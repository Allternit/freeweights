import type { Caller, Env, UserRow } from '../types';
import { authErr, authJson } from '../http';
import { authenticate, withClaim } from '../auth';
import { deletedHandle, handleProblem } from '../auth/handle';
import type { Handler } from '../router';

// /api/fw/v1/account (spec/parts/write-api.yaml: getAccount, createAccount, updateAccount, deleteAccount).
// GET reads the profile, POST claims a handle (first sign-in), PATCH edits it, DELETE removes it. The handle
// namespace is shared with orgs and the reserved list; the database triggers refuse a taken or reserved handle
// (handle_taken), so two claims racing for one handle cannot both win. Nothing here logs a token or an email.

const BODY_MAX = 16 * 1024;
const ISO = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const bad = (m: string) => authErr(400, 'bad_request', m);

async function readBody(req: Request): Promise<Record<string, unknown> | Response> {
  const t = await req.text();
  if (t.length > BODY_MAX) return bad('Request body is too large.');
  let v: unknown;
  try { v = JSON.parse(t); } catch { return bad('Send a JSON object.'); }
  return isObj(v) ? v : bad('Send a JSON object.');
}

function httpsUrl(v: unknown, what: string): string | Response {
  if (typeof v !== 'string' || v.length > 500) return bad(`${what} must be an https URL of at most 500 characters.`);
  try { if (new URL(v).protocol === 'https:') return v; } catch { /* fall through */ }
  return bad(`${what} must be an https URL of at most 500 characters.`);
}

const can = (c: Caller, write: boolean) => c.scopes.includes('freeweights.write') || (!write && c.scopes.includes('freeweights.read'));
const handleTaken = () => authErr(409, 'handle_taken', 'That handle is taken or reserved. Pick another.');
const isTakenError = (e: unknown) => /handle_taken|UNIQUE constraint/i.test(String((e as Error)?.message ?? e));

async function limitValue(env: Env, key: string): Promise<number | null> {
  const r = await env.ACC!.prepare('SELECT value FROM limits WHERE key = ?1').bind(key).first<{ value: number }>();
  return r ? r.value : null;
}

/** The entitlement claim when it can be had; the account page still answers when cloud-api is slow. */
async function claimOrNull(c: Caller, env: Env, origin: string, ctx: ExecutionContext) {
  const r = await withClaim(c, env, origin, ctx);
  return r instanceof Response ? null : r.claim ?? null;
}

async function accountBody(env: Env, c: Caller, u: UserRow, origin: string, ctx: ExecutionContext) {
  const db = env.ACC!;
  const [claim, kinds, usage, cap] = await Promise.all([
    claimOrNull(c, env, origin, ctx),
    db.prepare("SELECT kind, COUNT(*) AS n FROM repos WHERE owner_user_id = ?1 AND status <> 'removed' GROUP BY kind").bind(u.id).all<{ kind: string; n: number }>(),
    db.prepare('SELECT public_bytes, private_bytes, quarantine_bytes, repos FROM storage_usage WHERE owner_user_id = ?1').bind(u.id)
      .first<{ public_bytes: number; private_bytes: number; quarantine_bytes: number; repos: number }>(),
    limitValue(env, 'user_cap_bytes'),
  ]);
  const n = (k: string) => kinds.results.find((r) => r.kind === k)?.n ?? 0;
  return {
    user: {
      user: u.handle, type: 'user', fullname: u.name, avatarUrl: u.avatar_url, details: u.bio,
      isPro: claim ? claim.plan !== 'free' : false, createdAt: u.created_at,
      numModels: n('model'), numDatasets: n('dataset'), numSpaces: n('app'),
    },
    plan: claim ? claim.plan : null,
    perks: claim ? claim.perks : {},
    addon_bytes: claim ? claim.addon_bytes : { public: 0, private: 0 },
    usage: usage ?? { public_bytes: 0, private_bytes: 0, quarantine_bytes: 0, repos: 0 },
    storage_cap_bytes: cap,
    rules_accepted_at: u.rules_accepted_at,
    staff: u.staff === 1,
    status: u.status === 'suspended' ? 'suspended' : 'active',
    orgs: (claim?.orgs ?? []).map((o) => ({ name: o.slug, role: o.role === 'admin' ? 'admin' : 'contributor' })),
  };
}

const loadUser = (env: Env, id: string) => env.ACC!.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first<UserRow>();

/** Is the handle free for this account? Case-insensitive across users, orgs and the reserved list. */
async function handleFree(env: Env, handle: string, selfId: string): Promise<boolean> {
  const r = await env.ACC!.prepare(
    `SELECT (SELECT COUNT(*) FROM users WHERE handle = ?1 COLLATE NOCASE AND id <> ?2)
          + (SELECT COUNT(*) FROM orgs WHERE slug = ?1 COLLATE NOCASE)
          + (SELECT COUNT(*) FROM reserved_handles WHERE handle = ?1 COLLATE NOCASE) AS n`).bind(handle, selfId).first<{ n: number }>();
  return (r?.n ?? 1) === 0;
}

const audit = (env: Env, actor: string, action: string, target: string) =>
  env.ACC!.prepare("INSERT INTO audit_log (actor_user_id, action, target_type, target_id) VALUES (?1, ?2, 'user', ?3)").bind(actor, action, target);

function profileFields(b: Record<string, unknown>): { set: Record<string, string | null> } | Response {
  const set: Record<string, string | null> = {};
  if ('name' in b) {
    if (typeof b.name !== 'string' || b.name.length > 100) return bad('name must be a string of at most 100 characters.');
    set.name = b.name.trim() || null;
  }
  if ('bio' in b) {
    if (typeof b.bio !== 'string' || b.bio.length > 2000) return bad('bio must be a string of at most 2000 characters.');
    set.bio = b.bio.trim() || null;
  }
  if ('homepage' in b) { const u = b.homepage === '' ? null : httpsUrl(b.homepage, 'homepage'); if (u instanceof Response) return u; set.homepage = u; }
  if ('avatarUrl' in b) { const u = b.avatarUrl === '' ? null : httpsUrl(b.avatarUrl, 'avatarUrl'); if (u instanceof Response) return u; set.avatar_url = u; }
  return { set };
}

export const accountRoute: Handler = async ({ req, env, ctx, url }) => {
  const a = await authenticate(req, env, url.origin, ctx);
  if (a instanceof Response) return a;
  const method = req.method;
  const write = method !== 'GET' && method !== 'HEAD';
  if (!can(a, write)) {
    return authErr(403, 'insufficient_scope', write ? 'This key needs the freeweights.write scope.' : 'This key needs the freeweights.read or freeweights.write scope.');
  }
  const user = await loadUser(env, a.userId);
  const live = user && user.status !== 'deleted' ? user : null;

  if (method === 'GET' || method === 'HEAD') {
    if (!live) return authErr(404, 'profile_not_found', 'Signed in, but no Freeweights profile yet. Pick a handle with POST /api/fw/v1/account.');
    return authJson(await accountBody(env, a, live, url.origin, ctx));
  }

  if (method === 'DELETE') {
    if (!live) return authErr(404, 'profile_not_found', 'No Freeweights profile to delete.');
    const tomb = deletedHandle(a.userId);
    const now = ISO();
    await env.ACC!.batch([
      // Repos stop being served at once (resolve answers 404 for owner / account_deleted). Their bytes stay counted
      // until the files are deleted (admin repo purge, or the sweep), then usage reconcile releases them.
      env.ACC!.prepare("UPDATE repos SET status = 'removed', removed_reason = 'account_deleted', namespace = ?2, updated_at = ?3 WHERE owner_user_id = ?1 AND status <> 'removed'").bind(a.userId, tomb, now),
      env.ACC!.prepare("UPDATE repos SET namespace = ?2, updated_at = ?3 WHERE owner_user_id = ?1 AND removed_reason IN ('owner', 'account_deleted') AND namespace <> ?2").bind(a.userId, tomb, now),
      env.ACC!.prepare('DELETE FROM webhooks WHERE owner_user_id = ?1').bind(a.userId),
      env.ACC!.prepare("DELETE FROM org_members WHERE user_id = ?1 AND source = 'local'").bind(a.userId),
      env.ACC!.prepare("UPDATE users SET status = 'deleted', handle = ?2, name = NULL, avatar_url = NULL, bio = NULL, homepage = NULL, updated_at = ?3 WHERE id = ?1").bind(a.userId, tomb, now),
      audit(env, a.userId, 'account.delete', a.userId),
    ]);
    return authJson({ deleted: true });
  }

  const b = await readBody(req);
  if (b instanceof Response) return b;
  if ('acceptRules' in b && b.acceptRules !== true) return bad('acceptRules, when sent, must be true.');
  const now = ISO();

  if (method === 'POST') {
    if (live) return authErr(409, 'account_exists', `This account already has the handle ${live.handle}. Change it with PATCH /api/fw/v1/account.`);
    const hp = handleProblem(b.handle);
    if (hp) return bad(hp);
    const f = profileFields(b);
    if (f instanceof Response) return f;
    const handle = b.handle as string;
    if (!(await handleFree(env, handle, a.userId))) return handleTaken();
    const rules = b.acceptRules === true ? now : null;
    const name = f.set.name ?? null;
    try {
      await env.ACC!.batch([
        user // a deleted profile comes back on the same row
          ? env.ACC!.prepare("UPDATE users SET handle = ?2, name = ?3, status = 'active', rules_accepted_at = ?4, updated_at = ?5 WHERE id = ?1").bind(a.userId, handle, name, rules, now)
          : env.ACC!.prepare('INSERT INTO users (id, handle, name, rules_accepted_at) VALUES (?1, ?2, ?3, ?4)').bind(a.userId, handle, name, rules),
        audit(env, a.userId, 'account.create', a.userId),
      ]);
    } catch (e) {
      if (isTakenError(e)) return handleTaken();
      throw e;
    }
    return authJson(await accountBody(env, a, (await loadUser(env, a.userId))!, url.origin, ctx));
  }

  // PATCH
  if (!live) return authErr(404, 'profile_not_found', 'Signed in, but no Freeweights profile yet. Pick a handle with POST /api/fw/v1/account.');
  if (live.status === 'suspended') return authErr(403, 'account_suspended', 'This account is suspended.');
  const f = profileFields(b);
  if (f instanceof Response) return f;
  const set = f.set;
  const stmts: D1PreparedStatement[] = [];
  if ('handle' in b) {
    const hp = handleProblem(b.handle);
    if (hp) return bad(hp);
    const handle = b.handle as string;
    if (handle !== live.handle) {
      if (!(await handleFree(env, handle, a.userId))) return handleTaken();
      set.handle = handle;
      // A repo address is namespace/name, so a new handle moves every repo of this account with it.
      stmts.push(env.ACC!.prepare("UPDATE repos SET namespace = ?2, updated_at = ?3 WHERE owner_user_id = ?1 AND source = 'community'").bind(a.userId, handle, now));
    }
  }
  if (b.acceptRules === true && !live.rules_accepted_at) set.rules_accepted_at = now; // the first time stays
  if (!Object.keys(set).length && !('acceptRules' in b) && !('handle' in b)) return bad('Send at least one field to change.');
  if (Object.keys(set).length) {
    const cols = Object.keys(set);
    stmts.unshift(env.ACC!.prepare(`UPDATE users SET ${cols.map((c, i) => `${c} = ?${i + 2}`).join(', ')}, updated_at = ?${cols.length + 2} WHERE id = ?1`)
      .bind(a.userId, ...cols.map((c) => set[c]), now));
    stmts.push(audit(env, a.userId, 'account.update', a.userId));
  }
  try { if (stmts.length) await env.ACC!.batch(stmts); }
  catch (e) { if (isTakenError(e)) return handleTaken(); throw e; }
  return authJson(await accountBody(env, a, (await loadUser(env, a.userId))!, url.origin, ctx));
};
