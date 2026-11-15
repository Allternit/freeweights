---
title: Ledger
nav_label: Ledger
summary: What Freeweights costs, who pays, how anyone can check that the ledger was not edited, and what each funding goal unlocks.
updated: 2026-11-14
sections:
  - {id: how-it-works, title: How the ledger works}
  - {id: tamper-evident, title: Why it is tamper-evident}
  - {id: verify, title: Verify it yourself}
  - {id: snapshots, title: Catalog snapshots and takedowns}
  - {id: costs-by-stage, title: Costs by stage}
  - {id: goals, title: Funding goals}
  - {id: allternit-share, title: Allternit's share}
  - {id: support, title: Support}
---
The ledger lists every dollar in and out of Freeweights. It is a public file you can read and check.

## How the ledger works {#how-it-works}

The source is one CSV file per month in the public repository. Each row is one money movement, or one service on a free tier. A free tier is recorded as a row with 0.00, because that is a real fact.

- **Money in** is recorded by type: support, sponsor, Allternit share, credit or in-kind.
- **Money out** is backed by an invoice or receipt reference: hosting, storage, email, code or other.
- **In-kind capacity** (for example a sponsor's disk) is logged at the value the sponsor states, with consent.
- **Names** of supporters appear only with their consent.
- **Never** a credential, token or account secret.

The first rows are zeros: Cloudflare Pages, Workers, D1 and R2, GitHub, and Cloudflare Email Routing, all on free plans at Stage 0.

## Why it is tamper-evident {#tamper-evident}

There is no blockchain and no token. We use a hash chain, the same idea Git uses.

Each row becomes an entry with a sequence number. Each entry holds the hash of the entry before it, and its own hash covers all its fields. Change one amount in an old row and its hash changes. The next entry no longer matches, and so on to the end. The newest hash is written in a small head file, and that file is signed with the Freeweights signing key. Anyone with the public key can check the signature.

This does not stop us from adding rows, and it does not prove a row is true. It proves that the history you see is the history we signed. If we ever rewrite the past, a copy someone saved earlier will not match. Details are in the ledger chain doc.

## Verify it yourself {#verify}

From the public repository:

```
python3 scripts/verify_ledger.py
```

It prints PASS or FAIL. On FAIL it names the first entry that does not match. It needs Python 3 and the `minisign` program. The public key is `spec/keys/freeweights-v0.pub` (key id 2DC28CC7B26A283B).

You can also do it by hand: the head file is `ledger/head.json`, its signature is `ledger/head.json.minisig`, and the check is `minisign -Vm ledger/head.json -p spec/keys/freeweights-v0.pub`. The chain is `ledger/chain.jsonl`, one JSON entry per line.

## Catalog snapshots and takedowns {#snapshots}

A second hash chain, `ledger/registry.jsonl`, records what the catalog lists and what was removed. It is kept apart from the money chain so the money totals stay exact.

- **Snapshot.** Each signed catalog build takes the sha256 of every published manifest, sorts the pairs (entry id, hash) by id, writes one line `<id> <hash>` per pair, and hashes those lines into one root. When the root changes, the build adds a snapshot entry to the chain and signs `ledger/snapshot.json`, which lists every pair. If a manifest is changed or removed later, the root no longer matches the signed one.
- **Takedown.** Every removal adds one entry: the date, the entry id and a reason class (for example copyright). No names, no addresses, no report text.

The head of this chain is signed like the money chain: `ledger/registry-head.json` and its `.minisig`.

## Costs by stage {#costs-by-stage}

These are plan figures for what each stage can cost per month. They are estimates, not invoices.

| Stage | What is added | Cost a month |
| --- | --- | --- |
| 0 | Coordinator only: Pages, one Worker, a database, 10 GB object store, public repo | 0 USD |
| 1 | Tracker, hub server, up to 1 TB | 0 to 15 USD |
| 2 | 6 TB web-seed origin | 42 to 90 USD |
| 3 | 50 TB | 350 to 750 USD |
| 4 | 500 TB on donated mirrors | 0 if donated, or 3,500 to 7,500 USD if paid |

## Funding goals {#goals}

A stage starts when three months are prepaid or pledged in writing. The raised amounts below are the real figures in `ledger/goals.json`. At this version they are all 0.

| Goal | Unlocks | Amount | Raised |
| --- | --- | --- | --- |
| 1: Tracker and hub (Stage 1) | Our tracker, hub server, seeds; up to 1 TB hosted. A free VM or a seedbox with written clearance can do this too. | 45 USD (3 months at 15) | 0 USD |
| 2: Origin (Stage 2) | A web-seed origin on Backblaze B2 behind Cloudflare, about 6 TB. Permissive models move to Hosted. Uploads open. | 126 to 270 USD, prepaid | 0 USD |
| 3: Storage server (Stage 3) | One storage server or object storage, 50 TB. Community repos and more quants. | 1,050 to 2,250 USD, prepaid, or a sponsor or credits | 0 USD |

Hosting is prepaid before December 31 so that money in and the costs it covers land in the same year.

## Allternit's share {#allternit-share}

Freeweights does not sell downloads. Allternit earns on its own services, such as running a model on Allternit's cloud. A published share of that revenue goes into the ledger.

The rule, as a draft: 5 percent of net revenue from running Freeweights models on Allternit's cloud and from GPU jobs in Freeweights Studio. Compute deposits never count. The share is booked monthly. **We set the final percentage before launch.** Until then no share has been booked.

## Support {#support}

**Support is not open yet.** There is no payment link. It opens after a separate bank account, the support terms page, an accountant's written view and a Minnesota charitable-solicitation check are done.

When it opens, this line goes with every support link: Support goes to Allternit LLC. It is not a charitable gift and is not tax-deductible.

Support is applied first to the running costs in this ledger. It buys no badge, ranking, placement, access or early features. You may ask for a refund within 30 days.
