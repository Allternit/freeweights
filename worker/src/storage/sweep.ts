// The sweep that every scanner poll runs (spec/accounts-v1.md 11.5, plan U9). No cron: if the scanner stops,
// nothing is promoted and nothing new is swept, and the R2 lifecycle rule on the quarantine bucket backs up
// the deletes. Each part touches at most SWEEP_BATCH rows per poll.
//   1. uploads not committed past expires_at (created + 1 hour) expire; their reserved bytes are released and
//      the quarantine object (or multipart upload) is removed when nothing else uses that key;
//   2. scans whose claim ran out go back to queued, or to error after the third attempt;
//   3. held files are deleted from quarantine 14 days after the scan, and their bytes released;
//   4. files of repos removed by their owner or by account deletion are deleted from their bucket and their
//      bytes released; once a repo has none left, its trees and community page go too. Takedowns keep files.
import type { Env, ScanSweep } from '../types';
import { HELD_KEEP_MS, MAX_ATTEMPTS, PURGE_REASONS, SWEEP_BATCH, iso, planSweep } from './scan-state';
import { blobKey } from './promote';
import { removeRepoPage } from '../pages/repo';
import { renderCommunityIndex } from '../pages/community-index';

const OWNER = `((owner_user_id IS NOT NULL AND owner_user_id = (SELECT owner_user_id FROM repos WHERE id = ?1))
  OR (owner_org_id IS NOT NULL AND owner_org_id = (SELECT owner_org_id FROM repos WHERE id = ?1)))`;

export async function runSweep(env: Env, nowMs = Date.now()): Promise<ScanSweep> {
  const db = env.ACC!;
  const now = iso(nowMs);
  const reasons = PURGE_REASONS.map((r) => `'${r}'`).join(', ');
  const [uploads, claims, held, removed] = await db.batch([
    db.prepare(`SELECT id, repo_id, status, expires_at, size, bucket, r2_key, r2_upload_id FROM uploads
      WHERE status IN ('pending', 'uploaded', 'verified') AND expires_at < ? ORDER BY expires_at LIMIT ${SWEEP_BATCH}`).bind(now),
    db.prepare(`SELECT id, status, attempts, claimed_until FROM scans
      WHERE status = 'scanning' AND claimed_until < ? ORDER BY claimed_until LIMIT ${SWEEP_BATCH}`).bind(now),
    db.prepare(`SELECT s.id, s.repo_id, s.sha256, s.status, s.finished_at FROM scans s
      WHERE s.status = 'held' AND s.finished_at < ?
        AND EXISTS (SELECT 1 FROM uploads u WHERE u.repo_id = s.repo_id AND u.oid = s.sha256 AND u.status = 'committed' AND u.bucket = 'quarantine')
      ORDER BY s.finished_at LIMIT ${SWEEP_BATCH}`).bind(iso(nowMs - HELD_KEEP_MS)),
    db.prepare(`SELECT u.id, u.repo_id, u.status, u.size, u.bucket, u.r2_key, u.r2_upload_id, r.removed_reason, r.namespace, r.name
      FROM uploads u JOIN repos r ON r.id = u.repo_id
      WHERE r.status = 'removed' AND r.removed_reason IN (${reasons}) AND u.status IN ('pending', 'uploaded', 'verified', 'committed')
      LIMIT ${SWEEP_BATCH}`),
  ]);
  type U = { id: string; repo_id: string; status: string; expires_at: string; size: number; bucket: string; r2_key: string; r2_upload_id: string | null };
  type C = { id: string; status: string; attempts: number; claimed_until: string | null };
  type H = { id: string; repo_id: string; sha256: string; status: string; finished_at: string | null };
  type R = { id: string; repo_id: string; status: string; size: number; bucket: 'quarantine' | 'public' | 'private'; r2_key: string; r2_upload_id: string | null; removed_reason: string | null; namespace: string; name: string };
  const U = uploads.results as U[]; const C = claims.results as C[]; const H = held.results as H[]; const R = removed.results as R[];
  const plan = planSweep(nowMs, { uploads: U, claims: C, held: H, removed: R });
  const out: ScanSweep = { expired_uploads: 0, requeued: 0, errored: 0, held_deleted: 0, purged_uploads: 0 };

  // 1. Expired uploads. The release statements run first in the batch and only while the upload is still
  // uncommitted, so a commit that lands at the same moment keeps its bytes.
  for (const id of plan.expire) {
    const u = U.find((x) => x.id === id)!;
    const live = `EXISTS (SELECT 1 FROM uploads WHERE id = ?2 AND status IN ('pending', 'uploaded', 'verified'))`;
    const r = await db.batch([
      db.prepare(`UPDATE storage_usage SET quarantine_bytes = MAX(0, quarantine_bytes - ?3), updated_at = ?4 WHERE ${OWNER} AND ${live}`).bind(u.repo_id, u.id, u.size, now),
      db.prepare(`UPDATE site_usage SET bytes = MAX(0, bytes - ?2), updated_at = ?3 WHERE id = 1 AND EXISTS (SELECT 1 FROM uploads WHERE id = ?1 AND status IN ('pending', 'uploaded', 'verified'))`).bind(u.id, u.size, now),
      db.prepare(`UPDATE uploads SET status = 'expired', updated_at = ?2 WHERE id = ?1 AND status IN ('pending', 'uploaded', 'verified')`).bind(u.id, now),
    ]);
    if (!r[2].meta.changes) continue;
    out.expired_uploads++;
    if (u.bucket !== 'quarantine') continue;
    const used = await db.prepare(`SELECT 1 FROM uploads WHERE r2_key = ? AND id <> ? AND status IN ('pending', 'uploaded', 'verified', 'committed') LIMIT 1`).bind(u.r2_key, u.id).first();
    if (used) continue;
    if (u.r2_upload_id) await env.QUARANTINE!.resumeMultipartUpload(u.r2_key, u.r2_upload_id).abort().catch(() => {});
    await env.QUARANTINE!.delete(u.r2_key);
  }

  // 2. Claims that ran out.
  const failed = JSON.stringify([{ scanner: 'worker', code: 'scan_failed', detail: `claim ran out ${MAX_ATTEMPTS} times` }]);
  for (const [ids, status] of [[plan.requeue, 'queued'], [plan.error, 'error']] as const) {
    for (const id of ids) {
      const r = await db.prepare(`UPDATE scans SET status = ?, claimed_until = NULL, updated_at = ?,
          findings = CASE WHEN ? = 'error' THEN ? ELSE findings END, finished_at = CASE WHEN ? = 'error' THEN ? ELSE finished_at END
        WHERE id = ? AND status = 'scanning' AND claimed_until < ?`).bind(status, now, status, failed, status, now, id, now).run();
      if (r.meta.changes) status === 'queued' ? out.requeued++ : out.errored++;
    }
  }

  // 3. Held files past 14 days. The bytes go back on the owner and the site; the scan row stays (held,
  // with its findings) for the admin record. The upload is marked expired so it is not counted again.
  for (const id of plan.deleteHeld) {
    const h = H.find((x) => x.id === id)!;
    const q = `(SELECT COALESCE(SUM(size), 0) FROM uploads WHERE repo_id = ?1 AND oid = ?2 AND status = 'committed' AND bucket = 'quarantine')`;
    const r = await db.batch([
      db.prepare(`UPDATE storage_usage SET quarantine_bytes = MAX(0, quarantine_bytes - ${q}), updated_at = ?3 WHERE ${OWNER}`).bind(h.repo_id, h.sha256, now),
      db.prepare(`UPDATE site_usage SET bytes = MAX(0, bytes - ${q}), updated_at = ?3 WHERE id = 1`).bind(h.repo_id, h.sha256, now),
      db.prepare(`UPDATE uploads SET status = 'expired', updated_at = ?3 WHERE repo_id = ?1 AND oid = ?2 AND status = 'committed' AND bucket = 'quarantine'`).bind(h.repo_id, h.sha256, now),
    ]);
    if (!r[2].meta.changes) continue;
    out.held_deleted++;
    const other = await db.prepare(`SELECT 1 FROM scans WHERE repo_id = ? AND sha256 = ? AND id <> ? AND status IN ('queued', 'scanning') LIMIT 1`).bind(h.repo_id, h.sha256, h.id).first();
    if (!other) await env.QUARANTINE!.delete(blobKey(h.repo_id, h.sha256));
  }

  // 4. Repos removed by their owner or by account deletion. Each upload's bytes leave the column of the bucket
  // it is in, and the site total; the guard keeps a repeat from releasing twice.
  const COL = { quarantine: 'quarantine_bytes', public: 'public_bytes', private: 'private_bytes' } as const;
  const BUCKET = { quarantine: env.QUARANTINE, public: env.FW, private: env.PRIVATE } as const;
  const touched = new Map<string, R>();
  for (const id of plan.purge) {
    const u = R.find((x) => x.id === id)!;
    const live = `EXISTS (SELECT 1 FROM uploads WHERE id = ?2 AND status IN ('pending', 'uploaded', 'verified', 'committed'))`;
    const col = COL[u.bucket];
    const r = await db.batch([
      db.prepare(`UPDATE storage_usage SET ${col} = MAX(0, ${col} - ?3), updated_at = ?4 WHERE ${OWNER} AND ${live}`).bind(u.repo_id, u.id, u.size, now),
      db.prepare(`UPDATE site_usage SET bytes = MAX(0, bytes - ?2), updated_at = ?3 WHERE id = 1 AND EXISTS (SELECT 1 FROM uploads WHERE id = ?1 AND status IN ('pending', 'uploaded', 'verified', 'committed'))`).bind(u.id, u.size, now),
      db.prepare(`UPDATE uploads SET status = 'expired', updated_at = ?2 WHERE id = ?1 AND status IN ('pending', 'uploaded', 'verified', 'committed')`).bind(u.id, now),
    ]);
    if (!r[2].meta.changes) continue;
    out.purged_uploads!++;
    touched.set(u.repo_id, u);
    const b = BUCKET[u.bucket];
    if (!b) continue;
    if (u.r2_upload_id && u.status !== 'committed') await b.resumeMultipartUpload(u.r2_key, u.r2_upload_id).abort().catch(() => {});
    await b.delete(u.r2_key);
  }
  // A repo with nothing left to purge: delete its commit trees (both buckets) and its community page.
  let pages = false;
  for (const [repoId, u] of touched) {
    const left = await db.prepare(`SELECT 1 FROM uploads WHERE repo_id = ? AND status IN ('pending', 'uploaded', 'verified', 'committed') LIMIT 1`).bind(repoId).first();
    if (left) continue;
    for (const b of [env.FW, env.QUARANTINE]) {
      if (!b) continue;
      const l = await b.list({ prefix: `repos/${repoId}/trees/`, limit: 1000 });
      if (l.objects.length) await b.delete(l.objects.map((o) => o.key));
    }
    await removeRepoPage(env, u);
    pages = true;
  }
  if (pages) await renderCommunityIndex(env).catch(() => {});

  return out;
}
