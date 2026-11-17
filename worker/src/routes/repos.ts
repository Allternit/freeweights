import type { Caller, Env, RepoKind, RepoRow } from '../types';
import type { Handler } from '../router';
import { authJson, seg } from '../http';
import { d1, notePause } from '../pause';
import { releaseRepoStatements } from '../storage/quota';
import { abortMultipart, r2Creds } from '../storage/presign';
import {
  audit, caller, findRepo, fwErr, gate, isoIn, kindOf, newId, noScope, openCheck, readJson, repoUrl, validName, writableRepo,
} from './repo-access';
import { removeRepoPage, repoPageUrl } from '../pages/repo';
import { renderCommunityIndex } from '../pages/community-index';

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
    // The Hub's 409 carries the repo url, and huggingface_hub's create_repo(exist_ok=True) reads it (KeyError 'url'
    // without it, so a second `hf upload` to the same repo failed). A removed name is not the caller's repo: no url.
    if (existing.status === 'removed') return fwErr(409, 'conflict', 'This repo name is not available.');
    return fwErr(409, 'conflict', 'You already have a repo with this name.', { url: repoUrl(url.origin, kind, ns, b.name as string) });
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
    if (/UNIQUE|namespace_reserved/i.test(String(e))) return fwErr(409, 'conflict', 'You already have a repo with this name.', { url: repoUrl(url.origin, kind, ns, b.name as string) });
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
  // The page and the index are removed here: this batch already released the uploads, so the sweep (which keys its
  // page cleanup on uploads still counted) never sees this repo again.
  ctx.waitUntil((async () => {
    await removeRepoPage(env, repo);
    await purge(env, repo.id, open || []);
    await renderCommunityIndex(env);
  })().catch(notePause));
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

// ---- GET /api/fw/v1/repos ------------------------------------------------------------------------------------
// The caller's community repos, newest first, with scan counts (spec listMyRepos). The account page, the
// /new/ upload page, `fw repo status` and the app upload screens read it. Any credential of the caller may
// read it (no write scope needed); a suspended account still sees its repos. Repos the owner deleted are left
// out (their names are free again); a takedown stays listed as removed with its reason.
//
// Scan counts: the commits waiting after the head (the head moves only over fully clean commits, spec 11.6),
// which is what "scanning" or "held" is about. When nothing waits, the head commit's scans (all clean).

const LIST_MAX = 200;
interface ListRow { id: string; kind: RepoKind; namespace: string; name: string; status: RepoRow['status']; removed_reason: string | null; head_commit: string | null; bytes: number; created_at: string; updated_at: string }
interface ScanCountRow { repo_id: string; status: 'queued' | 'scanning' | 'clean' | 'held' | 'error'; findings: string | null; waiting: number }

export const listMyReposRoute: Handler = ({ req, env, ctx, url }) => d1(async () => {
  const c = await caller(req, env, url, ctx);
  if (c instanceof Response) return c;
  const db = env.ACC!;
  const user = await db.prepare('SELECT status FROM users WHERE id = ?1').bind(c.userId).first<{ status: string }>();
  if (!user || user.status === 'deleted') return fwErr(404, 'profile_not_found', 'Signed in, but no Freeweights profile yet. Pick a handle at https://freeweights.allternit.com/account/ (POST /api/fw/v1/account).');
  const k = url.searchParams.get('kind');
  if (k !== null && k !== 'model' && k !== 'dataset') return badRequest('kind is model or dataset.');

  const [repos, scans] = await db.batch([
    db.prepare(`SELECT id, kind, namespace, name, status, removed_reason, head_commit, bytes, created_at, updated_at FROM repos
      WHERE owner_user_id = ?1 AND source = 'community' AND kind IN ('model', 'dataset') AND (?2 IS NULL OR kind = ?2)
        AND NOT (status = 'removed' AND removed_reason IN ('owner', 'account_deleted'))
      ORDER BY created_at DESC, id DESC LIMIT ${LIST_MAX}`).bind(c.userId, k),
    // waiting = 1 for a scan of a commit after the head, 0 for a scan of the head commit itself.
    db.prepare(`SELECT s.repo_id, s.status, s.findings,
        CASE WHEN s.commit_oid IS r.head_commit THEN 0 ELSE 1 END AS waiting
      FROM scans s JOIN repos r ON r.id = s.repo_id
      WHERE r.owner_user_id = ?1 AND r.source = 'community'
        AND (s.commit_oid IS r.head_commit
          OR s.commit_oid IN (SELECT oid FROM commits WHERE repo_id = r.id AND rowid > COALESCE((SELECT rowid FROM commits WHERE oid = r.head_commit), 0)))`).bind(c.userId),
  ]);
  const rows = (repos.results || []) as unknown as ListRow[];
  const byRepo = new Map<string, ScanCountRow[]>();
  for (const s of (scans.results || []) as unknown as ScanCountRow[]) byRepo.set(s.repo_id, [...(byRepo.get(s.repo_id) ?? []), s]);

  const out = rows.map((r) => {
    const all = byRepo.get(r.id) ?? [];
    const pick = all.some((s) => s.waiting === 1) ? all.filter((s) => s.waiting === 1) : all;
    const counts = { queued: 0, scanning: 0, clean: 0, held: 0, error: 0 };
    const codes = new Set<string>();
    for (const s of pick) {
      counts[s.status]++;
      if (s.status !== 'held' || !s.findings) continue;
      try { for (const f of JSON.parse(s.findings) as { code?: unknown }[]) if (typeof f?.code === 'string') codes.add(f.code); } catch { /* bad JSON: count only */ }
    }
    return {
      id: r.id, type: r.kind, name: `${r.namespace}/${r.name}`, status: r.status, removed_reason: r.removed_reason,
      head_commit: r.head_commit, bytes: r.bytes, createdAt: r.created_at, updatedAt: r.updated_at,
      scans: { ...counts, held_codes: [...codes] },
      // The detail page exists once a commit has been served (rendered at promotion), and is deleted on removal.
      page_url: r.head_commit && r.status !== 'removed' ? repoPageUrl(r) : null,
      source: 'community' as const, section: 'alt.freeweights.community' as const,
    };
  });
  return authJson({ repos: out, source: 'community', section: 'alt.freeweights.community' }, 200, { 'cache-control': 'private, no-store' });
});
