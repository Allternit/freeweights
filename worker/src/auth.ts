import type { Caller, Env, FwScope } from './types';
import { authErr } from './http';
import { AuthUnavailable, clerkConfigured, looksLikeJwt, verifyClerkJwt } from './auth/clerk';
import { getClaim, notConfigured } from './auth/entitlement';
import { checkRate } from './auth/ratelimit';

// ---- Token rules (every route) -----------------------------------------------------------------
// hf_ tokens are refused everywhere. The token value is never logged, stored or echoed.
// An alt_ key or a Clerk token on a public read is ignored: the read is served as anonymous and is
// never tied to the caller (spec/accounts-v1.md section 1). Only auth routes read a credential.
export function tokenKind(req: Request, url: URL): 'hf' | 'alt' | null {
  const vals: string[] = [];
  const a = req.headers.get('authorization');
  if (a) vals.push(a.replace(/^\s*bearer\s+/i, '').trim());
  const x = req.headers.get('x-hf-token'); if (x) vals.push(x.trim());
  for (const [k, v] of url.searchParams) { if (/token/i.test(k) || /^(hf|alt)_/.test(v)) vals.push(v); }
  if (vals.some((v) => v.startsWith('hf_'))) return 'hf';
  if (vals.some((v) => v.startsWith('alt_'))) return 'alt';
  return null;
}

// ---- Auth routes (spec/accounts-v1.md section 2) -------------------------------------------------
const SESSION_SCOPES: FwScope[] = ['freeweights.read', 'freeweights.write'];
const ALT_KEY = /^alt_[\x21-\x7e]{1,512}$/;
const denied = () => authErr(401, 'auth_required', 'Sign in or send an Allternit key (alt_...).', { 'www-authenticate': 'Bearer' });

/** The bearer from the Authorization header only. The Worker never reads a cookie or a query token for auth. */
function bearerOf(req: Request): string | null {
  const a = req.headers.get('authorization');
  const m = a && a.match(/^\s*bearer\s+(\S+)\s*$/i);
  return m ? m[1] : null;
}

/** True when the deployment can answer auth routes at all: the accounts database is bound. */
export const accountsConfigured = (env: Env) => !!env.ACC;

/**
 * Who is calling an auth route. Returns the caller, or a finished error reply (401 / 403 / 429 / 503).
 * A Clerk session is checked in the Worker with no call to cloud-api. An alt_ key is checked by fetching its
 * entitlement claim, which cloud-api only signs for a valid, unrevoked key.
 */
export async function authenticate(req: Request, env: Env, origin: string, ctx?: ExecutionContext): Promise<Caller | Response> {
  if (!accountsConfigured(env)) return notConfigured().res;
  const bearer = bearerOf(req);
  if (!bearer) return denied();
  let caller: Caller;
  if (bearer.startsWith('alt_')) {
    if (!ALT_KEY.test(bearer)) return denied();
    const r = await getClaim(env, origin, bearer, 'key', undefined, ctx);
    if ('res' in r) return r.res;
    caller = { userId: r.claim.sub, cred: 'key', scopes: r.claim.scopes, claim: r.claim, bearer };
  } else if (looksLikeJwt(bearer)) {
    if (!clerkConfigured(env)) return notConfigured().res;
    let claims;
    try { claims = await verifyClerkJwt(env, bearer, origin, ctx); }
    catch (e) {
      if (e instanceof AuthUnavailable) return authErr(503, 'entitlement_unavailable', 'Sign-in keys could not be fetched. Try again shortly.', { 'retry-after': '30' });
      throw e;
    }
    if (!claims) return denied();
    caller = { userId: claims.sub, cred: 'session', scopes: SESSION_SCOPES, bearer };
  } else {
    return denied();
  }
  return checkRate(caller) ?? caller;
}

/** The caller's entitlement claim, fetching it for a session on first need. Fails closed (503) without a verifiable claim. */
export async function withClaim(caller: Caller, env: Env, origin: string, ctx?: ExecutionContext): Promise<Caller | Response> {
  if (caller.claim) return caller;
  const r = await getClaim(env, origin, caller.bearer, caller.cred, caller.userId, ctx);
  if ('res' in r) return r.res;
  const next = { ...caller, claim: r.claim };
  return checkRate(next) ?? next;
}
