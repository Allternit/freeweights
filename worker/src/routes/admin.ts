import type { Env } from '../types';
import { authErr, authJson } from '../http';
import { requireSigned } from '../auth/hmac';
import { LIMIT_KEYS, REMOVE_REASONS, diffUsage, limitsView, type Usage } from '../moderation';
import { promoteBlob, publishPage, settleRepo } from '../storage/promote';
import type { Handler } from '../router';

// /api/fw/v1/admin/* (spec/accounts-v1.md 11.4 and 11.7, spec/parts/write-api.yaml tag admin). Signed with
// ADMIN_SECRET (auth/hmac.ts), driven by scripts/fw_admin.py. Every write is safe to repeat inside the 300 s
// replay window and is recorded in audit_log with no actor (the operator is not a user).

const PAGE = 50;
const ACTIVE = "('pending', 'uploaded', 'verified', 'committed')";
const ISO = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const bad = (m: string) => authErr(400, 'bad_request', m);
const notFound = (m = 'Not found.') => authErr(404, 'not_found', m);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const REPO_ID = /^rp_[0-9A-Za-z]+$/;
const REPORT_ID = /^rpt_[0-9A-Za-z]+$/;
const HANDLE = /^[A-Za-z0-9][A-Za-z0-9._-]{1,41}$/;

const parse = (body: string): Record<string, unknown> | Response => {
  if (!body) return {};
  try { const v = JSON.parse(body); return isObj(v) ? v : bad('Send a JSON object.'); } catch { return bad('Send a JSON object.'); }
};
const audit = (env: Env, action: string, type: 'user' | 'repo', id: string, meta?: unknown) =>
  env.ACC!.prepare('INSERT INTO audit_log (action, target_type, target_id, meta) VALUES (?1, ?2, ?3, ?4)').bind(action, type, id, meta === undefined ? null : JSON.stringify(meta));

/** Keyset paging over (created_at, id), oldest first. The cursor is "<created_at>|<id>" of the last row sent. */
function cursorArgs(url: URL): { ts: string; id: string } | Response {
  const c = url.searchParams.get('cursor');
  if (!c) return { ts: '', id: '' };
  const i = c.indexOf('|');
  return i > 0 ? { ts: c.slice(0, i), id: c.slice(i + 1) } : bad('Bad cursor.');
}
const nextOf = <T extends { created_at: string; id: string }>(rows: T[]) => (rows.length > PAGE ? `${rows[PAGE - 1].created_at}|${rows[PAGE - 1].id}` : null);

// ---- reports ----------------------------------------------------------------------------------------------

async function listReports(env: Env, url: URL) {
  const st = url.searchParams.get('status') || 'open';
  if (!['open', 'actioned', 'rejected'].includes(st)) return bad('status must be open, actioned or rejected.');
  const c = cursorArgs(url); if (c instanceof Response) return c;
  const { results } = await env.ACC!.prepare(
    `SELECT r.id, r.created_at, r.target_type, r.target_id, r.reason_class, r.body, r.status, r.resolution, u.handle AS reporter
       FROM reports r LEFT JOIN users u ON u.id = r.reporter_user_id
      WHERE r.status = ?1 AND (r.created_at, r.id) > (?2, ?3) ORDER BY r.created_at, r.id LIMIT ?4`)
    .bind(st, c.ts, c.id, PAGE + 1).all<{ id: string; created_at: string; target_type: string; target_id: string; reason_class: string; body: string | null; status: string; resolution: string | null; reporter: string | null }>();
  return authJson({
    reports: results.slice(0, PAGE).map((r) => ({ id: r.id, reporter: r.reporter, target_type: r.target_type, target_id: r.target_id, reason_class: r.reason_class, body: r.body, status: r.status, resolution: r.resolution, createdAt: r.created_at })),
    next: nextOf(results),
  });
}

async function resolveReport(env: Env, id: string, b: Record<string, unknown>) {
  if (!REPORT_ID.test(id)) return notFound();
  if (b.status !== 'actioned' && b.status !== 'rejected') return bad('status must be actioned or rejected.');
  if (b.resolution !== undefined && (typeof b.resolution !== 'string' || b.resolution.length > 2000)) return bad('resolution must be a string of at most 2000 characters.');
  const row = await env.ACC!.prepare(
    "UPDATE reports SET status = ?2, resolution = ?3, updated_at = ?4 WHERE id = ?1 RETURNING id, created_at, target_type, target_id, reason_class, body, status, resolution")
    .bind(id, b.status, (b.resolution as string | undefined) ?? null, ISO()).first<Record<string, string | null>>();
  if (!row) return notFound('No such report.');
  return authJson({ id: row.id, reporter: null, target_type: row.target_type, target_id: row.target_id, reason_class: row.reason_class, body: row.body, status: row.status, resolution: row.resolution, createdAt: row.created_at });
}

// ---- held scans -------------------------------------------------------------------------------------------

async function listHeld(env: Env, url: URL) {
  const c = cursorArgs(url); if (c instanceof Response) return c;
  const { results } = await env.ACC!.prepare(
    `SELECT s.id, s.created_at, s.repo_id, s.path, s.sha256, s.status, s.attempts, s.findings, s.finished_at, r.namespace, r.name
       FROM scans s JOIN repos r ON r.id = s.repo_id
      WHERE s.status IN ('held', 'error') AND (s.created_at, s.id) > (?1, ?2) ORDER BY s.created_at, s.id LIMIT ?3`)
    .bind(c.ts, c.id, PAGE + 1).all<{ id: string; created_at: string; repo_id: string; path: string; sha256: string; status: string; attempts: number; findings: string | null; finished_at: string | null; namespace: string; name: string }>();
  return authJson({
    scans: results.slice(0, PAGE).map((s) => {
      let findings: unknown = [];
      try { findings = s.findings ? JSON.parse(s.findings) : []; } catch { /* keep [] */ }
      return {
        id: s.id, repo_id: s.repo_id, repo: `${s.namespace}/${s.name}`, path: s.path, sha256: s.sha256, status: s.status, attempts: s.attempts, findings,
        finished_at: s.finished_at, delete_after: s.status === 'held' && s.finished_at ? new Date(Date.parse(s.finished_at) + 14 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z') : null,
      };
    }),
    next: nextOf(results),
  });
}

// ---- repo remove / restore --------------------------------------------------------------------------------

interface RepoRowLite { id: string; namespace: string; name: string; status: string; removed_reason: string | null; head_commit: string | null }
const loadRepo = (env: Env, id: string) =>
  REPO_ID.test(id) ? env.ACC!.prepare("SELECT id, namespace, name, status, removed_reason, head_commit FROM repos WHERE id = ?1 AND source = 'community'").bind(id).first<RepoRowLite>() : Promise.resolve(null);

/** Deletes a repo's R2 objects, a bounded number per call (the free plan allows 50 subrequests per request). True when nothing is left. */
async function purgeFiles(env: Env, repoId: string): Promise<boolean> {
  let calls = 0;
  for (const b of [env.FW, env.QUARANTINE, env.PRIVATE]) {
    if (!b) continue;
    for (;;) {
      if (calls >= 16) return false;
      const l = await b.list({ prefix: `repos/${repoId}/`, limit: 500 }); calls += 1;
      if (l.objects.length) { await b.delete(l.objects.map((o) => o.key)); calls += 1; }
      if (!l.truncated) break;
    }
  }
  return true;
}

async function isPurged(env: Env, repo: RepoRowLite): Promise<boolean> {
  if (!repo.head_commit) return false;
  const r = await env.ACC!.prepare(`SELECT COUNT(*) AS n FROM uploads WHERE repo_id = ?1 AND status IN ${ACTIVE}`).bind(repo.id).first<{ n: number }>();
  return (r?.n ?? 0) === 0;
}

async function removeRepo(env: Env, id: string, b: Record<string, unknown>) {
  if (typeof b.reason_class !== 'string' || !(REMOVE_REASONS as readonly string[]).includes(b.reason_class)) return bad(`reason_class must be one of ${REMOVE_REASONS.join(', ')}.`);
  if (b.report_id !== undefined && (typeof b.report_id !== 'string' || !REPORT_ID.test(b.report_id))) return bad('report_id must look like rpt_...');
  const repo = await loadRepo(env, id);
  if (!repo) return notFound('No such repo.');
  const db = env.ACC!;
  const now = ISO();
  const { results } = await db.prepare('SELECT sha256 FROM scans WHERE repo_id = ?1 UNION SELECT oid FROM uploads WHERE repo_id = ?1').bind(id).all<{ sha256: string }>();
  const hashes = results.map((r) => r.sha256);
  const stmts = [db.prepare("UPDATE repos SET status = 'removed', removed_reason = ?2, updated_at = ?3 WHERE id = ?1").bind(id, b.reason_class, now)];
  if (b.blocklist === true) {
    for (let i = 0; i < hashes.length; i += 30) {
      const chunk = hashes.slice(i, i + 30);
      stmts.push(db.prepare(`INSERT OR IGNORE INTO blocked_hashes (sha256, reason_class, source) VALUES ${chunk.map((_, j) => `(?${j * 3 + 1}, ?${j * 3 + 2}, ?${j * 3 + 3})`).join(', ')}`)
        .bind(...chunk.flatMap((h) => [h, b.reason_class, id])));
    }
  }
  if (typeof b.report_id === 'string') stmts.push(db.prepare("UPDATE reports SET status = 'actioned', resolution = ?2, updated_at = ?3 WHERE id = ?1 AND status = 'open'").bind(b.report_id, `removed: ${b.reason_class}`, now));
  stmts.push(audit(env, 'repo.remove', 'repo', id, { reason_class: b.reason_class, blocklist: b.blocklist === true, purge: b.purge === true, report_id: b.report_id ?? null }));
  await db.batch(stmts);

  // The community detail page sits in R2 where Cloud Connector serves it with no Worker in the path: delete it
  // (404 there; the API answers 451). The caller purges these paths from the edge cache.
  const page = `alt.freeweights.community/${repo.namespace}/${repo.name}`;
  await env.FW.delete(`${page}/index.html`);
  let purged = false;
  if (b.purge === true) {
    purged = await purgeFiles(env, id);
    if (purged) {
      await db.prepare(`UPDATE uploads SET status = 'aborted', updated_at = ?2 WHERE repo_id = ?1 AND status IN ${ACTIVE}`).bind(id, now).run();
      await reconcile(env);
    }
  }
  return authJson({ id, status: 'removed', sha256: hashes, purged, static_paths: [`/${page}/`, `/${page}/index.html`, `/${page}`] });
}

async function restoreRepo(env: Env, id: string, b: Record<string, unknown>) {
  for (const k of ['release_held', 'unblock']) if (b[k] !== undefined && typeof b[k] !== 'boolean') return bad(`${k} must be true or false.`);
  if (b.note !== undefined && (typeof b.note !== 'string' || b.note.length > 2000)) return bad('note must be a string of at most 2000 characters.');
  const repo = await loadRepo(env, id);
  if (!repo) return notFound('No such repo.');
  const db = env.ACC!;
  if (repo.status === 'removed' && (await isPurged(env, repo))) return authErr(409, 'conflict', 'This repo was purged; its files are gone and it cannot be restored.');
  // Held files sit in commits after the head (the head only moves over fully clean commits, spec 11.6), so
  // release looks at every commit waiting after it. Copies go through storage/promote.ts (the same byte move
  // and usage bookkeeping a clean scan gets); settleRepo then moves the head and sets the state.
  const waiting = async () => (await db.prepare(`SELECT id, sha256, status FROM scans WHERE repo_id = ?1 AND status IN ('held', 'error')
      AND commit_oid IN (SELECT oid FROM commits WHERE repo_id = ?1 AND rowid > COALESCE((SELECT rowid FROM commits WHERE oid = ?2), 0))
      ORDER BY created_at, id`).bind(id, repo.head_commit).all<{ id: string; sha256: string; status: string }>()).results;
  const now = ISO();
  if (b.release_held === true) {
    const held = (await waiting()).slice(0, 10); // 10 files per call: 3 R2 calls each; repeat until none is left
    for (const s of held) {
      if ((await promoteBlob(env, id, s.sha256, s.id)) === 'missing') return authErr(409, 'conflict', 'A held file is already deleted from quarantine; it cannot be released.');
    }
    if (held.length) await db.batch(held.map((s) => db.prepare("UPDATE scans SET status = 'clean', finished_at = ?2, claimed_until = NULL, updated_at = ?2 WHERE id = ?1").bind(s.id, now)));
  }
  // An interim state (scanning with a head, else draft); settleRepo replaces it with the real one. The detail
  // page (deleted by remove) is rendered again for any repo with a served head.
  const stmts = [db.prepare("UPDATE repos SET status = ?2, removed_reason = NULL, updated_at = ?3 WHERE id = ?1").bind(id, repo.head_commit ? 'scanning' : 'draft', now)];
  if (b.unblock === true) stmts.push(db.prepare('DELETE FROM blocked_hashes WHERE source = ?1').bind(id));
  await db.batch(stmts);
  const status = await settleRepo(env, id);
  if (status !== 'live' && status !== 'draft') await publishPage(env, id); // settle renders it only on live
  await db.batch([audit(env, 'repo.restore', 'repo', id, { status, release_held: b.release_held === true, unblock: b.unblock === true, note: b.note ?? null })]);
  return authJson({ id, status, held_left: (await waiting()).length });
}

// ---- users ------------------------------------------------------------------------------------------------

async function updateUser(env: Env, handle: string, b: Record<string, unknown>) {
  if (!HANDLE.test(handle)) return notFound('No such account.');
  if (b.status !== undefined && b.status !== 'active' && b.status !== 'suspended') return bad('status must be active or suspended.');
  if (b.staff !== undefined && typeof b.staff !== 'boolean') return bad('staff must be true or false.');
  if (b.note !== undefined && (typeof b.note !== 'string' || b.note.length > 2000)) return bad('note must be a string of at most 2000 characters.');
  if (b.status === undefined && b.staff === undefined) return bad('Send status or staff.');
  const u = await env.ACC!.prepare("SELECT id FROM users WHERE handle = ?1 COLLATE NOCASE AND status <> 'deleted'").bind(handle).first<{ id: string }>();
  if (!u) return notFound('No such account.');
  const row = await env.ACC!.batch([
    env.ACC!.prepare('UPDATE users SET status = COALESCE(?2, status), staff = COALESCE(?3, staff), updated_at = ?4 WHERE id = ?1 RETURNING id, handle, status, staff')
      .bind(u.id, (b.status as string | undefined) ?? null, b.staff === undefined ? null : b.staff ? 1 : 0, ISO()),
    audit(env, 'user.admin_update', 'user', u.id, { status: b.status ?? null, staff: b.staff ?? null, note: b.note ?? null }),
  ]);
  const r = row[0].results[0] as { id: string; handle: string; status: string; staff: number };
  return authJson({ id: r.id, handle: r.handle, status: r.status, staff: r.staff === 1 });
}

// ---- limits -----------------------------------------------------------------------------------------------

async function limitRows(env: Env) {
  return (await env.ACC!.prepare('SELECT key, value, updated_by, updated_at FROM limits ORDER BY key').all<{ key: string; value: number; updated_by: string | null; updated_at: string }>()).results;
}
async function currentLimits(env: Env) {
  const [rows, site, scan] = await Promise.all([
    limitRows(env),
    env.ACC!.prepare('SELECT bytes FROM site_usage WHERE id = 1').first<{ bytes: number }>(),
    env.ACC!.prepare('SELECT last_poll_at FROM scanner_state WHERE id = 1').first<{ last_poll_at: string | null }>(),
  ]);
  return limitsView(Object.fromEntries(rows.map((r) => [r.key, r.value])), site?.bytes ?? 0, scan?.last_poll_at ?? null);
}
async function setLimit(env: Env, b: Record<string, unknown>) {
  if (typeof b.key !== 'string' || !(LIMIT_KEYS as readonly string[]).includes(b.key)) return bad(`key must be one of ${LIMIT_KEYS.join(', ')}.`);
  if (typeof b.value !== 'number' || !Number.isSafeInteger(b.value) || b.value < 0) return bad('value must be a whole number, 0 or more.');
  if (b.key === 'uploads_open' && b.value > 1) return bad('uploads_open takes 0 or 1.');
  await env.ACC!.prepare("INSERT INTO limits (key, value, updated_by) VALUES (?1, ?2, 'admin') ON CONFLICT(key) DO UPDATE SET value = ?2, updated_by = 'admin', updated_at = ?3")
    .bind(b.key, b.value, ISO()).run();
  return authJson(await currentLimits(env));
}

// ---- usage ------------------------------------------------------------------------------------------------

/** Recomputes storage_usage and the site total from uploads and repos (a removed repo whose files are not purged still counts). */
async function reconcile(env: Env) {
  const db = env.ACC!;
  const [bytes, repos, stored, site] = await Promise.all([
    db.prepare(`SELECT r.owner_user_id AS uid, u.bucket, SUM(u.size) AS n FROM uploads u JOIN repos r ON r.id = u.repo_id
                 WHERE u.status IN ${ACTIVE} AND r.owner_user_id IS NOT NULL GROUP BY r.owner_user_id, u.bucket`).all<{ uid: string; bucket: string; n: number }>(),
    db.prepare("SELECT owner_user_id AS uid, COUNT(*) AS n FROM repos WHERE owner_user_id IS NOT NULL AND status <> 'removed' GROUP BY owner_user_id").all<{ uid: string; n: number }>(),
    db.prepare('SELECT owner_user_id AS uid, public_bytes, private_bytes, quarantine_bytes, repos FROM storage_usage WHERE owner_user_id IS NOT NULL').all<Usage & { uid: string }>(),
    db.prepare('SELECT bytes FROM site_usage WHERE id = 1').first<{ bytes: number }>(),
  ]);
  const computed = new Map<string, Usage>();
  const at = (id: string) => { let u = computed.get(id); if (!u) computed.set(id, (u = { public_bytes: 0, private_bytes: 0, quarantine_bytes: 0, repos: 0 })); return u; };
  for (const r of bytes.results) at(r.uid)[`${r.bucket}_bytes` as 'public_bytes' | 'private_bytes' | 'quarantine_bytes'] += r.n;
  for (const r of repos.results) at(r.uid).repos = r.n;
  const d = diffUsage(computed, new Map(stored.results.map((r) => [r.uid, r])));
  const now = ISO();
  const stmts = d.changes.map((c) => db.prepare(
    `INSERT INTO storage_usage (owner_user_id, public_bytes, private_bytes, quarantine_bytes, repos, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(owner_user_id) WHERE owner_user_id IS NOT NULL DO UPDATE SET public_bytes = ?2, private_bytes = ?3, quarantine_bytes = ?4, repos = ?5, updated_at = ?6`)
    .bind(c.user_id, c.usage.public_bytes, c.usage.private_bytes, c.usage.quarantine_bytes, c.usage.repos, now));
  stmts.push(db.prepare('UPDATE site_usage SET bytes = ?1, reconciled_at = ?2, updated_at = ?2 WHERE id = 1').bind(d.site, now));
  stmts.push(audit(env, 'usage.reconcile', 'user', 'site', { before: site?.bytes ?? 0, after: d.site, owners_changed: d.changes.length }));
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50));
  return { site_bytes_before: site?.bytes ?? 0, site_bytes_after: d.site, owners_changed: d.changes.length };
}

// ---- r2-usage ---------------------------------------------------------------------------------------------

interface R2Cursor { i: number; c?: string; bytes: number[]; objects: number[] }
async function r2Usage(env: Env, url: URL) {
  const buckets: [string, R2Bucket | undefined][] = [['FW', env.FW], ['QUARANTINE', env.QUARANTINE], ['PRIVATE', env.PRIVATE]];
  let st: R2Cursor = { i: 0, bytes: [0, 0, 0], objects: [0, 0, 0] };
  const raw = url.searchParams.get('cursor');
  if (raw) { try { st = JSON.parse(atob(raw)); if (!Array.isArray(st.bytes) || st.bytes.length !== 3 || !Array.isArray(st.objects) || st.objects.length !== 3 || typeof st.i !== 'number') throw 0; } catch { return bad('Bad cursor.'); } }
  for (let calls = 0; st.i < buckets.length; ) {
    const b = buckets[st.i][1];
    if (!b) { st.i += 1; st.c = undefined; continue; }
    if (calls >= 20) break; // stay under the 50 subrequests of the free plan
    const l = await b.list({ limit: 1000, cursor: st.c }); calls += 1;
    for (const o of l.objects) { st.bytes[st.i] += o.size; st.objects[st.i] += 1; }
    if (l.truncated) st.c = l.cursor; else { st.i += 1; st.c = undefined; }
  }
  const done = st.i >= buckets.length;
  return authJson({
    buckets: buckets.map(([binding, b], k) => ({ binding, bytes: st.bytes[k], objects: st.objects[k], complete: !!b && k < st.i })).filter((_, k) => !!buckets[k][1]),
    cursor: done ? null : btoa(JSON.stringify(st)),
  });
}

// ---- dispatch ---------------------------------------------------------------------------------------------

export const adminRoute: Handler = async ({ req, env, url }) => {
  if (!env.ACC) return authErr(503, 'accounts_not_configured', 'Accounts are not turned on for this deployment yet.');
  const s = await requireSigned(req, env.ADMIN_SECRET);
  if (s instanceof Response) return s;
  const b = parse(s.body);
  if (b instanceof Response) return b;
  const path = url.pathname.replace(/^\/api\/fw\/v1\/admin\//, '').replace(/\/$/, '');
  const m = req.method;
  let x: RegExpMatchArray | null;
  if (m === 'GET' && path === 'reports') return listReports(env, url);
  if (m === 'POST' && (x = path.match(/^reports\/([^/]+)$/))) return resolveReport(env, x[1], b);
  if (m === 'GET' && path === 'held') return listHeld(env, url);
  if (m === 'POST' && (x = path.match(/^repos\/([^/]+)\/remove$/))) return removeRepo(env, x[1], b);
  if (m === 'POST' && (x = path.match(/^repos\/([^/]+)\/restore$/))) return restoreRepo(env, x[1], b);
  if (m === 'POST' && (x = path.match(/^users\/([^/]+)$/))) return updateUser(env, decodeURIComponent(x[1]), b);
  if (m === 'GET' && path === 'limits') return authJson({ limits: await limitRows(env) });
  if (m === 'PUT' && path === 'limits') return setLimit(env, b);
  if (m === 'POST' && path === 'usage/reconcile') return authJson(await reconcile(env));
  if (m === 'GET' && path === 'r2-usage') return r2Usage(env, url);
  return notFound('No such admin route.');
};
