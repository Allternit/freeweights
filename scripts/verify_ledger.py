#!/usr/bin/env python3
"""Verify the Freeweights ledger chain and the registry chain (stdlib plus the minisign binary).

  verify_ledger.py [--chain ledger/chain.jsonl] [--head ledger/head.json] [--pubkey spec/keys/freeweights-v0.pub]
                   [--snapshot-against manifests/ | https://freeweights.allternit.com]

Money chain (ledger/chain.jsonl): every entry's seq, prev_hash link and entry_hash; the head matches the last
entry; the head signature.
Registry chain (ledger/registry.jsonl: snapshots and takedowns, scripts/registry_chain.py), when present: the
same checks on registry-head.json, then ledger/snapshot.json: its entries hash to its root, its signature is
valid, and the chain's snapshot entry at its seq carries the same root.
--snapshot-against recomputes the root from the manifests themselves: a directory (every *.json in it), or a
site URL (fetches /manifests/<id>.json for every id in the snapshot and checks the id set against /api/catalog).
Prints PASS or FAIL (with the first bad seq) and exits 0 or 1."""
import argparse, hashlib, json, os, shutil, subprocess, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from ledger_chain import canon, GENESIS  # noqa: E402
import registry_chain  # noqa: E402


def fail(msg): print("FAIL: " + msg); return 1


def load_json(path):
    with open(path, encoding="utf-8") as f: return json.load(f)


def json_lines(path):
    with open(path, encoding="utf-8") as f: return [json.loads(l) for l in f if l.strip()]


def minisign_ok(path, pubkey):
    r = subprocess.run(["minisign", "-V", "-m", path, "-x", path + ".minisig", "-p", pubkey], capture_output=True, text=True)
    return None if r.returncode == 0 else (r.stderr or r.stdout).strip()


def check_chain(chain_path, head_path, pubkey, name):
    """(entries, None) or (None, error message)."""
    try: entries = json_lines(chain_path)
    except (OSError, ValueError) as e: return None, f"{name}: cannot read chain: {e}"
    if not entries: return None, f"{name}: chain is empty"
    prev = GENESIS
    for i, e in enumerate(entries, 1):
        if e.get("seq") != i: return None, f"{name} seq {i}: sequence number is {e.get('seq')}"
        if e.get("prev_hash") != prev: return None, f"{name} seq {i}: prev_hash does not match the entry before it"
        h = hashlib.sha256(canon({k: v for k, v in e.items() if k != "entry_hash"})).hexdigest()
        if h != e.get("entry_hash"): return None, f"{name} seq {i}: entry content does not match its entry_hash"
        prev = e["entry_hash"]
    try: head = load_json(head_path)
    except (OSError, ValueError) as e: return None, f"{name}: cannot read head: {e}"
    if head.get("seq") != len(entries) or head.get("entry_hash") != prev:
        return None, f"{name}: head says seq {head.get('seq')} but the chain ends at seq {len(entries)} with a different hash"
    bad = minisign_ok(head_path, pubkey)
    if bad: return None, f"{name}: head signature: {bad}"
    return entries, None


def check_snapshot(snap_path, entries, pubkey):
    """(snapshot dict, None) or (None, error)."""
    try: snap = load_json(snap_path)
    except (OSError, ValueError) as e: return None, f"snapshot: cannot read {snap_path}: {e}"
    listing = [tuple(x) for x in snap.get("entries", [])]
    if registry_chain.snapshot_root(listing) != snap.get("root") or len(listing) != snap.get("count"):
        return None, "snapshot: its entries do not hash to its root"
    bad = minisign_ok(snap_path, pubkey)
    if bad: return None, f"snapshot signature: {bad}"
    e = entries[snap["seq"] - 1] if isinstance(snap.get("seq"), int) and 0 < snap["seq"] <= len(entries) else None
    if not e or e.get("type") != "snapshot" or e.get("root") != snap["root"]:
        return None, f"snapshot: registry seq {snap.get('seq')} is not a snapshot entry with root {snap['root'][:16]}..."
    return snap, None


def fetch(url):
    req = urllib.request.Request(url, headers={"user-agent": "freeweights-verify/0"})
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()


def listing_from_site(base, snap):
    base = base.rstrip("/")
    listing = [(i, hashlib.sha256(fetch(f"{base}/manifests/{i}.json")).hexdigest()) for i, _ in snap["entries"]]
    hosted = {r["id"] for r in json.loads(fetch(f"{base}/api/catalog"))["models"] if r.get("manifest_url")}
    return listing, hosted


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chain", default=os.path.join(ROOT, "ledger", "chain.jsonl"))
    ap.add_argument("--head", default=os.path.join(ROOT, "ledger", "head.json"))
    ap.add_argument("--pubkey", default=os.path.join(ROOT, "spec", "keys", "freeweights-v0.pub"))
    ap.add_argument("--registry-dir", default=os.path.join(ROOT, "ledger"), help="where registry.jsonl and snapshot.json live")
    ap.add_argument("--snapshot-against", help="a manifests directory or a site URL to recompute the snapshot root from")
    a = ap.parse_args()
    if not shutil.which("minisign"): return fail("minisign not found (brew install minisign)")
    entries, err = check_chain(a.chain, a.head, a.pubkey, "ledger")
    if err: return fail(err)
    print(f"PASS: {len(entries)} entries, links and hashes ok, head seq {entries[-1]['seq']} signature ok (key 2DC28CC7B26A283B)")
    p = registry_chain.paths(a.registry_dir)
    if not os.path.exists(p["chain"]):
        if a.snapshot_against: return fail("no registry chain, so no snapshot to check")
        print("registry: no ledger/registry.jsonl yet (no snapshot or takedown recorded)")
        return 0
    reg, err = check_chain(p["chain"], p["head"], a.pubkey, "registry")
    if err: return fail(err)
    snaps = sum(e.get("type") == "snapshot" for e in reg); tds = sum(e.get("type") == "takedown" for e in reg)
    snap, err = check_snapshot(p["snap"], reg, a.pubkey)
    if err: return fail(err)
    print(f"PASS: registry {len(reg)} entries ({snaps} snapshots, {tds} takedowns), head signature ok; "
          f"snapshot seq {snap['seq']} root {snap['root'][:16]}... over {snap['count']} manifests, signature ok")
    if a.snapshot_against:
        src = a.snapshot_against
        if src.startswith(("http://", "https://")):
            listing, hosted = listing_from_site(src, snap)
            ids = {i for i, _ in snap["entries"]}
            if hosted != ids: return fail(f"snapshot ids differ from the hosted ids in {src}/api/catalog: "
                                          f"{len(ids - hosted)} only in the snapshot, {len(hosted - ids)} only in the catalog")
        else:
            listing = registry_chain.listing_from_dir(src)
        root = registry_chain.snapshot_root(listing)
        if root != snap["root"]:
            have, want = dict(listing), dict(tuple(x) for x in snap["entries"])
            diff = sorted(i for i in set(have) | set(want) if have.get(i) != want.get(i))
            return fail(f"root from {src} is {root[:16]}..., the snapshot says {snap['root'][:16]}... ({len(diff)} differ, first {diff[:3]})")
        print(f"PASS: recomputed root from {src} matches the signed snapshot ({len(listing)} manifests)")
    return 0


if __name__ == "__main__": sys.exit(main())
