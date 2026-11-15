// SigV4 presigned URLs on R2's S3 API (R2 bindings cannot presign). Used here for scan jobs (15 minutes on the
// quarantine object) and community downloads (5 minutes on the public object), spec/accounts-v1.md 11.5-11.6.
//
// MINIMAL VERSION written by lane "scan": lane "core" owns this file (PUT, multipart, Create/Complete/Abort,
// LFS) and had not pushed it yet. This copy exports only the subset of core's API that routes/scan.ts and
// routes/community-read.ts call (R2_BUCKETS, r2Creds, r2Presign), with the same names and shapes, so at
// merge the coordinator keeps core's file and no caller changes.
import type { Env } from '../types';

export const R2_BUCKETS = { public: 'freeweights', quarantine: 'freeweights-quarantine', private: 'freeweights-private' } as const;
export type BucketName = keyof typeof R2_BUCKETS;
export interface R2Creds { accountId: string; accessKeyId: string; secretAccessKey: string }
/** The R2 S3 credentials, or null while any of the three secrets is unset (routes then answer 503). */
export function r2Creds(env: Pick<Env, 'R2_ACCOUNT_ID' | 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY'>): R2Creds | null {
  const { R2_ACCOUNT_ID: accountId, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey } = env;
  return accountId && accessKeyId && secretAccessKey ? { accountId, accessKeyId, secretAccessKey } : null;
}
export const r2Host = (c: R2Creds) => `${c.accountId}.r2.cloudflarestorage.com`;

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const hmac = async (key: ArrayBuffer | Uint8Array, msg: string) =>
  crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(msg));
/** RFC 3986 encoding, as SigV4 wants it (encodeURIComponent leaves !'()* alone). */
const rfc3986 = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const amzDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

interface PresignInput { host: string; path: string; region: string; c: R2Creds; expiresS: number; now: Date; method: string }

/** Query-string SigV4 (UNSIGNED-PAYLOAD, signed header: host). `path` is already URI-encoded per segment. */
async function presignUrl(p: PresignInput): Promise<string> {
  const t = amzDate(p.now);
  const day = t.slice(0, 8);
  const scope = `${day}/${p.region}/s3/aws4_request`;
  const q: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${p.c.accessKeyId}/${scope}`],
    ['X-Amz-Date', t],
    ['X-Amz-Expires', String(p.expiresS)],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const query = q.map(([k, v]) => `${rfc3986(k)}=${rfc3986(v)}`).sort().join('&');
  const canonical = [p.method, p.path, query, `host:${p.host}`, '', 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', t, scope, hex(await crypto.subtle.digest('SHA-256', enc.encode(canonical)))].join('\n');
  let k = await hmac(enc.encode(`AWS4${p.c.secretAccessKey}`), day);
  for (const part of [p.region, 's3', 'aws4_request']) k = await hmac(k, part);
  const sig = hex(await hmac(k, toSign));
  return `https://${p.host}${p.path}?${query}&X-Amz-Signature=${sig}`;
}

/** Same shape as core's R2PresignOpts; this copy signs GET and HEAD only (no content-length, no extra query). */
export interface R2PresignOpts { method: 'GET' | 'PUT' | 'HEAD'; bucket: BucketName; key: string; expiresS: number; contentLength?: number; query?: [string, string][]; now?: Date }
export function r2Presign(c: R2Creds, o: R2PresignOpts): Promise<string> {
  if (o.method === 'PUT' || o.contentLength !== undefined || o.query?.length) throw new Error('presign subset: GET/HEAD only (lane core has the full version)');
  return presignUrl({
    host: r2Host(c), path: `/${R2_BUCKETS[o.bucket]}/${o.key.split('/').map(rfc3986).join('/')}`,
    region: 'auto', c, expiresS: o.expiresS, now: o.now ?? new Date(), method: o.method,
  });
}
