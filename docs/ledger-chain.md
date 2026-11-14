# Ledger chain

The Freeweights ledger is tamper-evident. It is a hash chain with a signed head. There is no blockchain and no token.

## Files

| File | What it is |
| --- | --- |
| `ledger/YYYY-MM.csv` | The human-edited source. One row per money movement. |
| `ledger/chain.jsonl` | One JSON entry per line, one per CSV row, linked by hashes. Written by a tool. |
| `ledger/head.json` | `seq`, `entry_hash` and `updated` of the last entry. |
| `ledger/head.json.minisig` | Minisign signature of `head.json`. |
| `scripts/ledger_chain.py` | Builds the chain and signs the head. |
| `scripts/verify_ledger.py` | Checks everything. Prints PASS or FAIL. |

## Entry format

Each entry has: `seq` (1, 2, 3 and so on), `date`, `direction`, `type`, `vendor_or_source`, `item`, `amount_usd` (a string such as `"0.00"`, so no float rounding), `ref` (the CSV `invoice_or_ref`), `notes`, `prev_hash` and `entry_hash`.

- Entry 1 has `prev_hash` of 64 zeros.
- `entry_hash` is the sha256 (hex) of the canonical JSON of the entry without `entry_hash`.
- Canonical JSON: keys sorted, separators `,` and `:` with no spaces, non-ASCII as raw UTF-8, no trailing newline.

## Why it detects tampering

Change any field of entry N, and its hash no longer matches its content. Fix the hash, and entry N+1 no longer links to it. Fix every later entry too, and the last hash no longer matches `head.json`. Fix `head.json`, and the signature fails, because only the key holder can sign. The verifier says which seq broke first.

What it does not do: prove that a row is true, or stop us from adding rows. That is why money out needs an invoice or receipt reference. It also cannot stop the key holder from re-signing a rewritten history. Two things limit that: anyone who saved an earlier head can show a mismatch, and the timestamp step below makes the head's date provable.

## Add rows

1. Add rows to the current month's CSV. Never edit or delete a row that is already in the chain. Add a correcting row instead. The tool stops if a past row changed.
2. Run `python3 scripts/ledger_chain.py`. It appends entries, rewrites `head.json` and signs it with `~/.config/freeweights/minisign.key`.
3. Run `python3 scripts/verify_ledger.py`. It must print PASS.
4. Commit the CSV, `chain.jsonl`, `head.json` and `head.json.minisig` together.

## Verify

```
python3 scripts/verify_ledger.py
```

Options: `--chain`, `--head`, `--pubkey` (default `spec/keys/freeweights-v0.pub`, key id 2DC28CC7B26A283B). It needs Python 3 and `minisign`. Exit code 0 means PASS.

By hand: `minisign -Vm ledger/head.json -p spec/keys/freeweights-v0.pub`, then recompute each entry hash.

## Tamper test

Copy the chain, change one amount, and verify the copy:

```
T=$(mktemp -d); cp ledger/head.json ledger/head.json.minisig $T/
python3 - $T <<'PY'
import sys, json
l = open('ledger/chain.jsonl').read().splitlines()
e = json.loads(l[2]); e['amount_usd'] = '9.99'
l[2] = json.dumps(e, sort_keys=True, separators=(',', ':'))
open(sys.argv[1] + '/chain.jsonl', 'w').write('\n'.join(l) + '\n')
PY
python3 scripts/verify_ledger.py --chain $T/chain.jsonl --head $T/head.json
```

Expected: `FAIL: seq 3: entry content does not match its entry_hash`, exit code 1.

## Optional: OpenTimestamps anchoring (at launch, Allternit's go)

OpenTimestamps ties a file's hash to the Bitcoin chain, which proves the file existed at a date, with no token and no fee. It contacts public calendar servers, so it is **not done now**. At launch, with Allternit's go:

```
ots stamp ledger/head.json     # writes ledger/head.json.ots
ots verify ledger/head.json.ots
```

Stamp again after each head change, and keep the `.ots` files in the repository. Install with `pip install opentimestamps-client`. Do not run it before Allternit says so.

## Key note

The v0 signing key has no password and sits outside the repository. We rotate to an offline, password-protected key before Stage 1. After rotation, verify old heads with the old public key, which stays published.
