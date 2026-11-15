#!/usr/bin/env python3
"""Upload the site's R2 tree (model and tool detail pages, manifests, signatures) to the R2 bucket (B4). Stdlib only.

  python3 scripts/sync_r2.py [--src site/r2] [--bucket freeweights] [--jobs 3] [--dry-run] [--delete] [--prefix P]

`node site/build.mjs` writes the tree (B5). Keys equal the public URL paths: manifests/<org>/<repo>.json(.minisig)
and <section>/<org>/<repo>/index.html; the Worker (or a Cloud Connector rule) serves them on those URLs.

Safe to re-run. The bucket listing gives each object's MD5 etag and content type; a file whose MD5 and type
match is skipped, so only changed files are sent. --delete removes bucket objects under the managed prefixes
(manifests/ and alt.freeweights.*) that the tree no longer has (a removed entry or a takedown); without it the
script only reports them. The Cloudflare API allows 1,200 requests per 5 minutes per user, so uploads are paced
under that (about 3.8 a second) and back off on 429. The token is wrangler's (`wrangler auth token`), refreshed
when it expires; it is never printed. Account: CLOUDFLARE_ACCOUNT_ID, else the first account wrangler shows.
"""
import argparse, concurrent.futures as cf, hashlib, json, os, re, subprocess, sys, threading, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRANGLER = ["npx", "--yes", "wrangler@4.160.0"]
API = "https://api.cloudflare.com/client/v4"
TYPES = {".html": "text/html; charset=utf-8", ".json": "application/json", ".minisig": "text/plain; charset=utf-8"}
MANAGED = re.compile(r"^(manifests/|alt\.freeweights\.)")
RATE = 3.8  # requests per second, under 1,200 per 300 s


class Api:
    def __init__(self, account):
        self.account, self.lock, self.next_at, self.tok = account, threading.Lock(), 0.0, None
        self.refresh()

    def refresh(self):
        out = subprocess.run(WRANGLER + ["auth", "token"], cwd=os.path.join(ROOT, "worker"), capture_output=True, text=True).stdout
        toks = [l.strip() for l in out.splitlines() if l.strip() and " " not in l.strip()]
        if not toks: sys.exit("sync_r2: no wrangler token (run `npx wrangler@4.160.0 login`)")
        self.tok = toks[-1]

    def pace(self):
        with self.lock:
            now = time.monotonic(); wait = self.next_at - now
            self.next_at = max(now, self.next_at) + 1.0 / RATE
        if wait > 0: time.sleep(wait)

    def call(self, method, path, data=None, ctype=None):
        for attempt in range(8):
            self.pace()
            req = urllib.request.Request(API + path, data=data, method=method, headers={"Authorization": f"Bearer {self.tok}", **({"Content-Type": ctype} if ctype else {})})
            try:
                with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read() or b"{}")
            except urllib.error.HTTPError as e:
                if e.code in (401, 403) and attempt < 2: self.refresh(); continue
                if e.code == 429 or e.code >= 500:
                    time.sleep(min(60, float(e.headers.get("retry-after") or 2 ** attempt))); continue
                raise RuntimeError(f"{method} {path.split('/objects/')[-1]}: HTTP {e.code} {e.read()[:200]!r}")
            except (urllib.error.URLError, TimeoutError):
                time.sleep(2 ** attempt)
        raise RuntimeError(f"{method} {path}: gave up after retries")


def account_id():
    if os.environ.get("CLOUDFLARE_ACCOUNT_ID"): return os.environ["CLOUDFLARE_ACCOUNT_ID"]
    out = subprocess.run(WRANGLER + ["whoami"], capture_output=True, text=True).stdout
    m = re.search(r"\b[0-9a-f]{32}\b", out)
    if not m: sys.exit("sync_r2: set CLOUDFLARE_ACCOUNT_ID")
    return m.group(0)


def local_tree(src, prefix):
    files = {}
    for d, _, fs in os.walk(src):
        for f in fs:
            p = os.path.join(d, f); key = os.path.relpath(p, src).replace(os.sep, "/")
            if prefix and not key.startswith(prefix): continue
            files[key] = p
    return files


def remote_objects(api, bucket, prefix):
    objs, cursor = {}, None
    while True:
        q = {"per_page": "1000", **({"prefix": prefix} if prefix else {}), **({"cursor": cursor} if cursor else {})}
        d = api.call("GET", f"/accounts/{api.account}/r2/buckets/{bucket}/objects?" + urllib.parse.urlencode(q))
        for o in d.get("result") or []:
            objs[o["key"]] = (o.get("etag", "").strip('"'), (o.get("http_metadata") or {}).get("contentType"), int(o.get("size") or 0))
        cursor = (d.get("result_info") or {}).get("cursor")
        if not (d.get("result_info") or {}).get("is_truncated") or not cursor: return objs


def ctype_of(key):
    return TYPES.get(os.path.splitext(key)[1], "application/octet-stream")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", default=os.path.join(ROOT, "site", "r2"))
    ap.add_argument("--bucket", default="freeweights")
    ap.add_argument("--jobs", type=int, default=3)
    ap.add_argument("--prefix", default="")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--delete", action="store_true")
    a = ap.parse_args()
    if not os.path.isdir(a.src): sys.exit(f"sync_r2: no {a.src} (run `cd site && node build.mjs` first)")
    files = local_tree(a.src, a.prefix)
    api = Api(account_id())
    remote = remote_objects(api, a.bucket, a.prefix)
    todo, skipped = [], 0
    for key, path in sorted(files.items()):
        md5 = hashlib.md5(open(path, "rb").read()).hexdigest()
        r = remote.get(key)
        if r and r[0] == md5 and r[1] == ctype_of(key): skipped += 1
        else: todo.append((key, path))
    stale = sorted(k for k in remote if k not in files and MANAGED.match(k))
    nbytes = sum(os.path.getsize(p) for _, p in todo)
    print(f"sync_r2: {len(files):,} local objects, {len(remote):,} in bucket {a.bucket}; {len(todo):,} to upload ({nbytes/1e6:.1f} MB), {skipped:,} unchanged, {len(stale):,} not in the tree{'' if a.delete else ' (kept; --delete removes them)'}")
    if a.dry_run: return 0
    done, failed, lock = [0], [], threading.Lock()

    def put(item):
        key, path = item
        try:
            api.call("PUT", f"/accounts/{api.account}/r2/buckets/{a.bucket}/objects/{urllib.parse.quote(key, safe='/')}", open(path, "rb").read(), ctype_of(key))
        except Exception as e:  # noqa: BLE001 - reported and retried on the next run
            with lock: failed.append(f"{key}: {e}")
        with lock:
            done[0] += 1
            if done[0] % 250 == 0 or done[0] == len(todo): print(f"  {done[0]:,}/{len(todo):,} uploaded", flush=True)

    with cf.ThreadPoolExecutor(max(1, a.jobs)) as ex: list(ex.map(put, todo))
    if a.delete:
        for key in stale:
            try: api.call("DELETE", f"/accounts/{api.account}/r2/buckets/{a.bucket}/objects/{urllib.parse.quote(key, safe='/')}")
            except Exception as e: failed.append(f"delete {key}: {e}")  # noqa: BLE001
        print(f"  {len(stale):,} removed")
    total = sum(os.path.getsize(p) for p in files.values())
    print(f"sync_r2: done; bucket tree now {len(files):,} objects, {total/1e6:.1f} MB; {len(failed)} failed")
    for f in failed[:20]: print("  FAIL", f)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
