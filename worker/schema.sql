-- Download starts per model per UTC day. No IP, no user agent, no token is stored.
CREATE TABLE IF NOT EXISTS downloads (
  model_id TEXT NOT NULL,
  day      TEXT NOT NULL,
  starts   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (model_id, day)
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
