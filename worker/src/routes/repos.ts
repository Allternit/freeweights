import type { Caller, Env, RepoKind, RepoRow } from '../types';
import type { Handler } from '../router';
import { authJson, seg } from '../http';
import { d1, notePause } from '../pause';
import { releaseRepoStatements } from '../storage/quota';
import { abortMultipart, r2Creds } from '../storage/presign';
import {
  audit, caller, findRepo, fwErr, gate, isoIn, kindOf, newId, noScope, openCheck, readJson, repoUrl, validName, writableRepo,
} from './repo-access';

// Repo create / delete / move / settings (plan step 7, spec/parts/write-api.yaml "repos", accounts-v1.md 11).
// At launch: public model and dataset repos under the caller's own handle. Org namespaces and app repos
// answer 403 forbidden, private repos 402 perk_required. Hugging Face shapes, so `huggingface_hub`
// create_repo / delete_repo / move_repo / update_repo_settings work with an alt_ key.

const PERK = { perk: 'private_storage', plans_url: 'https://freeweights.allternit.com/plans/' };
const perkRequired = () => fwErr(402, 'perk_required', 'Private repos are not offered yet. Create the repo as public.', PERK);
const orgsClosed = () => fwErr(403, 'forbidden', 'Org namespaces are not open for uploads yet. Use your own handle.');
const appsClosed = () => fwErr(403, 'forbidden', 'App repos (spaces) are not open for uploads yet. Use a model or dataset repo.');
const badRequest = (m: string) => fwErr(400, 'bad_request', m);
const wantsPrivate = (b: { private?: unknown; visibility?: unknown }) => b.private === true || b.visibility === 'private';
const sameNs = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
/** A repo the owner deleted leaves a removed row behind; its name may be used again. A takedown's row may not. */
const reusable = (r: RepoRow | null) => !!r && r.status === 'removed' && r.removed_reason === 'owner';

function splitId(s: unknown): [string, string] | null {
  if (typeof s !== 'string') return null;
  const p = s.split('/');
  return p.length === 2 && p[0] && validName(p[1]) ? [p[0], p[1]] : null;
}
async function writer(req: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Caller | Response> {
  const c = await caller(req, env, url, ctx);
  if (c instanceof Response) return c;
  return c.scopes.includes('freeweights.write') ? c : noScope();
}
const since = (s: number) => isoIn(-s);
const retryAfter = (first: string | null, windowS: number) =>
  String(Math.max(1, Math.ceil(((first ? Date.parse(first) : Date.now()) + windowS * 1000 - Date.now()) / 1000)));

// ---- POST /api/repos/create ---------------------------------------------------------------------------------
interface CreateBody { name?: unknown; organization?: unknown; type?: unknown; private?: unknown; visibility?: unknown; license?: unknown }

export const createRepoRoute: Handler = ({ req, env, ctx, url }) => d1(async () => {
  const c = await writer(req, env, url, ctx);
  if (c instanceof Response) return c;
  const b = await readJson<CreateBody>(req);
  if (!b || typeof b !== 'object') return badRequest('Send a JSON body with at least "name".');
  if (!validName(b.name)) return badRequest('A repo name is 1 to 96 letters, digits, ".", "_" or "-", with no ".." or "--", and does not end in ".git".');
  const kind = kindOf(typeof b.type === 'string' ? b.type : null);
  if (!kind) return badRequest('type is model or dataset.');
  if (kind === 'app') return appsClosed();
  if (wantsPrivate(b)) return perkRequired();
  const g = await gate(env, c, false);
  if (g instanceof Response) return g;
  const ns = g.user.handle;
  if (b.organization !== undefined && b.organization !== null && b.organization !== '' && !(typeof b.organization === 'string' && sameNs(b.organization, ns))) return orgsClosed();

  // An existing repo answers 409 before any limit, so `create_repo(exist_ok=True)` (which `hf upload` calls
  // every time) keeps working for an account that is at its repo limit or rate limit.
  const existing = await findRepo(env, kind, ns, b.name);
  if (existing && !reusable(existing)) {
    return fwErr(409, 'conflict', existing.status === 'removed' ? 'This repo name is not available.' : 'You already have a repo with this name.');
  }
  const closed = openCheck(g);
  if (closed) return closed;

  const lim = g.limits.values;
  const acc = env.ACC!;
  const [held, made] = await acc.batch([
    acc.prepare("SELECT COUNT(*) AS n FROM repos WHERE owner_user_id = ?1 AND status != 'removed'").bind(c.userId),
    acc.prepare("SELECT COUNT(*) AS n, MIN(created_at) AS first FROM audit_log WHERE actor_user_id = ?1 AND action = 'repo.create' AND created_at > ?2").bind(c.userId, since(86400)),
  ]);
  const heldN = Number((held.results?.[0] as { n: number })?.n ?? 0);
  const madeRow = (made.results?.[0] ?? {}) as { n?: number; first?: string | null };
  if (heldN >= lim.repos_per_user!) return fwErr(403, 'repo_limit', 'This account has as many repos as it may hold. Delete one first.', { limit: 'repos_per_user' });
  if (Number(madeRow.n ?? 0) >= lim.repo_creates_per_day!) {
    return fwErr(429, 'rate_limited', 'This account created as many repos as it may in 24 hours. Try again later.', { limit: 'repo_creates_per_day', headers: { 'retry-after': retryAfter(madeRow.first ?? null, 86400) } });
  }

  const id = newId('rp_');
  const license = typeof b.license === 'string' && /^[A-Za-z0-9.+_-]{1,64}$/.test(b.license) ? b.license : null;
  try {
    await acc.batch([
      ...(existing ? [acc.prepare("DELETE FROM repos WHERE id = ?1 AND status = 'removed' AND removed_reason = 'owner'").bind(existing.id)] : []),
      acc.prepare("INSERT INTO repos (id, kind, source, namespace, name, owner_user_id, license_id) VALUES (?1, ?2, 'community', ?3, ?4, ?5, ?6)")
        .bind(id, kind, ns, b.name, c.userId, license),
      acc.prepare('INSERT INTO storage_usage (owner_user_id) SELECT ?1 WHERE NOT EXISTS (SELECT 1 FROM storage_usage WHERE owner_user_id = ?1)').bind(c.userId),
      acc.prepare("UPDATE storage_usage SET repos = repos + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE owner_user_id = ?1").bind(c.userId),
      audit(env, c.userId, 'repo.create', id, { kind }),
    ]);
  } catch (e) {
    if (/UNIQUE|namespace_reserved/i.test(String(e))) return fwErr(409, 'conflict', 'You already have a repo with this name.');
    throw e;
  }
  return authJson({ url: repoUrl(url.origin, kind, ns, b.name), name: `${ns}/${b.name}`, id });
});

// ---- DELETE /api/repos/delete ---------------------------------------------------------------------------------
// The repo row stays as status 'removed', removed_reason 'owner' (resolve answers 404), its bytes go back to
// the account and the site, queued scans are dropped, and its files leave R2 after the reply.

export const deleteRepoRoute: Handler = ({ req, env, ctx, url }) => d1(async () => {
  const c = await writer(req, env, url, ctx);
  if (c instanceof Response) return c;
  const b = await readJson<{ name?: unknown; organization?: unknown; type?: unknown }>(req);
  if (!b || !validName(b.name)) return badRequest('Send {"name": "<repo>", "type": "model"|"dataset"}.');
  const kind = kindOf(typeof b.type === 'string' ? b.type : null);
  if (!kind) return badRequest('type is model or dataset.');
  const g = await gate(env, c, false);
  if (g instanceof Response) return g;
  const ns = typeof b.organization === 'string' && b.organization ? b.organization : g.user.handle;
  const repo = await writableRepo(env, c, kind, ns, b.name, false);
  if (repo instanceof Response) return repo;

  const acc = env.ACC!;
  const { results: open } = await acc.prepare("SELECT r2_key, r2_upload_id FROM uploads WHERE repo_id = ?1 AND transfer = 'multipart' AND status = 'pending' AND r2_upload_id != '' LIMIT 20")
    .bind(repo.id).all<{ r2_key: string; r2_upload_id: string }>();
  await acc.batch([
    ...releaseRepoStatements(acc, repo.id),
    acc.prepare("DELETE FROM scans WHERE repo_id = ?1 AND status IN ('queued', 'scanning')").bind(repo.id),
    acc.prepare("UPDATE repos SET status = 'removed', removed_reason = 'owner', bytes = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1").bind(repo.id),
    acc.prepare("UPDATE storage_usage SET repos = MAX(0, repos - 1), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE owner_user_id = ?1").bind(c.userId),
    audit(env, c.userId, 'repo.delete', repo.id),
  ]);
  ctx.waitUntil(purge(env, repo.id, open || []).catch(notePause));
  return authJson({});
});

/** Deletes a repo's objects (blobs, trees) from quarantine and the public bucket, and aborts open multiparts. */
export async function purge(env: Env, repoId: string, open: { r2_key: string; r2_upload_id: string }[] = []): Promise<void> {
  const creds = r2Creds(env);
  if (creds) await Promise.allSettled(open.map((u) => abortMultipart(creds, 'quarantine', u.r2_key, u.r2_upload_id)));
  for (const bucket of [env.QUARANTINE, env.FW]) {
    if (!bucket) continue;
    let cursor: string | undefined;
    for (let page = 0; page < 5; page++) {
      const l = await bucket.list({ prefix: `repos/${repoId}/`, cursor, limit: 1000 });
      if (l.objects.length) await bucket.delete(l.objects.map((o) => o.key));
      if (!l.truncated) break;
      cursor = l.cursor;
    }
  }
}

// ---- POST /api/repos/move --------------------------------------------------------------------------------------

export const moveRepoRoute: Handler = ({ req, env, ctx, url }) => d1(async () => {
  const c = await writer(req, env, url, ctx);
  if (c instanceof Response) return c;
  const b = await readJson<{ fromRepo?: unknown; toRepo?: unknown; type?: unknown }>(req);
  const from = splitId(b?.fromRepo), to = splitId(b?.toRepo);
  if (!from || !to) return badRequest('Send {"fromRepo": "<you>/<name>", "toRepo": "<you>/<new name>"}.');
  const kind = kindOf(typeof b?.type === 'string' ? b.type : null);
  if (!kind) return badRequest('type is model or dataset.');
  const g = await gate(env, c, false);
  if (g instanceof Response) return g;
  const repo = await writableRepo(env, c, kind, from[0], from[1], false);
  if (repo instanceof Response) return repo;
  if (!sameNs(to[0], g.user.handle)) return orgsClosed();
  if (to[1] === repo.name) return authJson({ url: repoUrl(url.origin, kind, g.user.handle, to[1]) });
  const there = await findRepo(env, kind, g.user.handle, to[1]);
  if (there && there.id !== repo.id && !reusable(there)) return fwErr(409, 'conflict', 'A repo with that name already exists.');
  const acc = env.ACC!;
  try {
    await acc.batch([
      ...(there && there.id !== repo.id ? [acc.prepare("DELETE FROM repos WHERE id = ?1 AND status = 'removed' AND removed_reason = 'owner'").bind(there.id)] : []),
      acc.prepare("UPDATE repos SET namespace = ?2, name = ?3, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1").bind(repo.id, g.user.handle, to[1]),
      audit(env, c.userId, 'repo.move', repo.id, { from: `${repo.namespace}/${repo.name}`, to: `${g.user.handle}/${to[1]}` }),
    ]);
  } catch (e) {
    if (/UNIQUE/i.test(String(e))) return fwErr(409, 'conflict', 'A repo with that name already exists.');
    throw e;
  }
  return authJson({ url: repoUrl(url.origin, kind, g.user.handle, to[1]) });
});

// ---- PUT /api/{type}s/{ns}/{repo}/settings ------------------------------------------------------------------------

export const repoSettingsRoute: Handler = ({ req, env, ctx, url }, m) => d1(async () => {
  const kind = kindOf(m[1]) as RepoKind;
  const c = await caller(req, env, url, ctx);
  if (c instanceof Response) return c;
  const repo = await writableRepo(env, c, kind, seg(m[2]), seg(m[3]));
  if (repo instanceof Response) return repo;
  const g = await gate(env, c, false);
  if (g instanceof Response) return g;
  const b = await readJson<{ visibility?: unknown; private?: unknown; gated?: unknown; discussionsDisabled?: unknown }>(req);
  if (!b || typeof b !== 'object' || !['visibility', 'private', 'gated', 'discussionsDisabled'].some((k) => k in b)) {
    return badRequest('Send one of visibility, private, gated or discussionsDisabled.');
  }
  if (wantsPrivate(b)) return perkRequired();
  if ('visibility' in b && b.visibility !== 'public') return badRequest('visibility is public or private.');
  if ('gated' in b && b.gated !== false && b.gated !== null && b.gated !== 'false') return fwErr(501, 'not_implemented', 'Gated repos are not open yet.');
  if ('discussionsDisabled' in b) {
    if (typeof b.discussionsDisabled !== 'boolean') return badRequest('discussionsDisabled is true or false.');
    await env.ACC!.batch([
      env.ACC!.prepare("UPDATE repos SET discussions_disabled = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?1").bind(repo.id, b.discussionsDisabled ? 1 : 0),
      audit(env, c.userId, 'repo.settings', repo.id, { discussionsDisabled: b.discussionsDisabled }),
    ]);
  }
  return authJson({ private: false });
});
