#!/usr/bin/env python3
"""Verify the Freeweights ledger chain (stdlib plus the minisign binary).

  verify_ledger.py [--chain ledger/chain.jsonl] [--head ledger/head.json] [--pubkey spec/keys/freeweights-v0.pub]

Checks, in order: every entry's seq, prev_hash link and entry_hash; the head matches the last entry;
the head signature. Prints PASS or FAIL (with the first bad seq) and exits 0 or 1."""
import argparse, hashlib, json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from ledger_chain import canon, GENESIS  # noqa: E402

def fail(msg): print("FAIL: " + msg); return 1

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chain", default=os.path.join(ROOT, "ledger", "chain.jsonl"))
    ap.add_argument("--head", default=os.path.join(ROOT, "ledger", "head.json"))
    ap.add_argument("--pubkey", default=os.path.join(ROOT, "spec", "keys", "freeweights-v0.pub"))
    a = ap.parse_args()
    try: entries = [json.loads(l) for l in open(a.chain, encoding="utf-8") if l.strip()]
    except (OSError, ValueError) as e: return fail(f"cannot read chain: {e}")
    if not entries: return fail("chain is empty")
    prev = GENESIS
    for i, e in enumerate(entries, 1):
        if e.get("seq") != i: return fail(f"seq {i}: sequence number is {e.get('seq')}")
        if e.get("prev_hash") != prev: return fail(f"seq {i}: prev_hash does not match the entry before it")
        h = hashlib.sha256(canon({k: v for k, v in e.items() if k != "entry_hash"})).hexdigest()
        if h != e.get("entry_hash"): return fail(f"seq {i}: entry content does not match its entry_hash")
        prev = e["entry_hash"]
    try: head = json.load(open(a.head))
    except (OSError, ValueError) as e: return fail(f"cannot read head: {e}")
    if head.get("seq") != len(entries) or head.get("entry_hash") != prev:
        return fail(f"head says seq {head.get('seq')} but the chain ends at seq {len(entries)} with a different hash")
    if not shutil.which("minisign"): return fail("minisign not found (brew install minisign)")
    r = subprocess.run(["minisign", "-V", "-m", a.head, "-x", a.head + ".minisig", "-p", a.pubkey], capture_output=True, text=True)
    if r.returncode: return fail("head signature: " + (r.stderr or r.stdout).strip())
    print(f"PASS: {len(entries)} entries, links and hashes ok, head seq {head['seq']} signature ok (key 2DC28CC7B26A283B)")
    return 0

if __name__ == "__main__": sys.exit(main())
