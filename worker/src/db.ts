import type { Env, State } from './types';

export const FAILED_TTL_MS = 120_000;
export const freshMs = (env: Env) => Number(env.FRESH_MS) || 600_000;
const day = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

export interface StoredState { state: 'live' | 'failed' | 'skipped'; checked_at: number; reason: string | null }

export function effective(s: StoredState | undefined, env: Env, now = Date.now()): State {
  if (!s) return 'stale';
  if (s.state === 'skipped') return 'skipped';
  const ttl = s.state === 'failed' ? FAILED_TTL_MS : freshMs(env);
  return now - s.checked_at > ttl ? 'stale' : s.state;
}

export async function getStates(env: Env, keys: string[]): Promise<Map<string, StoredState>> {
  const out = new Map<string, StoredState>();
  // D1 allows at most 100 bound parameters per statement, so look keys up in chunks.
  // (Listing broke with a 500 once the catalog passed ~100 source keys.)
  const CHUNK = 90;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const part = keys.slice(i, i + CHUNK);
    const rows = await env.DB.prepare(
      `SELECT key, state, checked_at, reason FROM source_state WHERE key IN (${part.map(() => '?').join(',')})`,
    ).bind(...part).all<{ key: string } & StoredState>();
    for (const r of rows.results) out.set(r.key, r);
  }
  return out;
}

/** Worst state across the files of one source (for the detail endpoint). */
export async function sourceSummary(env: Env, prefix: string) {
  const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
  const rows = await env.DB.prepare(
    'SELECT state, checked_at, reason FROM source_state WHERE key >= ? AND key < ?',
  ).bind(prefix, hi).all<StoredState>();
  return rows.results;
}

export const putState = (env: Env, key: string, state: StoredState['state'], reason: string | null) =>
  env.DB.prepare(
    `INSERT INTO source_state (key, state, checked_at, reason) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(key) DO UPDATE SET state = ?2, checked_at = ?3, reason = ?4`,
  ).bind(key, state, Date.now(), reason).run();

/** Takes one slot of the Hugging Face check budget. Returns false when the 5-minute cap is used. */
export async function takeHfSlot(env: Env): Promise<boolean> {
  const cap = Number(env.HF_CHECK_CAP) || 2000;
  const win = Math.floor(Date.now() / 300_000);
  const r = await env.DB.prepare(
    `INSERT INTO hf_window (window, n) VALUES (?1, 1) ON CONFLICT(window) DO UPDATE SET n = n + 1 RETURNING n`,
  ).bind(win).first<{ n: number }>();
  if (r && r.n === 1) await env.DB.prepare('DELETE FROM hf_window WHERE window < ?').bind(win - 2).run();
  return !!r && r.n <= cap;
}

// Route kind of an entry: "model" now; "dataset" once dataset routes exist (plan B1), so ids cannot collide.
export type Kind = 'model' | 'dataset';
// downloads.model_id stays "org/repo" for models (old rows) and is "<kind>:org/repo" for other kinds.
const dayKey = (kind: Kind, id: string) => (kind === 'model' ? id : `${kind}:${id}`);

/** One counted download: the per-day row and the running total, in one atomic batch (2 rows written). */
export const addDownload = (env: Env, kind: Kind, id: string) =>
  env.DB.batch([
    env.DB.prepare(
      `INSERT INTO downloads (model_id, day, starts) VALUES (?1, ?2, 1)
       ON CONFLICT(model_id, day) DO UPDATE SET starts = starts + 1`,
    ).bind(dayKey(kind, id), day()),
    env.DB.prepare(
      `INSERT INTO download_totals (kind, entry_id, total) VALUES (?1, ?2, 1)
       ON CONFLICT(kind, entry_id) DO UPDATE SET total = total + 1`,
    ).bind(kind, id),
  ]);

// Reads use download_totals (one row per entry) and never aggregate the per-day table, which grows
// by one row per entry per day (plan A8: a GROUP BY there used the daily D1 read budget in ~166 calls).

/** Totals for every entry of a kind (sort by downloads). Reads one row per entry with downloads. */
export async function allTotals(env: Env, kind: Kind): Promise<Map<string, number>> {
  const rows = await env.DB.prepare('SELECT entry_id, total FROM download_totals WHERE kind = ?')
    .bind(kind).all<{ entry_id: string; total: number }>();
  return new Map(rows.results.map((r) => [r.entry_id, r.total]));
}

/** Totals for the given entries only (a page of results or one detail). */
export async function totalsFor(env: Env, kind: Kind, ids: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const CHUNK = 90; // D1: at most 100 bound parameters per statement
  for (let i = 0; i < ids.length; i += CHUNK) {
    const part = ids.slice(i, i + CHUNK);
    const rows = await env.DB.prepare(
      `SELECT entry_id, total FROM download_totals WHERE kind = ? AND entry_id IN (${part.map(() => '?').join(',')})`,
    ).bind(kind, ...part).all<{ entry_id: string; total: number }>();
    for (const r of rows.results) out.set(r.entry_id, r.total);
  }
  return out;
}

export const bumpCounter = (env: Env, name: string) =>
  env.DB.prepare(
    `INSERT INTO counters (name, day, n) VALUES (?1, ?2, 1) ON CONFLICT(name, day) DO UPDATE SET n = n + 1`,
  ).bind(name, day()).run();

// Origin budget guard (plan F11). Budget 0 = disabled.
export async function originGuardOn(env: Env): Promise<boolean> {
  const budget = Number(env.ORIGIN_BUDGET_BYTES) || 0;
  if (budget <= 0) return false;
  const r = await env.DB.prepare('SELECT bytes FROM origin_egress WHERE month = ?').bind(month()).first<{ bytes: number }>();
  return (r?.bytes ?? 0) >= budget;
}
export const addOriginBytes = (env: Env, bytes: number) =>
  env.DB.prepare(
    `INSERT INTO origin_egress (month, bytes) VALUES (?1, ?2) ON CONFLICT(month) DO UPDATE SET bytes = bytes + ?2`,
  ).bind(month(), bytes).run();
export const isPaidOrigin = (env: Env, url: string | undefined) => {
  if (!url) return false;
  const hosts = (env.PAID_ORIGIN_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  try { return hosts.includes(new URL(url).hostname.toLowerCase()); } catch { return false; }
};

// ---- Takedowns (plan B9, migration 0003) -----------------------------------------------------
// The whole table is read at most once per TAKEDOWN_TTL_MS per isolate (one row per takedown, so a few
// rows), so a takedown written with `fw_admin.py takedown --apply` answers 451 within a minute with no
// redeploy. A failed read (table not created yet, D1 paused at the daily cap) keeps the last known set and
// never fails the route: catalog, manifests and detail pages stay up when D1 is down.
export const TAKEDOWN_TTL_MS = 60_000;
let takedownIds = new Set<string>();
let takedownAt = 0;
export async function takenDownIds(env: Env, now = Date.now()): Promise<Set<string>> {
  if (now - takedownAt < TAKEDOWN_TTL_MS) return takedownIds;
  takedownAt = now;
  try {
    const rows = await env.DB.prepare('SELECT entry_id FROM takedowns').all<{ entry_id: string }>();
    takedownIds = new Set(rows.results.map((r) => r.entry_id));
  } catch { /* keep the last known set */ }
  return takedownIds;
}
/** True when the id was removed after a takedown (any kind: routes do not carry the kind yet). */
export const isTakenDown = async (env: Env, id: string) => (await takenDownIds(env)).has(id);
