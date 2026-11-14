#!/usr/bin/env python3
"""Build the hash-chained, signed Freeweights ledger (stdlib plus the minisign binary).

  ledger_chain.py            append new CSV rows to ledger/chain.jsonl, rewrite and sign ledger/head.json
  ledger_chain.py --no-sign  same, but do not sign (head.json.minisig is removed so it cannot go stale)

Each chain entry holds the CSV row plus seq, prev_hash and entry_hash.
entry_hash = sha256 of the canonical JSON of the entry without entry_hash.
Canonical JSON: sort_keys, separators (",", ":"), ensure_ascii=False, UTF-8, no trailing newline.
The chain is append-only: if a row already in the chain no longer matches its CSV row, this tool stops."""
import argparse, csv, datetime, glob, hashlib, json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(ROOT, "ledger")
CHAIN = os.path.join(LEDGER, "chain.jsonl")
HEAD = os.path.join(LEDGER, "head.json")
KEY = os.path.expanduser("~/.config/freeweights/minisign.key")
GENESIS = "0" * 64
FIELDS = ["date", "direction", "type", "vendor_or_source", "item", "amount_usd", "ref", "notes"]

def canon(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def entry_hash(entry):
    return hashlib.sha256(canon({k: v for k, v in entry.items() if k != "entry_hash"})).hexdigest()

def csv_rows():
    for path in sorted(glob.glob(os.path.join(LEDGER, "[0-9][0-9][0-9][0-9]-[0-9][0-9].csv"))):
        with open(path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                yield {"date": r["date"], "direction": r["direction"], "type": r["type"],
                       "vendor_or_source": r["vendor_or_source"], "item": r["item"],
                       "amount_usd": r["amount_usd"], "ref": r["invoice_or_ref"], "notes": r["notes"]}

def read_chain():
    if not os.path.exists(CHAIN): return []
    with open(CHAIN, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--no-sign", action="store_true"); a = ap.parse_args()
    chain, rows = read_chain(), list(csv_rows())
    if len(rows) < len(chain): sys.exit("STOP: the CSV has fewer rows than the chain. The ledger is append-only.")
    for e, r in zip(chain, rows):
        if any(e[k] != r[k] for k in FIELDS):
            sys.exit(f"STOP: CSV row for seq {e['seq']} was changed after it entered the chain. Add a correcting row instead.")
    prev = chain[-1]["entry_hash"] if chain else GENESIS
    for r in rows[len(chain):]:
        e = dict(r); e["seq"] = len(chain) + 1; e["prev_hash"] = prev
        e["entry_hash"] = entry_hash(e); chain.append(e); prev = e["entry_hash"]
    with open(CHAIN, "w", encoding="utf-8", newline="\n") as f:
        for e in chain: f.write(json.dumps(e, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n")
    if not chain: sys.exit("empty ledger")
    old = json.load(open(HEAD)) if os.path.exists(HEAD) else {}
    head = {"seq": chain[-1]["seq"], "entry_hash": chain[-1]["entry_hash"],
            "updated": old["updated"] if old.get("entry_hash") == chain[-1]["entry_hash"] and "updated" in old
            else datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    with open(HEAD, "w", encoding="utf-8", newline="\n") as f: f.write(json.dumps(head, sort_keys=True, indent=2) + "\n")
    sig = HEAD + ".minisig"
    if os.path.exists(sig): os.remove(sig)
    if a.no_sign: print(f"chain: {len(chain)} entries, head {head['entry_hash'][:16]}... (unsigned)"); return 0
    if not shutil.which("minisign"): sys.exit("minisign not found (brew install minisign)")
    r = subprocess.run(["minisign", "-S", "-s", KEY, "-m", HEAD, "-x", sig, "-t", "freeweights ledger head"], capture_output=True, text=True)
    if r.returncode: sys.exit("signing failed: " + (r.stderr or r.stdout).strip())
    print(f"chain: {len(chain)} entries, head seq {head['seq']} {head['entry_hash'][:16]}... signed")
    return 0

if __name__ == "__main__": sys.exit(main())
