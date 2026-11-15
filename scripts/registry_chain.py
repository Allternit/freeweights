#!/usr/bin/env python3
"""The Freeweights registry chain: catalog snapshots and takedowns (stdlib plus the minisign binary).

  registry_chain.py snapshot [--no-sign] [--key K]    append a snapshot if the manifests changed, sign

This is a second hash chain, separate from the money ledger (ledger/chain.jsonl). The money chain is built
from the monthly CSVs and must hold only money rows, so validate_ledger.py, the ledger page totals and the
CSV append-only check stay exact. Registry events (what was listed, what was removed) go here instead.

Files (all public, CC0):
  ledger/registry.jsonl            one entry per line: seq, prev_hash, type, date, entry_hash + type fields
  ledger/registry-head.json        {seq, entry_hash, updated}; signed as registry-head.json.minisig
  ledger/snapshot.json             the latest snapshot: root, count, created, seq, entries [[id, sha256], ...]
  ledger/snapshot.json.minisig     signed, trusted comment "freeweights snapshot <root>"

Entry types:
  snapshot  {count, root}                    root of every published manifest (see snapshot_root)
  takedown  {id, kind, reason_class}         one removal; no personal data, no ticket text; id is null for a
                                             sensitive class (blocklist.SENSITIVE)

entry_hash = sha256 of the canonical JSON of the entry without entry_hash (same rule as ledger_chain.py).
Snapshot root: sort the (entry id, sha256 of the manifest file bytes) pairs by id, write one line
"<id> <sha256>\\n" per pair, root = sha256 of those UTF-8 bytes. Anyone can recompute it from the published
manifests (verify_ledger.py --snapshot-against)."""
import argparse, datetime, glob, hashlib, json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from ledger_chain import canon, entry_hash, GENESIS  # noqa: E402

LEDGER = os.path.join(ROOT, "ledger")
MANIFESTS = os.path.join(ROOT, "manifests")
KEY = os.path.expanduser("~/.config/freeweights/minisign.key")
TYPES = {"snapshot": ("count", "root"), "takedown": ("id", "kind", "reason_class")}


def paths(ledger=LEDGER):
    return {"chain": os.path.join(ledger, "registry.jsonl"), "head": os.path.join(ledger, "registry-head.json"),
            "snap": os.path.join(ledger, "snapshot.json")}


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------- snapshot root ----------
def listing_from_dir(man_dir=MANIFESTS):
    """[(id, sha256 of the file bytes)] for every manifest in man_dir, sorted by id."""
    out = []
    for p in glob.glob(os.path.join(man_dir, "**", "*.json"), recursive=True):
        with open(p, "rb") as f: raw = f.read()
        out.append((json.loads(raw)["id"], hashlib.sha256(raw).hexdigest()))
    return sorted(out)


def snapshot_root(listing):
    body = "".join(f"{i} {h}\n" for i, h in sorted(listing))
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


# ---------- chain ----------
def read_chain(ledger=LEDGER):
    p = paths(ledger)["chain"]
    if not os.path.exists(p): return []
    with open(p, encoding="utf-8") as f: return [json.loads(l) for l in f if l.strip()]


def last_of(chain, typ):
    return next((e for e in reversed(chain) if e.get("type") == typ), None)


def minisign_sign(path, comment, key):
    if not shutil.which("minisign"): sys.exit("minisign not found (brew install minisign)")
    tmp = path + ".minisig.tmp"
    if os.path.exists(tmp): os.remove(tmp)
    r = subprocess.run(["minisign", "-S", "-s", key, "-m", path, "-x", tmp, "-t", comment], capture_output=True, text=True)
    if r.returncode: sys.exit("signing failed: " + (r.stderr or r.stdout).strip())
    os.replace(tmp, path + ".minisig")  # a signature is never removed before its replacement exists


def append(entries, key=KEY, ledger=LEDGER):
    """Append entries (dicts with type, date and the type's fields), rewrite the head and sign it.
    Always signs: an unsigned registry head would break verify_ledger.py, so callers skip instead."""
    chain = read_chain(ledger)
    prev = chain[-1]["entry_hash"] if chain else GENESIS
    for x in entries:
        if x.get("type") not in TYPES or any(k not in x for k in TYPES[x["type"]] + ("date",)):
            raise ValueError(f"bad registry entry {x}")
        e = dict(x); e["seq"] = len(chain) + 1; e["prev_hash"] = prev
        e["entry_hash"] = entry_hash(e); chain.append(e); prev = e["entry_hash"]
    p = paths(ledger)
    os.makedirs(ledger, exist_ok=True)
    tmp = p["chain"] + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        for e in chain: f.write(json.dumps(e, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n")
    os.replace(tmp, p["chain"])
    head = {"seq": chain[-1]["seq"], "entry_hash": chain[-1]["entry_hash"], "updated": now()}
    with open(p["head"], "w", encoding="utf-8", newline="\n") as f: f.write(json.dumps(head, sort_keys=True, indent=2) + "\n")
    minisign_sign(p["head"], f"freeweights registry head {head['seq']} {head['entry_hash'][:16]}", key)
    return chain


def snapshot_entry(listing, date=None):
    return {"type": "snapshot", "date": date or now()[:10], "count": len(listing), "root": snapshot_root(listing)}


def write_snapshot(listing, seq, key=KEY, ledger=LEDGER):
    snap = {"schema_version": 0, "root": snapshot_root(listing), "count": len(listing), "created": now(), "seq": seq,
            "rule": "sha256 of the lines '<id> <sha256 of manifest bytes>\\n', sorted by id",
            "entries": [[i, h] for i, h in sorted(listing)]}
    p = paths(ledger)["snap"]
    # one [id, sha256] pair per line, so a git diff shows exactly which manifests changed
    head = json.dumps({k: v for k, v in snap.items() if k != "entries"}, sort_keys=True, indent=1, ensure_ascii=False)
    pairs = ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in snap["entries"])
    with open(p, "w", encoding="utf-8", newline="\n") as f: f.write(head[:-2] + ',\n "entries": [\n' + pairs + "\n ]\n}\n")
    minisign_sign(p, f"freeweights snapshot {snap['root']}", key)
    return snap


def snapshot(sign=True, key=KEY, man_dir=MANIFESTS, ledger=LEDGER, extra=()):
    """Append `extra` entries (e.g. a takedown) and, when the manifests changed since the last snapshot,
    a new snapshot entry; sign the head and the snapshot file. Returns a one-line summary.
    With sign=False nothing is written (an unsigned run must not leave a stale signature behind)."""
    listing = listing_from_dir(man_dir)
    root = snapshot_root(listing)
    last = last_of(read_chain(ledger), "snapshot")
    changed = not last or last["root"] != root
    if not sign:
        return f"snapshot: root {root[:16]}... over {len(listing)} manifests, {'changed' if changed else 'unchanged'}; not appended (unsigned run)"
    entries = list(extra) + ([snapshot_entry(listing)] if changed else [])
    if not entries:
        snap_file = paths(ledger)["snap"]
        if not (os.path.exists(snap_file) and os.path.exists(snap_file + ".minisig")):
            write_snapshot(listing, last["seq"], key, ledger)
        return f"snapshot: root {root[:16]}... unchanged since seq {last['seq']}"
    chain = append(entries, key, ledger)
    if changed: write_snapshot(listing, chain[-1]["seq"], key, ledger)
    return f"snapshot: root {root[:16]}... over {len(listing)} manifests, registry seq {chain[-1]['seq']} signed"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("snapshot"); s.add_argument("--no-sign", action="store_true"); s.add_argument("--key", default=KEY)
    a = ap.parse_args()
    if a.cmd == "snapshot": print(snapshot(not a.no_sign, a.key))
    return 0


if __name__ == "__main__": sys.exit(main())
