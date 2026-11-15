// GET /api/fw/v1/limits (spec/accounts-v1.md 11.1, spec/parts/write-api.yaml getLimits): the upload limits in
// force, the site total and whether scanning is delayed. Public and cacheable for 60 s; a credential is
// ignored (an account's own usage is in GET /api/fw/v1/account `usage`). Every number comes from the
// `limits` table at request time; none is built in. A missing key reads null and closes uploads.
import { LIMIT_KEYS, type Env, type LimitKey, type LimitsReply } from '../types';
import { err, json } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';
import { scannerOk } from '../storage/scan-state';

export type Limits = Record<LimitKey, number | null>;

/** Every limit key, null when unset. Unknown keys in the table are ignored. */
export async function loadLimits(db: D1Database): Promise<Limits> {
  const rows = (await db.prepare(`SELECT key, value FROM limits`).all<{ key: string; value: number }>()).results;
  const out = Object.fromEntries(LIMIT_KEYS.map((k) => [k, null])) as Limits;
  for (const r of rows) if ((LIMIT_KEYS as readonly string[]).includes(r.key)) out[r.key as LimitKey] = r.value;
  return out;
}

/** True when uploads_open is 1 and every cap key is set (staff pass regardless; that check is the caller's). */
export const uploadsOpen = (l: Limits) => l.uploads_open === 1 && LIMIT_KEYS.every((k) => l[k] !== null);

async function limits(env: Env): Promise<Response> {
  const db = env.ACC!;
  const [lim, site, st] = await Promise.all([
    loadLimits(db),
    db.prepare(`SELECT bytes FROM site_usage WHERE id = 1`).first<{ bytes: number }>(),
    db.prepare(`SELECT last_poll_at FROM scanner_state WHERE id = 1`).first<{ last_poll_at: string | null }>(),
  ]);
  const { uploads_open: _open, ...caps } = lim;
  const used = site?.bytes ?? 0;
  const cap = lim.site_cap_bytes;
  const reply: LimitsReply = {
    open: uploadsOpen(lim),
    limits: caps,
    site: { used_bytes: used, cap_bytes: cap, full: cap !== null && used >= cap },
    scanning_delayed: !scannerOk(st?.last_poll_at ?? null, Date.now()),
  };
  return json(reply, 200, { 'cache-control': 'public, max-age=60' });
}

export const limitsRoute: Handler = ({ env }) => {
  if (!env.ACC) return err(503, 'accounts_not_configured', 'Uploads are not turned on for this deployment. Downloads need no account.');
  return d1(() => limits(env));
};
