import type { Env } from '../types';

// AWS Signature Version 4 for the R2 S3 API (plan U4/U5, spec/accounts-v1.md 11.3). R2 bindings cannot
// presign, so uploads, scan jobs and community downloads use URLs signed here with the R2_* secrets.
// Two forms: query presigning (a URL a client uses with no credential) and header signing (a request the
// Worker sends itself: multipart create, complete and abort). Pure WebCrypto, no dependency, and no value
// import, so `node --test` can load this file as is (test/presign.test.mjs runs AWS's published vectors).

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export const UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';
export const ALGO = 'AWS4-HMAC-SHA256';

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? enc.encode(data) : data));
}
async function hmacRaw(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(msg));
}

/** RFC 3986 encoding as SigV4 wants it: everything but A-Z a-z 0-9 - . _ ~ is %XX (upper case). */
export function uriEncode(s: string, keepSlash = false): string {
  let out = '';
  for (const b of enc.encode(s)) {
    const c = String.fromCharCode(b);
    if (/[A-Za-z0-9\-._~]/.test(c) || (keepSlash && c === '/')) out += c;
    else out += '%' + b.toString(16).toUpperCase().padStart(2, '0');
  }
  return out;
}

export interface SigV4Creds { accessKeyId: string; secretAccessKey: string }
export interface SigV4Request {
  method: string;
  host: string;
  /** Raw path, not yet encoded, starting with "/". S3 encodes it once (no double encoding). */
  path: string;
  /** Query parameters, raw. A key with no value is ["uploads", ""]. */
  query?: [string, string][];
  /** Headers to sign besides host (names any case). */
  headers?: Record<string, string>;
  payloadHash: string;
  region: string;
  service: string;
  /** YYYYMMDDTHHMMSSZ */
  amzDate: string;
}

export const amzDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
export const scopeOf = (r: Pick<SigV4Request, 'amzDate' | 'region' | 'service'>) => `${r.amzDate.slice(0, 8)}/${r.region}/${r.service}/aws4_request`;

export function canonicalQuery(q: [string, string][] = []): string {
  return q.map(([k, v]) => [uriEncode(k), uriEncode(v)] as const)
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`).join('&');
}

/** The canonical request and the signed-header list (AWS SigV4 "Create a canonical request"). */
export function canonicalRequest(r: SigV4Request): { canonical: string; signedHeaders: string } {
  const h = new Map<string, string>([['host', r.host]]);
  for (const [k, v] of Object.entries(r.headers || {})) h.set(k.toLowerCase(), String(v).trim().replace(/\s+/g, ' '));
  const names = [...h.keys()].sort();
  const signedHeaders = names.join(';');
  const canonical = [
    r.method.toUpperCase(),
    uriEncode(r.path, true),
    canonicalQuery(r.query),
    names.map((n) => `${n}:${h.get(n)}\n`).join(''),
    signedHeaders,
    r.payloadHash,
  ].join('\n');
  return { canonical, signedHeaders };
}

// Derived signing keys change once a day. Cache them so a 16-part presign costs 16 SHA-256 + 16 HMAC,
// not 16 x 5 HMAC. In memory only, like the secret itself.
const keyCache = new Map<string, Promise<CryptoKey>>();
export function signingKey(secret: string, date: string, region: string, service: string): Promise<CryptoKey> {
  const id = `${date}/${region}/${service}\n${secret}`;
  let p = keyCache.get(id);
  if (!p) {
    p = (async () => {
      const kDate = await hmacRaw(enc.encode('AWS4' + secret), date);
      const kRegion = await hmacRaw(kDate, region);
      const kService = await hmacRaw(kRegion, service);
      const kSigning = await hmacRaw(kService, 'aws4_request');
      return crypto.subtle.importKey('raw', kSigning, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    })();
    if (keyCache.size > 16) keyCache.clear();
    keyCache.set(id, p);
  }
  return p;
}
/** Hex of the derived signing key (AWS publishes vectors for it). Test helper; signing uses signingKey(). */
export async function signingKeyHex(secret: string, date: string, region: string, service: string): Promise<string> {
  const kDate = await hmacRaw(enc.encode('AWS4' + secret), date);
  return hex(await hmacRaw(await hmacRaw(await hmacRaw(kDate, region), service), 'aws4_request'));
}

export async function sign(creds: SigV4Creds, r: SigV4Request): Promise<{ signature: string; signedHeaders: string; canonical: string; stringToSign: string }> {
  const { canonical, signedHeaders } = canonicalRequest(r);
  const stringToSign = [ALGO, r.amzDate, scopeOf(r), await sha256Hex(canonical)].join('\n');
  const key = await signingKey(creds.secretAccessKey, r.amzDate.slice(0, 8), r.region, r.service);
  const signature = hex(await crypto.subtle.sign('HMAC', key, enc.encode(stringToSign)));
  return { signature, signedHeaders, canonical, stringToSign };
}

/** A presigned URL (query auth). Headers given are signed and the client must send them exactly. */
export async function presignUrl(creds: SigV4Creds, r: Omit<SigV4Request, 'payloadHash'> & { expiresS: number }): Promise<string> {
  const names = ['host', ...Object.keys(r.headers || {}).map((k) => k.toLowerCase())].sort().join(';');
  const query: [string, string][] = [
    ...(r.query || []),
    ['X-Amz-Algorithm', ALGO],
    ['X-Amz-Credential', `${creds.accessKeyId}/${scopeOf(r)}`],
    ['X-Amz-Date', r.amzDate],
    ['X-Amz-Expires', String(r.expiresS)],
    ['X-Amz-SignedHeaders', names],
  ];
  const { signature } = await sign(creds, { ...r, query, payloadHash: UNSIGNED_PAYLOAD });
  return `https://${r.host}${uriEncode(r.path, true)}?${canonicalQuery(query)}&X-Amz-Signature=${signature}`;
}

/** Headers for a request the Worker sends itself (header auth). The body hash is signed. */
export async function authHeaders(creds: SigV4Creds, r: Omit<SigV4Request, 'payloadHash' | 'headers'> & { body?: string; headers?: Record<string, string> }): Promise<Record<string, string>> {
  const payloadHash = await sha256Hex(r.body ?? '');
  const headers = { ...(r.headers || {}), 'x-amz-content-sha256': payloadHash, 'x-amz-date': r.amzDate };
  const { signature, signedHeaders } = await sign(creds, { ...r, headers, payloadHash });
  return { ...headers, authorization: `${ALGO} Credential=${creds.accessKeyId}/${scopeOf(r)}, SignedHeaders=${signedHeaders}, Signature=${signature}` };
}

// ---- R2 -------------------------------------------------------------------------------------------------

/** Bucket names as wrangler.toml binds them (FW, QUARANTINE, PRIVATE). */
export const R2_BUCKETS = { public: 'freeweights', quarantine: 'freeweights-quarantine', private: 'freeweights-private' } as const;
export type BucketName = keyof typeof R2_BUCKETS;

export interface R2Creds extends SigV4Creds { accountId: string }
/** The R2 S3 credentials, or null while any of the three secrets is unset (routes then answer 503). */
export function r2Creds(env: Pick<Env, 'R2_ACCOUNT_ID' | 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY'>): R2Creds | null {
  const { R2_ACCOUNT_ID: accountId, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey } = env;
  return accountId && accessKeyId && secretAccessKey ? { accountId, accessKeyId, secretAccessKey } : null;
}
export const r2Host = (c: R2Creds) => `${c.accountId}.r2.cloudflarestorage.com`;
const r2Base = (c: R2Creds, bucket: BucketName, key: string) => ({ host: r2Host(c), path: `/${R2_BUCKETS[bucket]}/${key}`, region: 'auto', service: 's3' });

export interface R2PresignOpts {
  method: 'GET' | 'PUT' | 'HEAD';
  bucket: BucketName;
  key: string;
  expiresS: number;
  /** PUT: the exact byte count. Signed, so R2 refuses a body of any other size. */
  contentLength?: number;
  query?: [string, string][];
  now?: Date;
}
export function r2Presign(c: R2Creds, o: R2PresignOpts): Promise<string> {
  const headers = o.contentLength === undefined ? undefined : { 'content-length': String(o.contentLength) };
  return presignUrl(c, { ...r2Base(c, o.bucket, o.key), method: o.method, query: o.query, headers, amzDate: amzDate(o.now ?? new Date()), expiresS: o.expiresS });
}

/** A header-signed request to the R2 S3 API (the Worker's own calls). Built, not sent: r2Send sends it. */
export async function r2Request(c: R2Creds, o: { method: 'POST' | 'DELETE' | 'PUT' | 'GET' | 'HEAD'; bucket: BucketName; key: string; query?: [string, string][]; body?: string; contentType?: string; now?: Date }): Promise<Request> {
  const base = r2Base(c, o.bucket, o.key);
  const headers = await authHeaders(c, { ...base, method: o.method, query: o.query, body: o.body, amzDate: amzDate(o.now ?? new Date()),
    headers: o.contentType ? { 'content-type': o.contentType } : undefined });
  const qs = canonicalQuery(o.query);
  return new Request(`https://${base.host}${uriEncode(base.path, true)}${qs ? '?' + qs : ''}`, { method: o.method, headers, body: o.body });
}
const r2Send = async (c: R2Creds, o: Parameters<typeof r2Request>[1]) => fetch(await r2Request(c, o));

// ---- Multipart (S3 CreateMultipartUpload / UploadPart / CompleteMultipartUpload / AbortMultipartUpload) ----

export class R2Error extends Error {
  status: number; code: string;
  constructor(status: number, code: string) { super(`R2 ${status} ${code}`); this.status = status; this.code = code; }
}
const xmlTag = (xml: string, tag: string) => xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] ?? null;
const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function createMultipart(c: R2Creds, bucket: BucketName, key: string): Promise<string> {
  const res = await r2Send(c, { method: 'POST', bucket, key, query: [['uploads', '']] });
  const body = await res.text();
  const id = res.ok ? xmlTag(body, 'UploadId') : null;
  if (!id) throw new R2Error(res.status, xmlTag(body, 'Code') || 'CreateMultipartUploadFailed');
  return id;
}

/** Part numbers 1..n as Hugging Face clients read them: keys "00001", "00002", ... (lfs.py sorts int(key)). */
export const partKey = (n: number) => String(n).padStart(5, '0');
export const partCount = (size: number, chunk: number) => Math.max(1, Math.ceil(size / chunk));
export const partSize = (size: number, chunk: number, n: number) => (n < partCount(size, chunk) ? chunk : size - chunk * (partCount(size, chunk) - 1));

/** One presigned UploadPart URL per part, each signing its exact content-length. */
export async function partUrls(c: R2Creds, o: { bucket: BucketName; key: string; uploadId: string; size: number; chunk: number; expiresS: number; now?: Date }): Promise<Record<string, string>> {
  const now = o.now ?? new Date();
  const n = partCount(o.size, o.chunk);
  const urls = await Promise.all(Array.from({ length: n }, (_, i) => r2Presign(c, {
    method: 'PUT', bucket: o.bucket, key: o.key, expiresS: o.expiresS, now,
    contentLength: partSize(o.size, o.chunk, i + 1), query: [['partNumber', String(i + 1)], ['uploadId', o.uploadId]],
  })));
  return Object.fromEntries(urls.map((u, i) => [partKey(i + 1), u]));
}

export function completeXml(parts: { partNumber: number; etag: string }[]): string {
  const ps = [...parts].sort((a, b) => a.partNumber - b.partNumber)
    .map((p) => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${xmlEsc(p.etag.startsWith('"') ? p.etag : `"${p.etag}"`)}</ETag></Part>`);
  return `<CompleteMultipartUpload>${ps.join('')}</CompleteMultipartUpload>`;
}

/** Completes a multipart upload. S3 may answer 200 with an <Error> body; that counts as a failure. */
export async function completeMultipart(c: R2Creds, bucket: BucketName, key: string, uploadId: string, parts: { partNumber: number; etag: string }[]): Promise<void> {
  const res = await r2Send(c, { method: 'POST', bucket, key, query: [['uploadId', uploadId]], body: completeXml(parts), contentType: 'application/xml' });
  const body = await res.text();
  if (!res.ok || /<Error>/.test(body)) throw new R2Error(res.ok ? 400 : res.status, xmlTag(body, 'Code') || 'CompleteMultipartUploadFailed');
}

/** Aborts a multipart upload. A missing upload (already completed or aborted) is not an error. */
export async function abortMultipart(c: R2Creds, bucket: BucketName, key: string, uploadId: string): Promise<void> {
  const res = await r2Send(c, { method: 'DELETE', bucket, key, query: [['uploadId', uploadId]] });
  if (!res.ok && res.status !== 404) throw new R2Error(res.status, xmlTag(await res.text(), 'Code') || 'AbortMultipartUploadFailed');
}

// ---- LFS action URLs -------------------------------------------------------------------------------------
// The multipart completion and verify hrefs carry their own short signature. huggingface_hub POSTs the
// completion with LFS headers only (no Authorization), so the href itself must be the credential, the way a
// presigned URL is. The key is derived from R2_SECRET_ACCESS_KEY with a fixed label, so no new secret.

export type LfsStep = 'complete' | 'verify';
async function actionKey(secret: string): Promise<CryptoKey> {
  const raw = await hmacRaw(enc.encode(secret), 'fw-lfs-action-v1');
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
const actionMsg = (step: LfsStep, uploadId: string, exp: number) => `${step}\n${uploadId}\n${exp}`;

export async function lfsActionHref(origin: string, secret: string, step: LfsStep, uploadId: string, exp: number): Promise<string> {
  const sig = hex(await crypto.subtle.sign('HMAC', await actionKey(secret), enc.encode(actionMsg(step, uploadId, exp))));
  return `${origin}/api/fw/v1/lfs/${uploadId}/${step}?exp=${exp}&sig=${sig}`;
}
/** True when exp is in the future and sig matches (constant-time through WebCrypto verify). */
export async function lfsActionOk(secret: string, step: LfsStep, uploadId: string, exp: string | null, sig: string | null, nowS = Math.floor(Date.now() / 1000)): Promise<boolean> {
  if (!exp || !sig || !/^\d{1,12}$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig) || Number(exp) < nowS) return false;
  const bytes = new Uint8Array(sig.match(/../g)!.map((h) => parseInt(h, 16)));
  return crypto.subtle.verify('HMAC', await actionKey(secret), bytes, enc.encode(actionMsg(step, uploadId, Number(exp))));
}

// ---- LFS batch object (spec/parts/write-api.yaml, responses/LfsBatch) --------------------------------------

/** Objects up to this size get one presigned PUT; larger ones get multipart (plan U5). */
export const BASIC_MAX_BYTES = 64 * 1024 * 1024;
export const PART_BYTES = 32 * 1024 * 1024;
/** Presigned upload URLs and the reservation both last 1 hour (spec/accounts-v1.md 11.3). */
export const UPLOAD_TTL_S = 3600;

export interface LfsUploadPlan {
  oid: string; size: number; uploadId: string; key: string; expS: number; origin: string;
  /** Set for multipart: the S3 upload id. */
  s3UploadId?: string | null;
}
export interface LfsObjectReply {
  oid: string; size: number; authenticated?: boolean;
  actions?: { upload: { href: string; header?: Record<string, string>; expires_in: number }; verify: { href: string; expires_in: number } };
  error?: { code: number; message: string };
}

/** The batch reply entry for one new object, in the shape huggingface_hub's lfs.py validates. */
export async function lfsUploadObject(c: R2Creds, p: LfsUploadPlan, now = new Date()): Promise<LfsObjectReply> {
  const expiresIn = Math.max(1, p.expS - Math.floor(now.getTime() / 1000));
  const verify = { href: await lfsActionHref(p.origin, c.secretAccessKey, 'verify', p.uploadId, p.expS), expires_in: expiresIn };
  if (p.s3UploadId) {
    const header = { chunk_size: String(PART_BYTES), ...(await partUrls(c, { bucket: 'quarantine', key: p.key, uploadId: p.s3UploadId, size: p.size, chunk: PART_BYTES, expiresS: expiresIn, now })) };
    return { oid: p.oid, size: p.size, authenticated: true, actions: { upload: { href: await lfsActionHref(p.origin, c.secretAccessKey, 'complete', p.uploadId, p.expS), header, expires_in: expiresIn }, verify } };
  }
  const href = await r2Presign(c, { method: 'PUT', bucket: 'quarantine', key: p.key, expiresS: expiresIn, contentLength: p.size, now });
  return { oid: p.oid, size: p.size, authenticated: true, actions: { upload: { href, expires_in: expiresIn }, verify } };
}
