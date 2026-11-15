-- freeweights-accounts 0003: launch limits, the site byte total, the scanner heartbeat and scan job claims
-- (contract spec/accounts-v1.md section 11, routes spec/parts/write-api.yaml).
--
-- * `limits` holds every upload limit as key -> integer. No cap number is written here or anywhere in the
--   repo: the operator sets them with `scripts/fw_admin.py limits set <key> <value>` (admin route
--   PUT /api/fw/v1/admin/limits). The only seeded row is uploads_open = 0, so uploads start closed.
--   A missing cap key means uploads are paused (the Worker fails closed), never "no limit".
-- * Until perks are offered, the per-account storage cap is the `user_cap_bytes` limit, not a claim perk.
--   This supersedes the 0001 comment on storage_usage ("Limits come from the entitlement claim"). The site
--   cap (`site_cap_bytes`) always applies.
-- * Adds columns with ALTER TABLE, which has no IF NOT EXISTS in SQLite: run once, through
--   `wrangler d1 migrations apply freeweights-accounts` (which records it). The CREATE and INSERT parts are
--   safe to repeat.

-- ---- Limits ----------------------------------------------------------------------------------------

-- Keys the Worker reads (spec/accounts-v1.md 11.1): uploads_open (0/1), site_cap_bytes, user_cap_bytes,
-- file_max_bytes, repos_per_user, repo_creates_per_day, commits_per_hour, files_per_commit. Unknown keys are
-- ignored, so a new key needs no migration. Changing a value needs no deploy.
CREATE TABLE IF NOT EXISTS limits (
  key         TEXT PRIMARY KEY CHECK (length(key) BETWEEN 1 AND 64 AND key NOT GLOB '*[^a-z0-9_]*'),
  value       INTEGER NOT NULL CHECK (value >= 0),
  updated_by  TEXT,                                              -- 'admin' or 'migration'; never a person's name
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
INSERT OR IGNORE INTO limits (key, value, updated_by) VALUES ('uploads_open', 0, 'migration');

-- ---- Site byte total --------------------------------------------------------------------------------

-- One row. Every community byte counts against site_cap_bytes: reserved at the LFS batch (upload pending,
-- uploaded or verified), in quarantine (scanning or held) and promoted (live). Reserved in the same D1 batch
-- as the owner's storage_usage row, by one conditional UPDATE that checks file_max_bytes, user_cap_bytes and
-- site_cap_bytes together. Released on expiry, abort, size mismatch, held-file deletion and repo deletion.
-- `fw_admin.py usage reconcile` recomputes it (and storage_usage) from uploads and repos.
CREATE TABLE IF NOT EXISTS site_usage (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  bytes          INTEGER NOT NULL DEFAULT 0 CHECK (bytes >= 0),
  reconciled_at  TEXT,
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
INSERT OR IGNORE INTO site_usage (id, bytes) VALUES (1, 0);

-- ---- Scanner heartbeat ------------------------------------------------------------------------------

-- One row, written by every POST /api/fw/v1/scan/claim. GET /api/fw/v1/scan/health answers 200 while
-- last_poll_at is under 10 minutes old, else 503. Files are never promoted because the scanner is late.
CREATE TABLE IF NOT EXISTS scanner_state (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  last_poll_at     TEXT,
  scanner_version  TEXT,
  last_sweep_at    TEXT,
  last_sweep       TEXT,                                         -- JSON {expired_uploads, requeued, errored, held_deleted}
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
INSERT OR IGNORE INTO scanner_state (id) VALUES (1);

-- ---- Blocked hashes ---------------------------------------------------------------------------------

-- sha256 values of files removed after a takedown, from both blocklists (scripts/blocklist.py), so the
-- Worker can refuse a re-upload without the scanner holding the private list. Hashes only, never content or
-- a description. Written by the admin remove route; a scan result for a listed hash is held (blocklisted).
CREATE TABLE IF NOT EXISTS blocked_hashes (
  sha256        TEXT PRIMARY KEY CHECK (length(sha256) = 64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
  reason_class  TEXT NOT NULL,
  source        TEXT,                                            -- rp_... or a blocklist entry id; never a person
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ---- New columns ------------------------------------------------------------------------------------

-- Upload rules (policy/community-rules.md) accepted. Repo create, preupload, LFS batch and commit answer
-- 403 rules_not_accepted while this is null.
ALTER TABLE users ADD COLUMN rules_accepted_at TEXT;
-- Staff may upload while uploads_open = 0 (staged open). Set by the admin users route only.
ALTER TABLE users ADD COLUMN staff INTEGER NOT NULL DEFAULT 0 CHECK (staff IN (0, 1));

-- Why a repo is removed: a takedown reason_class (resolve answers 451) or 'owner' / 'account_deleted'
-- (resolve answers 404). Null while the repo is not removed.
ALTER TABLE repos ADD COLUMN removed_reason TEXT;

-- Scan job claims (U7, U9). A claim sets status 'scanning', attempts + 1 and claimed_until = now + 30 min.
-- The sweep puts a scan whose claim ran out back to 'queued'; after the third attempt it goes to 'error'.
ALTER TABLE scans ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0);
ALTER TABLE scans ADD COLUMN claimed_until TEXT;

-- ---- Indexes for the rate limits and the sweep ------------------------------------------------------

CREATE INDEX IF NOT EXISTS repos_owner_created ON repos(owner_user_id, created_at) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS commits_author_created ON commits(author_user_id, created_at) WHERE author_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS uploads_user_status ON uploads(user_id, status);
CREATE INDEX IF NOT EXISTS scans_claim ON scans(status, claimed_until);
CREATE INDEX IF NOT EXISTS reports_reporter ON reports(reporter_user_id, created_at) WHERE reporter_user_id IS NOT NULL;
