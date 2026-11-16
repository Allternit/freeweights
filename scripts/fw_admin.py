#!/usr/bin/env python3
"""Freeweights admin: takedowns and stats. Stdlib plus minisign (signing) and wrangler (D1).

  fw_admin.py takedown <org/repo> --reason <class> [--kind model|dataset] [--dry-run] [--apply | --local]
  fw_admin.py stats [--local | --remote] [--top N]

Community uploads (signed requests to /api/fw/v1/admin/*, spec/accounts-v1.md 11.4 and 11.7). The key is
$FW_ADMIN_SECRET or the first line of ~/.config/freeweights/admin-secret; the host is $FW_API (default
https://freeweights.allternit.com). Every request is HMAC-SHA256 signed with a timestamp (replays inside
300 s change nothing). Each command prints the JSON the Worker answered.
  fw_admin.py reports [--status open|actioned|rejected]      fw_admin.py report-close <rpt_id> --status actioned|rejected [--note T]
  fw_admin.py held
  fw_admin.py remove <rp_id> --reason <class> [--report rpt_id] [--blocklist] [--purge]
  fw_admin.py restore <rp_id> [--release-held] [--unblock] [--note T]
  fw_admin.py user <handle> [--suspend | --reinstate] [--staff | --no-staff] [--note T]
  fw_admin.py limits get | limits set <key> <value>
  fw_admin.py usage reconcile
  fw_admin.py r2-usage      (Worker buckets, plus the other R2 buckets from the Cloudflare API when CF_API_TOKEN is set)
remove: the repo goes `removed` (resolve answers 451; the Worker deletes the Connector page, 404 there), the
detail-page paths are purged from the edge cache when CF_API_TOKEN and CF_ZONE_ID are set, and with --blocklist
its file hashes go to the blocklist file scripts/blocklist.py picks (public, or the private list for a
sensitive class) as well as the Worker's blocked_hashes. --purge deletes the files; the command repeats the
call until the Worker says every file is gone.

takedown, in this order:
  1. D1: one row in `takedowns` (migration 0003). The Worker reads that table (cached 60 s per isolate) before
     any R2 read and answers 451 on the entry's API detail, tree, resolve, manifest, signature and detail page,
     and drops it from search, with no redeploy. Runs only with --apply (live database) or --local (local
     test database); otherwise the exact wrangler command is printed for later. A failed D1 write stops here.
  1b. Static copies: the entry's R2 objects (manifests/<id>.json, .json.minisig, <section>/<id>/index.html) are
     deleted and their public URLs purged from the edge cache, so the paths Cloud Connector serves without the
     Worker answer 404 (the API keeps 451). Runs only with --apply and needs CF_API_TOKEN (Cache Purge + R2 edit),
     CLOUDFLARE_ACCOUNT_ID and CF_ZONE_ID; otherwise every delete and purge is printed (--skip-static: skip it).
  2. Blocklist: the entry's weight-file sha256 list, so discover.py and build_catalog.py refuse the same weights
     under any name. Non-sensitive classes go to policy/blocklist.json (public). Sensitive classes (SENSITIVE:
     csam, ncii, personal_data, real_person_likeness) go ONLY to the private list outside the repo,
     ~/.config/freeweights/blocklist-private.json or $FREEWEIGHTS_PRIVATE_BLOCKLIST (hashes on request).
  3. The catalog: its row file, its catalog.json row and its manifest pair are removed (build_catalog.py skips it
     from now on because of the blocklist).
  4. policy/takedowns.json: the public counter (shown on the Operating Statement page).
  5. ledger/registry.jsonl: a signed takedown line (date, id, kind, reason class; no personal data, no ticket
     text) plus a new catalog snapshot, signed with ~/.config/freeweights/minisign.key.
For a sensitive class the counter entry and the registry line carry the date, kind and class with id null:
the id can name a person or describe the material. (The id was public before the removal, so git history
still holds it; do not name the entry in the commit message either.)
--dry-run prints every step and writes nothing. Reason classes are fixed (REASONS); the report itself and the
reporter's details stay in the takedown mailbox, never in the repo.

stats prints download totals, the top entries and the takedown count from D1. --local runs the read-only queries
against the local database (worker/.wrangler, or --persist-to); --remote runs them against the live database;
with neither, the commands are printed."""
import argparse, datetime, glob, hashlib, hmac, json, os, re, shlex, subprocess, sys, time
import urllib.error, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import blocklist, registry_chain  # noqa: E402

REASONS = ("copyright", "license_violation", "publisher_request", "malware_or_secrets", "crime_marketing",
           "real_person_likeness", "csam", "ncii", "personal_data", "other")
REMOVE_REASONS = ("copyright", "csam", "ncii", "personal_data", "real_person_likeness", "crime_marketing", "malware_or_secrets", "license_violation", "publisher_request", "spam", "abuse", "other")
SENSITIVE = blocklist.SENSITIVE  # private hashes; no entry id in the public counter or registry line
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._-]*$")
WRANGLER = "wrangler@4.160.0"
DB = "freeweights"


def fname(repo): return repo.replace("/", "__")
def now(): return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def canonical(obj): return json.dumps(obj, sort_keys=True, indent=2, ensure_ascii=False) + "\n"


def load_json(path):
    with open(path, encoding="utf-8") as f: return json.load(f)


def write_json(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f: f.write(canonical(obj))
    os.replace(tmp, path)


def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"


def wrangler_cmd(target, sql, persist=None, as_json=False):
    """The wrangler argv for one statement against the remote or local database (run from worker/)."""
    cmd = ["npx", WRANGLER, "d1", "execute", DB, "--remote" if target == "remote" else "--local"]
    if target == "local" and persist: cmd += ["--persist-to", persist]
    if as_json: cmd.append("--json")
    return cmd + ["--command", sql]


def show(cmd, cwd):
    return f"(cd {shlex.quote(os.path.relpath(cwd))} && {' '.join(shlex.quote(c) for c in cmd)})"


def run_d1(cmd, cwd):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode: sys.exit("D1 command failed:\n" + (r.stderr or r.stdout).strip())
    return r.stdout


# ---------- takedown: static copies (R2 + edge cache) ----------
CF_API = "https://api.cloudflare.com/client/v4"
BUCKET = "freeweights"
SITE = os.environ.get("FW_HOST") or "freeweights.allternit.com"


def static_targets(entry_id, section, host=SITE):
    """The R2 keys and public URLs of an entry's static copies (the paths Cloud Connector serves)."""
    from urllib.parse import quote
    q = lambda s: quote(s, safe="/")
    keys = [f"manifests/{entry_id}.json", f"manifests/{entry_id}.json.minisig", f"{section}/{entry_id}/index.html"]
    base = f"https://{host}"
    urls = [f"{base}/{q(k)}" for k in keys] + [f"{base}/{q(section)}/{q(entry_id)}/", f"{base}/{q(section)}/{q(entry_id)}"]
    return keys, urls


def static_env():
    missing = [k for k in ("CF_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CF_ZONE_ID") if not os.environ.get(k)]
    return missing


def remove_static(keys, urls):
    """Delete the R2 objects (a missing object is fine), then purge the URLs. Returns the failures."""
    import urllib.error, urllib.parse, urllib.request
    tok, acct, zone = os.environ["CF_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"], os.environ["CF_ZONE_ID"]
    def call(method, path, body=None):
        req = urllib.request.Request(CF_API + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                     headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r: return r.status
        except urllib.error.HTTPError as e: return e.code
    fails = []
    for k in keys:
        st = call("DELETE", f"/accounts/{acct}/r2/buckets/{BUCKET}/objects/{urllib.parse.quote(k, safe='/')}")
        if st not in (200, 204, 404): fails.append(f"delete {k}: HTTP {st}")
    st = call("POST", f"/zones/{zone}/purge_cache", {"files": urls})
    if st != 200: fails.append(f"purge: HTTP {st}")
    return fails


# ---------- takedown ----------
class Repo:
    def __init__(self, root):
        self.root = root
        self.cat = os.path.join(root, "catalog", "catalog.json")
        self.rows = os.path.join(root, "catalog", "rows")
        self.man = os.path.join(root, "manifests")
        self.blocklist = os.path.join(root, "policy", "blocklist.json")
        self.takedowns = os.path.join(root, "policy", "takedowns.json")
        self.ledger = os.path.join(root, "ledger")
        self.worker = os.path.join(root, "worker")


def plan_takedown(repo, entry_id, kind):
    cat = load_json(repo.cat)
    row = next((r for r in cat["models"] if r["id"] == entry_id and r.get("kind", "model") == kind), None)
    if blocklist.match(entry_id, data=blocklist.load_all(repo.blocklist)):
        sys.exit(f"STOP: {entry_id} is already on a blocklist (public or private).")
    if not row: sys.exit(f"STOP: no {kind} {entry_id} in catalog/catalog.json.")
    mpath = os.path.join(repo.man, fname(entry_id) + ".json")
    files = load_json(mpath)["files"] if os.path.exists(mpath) else []
    row_files = []
    for p in glob.glob(os.path.join(repo.rows, "*.json")):
        d = load_json(p)
        if d.get("id") == entry_id and d.get("kind", "model") == kind: row_files.append(p)
    manifest_files = [p for p in (mpath, mpath + ".minisig") if os.path.exists(p)]
    return cat, row, blocklist.weight_hashes(files), row_files, manifest_files


def takedown(a, repo):
    entry_id, kind, reason = a.id, a.kind, a.reason
    if not ID_RE.match(entry_id): sys.exit(f"STOP: {entry_id!r} is not an org/repo id.")
    cat, row, hashes, row_files, manifest_files = plan_takedown(repo, entry_id, kind)
    at = now(); date = at[:10]
    sensitive = reason in SENSITIVE
    public_id = None if sensitive else entry_id
    bl_path = blocklist.path_for(reason, repo.blocklist)
    sql = (f"INSERT INTO takedowns (kind, entry_id, reason_class, at) VALUES "
           f"({sql_str(kind)}, {sql_str(entry_id)}, {sql_str(reason)}, {sql_str(at)}) ON CONFLICT(kind, entry_id) DO NOTHING;")
    target = "remote" if a.apply else "local" if a.local else None
    cmd = wrangler_cmd(target or "remote", sql, a.persist_to)
    rel = lambda p: os.path.relpath(p, repo.root)
    tag = "DRY RUN: " if a.dry_run else ""
    keys, urls = static_targets(entry_id, row["section"])
    live_static = a.apply and not a.skip_static
    if live_static and static_env() and not a.dry_run:
        sys.exit(f"STOP: --apply also deletes the R2 copies and purges the cache; set {', '.join(static_env())} or pass --skip-static.")
    print(f"{tag}takedown {kind} {entry_id} ({row['section']}), reason class {reason}, {date}")
    print(f"  1. D1 ({'live database' if target == 'remote' else 'local database' if target else 'not run: pass --apply for the live database'}):")
    print(f"     {show(cmd, repo.worker)}")
    print(f"  1b. static copies ({'skipped: --skip-static' if a.skip_static else 'live' if live_static else 'not run: pass --apply'}): R2 bucket {BUCKET} and the edge cache")
    for k in keys: print(f"     DELETE {CF_API}/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets/{BUCKET}/objects/{k}")
    print(f"     POST   {CF_API}/zones/$CF_ZONE_ID/purge_cache {json.dumps({'files': urls})}")
    where = f"PRIVATE list {bl_path} (sensitive class: never committed)" if sensitive else rel(bl_path)
    print(f"  2. {where}: add {len(hashes)} weight sha256" + (f" ({hashes[0][:16]}...)" if hashes else " (link-only entry: no manifest, id only)"))
    print(f"  3. catalog: remove {', '.join(rel(p) for p in row_files) or 'no row file'}; the catalog.json row; "
          f"{', '.join(rel(p) for p in manifest_files) or 'no manifest'}")
    print(f"  4. {rel(repo.takedowns)}: counter {reason} +1")
    print(f"  5. {rel(os.path.join(repo.ledger, 'registry.jsonl'))}: signed line {{date: {date}, id: {public_id or 'null (withheld)'}, kind: {kind}, reason_class: {reason}}} and a new snapshot")
    if a.dry_run:
        print("DRY RUN: nothing written, nothing run.")
        return 0
    if target:
        run_d1(cmd, repo.worker)
        print(f"  D1 row written ({target}). The Worker answers 451 within 60 seconds.")
    if live_static:
        fails = remove_static(keys, urls)
        for f in fails: print(f"  FAIL {f}")
        print(f"  static copies: {len(keys)} R2 objects deleted, {len(urls)} URLs purged; Cloud Connector paths answer 404." if not fails
              else "  static copies NOT fully removed: rerun the commands in step 1b (D1 is written; the Worker answers 451).")
    # 2. blocklist
    bl = blocklist.load(bl_path)
    bl = {"schema_version": bl.get("schema_version", 0), "entries": list(bl.get("entries", []))}
    bl["entries"].append({"id": entry_id, "kind": kind, "date": date, "reason_class": reason, "sha256": hashes})
    blocklist.write(bl, bl_path)
    # 3. catalog row, catalog.json, manifest pair
    for p in row_files + manifest_files: os.remove(p)
    cat["models"] = [r for r in cat["models"] if not (r["id"] == entry_id and r.get("kind", "model") == kind)]
    for s in cat.get("sections", []):
        if "count" in s: s["count"] = sum(r["section"] == s["id"] for r in cat["models"])
    write_json(repo.cat, cat)
    # 4. public counter
    td = load_json(repo.takedowns) if os.path.exists(repo.takedowns) else {"schema_version": 0, "totals": {}, "entries": []}
    td.setdefault("totals", {}); td.setdefault("entries", [])
    for r in REASONS: td["totals"].setdefault(r, 0)
    td["totals"][reason] += 1
    td["entries"].append({"date": date, "id": public_id, "kind": kind, "reason": reason, "status": "removed"})
    td["updated"] = date
    write_json(repo.takedowns, td)
    # 5. registry line + snapshot (signed)
    line = {"type": "takedown", "date": date, "id": public_id, "kind": kind, "reason_class": reason}
    print("  " + registry_chain.snapshot(True, a.key, repo.man, repo.ledger, extra=[line]))
    if not target:
        print("  D1 NOT written. The Worker keeps serving this entry until you run the command in step 1 (or rerun with --apply).")
    if sensitive: print("  Sensitive class: do not name the entry in the commit message or anywhere public.")
    print("Next: cd site && node build.mjs && cd .. && python3 scripts/sync_r2.py --delete; deploy the Worker (bundled catalog) and Pages; commit.")
    return 0


# ---------- stats ----------
STATS = [
    ("totals", "SELECT kind, COUNT(*) AS entries, SUM(total) AS downloads FROM download_totals GROUP BY kind ORDER BY kind;"),
    ("top", "SELECT kind, entry_id, total FROM download_totals ORDER BY total DESC, entry_id LIMIT {top};"),
    ("takedowns", "SELECT COUNT(*) AS takedowns FROM takedowns;"),
    ("rejected", "SELECT name, SUM(n) AS n FROM counters GROUP BY name ORDER BY name;"),
]


def stats(a, repo):
    target = "remote" if a.remote else "local" if a.local else None
    cmds = [(name, wrangler_cmd(target or "remote", sql.format(top=int(a.top)), a.persist_to, as_json=True)) for name, sql in STATS]
    if not target:
        print("Read-only queries (pass --local or --remote to run them):")
        for _, c in cmds: print("  " + show(c, repo.worker))
        return 0
    out = {}
    for name, c in cmds:
        res = json.loads(run_d1(c, repo.worker))
        out[name] = res[0]["results"] if isinstance(res, list) and res else []
    print(f"D1 ({target})")
    for r in out["totals"]: print(f"  {r['kind']}: {r['downloads'] or 0} downloads over {r['entries']} entries")
    if not out["totals"]: print("  no downloads counted yet")
    print(f"  takedowns: {out['takedowns'][0]['takedowns'] if out['takedowns'] else 0}")
    for r in out["rejected"]: print(f"  counter {r['name']}: {r['n']}")
    print(f"Top {a.top}:")
    for i, r in enumerate(out["top"], 1): print(f"  {i:>3}. {r['entry_id']} ({r['kind']}) {r['total']}")
    return 0


# ---------- community uploads: signed admin API ----------
API = os.environ.get("FW_API") or "https://freeweights.allternit.com"
SECRET_FILE = os.path.expanduser("~/.config/freeweights/admin-secret")
FREE_TIER_BYTES = 10_000_000_000  # Cloudflare R2 free tier, for the r2-usage percentage


def sign(secret, ts, method, path_query, body=b""):
    """X-FW-Signature value: v1=hex(HMAC-SHA256(secret, "<ts>\n<METHOD>\n<path?query>\n<sha256 hex of body>"))."""
    msg = f"{ts}\n{method.upper()}\n{path_query}\n{hashlib.sha256(body).hexdigest()}"
    return "v1=" + hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()


def admin_secret():
    s = os.environ.get("FW_ADMIN_SECRET", "").strip()
    if not s and os.path.exists(SECRET_FILE):
        with open(SECRET_FILE, encoding="utf-8") as f: s = f.readline().strip()
    if not s: sys.exit("No admin key: set FW_ADMIN_SECRET or put it on the first line of " + SECRET_FILE)
    return s


def api(method, path, body=None, query=None, secret=None, now=None, base=None):
    """One signed call to /api/fw/v1/admin/<path>. Returns the decoded JSON; exits with the Worker's error on non-2xx."""
    pq = "/api/fw/v1/admin/" + "/".join(urllib.parse.quote(p, safe="") for p in path.split("/"))
    if query: pq += "?" + urllib.parse.urlencode(query)
    data = b"" if body is None else json.dumps(body, separators=(",", ":")).encode()
    ts = str(int(now if now is not None else time.time()))
    req = urllib.request.Request((base or API) + pq, method=method.upper(), data=data or None, headers={
        "X-FW-Timestamp": ts, "X-FW-Signature": sign(secret or admin_secret(), ts, method, pq, data),
        "Content-Type": "application/json", "User-Agent": "fw-admin"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        try: detail = json.load(e)
        except Exception: detail = {}
        sys.exit(f"HTTP {e.code} {detail.get('error', '')}: {detail.get('message', '')}".strip())


def show_json(obj): print(json.dumps(obj, indent=2, ensure_ascii=False))


def paged(path, query):
    """Follow `next` cursors; returns (key, all rows)."""
    out, cursor = [], None
    while True:
        r = api("GET", path, query=dict(query, **({"cursor": cursor} if cursor else {})))
        key = next(k for k in r if isinstance(r[k], list))
        out += r[key]; cursor = r.get("next")
        if not cursor: return key, out


def purge_cache(paths):
    """Purge detail-page URLs from the edge cache. Needs CF_API_TOKEN and CF_ZONE_ID; otherwise says what to purge."""
    host = SITE
    urls = [f"https://{host}{p}" for p in paths]
    tok, zone = os.environ.get("CF_API_TOKEN"), os.environ.get("CF_ZONE_ID")
    if not (tok and zone):
        print("  edge cache NOT purged (set CF_API_TOKEN and CF_ZONE_ID); purge these URLs:\n    " + "\n    ".join(urls)); return
    req = urllib.request.Request(f"{CF_API}/zones/{zone}/purge_cache", method="POST", data=json.dumps({"files": urls}).encode(),
                                 headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60): print(f"  edge cache: {len(urls)} URLs purged")
    except urllib.error.HTTPError as e: print(f"  edge cache purge FAILED: HTTP {e.code}; purge the URLs by hand")


def add_blocklist(repo_id, reason, hashes, root):
    path = blocklist.path_for(reason, os.path.join(root, "policy", "blocklist.json"))
    bl = blocklist.load(path)
    bl = {"schema_version": bl.get("schema_version", 0), "entries": list(bl.get("entries", []))}
    bl["entries"].append({"id": repo_id, "kind": "community", "date": now()[:10], "reason_class": reason, "sha256": hashes})
    blocklist.write(bl, path)
    print(f"  blocklist: {len(hashes)} hashes added to {'the PRIVATE list (not committed)' if reason in SENSITIVE else os.path.relpath(path, root)}")


def admin_cmd(a):
    if a.cmd == "reports":
        _, rows = paged("reports", {"status": a.status}); show_json(rows)
    elif a.cmd == "report-close":
        show_json(api("POST", f"reports/{a.id}", {"status": a.status, **({"resolution": a.note} if a.note else {})}))
    elif a.cmd == "held":
        _, rows = paged("held", {}); show_json(rows)
    elif a.cmd == "remove":
        body = {"reason_class": a.reason, "blocklist": a.blocklist, "purge": a.purge, **({"report_id": a.report} if a.report else {})}
        r = api("POST", f"repos/{a.id}/remove", body)
        for _ in range(200):  # purge goes a bounded number of files per call
            if not a.purge or r.get("purged"): break
            r = api("POST", f"repos/{a.id}/remove", body)
        print(f"removed {r['id']}: {len(r['sha256'])} file hashes" + (", files purged" if r.get("purged") else ""))
        if a.blocklist: add_blocklist(a.id, a.reason, r["sha256"], a.root)
        purge_cache(r.get("static_paths", []))
        if a.purge and not r.get("purged"): sys.exit("purge did not finish; run the same command again")
    elif a.cmd == "restore":
        show_json(api("POST", f"repos/{a.id}/restore", {"release_held": a.release_held, "unblock": a.unblock, **({"note": a.note} if a.note else {})}))
    elif a.cmd == "user":
        body = {}
        if a.suspend: body["status"] = "suspended"
        if a.reinstate: body["status"] = "active"
        if a.staff is not None: body["staff"] = a.staff
        if a.note: body["note"] = a.note
        if not body.keys() & {"status", "staff"}: sys.exit("Say --suspend, --reinstate, --staff or --no-staff.")
        show_json(api("POST", f"users/{a.handle}", body))
    elif a.cmd == "limits":
        if a.action == "get": show_json(api("GET", "limits"))
        else:
            if a.key is None or a.value is None or not re.fullmatch(r"\d+", a.value): sys.exit("limits set <key> <whole number>")
            show_json(api("PUT", "limits", {"key": a.key, "value": int(a.value)}))
    elif a.cmd == "usage": show_json(api("POST", "usage/reconcile"))
    elif a.cmd == "r2-usage": r2_usage()
    return 0


def other_buckets():
    """Bytes of the R2 buckets the Worker cannot see (default allternit-runtime), via the Cloudflare API."""
    tok, acct = os.environ.get("CF_API_TOKEN"), os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not (tok and acct): return None
    out = []
    for b in (os.environ.get("FW_R2_OTHER_BUCKETS") or "allternit-runtime").split(","):
        req = urllib.request.Request(f"{CF_API}/accounts/{acct}/r2/buckets/{b.strip()}/usage", headers={"Authorization": f"Bearer {tok}"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r: out.append((b.strip(), int(json.load(r)["result"]["payloadSize"])))
        except Exception as e: out.append((b.strip(), None))
    return out


def r2_usage():
    cursor, tot = None, {}
    while True:
        r = api("GET", "r2-usage", query={"cursor": cursor} if cursor else None)
        tot = {b["binding"]: b for b in r["buckets"]}; cursor = r["cursor"]
        if not cursor: break
    rows = [(f"worker:{k}", v["bytes"]) for k, v in tot.items()]
    extra = other_buckets()
    if extra is None: print("(other buckets NOT checked: set CF_API_TOKEN and CLOUDFLARE_ACCOUNT_ID)")
    else: rows += [(f"cf:{n}", b) for n, b in extra]
    for n, b in rows: print(f"  {n:<28} {'not checked' if b is None else f'{b / 1e9:8.3f} GB'}")
    known = [b for _, b in rows if b is not None]
    if extra is not None and None not in [b for _, b in extra]:
        print(f"  {'total':<28} {sum(known) / 1e9:8.3f} GB of {FREE_TIER_BYTES / 1e9:.0f} GB free tier ({100 * sum(known) / FREE_TIER_BYTES:.0f}%)")

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=ROOT, help=argparse.SUPPRESS)  # tests: a copy of the repo layout
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("takedown", help="remove an entry after a takedown")
    t.add_argument("id"); t.add_argument("--reason", required=True, choices=REASONS)
    t.add_argument("--kind", default="model", choices=("model", "dataset"))
    t.add_argument("--dry-run", action="store_true", help="print every step, write nothing")
    g = t.add_mutually_exclusive_group()
    g.add_argument("--apply", action="store_true", help="write the D1 row to the LIVE database")
    g.add_argument("--local", action="store_true", help="write the D1 row to the local test database")
    t.add_argument("--persist-to", help="local D1 state directory (with --local)")
    t.add_argument("--skip-static", action="store_true", help="with --apply: do not delete the R2 copies or purge the cache")
    t.add_argument("--key", default=registry_chain.KEY)
    s = sub.add_parser("stats", help="download totals, top entries, takedown count")
    g = s.add_mutually_exclusive_group()
    g.add_argument("--local", action="store_true"); g.add_argument("--remote", action="store_true")
    s.add_argument("--persist-to"); s.add_argument("--top", type=int, default=20)
    r = sub.add_parser("reports", help="list reports"); r.add_argument("--status", default="open", choices=("open", "actioned", "rejected"))
    c = sub.add_parser("report-close", help="close a report"); c.add_argument("id"); c.add_argument("--status", required=True, choices=("actioned", "rejected")); c.add_argument("--note")
    sub.add_parser("held", help="list held and errored scans")
    rm = sub.add_parser("remove", help="take a community repo down")
    rm.add_argument("id"); rm.add_argument("--reason", required=True, choices=REMOVE_REASONS); rm.add_argument("--report")
    rm.add_argument("--blocklist", action="store_true"); rm.add_argument("--purge", action="store_true")
    rs = sub.add_parser("restore", help="restore a removed repo or release a held one")
    rs.add_argument("id"); rs.add_argument("--release-held", action="store_true"); rs.add_argument("--unblock", action="store_true"); rs.add_argument("--note")
    us = sub.add_parser("user", help="suspend/reinstate an account, set the staff flag"); us.add_argument("handle")
    us.add_argument("--suspend", action="store_true"); us.add_argument("--reinstate", action="store_true"); us.add_argument("--note")
    us.add_argument("--staff", dest="staff", action="store_true", default=None); us.add_argument("--no-staff", dest="staff", action="store_false")
    li = sub.add_parser("limits", help="get or set upload limits"); li.add_argument("action", choices=("get", "set")); li.add_argument("key", nargs="?"); li.add_argument("value", nargs="?")
    ur = sub.add_parser("usage", help="usage maintenance"); ur.add_argument("action", choices=("reconcile",))
    sub.add_parser("r2-usage", help="R2 bytes against the free tier")
    a = ap.parse_args(argv)
    if a.cmd not in ("takedown", "stats"): return admin_cmd(a)
    repo = Repo(os.path.abspath(a.root))
    return takedown(a, repo) if a.cmd == "takedown" else stats(a, repo)


if __name__ == "__main__": sys.exit(main())
