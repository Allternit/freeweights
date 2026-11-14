-- 0002 (plan A8): running download totals, one row per catalog entry, so search and detail read
-- one row per entry instead of a GROUP BY over every (entry, day) row of `downloads`.
-- Additive and safe to run more than once: the backfill SETS each total from the per-day rows,
-- so a re-run repairs totals instead of adding to them. Re-run it once after the Worker that writes
-- download_totals is deployed, to pick up downloads the old Worker counted in between.
CREATE TABLE IF NOT EXISTS download_totals (
  kind     TEXT NOT NULL,             -- route kind: model | dataset
  entry_id TEXT NOT NULL,             -- org/repo
  total    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, entry_id)
) WITHOUT ROWID;

-- downloads.model_id is "org/repo" for models and "<kind>:org/repo" for other kinds.
-- ("WHERE true" is required by SQLite before GROUP BY in an INSERT ... SELECT ... ON CONFLICT.)
INSERT INTO download_totals (kind, entry_id, total)
SELECT CASE WHEN instr(model_id, ':') > 0 THEN substr(model_id, 1, instr(model_id, ':') - 1) ELSE 'model' END,
       CASE WHEN instr(model_id, ':') > 0 THEN substr(model_id, instr(model_id, ':') + 1) ELSE model_id END,
       SUM(starts)
FROM downloads WHERE true
GROUP BY model_id
ON CONFLICT(kind, entry_id) DO UPDATE SET total = excluded.total;
