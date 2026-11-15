---
title: Takedowns and snapshots
nav_label: Takedowns
summary: How to report an item, what happens when we remove one (451, blocklist, counter, signed record), and how to check the signed catalog snapshots.
group: Policy
order: 7.8
updated: 2026-11-15
sections:
  - {id: report, title: Report an item}
  - {id: what-happens, title: What a removal does}
  - {id: what-you-see, title: What clients see}
  - {id: record, title: The public record}
  - {id: snapshots, title: Catalog snapshots}
  - {id: operators, title: For operators}
---
Every removal is public. It is counted, and it is written to a signed record. The full process, with counter-notices and appeals, is on the Operating Statement page.

## Report an item {#report}

- **Banned content or a policy problem:** abuse@allternit.com.
- **Copyright notices and counter-notices:** dmca@allternit.com. Name the work, the item (its Freeweights id or URL), your contact details, a good-faith statement and a statement of authority, with a signature.
- **Malware, secrets or a security hole:** security@allternit.com.
- **Anything else** (a wrong license, checksum or source): freeweights@allternit.com, with the model id and what you found.

You get an acknowledgement. We decide within 72 hours. Malware and child sexual abuse material are handled at once.

## What a removal does {#what-happens}

One command does all of it, in this order:

1. **The entry stops at once.** The API, the download redirect, the manifest and the detail page answer 451 within a minute. No redeploy is needed.
2. **Its weights are blocklisted.** The sha256 of each weight file goes on a blocklist. The catalog build refuses any repo with one of those files, so the same weights uploaded under another name are not listed.
3. **It leaves the catalog.** Its row and its manifest are removed from the next build.
4. **The counter goes up.** The takedown counter on the Operating Statement page shows every removal by reason class.
5. **A signed line is written.** The registry chain gets one entry: the date, the id and the reason class.

The record holds no names, no addresses and no text from the report.

**Sensitive removals.** For child sexual abuse material (`csam`), non-consensual intimate imagery (`ncii`), personal data (`personal_data`) and a real person's likeness (`real_person_likeness`), the hashes go on a private list that is never published, and the counter and the signed line show only the date and the reason class, not the id, because the id can name a person or describe the material. We share those hashes on request with parties that need them to block the same files.

## What clients see {#what-you-see}

| Route | Reply |
| --- | --- |
| `GET` or `HEAD /{org}/{repo}/resolve/{rev}/{path}` | 451, code `removed_after_takedown` |
| `GET /api/models/{org}/{repo}` and `/tree/{rev}` | 451, code `removed_after_takedown` |
| `GET /manifests/{org}/{repo}.json` and `.json.minisig` | 451, code `removed_after_takedown` |
| The detail page | 451, a short page that links to the counter |
| `GET /api/models` (search) | The entry is not listed |

A 451 reply is never cached (`Cache-Control: no-store`), so a restore after a counter-notice or an appeal shows at once.

## The public record {#record}

- **Counter:** the Operating Statement page, section Takedown counter (from `policy/takedowns.json`).
- **Registry chain:** `ledger/registry.jsonl` on the site and in the repository, one entry per takedown and per snapshot, linked by hashes. Its head, `ledger/registry-head.json`, is signed with the Freeweights key (id 2DC28CC7B26A283B).
- **Blocklist:** `policy/blocklist.json` in the repository: the removed ids and their weight-file hashes for non-sensitive classes (copyright, license, publisher request and the like). It holds no content. Hashes for sensitive classes are on a private list, shared on request.

## Catalog snapshots {#snapshots}

Each signed catalog build records which manifests it published. It takes the sha256 of every manifest file, sorts the pairs (entry id, hash) by id, writes one line `<id> <hash>` per pair, and hashes those lines into one root. When the root changes, the build adds a snapshot entry to the registry chain and signs `ledger/snapshot.json`, which lists every pair.

To check that the manifests on the site are the ones we signed:

```
python3 scripts/verify_ledger.py --snapshot-against https://freeweights.allternit.com
```

It checks both chains and their signatures, downloads every manifest the snapshot names, recomputes the root and compares it with the signed one. From a checkout, `--snapshot-against manifests/` does the same with the local files. By hand: `minisign -Vm snapshot.json -P <key>`, then hash the lines yourself.

A changed or removed manifest gives a different root. That is how you can tell a manifest was edited after we signed it.

## For operators {#operators}

```
python3 scripts/fw_admin.py takedown <org/repo> --reason copyright --dry-run   # print every step, write nothing
python3 scripts/fw_admin.py takedown <org/repo> --reason copyright --apply     # live database first, then the files
cd site && node build.mjs && cd .. && python3 scripts/sync_r2.py --delete      # remove the stored page and manifest
python3 scripts/fw_admin.py stats --remote                                     # downloads, top entries, takedown count
```

Reason classes: `copyright`, `license_violation`, `publisher_request`, `malware_or_secrets`, `crime_marketing`, `other` (public blocklist), and the sensitive `csam`, `ncii`, `personal_data`, `real_person_likeness` (private list at `~/.config/freeweights/blocklist-private.json`, or `$FREEWEIGHTS_PRIVATE_BLOCKLIST`; never committed; id withheld from the public record). The build refuses hashes from both lists, so build on a machine that has the private list. Without `--apply`, the database command is printed and not run. For a sensitive class, do not name the entry in the commit message. Then deploy the Worker (its bundled catalog) and the site, and commit the blocklist, counter, catalog and registry files together.
