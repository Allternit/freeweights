# Freeweights Takedown and Appeals Procedure

Status: Draft. Owner: Allternit. Public summary at /ethos.

## 1. Intake

| Address | Use |
| --- | --- |
| abuse@allternit.com | Banned content, policy reports |
| dmca@allternit.com | Copyright notices and counter-notices |
| security@allternit.com | Malware, secrets, vulnerabilities |
| freeweights@allternit.com | Everything else |

All four routes forward to Allternit (verified 2026-11-14). Each report gets an acknowledgement and a ticket number.

## 2. Auto-quarantine

We quarantine automatically in only two cases:

- A scanner hit (malware, secrets, unsafe file format).
- A match to a hash on the blocklist.

Nothing else is removed without a person looking at it. Quarantined files are not served. The listing shows "under review".

## 3. CSAM procedure

1. Disable public access at once.
2. Preserve the material and the records as the law requires. Do not copy, view or share it more than needed.
3. Report as the law requires.
4. Add the hash to the blocklist.

The exact steps, the reporting body and the retention period come from counsel. Until counsel signs off, this section is a placeholder. No one acts on it from memory.

## 4. Copyright notice and counter-notice

- A notice must name the work, the infringing item, the sender's contact details, a good-faith statement and a statement of authority, with a signature.
- We remove or disable the item and tell the uploader and the source author.
- The uploader may send a counter-notice. If it is complete, we restore the item in 10 to 14 business days unless the sender files a court action.
- Repeat infringers are removed from any contributor program.

## 5. Decisions in 72 hours

We decide on each report within 72 hours of receipt and tell the reporter. CSAM and malware are handled at once, not in 72 hours.

## 6. Blocklist

Hashes and identifiers of removed items. A hash stays on the list until an appeal or a court order removes it. The lists hold no content.

- **Public list** (`policy/blocklist.json`, in the repository): non-sensitive classes: copyright, license_violation, publisher_request, malware_or_secrets, crime_marketing, other.
- **Private list** (`~/.config/freeweights/blocklist-private.json`, or `$FREEWEIGHTS_PRIVATE_BLOCKLIST`; never committed): sensitive classes: csam, ncii, personal_data, real_person_likeness. Hashes are shared on request. The public counter and registry line for these show only the date, kind and class; the id is withheld because it can name a person or describe the material.

`scripts/discover.py` drops and `scripts/build_catalog.py` refuses any repo whose id or weight-file sha256 is on either list, so catalog builds run on a machine that has the private list.

## 6a. The takedown command

`python3 scripts/fw_admin.py takedown <org/repo> --reason <class> [--dry-run] [--apply]` does the removal in one step: the database row that makes the Worker answer 451 at once (live only with `--apply`; the exact wrangler command is printed), the blocklist entry with the weight hashes, removal of the catalog row and manifest, the public counter (`policy/takedowns.json`) and a signed registry line (date, id, reason class; no personal data). Then rebuild the site, run `scripts/sync_r2.py --delete`, deploy, and commit. Reason classes: as in section 6.

## 7. Appeals

The owner of a removed item may appeal in writing within 30 days. A person who did not make the first decision reviews it and answers in 14 days. Removals for CSAM are not appealed through this process.

## 8. Public takedown counter

/ethos shows, per month: reports received, items removed, items restored, and the reason categories. Removals are never hidden.

## 9. DMCA designated agent

We file a designated agent with the US Copyright Office to qualify for safe harbor. The filing fee is to be verified on the Copyright Office page before filing. The agent's contact details are public.

## DECISION (Allternit)

- DECISION (Allternit): Who is the designated agent: Allternit, or a role mailbox with a named person. Draft default: Allternit LLC with Allternit named.
- DECISION (Allternit): Appeal window (30 days) and answer time (14 days). Draft default: as written.
- DECISION (Allternit): Whether the blocklist is published in full or as a count only. Draft default: count and category, with hashes shared on request. As built: hashes are public only for non-sensitive classes; sensitive classes keep hashes private (shared on request) and withhold the id.

## Verify with counsel

- CSAM disable, preserve and report steps, and the retention period.
- Section 512 notice and counter-notice wording, and the 10 to 14 day restore rule.
- Designated agent filing and the current fee.
- Whether hosting of the model weights changes our safe harbor position.
- Blocklist publication risk.
