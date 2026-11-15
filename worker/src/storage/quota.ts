import type { LimitKey } from '../types';

// Byte reservation (plan U3, spec/accounts-v1.md 11.1-11.3). Every community byte counts against the
// owner's cap (user_cap_bytes) and the site cap (site_cap_bytes) from the moment the LFS batch hands out an
// upload URL: reserved, in quarantine, held and live alike. No cap value is written here; they come from the
// `limits` table, and a missing key refuses (a NULL comparison is never true), so the Worker fails closed.
//
// Reserve: ONE conditional statement per object, an INSERT INTO uploads ... SELECT ... WHERE <file max, user
// cap, site cap>. The usage rows are then bumped only when that row exists, in the same D1 batch (one
// transaction), so the counters never move for a refused object.
// Release: the counters go down first, guarded by the upload still holding bytes, and the upload's status
// changes last. Run twice, the second run finds no row holding bytes and changes nothing.
//
// Only type imports, so test/quota.test.mjs runs these exact statements against SQLite with the migrations.

export const LIMIT_KEYS_ALL: readonly LimitKey[] = [
  'uploads_open', 'site_cap_bytes', 'user_cap_bytes', 'file_max_bytes',
  'repos_per_user', 'repo_creates_per_day', 'commits_per_hour', 'files_per_commit',
];
/** Upload statuses whose bytes are counted. */
export const HOLDING = ['pending', 'uploaded', 'verified', 'committed'] as const;
const HOLDING_SQL = `('pending', 'uploaded', 'verified', 'committed')`;
const NOW_SQL = `strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`;

export interface LimitsState {
  values: Partial<Record<LimitKey, number>>;
  /** Keys with no row. Any missing key pauses uploads (spec 11.1). */
  missing: LimitKey[];
  /** uploads_open = 1 and every key is set. */
  open: boolean;
}
export function limitsState(rows: { key: string; value: number }[]): LimitsState {
  const values: Partial<Record<LimitKey, number>> = {};
  for (const r of rows) if ((LIMIT_KEYS_ALL as readonly string[]).includes(r.key) && Number.isFinite(Number(r.value))) values[r.key as LimitKey] = Number(r.value);
  const missing = LIMIT_KEYS_ALL.filter((k) => values[k] === undefined);
  return { values, missing, open: values.uploads_open === 1 && missing.length === 0 };
}
export async function readLimits(db: D1Database): Promise<LimitsState> {
  const { results } = await db.prepare('SELECT key, value FROM limits').all<{ key: string; value: number }>();
  return limitsState(results || []);
}

export type Refusal = 'file_too_large' | 'storage_full' | 'site_full';
/**
 * Why a reservation of `size` bytes would be refused, or null when it fits. The same three tests as the SQL,
 * in the order the replies name them: file first, then the account, then the site. A missing cap refuses
 * (reported as the cap it belongs to).
 */
export function refusal(size: number, v: LimitsState['values'], userBytes: number, siteBytes: number): Refusal | null {
  if (v.file_max_bytes === undefined || size > v.file_max_bytes) return 'file_too_large';
  if (v.user_cap_bytes === undefined || userBytes + size > v.user_cap_bytes) return 'storage_full';
  if (v.site_cap_bytes === undefined || siteBytes + size > v.site_cap_bytes) return 'site_full';
  return null;
}

/** Refusals for a whole set of files at once (preupload): the per-file cap per file, the caps on the total. */
export function refuseSet(sizes: number[], v: LimitsState['values'], userBytes: number, siteBytes: number): { tooLarge: number[]; total: Refusal | null } {
  const tooLarge = sizes.map((s, i) => (v.file_max_bytes === undefined || s > v.file_max_bytes ? i : -1)).filter((i) => i >= 0);
  const sum = sizes.reduce((a, b) => a + b, 0);
  const total = v.user_cap_bytes === undefined || userBytes + sum > v.user_cap_bytes ? 'storage_full'
    : v.site_cap_bytes === undefined || siteBytes + sum > v.site_cap_bytes ? 'site_full' : null;
  return { tooLarge, total };
}

export interface Usage { userBytes: number; siteBytes: number }
const USAGE_SQL = `SELECT
  COALESCE((SELECT public_bytes + private_bytes + quarantine_bytes FROM storage_usage WHERE owner_user_id = ?1), 0) AS user_bytes,
  COALESCE((SELECT bytes FROM site_usage WHERE id = 1), 0) AS site_bytes`;
export async function readUsage(db: D1Database, userId: string): Promise<Usage> {
  const r = await db.prepare(USAGE_SQL).bind(userId).first<{ user_bytes: number; site_bytes: number }>();
  return { userBytes: Number(r?.user_bytes ?? 0), siteBytes: Number(r?.site_bytes ?? 0) };
}

export interface Reservation {
  id: string; repoId: string; userId: string; oid: string; size: number;
  transfer: 'basic' | 'multipart'; key: string; parts: number | null; expiresAt: string;
  /** 'pending' for an LFS upload URL; 'uploaded' for a regular file the Worker stored itself. */
  status?: 'pending' | 'uploaded';
}

const ENSURE_ROW = `INSERT INTO storage_usage (owner_user_id) SELECT ?1 WHERE NOT EXISTS (SELECT 1 FROM storage_usage WHERE owner_user_id = ?1)`;
// The one conditional statement. ?5 = size, ?3 = the account. A multipart row gets r2_upload_id '' until
// the S3 upload exists (the table's CHECK wants it non-null), so a refused object never costs an S3 call.
const RESERVE = `INSERT INTO uploads (id, repo_id, user_id, oid, size, transfer, bucket, r2_key, r2_upload_id, parts, status, expires_at)
SELECT ?1, ?2, ?3, ?4, ?5, ?6, 'quarantine', ?7, CASE WHEN ?6 = 'multipart' THEN '' END, ?8, ?9, ?10
WHERE ?5 <= (SELECT value FROM limits WHERE key = 'file_max_bytes')
  AND (SELECT public_bytes + private_bytes + quarantine_bytes FROM storage_usage WHERE owner_user_id = ?3) + ?5
      <= (SELECT value FROM limits WHERE key = 'user_cap_bytes')
  AND (SELECT bytes FROM site_usage WHERE id = 1) + ?5 <= (SELECT value FROM limits WHERE key = 'site_cap_bytes')`;
const BUMP_USER = `UPDATE storage_usage SET quarantine_bytes = quarantine_bytes + ?2, updated_at = ${NOW_SQL}
WHERE owner_user_id = ?1 AND EXISTS (SELECT 1 FROM uploads WHERE id = ?3)`;
const BUMP_SITE = `UPDATE site_usage SET bytes = bytes + ?1, updated_at = ${NOW_SQL} WHERE id = 1 AND EXISTS (SELECT 1 FROM uploads WHERE id = ?2)`;

export type ReserveResult = { id: string; ok: true } | { id: string; ok: false; reason: Refusal };

/**
 * Reserves bytes for each object in order, all in one D1 batch. Objects are tested one after another
 * inside the transaction, so a later object sees the earlier ones' bytes. The first statement reads the
 * starting usage, which gives each refusal its reason.
 */
export async function reserve(db: D1Database, list: Reservation[]): Promise<ReserveResult[]> {
  if (!list.length) return [];
  const userId = list[0].userId;
  if (list.some((r) => r.userId !== userId)) throw new Error('reserve: one account per batch');
  const stmts: D1PreparedStatement[] = [
    db.prepare(ENSURE_ROW).bind(userId),
    db.prepare(USAGE_SQL).bind(userId),
    db.prepare('SELECT key, value FROM limits'),
  ];
  for (const r of list) {
    stmts.push(
      db.prepare(RESERVE).bind(r.id, r.repoId, r.userId, r.oid, r.size, r.transfer, r.key, r.parts, r.status ?? 'pending', r.expiresAt),
      db.prepare(BUMP_USER).bind(r.userId, r.size, r.id),
      db.prepare(BUMP_SITE).bind(r.size, r.id),
    );
  }
  const res = await db.batch(stmts);
  const u = (res[1].results?.[0] ?? {}) as { user_bytes?: number; site_bytes?: number };
  const lim = limitsState((res[2].results ?? []) as { key: string; value: number }[]).values;
  let userBytes = Number(u.user_bytes ?? 0), siteBytes = Number(u.site_bytes ?? 0);
  return list.map((r, i) => {
    if (res[3 + i * 3].meta.changes === 1) { userBytes += r.size; siteBytes += r.size; return { id: r.id, ok: true }; }
    return { id: r.id, ok: false, reason: refusal(r.size, lim, userBytes, siteBytes) ?? 'site_full' };
  });
}

// ---- Release ---------------------------------------------------------------------------------------------

const col = (bucket: string) => `COALESCE((SELECT size FROM uploads WHERE id = ?1 AND status IN ${HOLDING_SQL} AND bucket = '${bucket}'), 0)`;
const REL_USER = `UPDATE storage_usage SET
  quarantine_bytes = MAX(0, quarantine_bytes - ${col('quarantine')}),
  public_bytes = MAX(0, public_bytes - ${col('public')}),
  private_bytes = MAX(0, private_bytes - ${col('private')}),
  updated_at = ${NOW_SQL}
WHERE owner_user_id = (SELECT user_id FROM uploads WHERE id = ?1 AND status IN ${HOLDING_SQL})`;
const REL_SITE = `UPDATE site_usage SET bytes = MAX(0, bytes - (SELECT size FROM uploads WHERE id = ?1)), updated_at = ${NOW_SQL}
WHERE id = 1 AND EXISTS (SELECT 1 FROM uploads WHERE id = ?1 AND status IN ${HOLDING_SQL})`;
const REL_STATUS = `UPDATE uploads SET status = ?2, updated_at = ${NOW_SQL} WHERE id = ?1 AND status IN ${HOLDING_SQL}`;

/**
 * Statements that give back one upload's bytes and set its status ('aborted' on abort or size mismatch,
 * 'expired' from the sweep). Safe to repeat. For the sweep and held-file deletion (plan step 9) as well.
 */
export function releaseStatements(db: D1Database, uploadId: string, to: 'aborted' | 'expired' = 'aborted'): D1PreparedStatement[] {
  return [db.prepare(REL_USER).bind(uploadId), db.prepare(REL_SITE).bind(uploadId), db.prepare(REL_STATUS).bind(uploadId, to)];
}
export async function release(db: D1Database, uploadId: string, to: 'aborted' | 'expired' = 'aborted'): Promise<void> {
  await db.batch(releaseStatements(db, uploadId, to));
}

const repoCol = (bucket: string) => `COALESCE((SELECT SUM(u.size) FROM uploads u WHERE u.repo_id = ?1 AND u.user_id = storage_usage.owner_user_id
    AND u.status IN ${HOLDING_SQL} AND u.bucket = '${bucket}'), 0)`;
/** Statements that give back every byte a repo holds (repo delete, purge). Safe to repeat. */
export function releaseRepoStatements(db: D1Database, repoId: string): D1PreparedStatement[] {
  return [
    db.prepare(`UPDATE storage_usage SET
      quarantine_bytes = MAX(0, quarantine_bytes - ${repoCol('quarantine')}),
      public_bytes = MAX(0, public_bytes - ${repoCol('public')}),
      private_bytes = MAX(0, private_bytes - ${repoCol('private')}),
      updated_at = ${NOW_SQL}
    WHERE owner_user_id IN (SELECT user_id FROM uploads WHERE repo_id = ?1 AND status IN ${HOLDING_SQL})`).bind(repoId),
    db.prepare(`UPDATE site_usage SET bytes = MAX(0, bytes - COALESCE((SELECT SUM(size) FROM uploads WHERE repo_id = ?1 AND status IN ${HOLDING_SQL}), 0)),
      updated_at = ${NOW_SQL} WHERE id = 1`).bind(repoId),
    db.prepare(`UPDATE uploads SET status = 'aborted', updated_at = ${NOW_SQL} WHERE repo_id = ?1 AND status IN ${HOLDING_SQL}`).bind(repoId),
  ];
}
