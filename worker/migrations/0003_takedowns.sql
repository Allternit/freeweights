-- 0003 (plan B9): entries removed after a takedown. Written by scripts/fw_admin.py takedown --apply.
-- The Worker reads the whole table (one row per takedown, cached 60 s per isolate) before any R2 read and
-- answers 451 for the entry's API detail, tree, resolve, manifest, signature and detail page, with no redeploy.
-- No personal data: the reason is a fixed class; the report itself stays in the takedown mailbox.
-- Additive and safe to run more than once.
CREATE TABLE IF NOT EXISTS takedowns (
  kind         TEXT NOT NULL,      -- model | dataset
  entry_id     TEXT NOT NULL,      -- org/repo
  reason_class TEXT NOT NULL,      -- copyright | csam | real_person_likeness | crime_marketing | malware_or_secrets | license_violation | other
  at           TEXT NOT NULL,      -- ISO time of the removal (UTC)
  PRIMARY KEY (kind, entry_id)
) WITHOUT ROWID;
