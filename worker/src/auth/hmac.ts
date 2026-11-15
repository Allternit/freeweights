// Signed requests for the scanner (/api/fw/v1/scan/*) and the operator (/api/fw/v1/admin/*), spec/accounts-v1.md 11.4.
// Shared by both route files. The pure functions in this file import nothing, so node --test can load them.
//
//   X-FW-Timestamp: Unix seconds, within SKEW_S of the Worker clock
//   X-FW-Signature: v1=<hex>  =  HMAC-SHA256(secret, "<ts>\n<METHOD>\n<path and query>\n<sha256 hex of the body>")
//
// The body hash of an empty body is the sha256 of the empty string. A failure never says which part was wrong.

export const SKEW_S = 300;
export const MAX_SIGNED_BODY = 256 * 1024;
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? enc.encode(data) : data));
}

/** The exact string that is signed. `pathQuery` is the request path plus its query string as sent. */
export const signingMessage = (ts: string, method: string, pathQuery: string, bodySha256: string) =>
  `${ts}\n${method.toUpperCase()}\n${pathQuery}\n${bodySha256}`;

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

/** Constant-time string compare (length leaks, content does not). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export interface SignedParts { secret: string; timestamp: string | null; signature: string | null; method: string; pathQuery: string; body: string; nowS?: number }

/** True when the signature is current and correct. Never throws on malformed input. */
export async function verifySignature(p: SignedParts): Promise<boolean> {
  if (!p.secret || !p.timestamp || !p.signature) return false;
  if (!/^\d{1,12}$/.test(p.timestamp)) return false;
  const now = p.nowS ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(p.timestamp)) > SKEW_S) return false;
  const m = p.signature.match(/^v1=([0-9a-f]{64})$/);
  if (!m) return false;
  const want = await hmacHex(p.secret, signingMessage(p.timestamp, p.method, p.pathQuery, await sha256Hex(p.body)));
  return timingSafeEqual(want, m[1]);
}

/**
 * Checks a signed request and returns its body text, or a finished error reply:
 * 503 accounts_not_configured while the secret is unset, 401 bad_signature for anything else wrong.
 * Pass the Env secret (SCANNER_SECRET for scan routes, ADMIN_SECRET for admin routes); one never works on
 * the other's routes because each route passes its own.
 */
export async function requireSigned(req: Request, secret: string | undefined, nowS?: number): Promise<{ body: string } | Response> {
  const { authErr } = await import('../http');
  if (!secret) return authErr(503, 'accounts_not_configured', 'This route is not turned on for this deployment yet.');
  const bad = () => authErr(401, 'bad_signature', 'Bad signature.');
  const len = Number(req.headers.get('content-length') || 0);
  if (len > MAX_SIGNED_BODY) return bad();
  const body = req.method === 'GET' || req.method === 'HEAD' ? '' : await req.text();
  if (body.length > MAX_SIGNED_BODY) return bad();
  const u = new URL(req.url);
  const ok = await verifySignature({
    secret, timestamp: req.headers.get('x-fw-timestamp'), signature: req.headers.get('x-fw-signature'),
    method: req.method, pathQuery: u.pathname + u.search, body, nowS,
  });
  return ok ? { body } : bad();
}
