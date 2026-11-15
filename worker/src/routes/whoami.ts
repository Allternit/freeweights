import type { Caller, EntitlementClaim, FwScope, OrgRole } from '../types';
import { authErr, authJson } from '../http';
import { authenticate, withClaim } from '../auth';
import type { Handler } from '../router';

// GET /api/whoami-v2 (spec/parts/write-api.yaml, WhoAmI). Hugging Face shape, so `huggingface_hub` login and
// whoami() read an Allternit key the way they read their own tokens, plus an `allternit` block with the plan
// id and scopes from the entitlement claim (no price, no perk values).

/** Clerk org role in the claim -> Freeweights org role (plan section 8: admin -> admin, member -> contributor). */
const ROLE: Record<EntitlementClaim['orgs'][number]['role'], OrgRole> = { admin: 'admin', member: 'contributor' };
const REPO_SCOPE = 'freeweights.repo:';

function tokenAuth(c: Caller) {
  if (c.cred === 'session') return { type: 'session' as const };
  const repos = c.scopes.filter((s) => s.startsWith(REPO_SCOPE)).map((s) => s.slice(REPO_SCOPE.length));
  const role = c.scopes.includes('freeweights.write') ? 'write' : c.scopes.includes('freeweights.read') ? 'read' : 'fineGrained';
  return {
    type: 'access_token' as const,
    accessToken: {
      displayName: 'Allternit key',
      role,
      ...(role === 'fineGrained' ? { fineGrained: { scoped: repos.map((id) => ({ entity: { type: 'repo', name: id }, permissions: ['repo.content.read', 'repo.write'] })) } } : {}),
    },
  };
}

const usable = (scopes: FwScope[]) => scopes.some((s) => s === 'freeweights.read' || s === 'freeweights.write' || s.startsWith(REPO_SCOPE));

export const whoamiRoute: Handler = async ({ req, env, ctx, url }) => {
  const a = await authenticate(req, env, url.origin, ctx);
  if (a instanceof Response) return a;
  if (!usable(a.scopes)) return authErr(403, 'insufficient_scope', 'This key has no Freeweights scope. Add freeweights.read, freeweights.write or freeweights.repo:<id> on the console key page.');
  const c = await withClaim(a, env, url.origin, ctx);
  if (c instanceof Response) return c;
  const claim = c.claim!;
  const row = await env.ACC!.prepare("SELECT handle, name, avatar_url FROM users WHERE id = ?1 AND status = 'active'")
    .bind(c.userId).first<{ handle: string; name: string | null; avatar_url: string | null }>();
  if (!row) return authErr(404, 'profile_not_found', 'Signed in, but no Freeweights profile yet. Pick a handle at https://freeweights.allternit.com/account/ (POST /api/fw/v1/account).');
  return authJson({
    type: 'user',
    id: c.userId,
    name: row.handle,
    fullname: row.name,
    avatarUrl: row.avatar_url,
    isPro: claim.plan !== 'free',
    orgs: claim.orgs.map((o) => ({ type: 'org', name: o.slug, fullname: null, avatarUrl: null, roleInOrg: ROLE[o.role] ?? 'read' })),
    auth: tokenAuth(c),
    allternit: { plan: claim.plan, scopes: claim.scopes },
  });
};
