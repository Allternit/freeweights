// GET /api/fw/v1/limits (spec/accounts-v1.md 11.1, spec/parts/write-api.yaml getLimits): the upload limits in
// force, the site total and whether scanning is delayed. Public and cacheable for 60 s; a credential is
// ignored (an account's own usage is in GET /api/fw/v1/account `usage`). Every number comes from the
// `limits` table at request time; none is built in. A missing key reads null and closes uploads.
//
// The body is built by moderation.ts limitsView, the same function the admin PUT /limits reply uses, so the
// public and admin bodies cannot drift apart.
import type { Env, LimitsReply } from '../types';
import { err, json } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';
import { limitsView } from '../moderation';

async function limits(env: Env): Promise<Response> {
  const db = env.ACC!;
  const [rows, site, st] = await Promise.all([
    db.prepare(`SELECT key, value FROM limits`).all<{ key: string; value: number }>(),
    db.prepare(`SELECT bytes FROM site_usage WHERE id = 1`).first<{ bytes: number }>(),
    db.prepare(`SELECT last_poll_at FROM scanner_state WHERE id = 1`).first<{ last_poll_at: string | null }>(),
  ]);
  const reply: LimitsReply = limitsView(Object.fromEntries((rows.results || []).map((r) => [r.key, r.value])), site?.bytes ?? 0, st?.last_poll_at ?? null) as LimitsReply;
  return json(reply, 200, { 'cache-control': 'public, max-age=60' });
}

export const limitsRoute: Handler = ({ env }) => {
  if (!env.ACC) return err(503, 'accounts_not_configured', 'Uploads are not turned on for this deployment. Downloads need no account.');
  return d1(() => limits(env));
};
