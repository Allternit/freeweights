-- Full current schema for a fresh database. Existing databases apply migrations/ in order instead.

-- Download starts per entry per UTC day. No IP, no user agent, no token is stored.
-- model_id is "org/repo" for models and "<kind>:org/repo" for other kinds.
CREATE TABLE IF NOT EXISTS downloads (
  model_id TEXT NOT NULL,
  day      TEXT NOT NULL,
  starts   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (model_id, day)
) WITHOUT ROWID;

-- Running download total per entry (migration 0002). Written in the same batch as `downloads`;
-- search and detail read this table and never aggregate `downloads`.
CREATE TABLE IF NOT EXISTS download_totals (
  kind     TEXT NOT NULL,             -- route kind: model | dataset
  entry_id TEXT NOT NULL,             -- org/repo
  total    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, entry_id)
) WITHOUT ROWID;

-- Last check result per model/source/file. key = "<id>|<type>|<priority>|<path>".
CREATE TABLE IF NOT EXISTS source_state (
  key        TEXT PRIMARY KEY,
  state      TEXT NOT NULL,       -- live | failed | skipped
  checked_at INTEGER NOT NULL,    -- epoch ms
  reason     TEXT
) WITHOUT ROWID;

-- Hugging Face check budget, one row per 5-minute window.
CREATE TABLE IF NOT EXISTS hf_window (
  window INTEGER PRIMARY KEY,
  n      INTEGER NOT NULL
);

-- Origin egress estimate per month (bytes), for the budget guard stub (plan F11).
CREATE TABLE IF NOT EXISTS origin_egress (
  month TEXT PRIMARY KEY,
  bytes INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

-- Small named counters per day, for example hf_token_rejected. Only the fact is counted.
CREATE TABLE IF NOT EXISTS counters (
  name TEXT NOT NULL,
  day  TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (name, day)
) WITHOUT ROWID;

-- Entries removed after a takedown (migration 0003). The Worker answers 451 for them before any R2 read.
CREATE TABLE IF NOT EXISTS takedowns (
  kind         TEXT NOT NULL,      -- model | dataset
  entry_id     TEXT NOT NULL,      -- org/repo
  reason_class TEXT NOT NULL,      -- fixed class, never free text
  at           TEXT NOT NULL,      -- ISO time of the removal (UTC)
  PRIMARY KEY (kind, entry_id)
) WITHOUT ROWID;
