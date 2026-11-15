import type { Env, RepoKind, UploadRow } from '../types';
import type { Handler } from '../router';
import { authJson, seg } from '../http';
import { d1 } from '../pause';
import { HOLDING, release, reserve, type Refusal, type Reservation } from '../storage/quota';
import {
  BASIC_MAX_BYTES, PART_BYTES, R2Error, UPLOAD_TTL_S, completeMultipart, createMultipart, lfsActionOk, lfsUploadObject,
  partCount, r2Creds, type LfsObjectReply,
} from '../storage/presign';
import { blobKey, caller, fwErr, gate, isoIn, kindOf, newId, writableRepo } from './repo-access';

// Git LFS batch, multipart completion and verify (plan step 6, U3-U5; spec/accounts-v1.md 11.3).
// Bytes never pass through the Worker: the batch reserves each new object's bytes (storage/quota.ts) and
// answers presigned R2 URLs on the quarantine bucket, signed by storage/presign.ts. Objects up to 64 MiB get
// one PUT that signs content-length; larger ones get S3 multipart with 32 MiB parts. Verify and complete HEAD
// the stored object: a different size deletes it, releases the bytes and answers 422 size_mismatch.

const LFS_TYPE = { 'content-type': 'application/vnd.git-lfs+json' };
/**
 * Multipart creates are signed fetches to the R2 S3 API, and the Workers Free plan allows 50 such
 * subrequests per request. One batch therefore starts at most this many multipart uploads; huggingface_hub
 * sends the rest in its next batch call only if asked, so the extra objects get a per-object error.
 */
export const MULTIPART_PER_BATCH = 40;
const OID = /^[0-9a-f]{64}$/;
const notConfigured = () => fwErr(503, 'accounts_not_configured', 'Uploads are not turned on for this deployment yet.');

const objErr = (oid: string, size: number, code: number, message: string): LfsObjectReply => ({ oid, size, error: { code, message } });
const REFUSAL: Record<Refusal, [number, string]> = {
  file_too_large: [413, 'file_too_large: this file is larger than one file may be. See /api/fw/v1/limits.'],
  storage_full: [507, 'storage_full: this upload would pass your account\'s storage limit. Delete files or repos first. See /api/fw/v1/limits.'],
  site_full: [507, 'site_full: Freeweights has no room for community uploads right now. Try again later. See /api/fw/v1/limits.'],
};

// ---- POST /{ns}/{repo}.git/info/lfs/objects/batch (and /datasets/...) ---------------------------------------

interface BatchBody { operation?: unknown; transfers?: unknown; objects?: unknown; hash_algo?: unknown }

export const lfsBatchRoute: Handler = ({ req, env, ctx, url }, m) => d1(async () => {
  const kind = (m[1] ? kindOf(m[1]) : 'model') as RepoKind;
  const c = await caller(req, env, url, ctx);
  if (c instanceof Response) return c;
  const repo = await writableRepo(env, c, kind, seg(m[2]), seg(m[3]));
  if (repo instanceof Response) return repo;
  const g = await gate(env, c, true);
  if (g instanceof Response) return g;
  const creds = r2Creds(env);
  if (!creds || !env.QUARANTINE) return notConfigured();

  let b: BatchBody | null = null;
  try { b = await req.json(); } catch { /* below */ }
  if (!b || b.operation !== 'upload') return fwErr(400, 'bad_request', b?.operation === 'download' ? 'Download files through /<repo>/resolve/main/<path>.' : 'operation must be "upload".');
  if (b.hash_algo !== undefined && b.hash_algo !== 'sha256') return fwErr(400, 'bad_request', 'hash_algo must be sha256.');
  if (!Array.isArray(b.objects) || !b.objects.length || b.objects.length > 1000) return fwErr(400, 'bad_request', 'objects must list 1 to 1000 {oid, size}.');
  const multipartOk = Array.isArray(b.transfers) && b.transfers.includes('multipart');

  // One answer per distinct oid; a repeated oid gets the same answer.
  const objs = (b.objects as { oid?: unknown; size?: unknown }[]).map((o) => ({ oid: String(o?.oid ?? ''), size: Number(o?.size) }));
  const reply = new Map<string, LfsObjectReply>();
  const valid = objs.filter((o) => {
    if (reply.has(o.oid)) return false;
    if (!OID.test(o.oid) || !Number.isSafeInteger(o.size) || o.size < 0) { reply.set(o.oid, objErr(o.oid, Number.isFinite(o.size) ? o.size : 0, 422, 'bad oid or size: oid is a lowercase sha256, size a byte count')); return false; }
    reply.set(o.oid, objErr(o.oid, o.size, 500, 'pending'));
    return true;
  });
  const acc = env.ACC!;
  const oids = JSON.stringify(valid.map((o) => o.oid));
  const [blocked, rows] = await acc.batch([
    acc.prepare('SELECT sha256 FROM blocked_hashes WHERE sha256 IN (SELECT value FROM json_each(?1))').bind(oids),
    acc.prepare(`SELECT * FROM uploads WHERE repo_id = ?1 AND oid IN (SELECT value FROM json_each(?2)) AND status IN ('${HOLDING.join("', '")}') ORDER BY created_at DESC`).bind(repo.id, oids),
  ]);
  const isBlocked = new Set(((blocked.results ?? []) as { sha256: string }[]).map((r) => r.sha256));
  const held = new Map<string, UploadRow>();
  for (const r of (rows.results ?? []) as UploadRow[]) if (!held.has(r.oid) || r.status !== 'pending') held.set(r.oid, r);

  const nowS = Math.floor(Date.now() / 1000);
  const expS = nowS + UPLOAD_TTL_S;
  const reissue: UploadRow[] = [];
  const stale: string[] = [];
  const fresh: (Reservation & { multipart: boolean })[] = [];
  let multiparts = 0;
  for (const o of valid) {
    if (isBlocked.has(o.oid)) { reply.set(o.oid, objErr(o.oid, o.size, 451, 'removed_after_takedown: this file was removed after a takedown and cannot be uploaded again.')); continue; }
    const h = held.get(o.oid);
    if (h && h.size !== o.size) { reply.set(o.oid, objErr(o.oid, o.size, 422, `size_mismatch: this oid is already stored with ${h.size} bytes.`)); continue; }
    // Already stored for this repo: no actions, the client skips the upload.
    if (h && h.status !== 'pending') { reply.set(o.oid, { oid: o.oid, size: o.size, authenticated: true }); continue; }
    // A retry of an upload still open: same reservation, fresh URLs.
    const multipart = o.size > BASIC_MAX_BYTES && multipartOk;
    if (h && Date.parse(h.expires_at) > Date.now() + 60_000 && (h.transfer === 'multipart') === multipart && (h.transfer === 'basic' || h.r2_upload_id)) { reissue.push(h); continue; }
    if (h) stale.push(h.id);
    if (multipart && ++multiparts > MULTIPART_PER_BATCH) {
      reply.set(o.oid, objErr(o.oid, o.size, 429, `too many large files in one batch: send at most ${MULTIPART_PER_BATCH} files over 64 MiB per call.`));
      continue;
    }
    fresh.push({
      id: newId('up_'), repoId: repo.id, userId: c.userId, oid: o.oid, size: o.size, transfer: multipart ? 'multipart' : 'basic',
      key: blobKey(repo.id, o.oid), parts: multipart ? partCount(o.size, PART_BYTES) : null, expiresAt: isoIn(UPLOAD_TTL_S), multipart,
    });
  }
  // An expired open upload is given back before a new one is reserved for the same object.
  for (const id of stale) await release(acc, id, 'expired');

  const made = await reserve(acc, fresh);
  const okNew = fresh.filter((f, i) => {
    const r = made[i];
    if (!r.ok) reply.set(f.oid, objErr(f.oid, f.size, ...REFUSAL[r.reason]));
    return r.ok;
  });
  // S3 multipart uploads start only for reserved objects, so a refusal never costs an S3 call.
  const s3Ids = new Map<string, string>();
  await Promise.all(okNew.filter((f) => f.multipart).map(async (f) => {
    try { s3Ids.set(f.id, await createMultipart(creds, 'quarantine', f.key)); }
    catch { await release(acc, f.id); reply.set(f.oid, objErr(f.oid, f.size, 503, 'storage did not answer: try the upload again shortly.')); }
  }));
  if (s3Ids.size) await acc.batch([...s3Ids].map(([id, s3]) => acc.prepare('UPDATE uploads SET r2_upload_id = ?2 WHERE id = ?1').bind(id, s3)));

  const plans = [
    ...okNew.filter((f) => !f.multipart || s3Ids.has(f.id)).map((f) => ({ oid: f.oid, size: f.size, uploadId: f.id, key: f.key, s3UploadId: s3Ids.get(f.id) ?? null })),
    ...reissue.map((h) => ({ oid: h.oid, size: h.size, uploadId: h.id, key: h.r2_key, s3UploadId: h.transfer === 'multipart' ? h.r2_upload_id : null })),
  ];
  const now = new Date();
  // A retried reservation keeps its own expiry: its URLs never outlive the bytes held for it.
  const expOf = new Map(reissue.map((h) => [h.id, Math.floor(Date.parse(h.expires_at) / 1000)]));
  for (const p of plans) reply.set(p.oid, await lfsUploadObject(creds, { ...p, expS: expOf.get(p.uploadId) ?? expS, origin: url.origin }, now));

  const objects = objs.map((o) => reply.get(o.oid)!).filter((o, i, a) => a.indexOf(o) === i);
  const anyMultipart = objects.some((o) => o.actions?.upload.header?.chunk_size);
  return authJson({ transfer: anyMultipart ? 'multipart' : 'basic', objects, hash_algo: 'sha256' }, 200, LFS_TYPE);
});

// ---- POST /api/fw/v1/lfs/{uploadId}/complete | verify --------------------------------------------------------
// The href is the credential (signed exp + sig from the batch): huggingface_hub sends the multipart completion
// with LFS headers only, no Authorization. Both steps are safe to repeat.

/** HEAD the stored object; on a size other than the reserved one, delete it and give the bytes back. */
async function checkStored(env: Env, up: UploadRow): Promise<Response | null> {
  const o = await env.QUARANTINE!.head(up.r2_key);
  if (!o) return fwErr(404, 'not_found', 'The object is not stored yet. Upload it, then verify.');
  if (o.size !== up.size) {
    await env.QUARANTINE!.delete(up.r2_key);
    await release(env.ACC!, up.id);
    return fwErr(422, 'size_mismatch', `The stored object has ${o.size} bytes, not the ${up.size} given at the batch. It was deleted; upload it again.`);
  }
  return null;
}

export const lfsFinishRoute: Handler = ({ req, env, url }, m) => d1(async () => {
  const id = m[1], step = m[2] as 'complete' | 'verify';
  const creds = r2Creds(env);
  if (!creds || !env.QUARANTINE || !env.ACC) return notConfigured();
  if (!/^up_[0-9A-Z]{10,40}$/.test(id) || !(await lfsActionOk(creds.secretAccessKey, step, id, url.searchParams.get('exp'), url.searchParams.get('sig')))) {
    return fwErr(401, 'bad_signature', 'This upload link is wrong or has expired. Run the upload again.');
  }
  const up = await env.ACC.prepare('SELECT * FROM uploads WHERE id = ?1').bind(id).first<UploadRow>();
  if (!up || up.status === 'aborted' || up.status === 'expired') return fwErr(404, 'not_found', 'This upload expired or was cancelled. Run the upload again.');
  let b: { oid?: unknown; size?: unknown; parts?: unknown } | null = null;
  try { b = await req.json(); } catch { /* below */ }
  if (!b || b.oid !== up.oid) return fwErr(400, 'bad_request', 'oid does not match this upload.');
  const done = () => authJson({}, 200, LFS_TYPE);

  if (step === 'verify') {
    if (b.size !== undefined && b.size !== up.size) return fwErr(400, 'bad_request', `size does not match this upload (${up.size} bytes).`);
    if (up.status === 'verified' || up.status === 'committed') return done();
    const bad = await checkStored(env, up);
    if (bad) return bad;
    await env.ACC.prepare("UPDATE uploads SET status = 'verified', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1 AND status IN ('pending', 'uploaded')").bind(id).run();
    return done();
  }

  if (up.transfer !== 'multipart' || !up.r2_upload_id) return fwErr(400, 'bad_request', 'This upload is not a multipart upload.');
  if (up.status !== 'pending') return done();
  const parts = Array.isArray(b.parts) ? (b.parts as { partNumber?: unknown; etag?: unknown }[]) : [];
  const n = up.parts ?? 0;
  const nums = new Set(parts.map((p) => p?.partNumber));
  if (parts.length !== n || nums.size !== n || ![...Array(n)].every((_, i) => nums.has(i + 1)) || parts.some((p) => typeof p.etag !== 'string' || !p.etag)) {
    return fwErr(400, 'bad_request', `Send all ${n} parts as {partNumber, etag}, numbered from 1.`);
  }
  try {
    await completeMultipart(creds, 'quarantine', up.r2_key, up.r2_upload_id, parts as { partNumber: number; etag: string }[]);
  } catch (e) {
    // NoSuchUpload after a lost reply: the upload may already be complete; the HEAD below decides.
    if (!(e instanceof R2Error && e.code === 'NoSuchUpload')) {
      return e instanceof R2Error && e.status < 500
        ? fwErr(400, 'bad_request', `Storage refused the parts (${e.code}). Upload them again.`)
        : fwErr(502, 'storage_error', 'Storage did not answer. Try the completion again.');
    }
  }
  const bad = await checkStored(env, up);
  if (bad) return bad;
  await env.ACC.prepare("UPDATE uploads SET status = 'uploaded', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1 AND status = 'pending'").bind(id).run();
  return done();
});
