import { authErr, authJson } from '../http';
import { authenticate } from '../auth';
import { reportsAllowed, validateReport } from '../moderation';
import type { Handler } from '../router';

// POST /api/fw/v1/reports (spec/parts/write-api.yaml createReport). A signed-in person with a profile reports a
// repo, user or other target; an admin reads it with fw_admin.py reports. Rate limited per account by the
// `reports_per_day` limit (a key in the limits table, set by the operator; no number lives in this repo). With
// the key unset only the request rate applies, so a report is never refused for a missing setting. Filing the
// same report twice returns the first one. Legal notices without an account go to the takedown mailbox.

const ulid = () => {
  const t = Date.now().toString(36).toUpperCase().padStart(10, '0');
  const r = crypto.getRandomValues(new Uint8Array(16));
  return t + [...r].map((x) => (x % 36).toString(36).toUpperCase()).join('');
};

export const reportsRoute: Handler = async ({ req, env, ctx, url }) => {
  const a = await authenticate(req, env, url.origin, ctx);
  if (a instanceof Response) return a;
  if (!a.scopes.includes('freeweights.write')) return authErr(403, 'insufficient_scope', 'This key needs the freeweights.write scope.');
  const text = await req.text();
  if (text.length > 16 * 1024) return authErr(400, 'bad_request', 'Request body is too large.');
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return authErr(400, 'bad_request', 'Send a JSON object.'); }
  const v = validateReport(raw);
  if ('problem' in v) return authErr(400, 'bad_request', v.problem);
  const r = v.ok;
  const db = env.ACC!;
  const me = await db.prepare("SELECT id FROM users WHERE id = ?1 AND status <> 'deleted'").bind(a.userId).first();
  if (!me) return authErr(404, 'profile_not_found', 'Pick a handle first (POST /api/fw/v1/account), then report. A legal notice without an account goes to the takedown mailbox (docs/takedowns).');

  const same = await db.prepare("SELECT id FROM reports WHERE reporter_user_id = ?1 AND target_type = ?2 AND target_id = ?3 AND reason_class = ?4 AND status = 'open'")
    .bind(a.userId, r.target_type, r.target_id, r.reason_class).first<{ id: string }>();
  if (same) return authJson({ id: same.id, status: 'open' });

  const lim = await db.prepare("SELECT value FROM limits WHERE key = 'reports_per_day'").first<{ value: number }>();
  const since = new Date(Date.now() - 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const n = await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE reporter_user_id = ?1 AND created_at >= ?2').bind(a.userId, since).first<{ n: number }>();
  if (!reportsAllowed(n?.n ?? 0, lim ? lim.value : null)) {
    return authErr(429, 'rate_limited', 'Too many reports from this account today. Try again tomorrow, or write to the takedown mailbox for a legal notice.', { 'retry-after': '3600' });
  }
  const id = `rpt_${ulid()}`;
  await db.prepare('INSERT INTO reports (id, reporter_user_id, target_type, target_id, reason_class, body) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(id, a.userId, r.target_type, r.target_id, r.reason_class, r.body).run();
  return authJson({ id, status: 'open' });
};
