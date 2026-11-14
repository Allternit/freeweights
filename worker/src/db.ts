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

export const addDownload = (env: Env, id: string) =>
  env.DB.prepare(
    `INSERT INTO downloads (model_id, day, starts) VALUES (?1, ?2, 1)
     ON CONFLICT(model_id, day) DO UPDATE SET starts = starts + 1`,
  ).bind(id, day()).run();

export async function downloadTotals(env: Env): Promise<Map<string, number>> {
  const rows = await env.DB.prepare('SELECT model_id, SUM(starts) AS n FROM downloads GROUP BY model_id').all<{ model_id: string; n: number }>();
  return new Map(rows.results.map((r) => [r.model_id, r.n]));
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
