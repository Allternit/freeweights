# Freeweights ledger

The public ledger for Freeweights costs and income. It is shown at /ledger.

## Files

- `YYYY-MM.csv`: one file per month. Each row is one money movement or one zero-cost service.
- `goals.json`: funding goals and the stage each one unlocks, with amount range and the amount raised so far.
- `chain.jsonl`, `head.json`, `head.json.minisig`: the money rows as a signed hash chain (scripts/ledger_chain.py).
- `registry.jsonl`, `registry-head.json`, `snapshot.json` (each signed): a separate chain of catalog snapshots and takedowns (scripts/registry_chain.py, docs/ledger-chain.md). Not money: never add these to the CSVs.

## CSV columns

| Column | Rules |
|---|---|
| date | ISO date, YYYY-MM-DD |
| direction | `in` (money or value received) or `out` (money spent) |
| type | For `in`: `support`, `sponsor`, `allternit_share`, `credit`, `in_kind`. For `out`: `hosting`, `storage`, `email`, `code`, `other` |
| vendor_or_source | Who paid or who was paid |
| item | What the money or value was for |
| amount_usd | Decimal USD, 0.00 or more. In-kind capacity is logged at its stated value |
| invoice_or_ref | Invoice or receipt reference; blank when none |
| notes | Free text |

Rows with a 0.00 amount are real: they record that a Stage 0 service is on a free tier.

## Rules

- Support is applied first to running costs; every dollar shown.
- Money out is backed by an invoice or receipt. Money in is recorded by type.
- Names of supporters appear only with their consent.
- Sponsor capacity appears on the mirror list; sponsorship never changes catalog order.
- Allternit share is fixed, published and booked monthly.
- Prepay hosting before 12-31 so money in and costs land in the same year.
- Never record a credential, token or account secret here.

Validate with `python3 scripts/validate_ledger.py` from the repo root.
