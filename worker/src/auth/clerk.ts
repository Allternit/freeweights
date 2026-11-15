import type { ClerkClaims, Env } from '../types';

// Clerk session JWT check (spec/accounts-v1.md section 2.1). RS256 with WebCrypto; no Clerk SDK, no dependency.
// Every failed check gives the same answer (null -> 401 auth_required), so a caller cannot tell which check failed.

export const MAX_JWT_BYTES = 8192;
export const SKEW_S = 60;
export const JWKS_TTL_MS = 3_600_000;
/** An unknown kid refetches the JWKS at most this often (key rotation), then fails. */
export const KID_REFETCH_MS = 60_000;

const RSA = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;
const enc = new TextEncoder();
const dec = new TextDecoder();
const list = (v: string | undefined) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export function b64urlBytes(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('bad base64url');
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
export const b64urlJson = (s: string): unknown => JSON.parse(dec.decode(b64urlBytes(s)));

/** True when the value looks like a JWT (three base64url parts). Used to tell a Clerk token from an alt_ key. */
export const looksLikeJwt = (t: string) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t);

// ---- JWKS cache: per isolate, backed by the Workers Cache API (1 hour) -------------------------------------
type KeySet = { keys: Map<string, CryptoKey>; at: number };
const sets = new Map<string, KeySet>();          // JWKS URL -> keys
const kidRefetchAt = new Map<string, number>();  // JWKS URL -> time of the last unknown-kid refetch
const inflight = new Map<string, Promise<KeySet>>();

export class AuthUnavailable extends Error {}

function cacheApi(): Cache | undefined {
  return (globalThis as unknown as { caches?: { default: Cache } }).caches?.default;
}
const cacheKey = (origin: string, jwksUrl: string) => new Request(`${origin}/__fw_cache/jwks/${encodeURIComponent(jwksUrl)}`);

async function importJwks(body: string): Promise<Map<string, CryptoKey>> {
  const doc = JSON.parse(body) as { keys?: { kid?: string; kty?: string; n?: string; e?: string; use?: string; alg?: string }[] };
  const keys = new Map<string, CryptoKey>();
  for (const k of doc.keys || []) {
    if (!k.kid || k.kty !== 'RSA' || !k.n || !k.e) continue;
    if (k.use && k.use !== 'sig') continue;
    if (k.alg && k.alg !== 'RS256') continue;
    try { keys.set(k.kid, await crypto.subtle.importKey('jwk', { kty: 'RSA', n: k.n, e: k.e, alg: 'RS256', ext: true }, RSA, false, ['verify'])); }
    catch { /* skip a key that does not import */ }
  }
  return keys;
}

async function loadJwks(env: Env, origin: string, url: string, fresh: boolean, ctx?: ExecutionContext): Promise<KeySet> {
  const now = Date.now();
  const have = sets.get(url);
  if (!fresh && have && now - have.at < JWKS_TTL_MS) return have;
  const running = inflight.get(url);
  if (running) return running;
  const p = (async () => {
    const cache = cacheApi();
    const ck = cacheKey(origin, url);
    if (!fresh && cache) {
      const hit = await cache.match(ck).catch(() => undefined);
      if (hit) {
        const at = Number(hit.headers.get('x-fw-fetched-at')) || now;
        if (now - at < JWKS_TTL_MS) { const s = { keys: await importJwks(await hit.text()), at }; sets.set(url, s); return s; }
      }
    }
    let body: string;
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 3000);
      try {
        const r = await fetch(url, { headers: { accept: 'application/json' }, signal: ac.signal });
        if (!r.ok) throw new AuthUnavailable(`jwks http ${r.status}`);
        body = await r.text();
      } finally { clearTimeout(t); }
    } catch (e) {
      if (have) return have; // keep the last known keys when the JWKS host is down
      throw e instanceof AuthUnavailable ? e : new AuthUnavailable('jwks fetch failed');
    }
    const s = { keys: await importJwks(body), at: now };
    sets.set(url, s);
    if (cache) {
      const put = cache.put(ck, new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': `max-age=${JWKS_TTL_MS / 1000}`, 'x-fw-fetched-at': String(now) } })).catch(() => {});
      if (ctx) ctx.waitUntil(put); else await put;
    }
    return s;
  })();
  inflight.set(url, p);
  try { return await p; } finally { inflight.delete(url); }
}

async function keyFor(env: Env, origin: string, url: string, kid: string, ctx?: ExecutionContext): Promise<CryptoKey | null> {
  let s = await loadJwks(env, origin, url, false, ctx);
  let k = s.keys.get(kid);
  if (k) return k;
  const last = kidRefetchAt.get(url) ?? 0;
  if (Date.now() - last < KID_REFETCH_MS) return null;
  kidRefetchAt.set(url, Date.now());
  s = await loadJwks(env, origin, url, true, ctx);
  k = s.keys.get(kid);
  return k ?? null;
}

export const clerkConfigured = (env: Env) => !!env.CLERK_JWKS_URL && list(env.CLERK_ISSUERS).length > 0;

/**
 * Verifies a Clerk session token. Returns its claims, or null for any failed check.
 * Throws AuthUnavailable when the JWKS cannot be fetched and no keys are known (a server problem, not the caller's).
 */
export async function verifyClerkJwt(env: Env, token: string, origin: string, ctx?: ExecutionContext, nowS = Math.floor(Date.now() / 1000)): Promise<ClerkClaims | null> {
  if (!clerkConfigured(env)) return null;
  if (token.length > MAX_JWT_BYTES || !looksLikeJwt(token)) return null;
  const [h, p, s] = token.split('.');
  let header: { alg?: unknown; kid?: unknown; typ?: unknown };
  let claims: Partial<ClerkClaims> & Record<string, unknown>;
  let sig: Uint8Array;
  try {
    header = b64urlJson(h) as typeof header;
    claims = b64urlJson(p) as typeof claims;
    sig = b64urlBytes(s);
  } catch { return null; }
  if (!header || header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) return null;
  if (!claims || typeof claims !== 'object') return null;

  const key = await keyFor(env, origin, env.CLERK_JWKS_URL!, header.kid, ctx);
  if (!key) return null;
  const ok = await crypto.subtle.verify(RSA, key, sig, enc.encode(`${h}.${p}`));
  if (!ok) return null;

  if (typeof claims.iss !== 'string' || !list(env.CLERK_ISSUERS).includes(claims.iss)) return null;
  if (typeof claims.exp !== 'number' || claims.exp + SKEW_S <= nowS) return null;
  if (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf - SKEW_S > nowS)) return null;
  if (claims.azp !== undefined && (typeof claims.azp !== 'string' || !list(env.CLERK_AZP).includes(claims.azp))) return null;
  if (typeof claims.sub !== 'string' || !/^user_[A-Za-z0-9]+$/.test(claims.sub)) return null;
  return claims as ClerkClaims;
}
