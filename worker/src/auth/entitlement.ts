import type { EntitlementClaim, Env } from '../types';
import { ENTITLEMENT_KEYS } from '../data.generated';
import { authErr } from '../http';
import { b64urlBytes, b64urlJson } from './clerk';

// Entitlement claim (spec/accounts-v1.md section 3). cloud-api decides plan, orgs, perks and add-ons and signs
// them as a compact EdDSA JWS; the Worker fetches it with the caller's own bearer, verifies it with the
// Ed25519 public key in spec/keys/entitlement-<n>.pub (bundled by scripts/build-data.mjs) or the
// ENTITLEMENT_PUBKEY var, and caches it by sha256(bearer). This file holds no perk value and no price.

export const CLAIM_ISS = 'https://api.allternit.com';
export const CLAIM_AUD = 'freeweights';
export const SKEW_S = 60;
/** Claims are cached until 30 s before exp, and never longer than 5 minutes. */
export const CACHE_EARLY_S = 30;
export const CACHE_MAX_S = 300;
const FETCH_MS = 3000;
const MEMO_MAX = 2000;

const ED = { name: 'Ed25519' } as const;
const enc = new TextEncoder();

// ---- Public keys -----------------------------------------------------------------------------------------
// kid -> base64 SPKI DER. ENTITLEMENT_PUBKEY is a comma list of "[kid=]<PEM or base64 SPKI>"; with no kid the
// key is entitlement-v1. A var key replaces a bundled key of the same kid.
function keySources(env: Env): Map<string, string> {
  const out = new Map(Object.entries(ENTITLEMENT_KEYS));
  for (const part of (env.ENTITLEMENT_PUBKEY || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(entitlement-v\d+)=(.*)$/s);
    const kid = m ? m[1] : 'entitlement-v1';
    const body = (m ? m[2] : part).replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/\\n|\s+/g, '');
    if (/^[A-Za-z0-9+/]+=*$/.test(body)) out.set(kid, body);
  }
  return out;
}

const imported = new Map<string, Promise<CryptoKey | null>>(); // base64 SPKI -> key
function importKey(spki: string): Promise<CryptoKey | null> {
  let p = imported.get(spki);
  if (!p) {
    let der: Uint8Array;
    try { der = Uint8Array.from(atob(spki), (c) => c.charCodeAt(0)); } catch { return Promise.resolve(null); }
    p = crypto.subtle.importKey('spki', der, ED, false, ['verify']).catch(() => null);
    imported.set(spki, p);
  }
  return p;
}

/** True when at least one entitlement public key exists. With only the placeholder file, no claim can verify. */
export const entitlementConfigured = (env: Env) => !!env.ENTITLEMENT_URL && keySources(env).size > 0;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isPerks = (v: unknown) => isObj(v) && Object.values(v).every((x) => ['number', 'boolean', 'string'].includes(typeof x));
const isBytes = (v: unknown) => isObj(v) && typeof v.public === 'number' && typeof v.private === 'number';

/** Shape check of the payload, every field required (spec/accounts-v1.md section 3). */
function shapeOk(c: Record<string, unknown>): boolean {
  return typeof c.sub === 'string' && typeof c.plan === 'string'
    && Array.isArray(c.orgs) && c.orgs.every((o) => isObj(o) && typeof o.clerk_org_id === 'string' && typeof o.slug === 'string'
      && (o.role === 'admin' || o.role === 'member') && typeof o.plan === 'string' && isPerks(o.perks) && isBytes(o.addon_bytes)
      && (o.seats === undefined || typeof o.seats === 'number'))
    && isPerks(c.perks) && isBytes(c.addon_bytes)
    && Array.isArray(c.scopes) && c.scopes.every((s) => typeof s === 'string')
    && (c.cred === 'session' || c.cred === 'key')
    && typeof c.iat === 'number' && typeof c.exp === 'number';
}

/** Verifies a compact JWS claim. Returns the payload, or null for any failed check ("treated as no claim"). */
export async function verifyClaim(env: Env, jws: string, nowS = Math.floor(Date.now() / 1000)): Promise<EntitlementClaim | null> {
  const parts = jws.trim().split('.');
  if (parts.length !== 3 || jws.length > 16384) return null;
  const [h, p, s] = parts;
  let header: Record<string, unknown>, payload: Record<string, unknown>, sig: Uint8Array;
  try { header = b64urlJson(h) as Record<string, unknown>; payload = b64urlJson(p) as Record<string, unknown>; sig = b64urlBytes(s); }
  catch { return null; }
  if (!isObj(header) || header.alg !== 'EdDSA' || typeof header.kid !== 'string') return null;
  const spki = keySources(env).get(header.kid);
  if (!spki) return null;
  const key = await importKey(spki);
  if (!key) return null;
  if (!(await crypto.subtle.verify(ED, key, sig, enc.encode(`${h}.${p}`)))) return null;
  if (!isObj(payload) || payload.iss !== CLAIM_ISS) return null;
  const aud = payload.aud;
  if (!(aud === CLAIM_AUD || (Array.isArray(aud) && aud.includes(CLAIM_AUD)))) return null;
  if (!shapeOk(payload)) return null;
  if ((payload.exp as number) + SKEW_S <= nowS) return null;
  return payload as unknown as EntitlementClaim;
}

// ---- Fetch + cache ---------------------------------------------------------------------------------------
async function sha256hex(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const memo = new Map<string, { claim: EntitlementClaim; until: number }>(); // sha256(bearer) -> claim
const cacheApi = () => (globalThis as unknown as { caches?: { default: Cache } }).caches?.default;
const cacheTtl = (c: EntitlementClaim, nowS: number) => Math.min(c.exp - CACHE_EARLY_S - nowS, CACHE_MAX_S);

export type ClaimResult = { claim: EntitlementClaim } | { res: Response };
const unavailable = () => ({ res: authErr(503, 'entitlement_unavailable', 'The account service did not answer. Try again shortly.', { 'retry-after': '30' }) });
export const notConfigured = () => ({ res: authErr(503, 'accounts_not_configured', 'Accounts are not turned on for this deployment yet. Public reads and downloads need no account.') });
const denied = () => ({ res: authErr(401, 'auth_required', 'Sign in or send an Allternit key (alt_...).') });

/** The claim must belong to this credential: same kind, and for a session the same Clerk user. */
const matches = (c: EntitlementClaim, cred: 'session' | 'key', sub?: string) => c.cred === cred && (cred === 'key' || c.sub === sub);

/**
 * The caller's claim. `cred` is the credential kind; `sub` is the verified Clerk user for a session.
 * cloud-api refusing the credential -> 401; cloud-api down, or a claim that does not verify -> 503.
 */
export async function getClaim(env: Env, origin: string, bearer: string, cred: 'session' | 'key', sub?: string, ctx?: ExecutionContext): Promise<ClaimResult> {
  if (!entitlementConfigured(env)) return notConfigured(); // never send the credential anywhere we cannot verify the answer
  const nowS = Math.floor(Date.now() / 1000);
  const h = await sha256hex(bearer);
  const m = memo.get(h);
  if (m && m.until > nowS && matches(m.claim, cred, sub)) return { claim: m.claim };
  if (m) memo.delete(h);

  const remember = (claim: EntitlementClaim) => {
    const ttl = cacheTtl(claim, nowS);
    if (ttl <= 0) return;
    memo.set(h, { claim, until: nowS + ttl });
    if (memo.size > MEMO_MAX) memo.delete(memo.keys().next().value!);
  };

  const cache = cacheApi();
  const ck = new Request(`${origin}/__fw_cache/entitlement/${h}`);
  if (cache) {
    const hit = await cache.match(ck).catch(() => undefined);
    if (hit) {
      const claim = await verifyClaim(env, await hit.text(), nowS); // re-verified: the cache holds the signed JWS
      if (claim && matches(claim, cred, sub) && cacheTtl(claim, nowS) > 0) { remember(claim); return { claim }; }
    }
  }

  let jws: string;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), FETCH_MS);
    try {
      const r = await fetch(env.ENTITLEMENT_URL!, { headers: { authorization: `Bearer ${bearer}`, accept: 'application/jose' }, redirect: 'manual', signal: ac.signal });
      if (r.status === 401 || r.status === 403) return denied();
      if (r.status !== 200) return unavailable();
      jws = await r.text();
    } finally { clearTimeout(t); }
  } catch { return unavailable(); }

  const claim = await verifyClaim(env, jws, nowS);
  if (!claim) return unavailable();
  if (!matches(claim, cred, sub)) return denied();
  remember(claim);
  const ttl = cacheTtl(claim, nowS);
  if (cache && ttl > 0) {
    const put = cache.put(ck, new Response(jws, { headers: { 'content-type': 'application/jose', 'cache-control': `max-age=${ttl}` } })).catch(() => {});
    if (ctx) ctx.waitUntil(put); else await put;
  }
  return { claim };
}
