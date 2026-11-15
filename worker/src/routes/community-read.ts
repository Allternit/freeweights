// Hugging Face read routes for community repos (spec/accounts-v1.md 6 and 11.6): info, tree, commits, refs
// and resolve, for /api/models/... and /api/datasets/.... Catalog ids win: a namespace that is a catalog org
// can never be a handle (reserved_handles), and every handler declines (returns null) for a catalog id, so
// the catalog routes after it answer exactly as before.
//
// What is served: only the head commit and the commits before it. The head moves only when every scan of a
// commit is clean (storage/promote.ts), so a new commit that is scanning or held is never reachable, while
// the files of the last clean head stay downloadable. A repo with no head yet answers 404 file_not_ready.
// Removed repos: a takedown answers 451 removed_after_takedown; removed by the owner or by account
// deletion answers 404 repo_not_found. Private repos are not part of the launch and read as not found.
//
// Every community reply carries "source": "community" and "section": "alt.freeweights.community" (the
// markers the iOS and ai.allternit.com clients key on; catalog replies keep their shape).
import type { Env, RepoRow } from '../types';
import { CORS, err, json, seg } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';
import { ROWS } from '../catalog';
import { readServedTree } from '../storage/promote';
import { blobKey } from '../storage/promote';
import { r2Creds, r2Presign } from '../storage/presign';
import type { TreeFile } from '../storage/scan-state';

export const COMMUNITY_SECTION = 'alt.freeweights.community';
const MARK = { source: 'community', section: COMMUNITY_SECTION } as const;
/** Presigned download lifetime: a takedown takes effect within this time (plan U6). */
export const DOWNLOAD_URL_S = 300;
const NOSTORE = { 'cache-control': 'no-store' };

type Kind = 'model' | 'dataset';
const kindOf = (segment: string | undefined): Kind => (segment === 'datasets' ? 'dataset' : 'model');

/** The community repo row, or null to decline (catalog id, accounts off, or no such community repo of that kind). */
async function find(env: Env, kind: Kind, ns: string, name: string): Promise<RepoRow | null> {
  if (!env.ACC) return null;
  if (kind === 'model' && ROWS.has(`${ns}/${name}`)) return null;
  return env.ACC.prepare(`SELECT * FROM repos WHERE kind = ? AND namespace = ? AND name = ? AND source = 'community'`).bind(kind, ns, name).first<RepoRow>();
}

/** A reply when the repo cannot be read at all, else null. */
function unreadable(repo: RepoRow): Response | null {
  const id = `${repo.namespace}/${repo.name}`;
  if (repo.status === 'removed') {
    if (repo.removed_reason && repo.removed_reason !== 'owner' && repo.removed_reason !== 'account_deleted') {
      return err(451, 'removed_after_takedown', `${id} was removed after a takedown. It is counted at https://freeweights.allternit.com/operating-statement/#takedown-counter.`, NOSTORE);
    }
    return err(404, 'repo_not_found', `No repo ${id}.`, NOSTORE);
  }
  if (repo.private) return err(404, 'repo_not_found', `No repo ${id}.`, NOSTORE);
  return null;
}

/** Unknown repo on /api/datasets (no catalog route answers datasets) or a declined model id. */
const missing = (kind: Kind, id: string) => (kind === 'dataset' ? err(404, 'repo_not_found', `No dataset ${id}.`) : null);

const notReady = (repo: RepoRow) => err(404, 'file_not_ready',
  repo.status === 'held'
    ? 'This repo has a file that did not pass the upload scan, so nothing of that commit is served. The owner can see why on the account page.'
    : repo.status === 'draft' ? 'This repo has no files yet.' : 'The files of this repo are still being scanned. Try again in a few minutes.',
  NOSTORE);

interface Served { oid: string; files: TreeFile[]; created_at: string }

/**
 * The served commit for `rev`: 'main' (or the head oid) -> the head; another 40-hex oid -> that commit if it
 * is at or before the head. Returns null for an unknown revision.
 */
async function servedCommit(env: Env, repo: RepoRow, rev: string): Promise<Served | 'not_ready' | null> {
  if (!repo.head_commit) return 'not_ready';
  const db = env.ACC!;
  const oid = rev === 'main' || rev === 'refs/heads/main' ? repo.head_commit : /^[0-9a-f]{40}$/.test(rev) ? rev : null;
  if (!oid) return null;
  const c = await db.prepare(`SELECT c.oid, c.tree_key, c.created_at FROM commits c
      WHERE c.oid = ? AND c.repo_id = ? AND c.rowid <= (SELECT rowid FROM commits WHERE oid = ?)`).bind(oid, repo.id, repo.head_commit)
    .first<{ oid: string; tree_key: string; created_at: string }>();
  if (!c) return null;
  const files = await readServedTree(env, c.tree_key);
  return files ? { oid: c.oid, files, created_at: c.created_at } : 'not_ready';
}
const revMissing = (rev: string, id: string) => err(404, 'revision_not_found', `Revision ${rev} is not a served commit of ${id}. Use main.`);

// ---- info -------------------------------------------------------------------------------------------------

async function info(env: Env, kind: Kind, ns: string, name: string, rev: string | undefined): Promise<Response | null> {
  const id = `${ns}/${name}`;
  const repo = await find(env, kind, ns, name);
  if (!repo) return missing(kind, id);
  const stop = unreadable(repo);
  if (stop) return stop;
  let sha: string | null = null;
  let siblings: { rfilename: string; size: number }[] = [];
  if (repo.head_commit) {
    const s = await servedCommit(env, repo, rev ?? 'main');
    if (s === null) return revMissing(rev!, id);
    if (s !== 'not_ready') { sha = s.oid; siblings = s.files.map((f) => ({ rfilename: f.path, size: f.size })); }
  } else if (rev && rev !== 'main') return revMissing(rev, id);
  return json({
    _id: repo.id, id, ...(kind === 'model' ? { modelId: id } : {}), author: ns, sha,
    lastModified: repo.updated_at, createdAt: repo.created_at, private: false, gated: false, disabled: false,
    downloads: 0, likes: repo.likes, tags: repo.license_id ? [`license:${repo.license_id.toLowerCase()}`] : [],
    siblings, usedStorage: repo.bytes, cardData: repo.license_id ? { license: repo.license_id } : {},
    ...MARK, status: repo.status, license_id: repo.license_id,
  }, 200, { 'cache-control': 'public, max-age=60', ...(sha ? { 'x-repo-commit': sha } : {}) });
}

// ---- tree -------------------------------------------------------------------------------------------------

/** Folder entries need an oid (huggingface_hub reads it as tree_id); a stable one from commit + path. */
async function folderOid(commit: string, path: string) {
  const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(`${commit}:${path}`));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function tree(env: Env, kind: Kind, ns: string, name: string, rev: string, sub: string, recursive: boolean): Promise<Response | null> {
  const id = `${ns}/${name}`;
  const repo = await find(env, kind, ns, name);
  if (!repo) return missing(kind, id);
  const stop = unreadable(repo);
  if (stop) return stop;
  const s = await servedCommit(env, repo, rev);
  if (s === null) return revMissing(rev, id);
  if (s === 'not_ready') return notReady(repo);
  const prefix = sub.replace(/^\/+|\/+$/g, '');
  const under = s.files.filter((f) => !prefix || f.path.startsWith(`${prefix}/`));
  if (prefix && !under.length) return err(404, 'entry_not_found', `No folder ${prefix} in ${id} at ${s.oid}.`);
  const out: unknown[] = [];
  const dirs = new Set<string>();
  for (const f of under) {
    const rest = prefix ? f.path.slice(prefix.length + 1) : f.path;
    const cut = rest.indexOf('/');
    if (!recursive && cut >= 0) { dirs.add((prefix ? `${prefix}/` : '') + rest.slice(0, cut)); continue; }
    if (recursive) { // every folder on the way down
      const parts = rest.split('/');
      for (let i = 1; i < parts.length; i++) dirs.add((prefix ? `${prefix}/` : '') + parts.slice(0, i).join('/'));
    }
    out.push({
      type: 'file', path: f.path, size: f.size, oid: f.sha256,
      ...(f.lfs ? { lfs: { oid: f.sha256, size: f.size, pointerSize: 125 + String(f.size).length } } : {}),
    });
  }
  const folders = await Promise.all([...dirs].sort().map(async (p) => ({ type: 'directory', path: p, size: 0, oid: await folderOid(s.oid, p) })));
  return json([...folders, ...out], 200, { 'x-repo-commit': s.oid, 'cache-control': 'public, max-age=60' });
}

// ---- commits and refs ------------------------------------------------------------------------------------

const escHtml = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function commits(env: Env, kind: Kind, ns: string, name: string, rev: string): Promise<Response | null> {
  const id = `${ns}/${name}`;
  const repo = await find(env, kind, ns, name);
  if (!repo) return missing(kind, id);
  const stop = unreadable(repo);
  if (stop) return stop;
  if (!repo.head_commit) return notReady(repo);
  const start = rev === 'main' ? repo.head_commit : rev;
  const rows = (await env.ACC!.prepare(`SELECT c.oid, c.title, c.message, c.created_at, u.handle FROM commits c LEFT JOIN users u ON u.id = c.author_user_id
      WHERE c.repo_id = ? AND c.ref = 'refs/heads/main'
        AND c.rowid <= (SELECT rowid FROM commits WHERE oid = ? AND repo_id = ?)
        AND c.rowid <= (SELECT rowid FROM commits WHERE oid = ?)
      ORDER BY c.rowid DESC LIMIT 100`).bind(repo.id, start, repo.id, repo.head_commit)
    .all<{ oid: string; title: string; message: string | null; created_at: string; handle: string | null }>()).results;
  if (!rows.length) return revMissing(rev, id);
  return json(rows.map((c) => ({
    id: c.oid, authors: c.handle ? [{ user: c.handle }] : [], date: c.created_at, title: c.title, message: c.message ?? '',
    formatted_title: escHtml(c.title), formatted_message: c.message ? `<p>${escHtml(c.message)}</p>` : '',
  })), 200, { 'x-repo-commit': rows[0].oid, 'cache-control': 'public, max-age=60' });
}

async function refs(env: Env, kind: Kind, ns: string, name: string, includePrs: boolean): Promise<Response | null> {
  const id = `${ns}/${name}`;
  const repo = await find(env, kind, ns, name);
  if (!repo) return missing(kind, id);
  const stop = unreadable(repo);
  if (stop) return stop;
  return json({
    branches: repo.head_commit ? [{ name: 'main', ref: 'refs/heads/main', targetCommit: repo.head_commit }] : [],
    converts: [], tags: [], ...(includePrs ? { pullRequests: [] } : {}),
  }, 200, { 'cache-control': 'public, max-age=60' });
}

// ---- resolve ----------------------------------------------------------------------------------------------

async function resolve(env: Env, req: Request, kind: Kind, ns: string, name: string, rev: string, path: string): Promise<Response | null> {
  const id = `${ns}/${name}`;
  const repo = await find(env, kind, ns, name);
  if (!repo) return missing(kind, id);
  const stop = unreadable(repo);
  if (stop) return stop;
  const s = await servedCommit(env, repo, rev);
  if (s === null) return revMissing(rev, id);
  if (s === 'not_ready') return notReady(repo);
  const f = s.files.find((x) => x.path === path);
  if (!f) {
    // Possibly a new file of a commit that is still scanning or held: say so rather than "no such file".
    if (repo.status === 'scanning' || repo.status === 'held') return notReady(repo);
    return err(404, 'file_not_found', `No file ${path} in ${id} at ${s.oid}.`);
  }
  const creds = r2Creds(env);
  if (!creds) return err(503, 'accounts_not_configured', 'Community downloads are not turned on for this deployment.', NOSTORE);
  const headers = new Headers({
    'x-repo-commit': s.oid, etag: `"${f.sha256}"`, 'x-freeweights-source': 'community', 'cache-control': 'private, no-store', ...CORS,
  });
  if (f.lfs) { headers.set('x-linked-size', String(f.size)); headers.set('x-linked-etag', `"${f.sha256}"`); }
  if (req.method === 'HEAD') { // metadata only, no redirect (same reason as the catalog resolve: huggingface_hub 2.x HEAD handling)
    headers.set('content-length', String(f.size));
    return new Response(null, { status: 200, headers });
  }
  headers.set('location', await r2Presign(creds, { method: 'GET', bucket: 'public', key: blobKey(repo.id, f.sha256), expiresS: DOWNLOAD_URL_S }));
  return new Response(null, { status: 302, headers });
}

// ---- handlers (patterns in routes/index.ts) --------------------------------------------------------------
// m[1] is the type segment ('models' | 'datasets'), m[2] the namespace, m[3] the name.

export const communityInfoRoute: Handler = ({ env }, m) =>
  d1(async () => (await info(env, kindOf(m[1]), seg(m[2]), seg(m[3]), m[4] ? seg(m[4]) : undefined)) ?? DECLINE).then(undecline);
export const communityTreeRoute: Handler = ({ env, url }, m) =>
  d1(async () => (await tree(env, kindOf(m[1]), seg(m[2]), seg(m[3]), seg(m[4]), m[5] ? seg(m[5]) : '', /^(1|true)$/i.test(url.searchParams.get('recursive') ?? ''))) ?? DECLINE).then(undecline);
export const communityCommitsRoute: Handler = ({ env }, m) =>
  d1(async () => (await commits(env, kindOf(m[1]), seg(m[2]), seg(m[3]), seg(m[4]))) ?? DECLINE).then(undecline);
export const communityRefsRoute: Handler = ({ env, url }, m) =>
  d1(async () => (await refs(env, kindOf(m[1]), seg(m[2]), seg(m[3]), url.searchParams.get('include_prs') === '1')) ?? DECLINE).then(undecline);
/** /{ns}/{name}/resolve/... (models) and /datasets/{ns}/{name}/resolve/... */
export const communityResolveRoute: Handler = ({ env, req }, m) => {
  if (!m[1] && (m[2] === 'api' || m[2] === 'manifests')) return null;
  return d1(async () => (await resolve(env, req, m[1] ? 'dataset' : 'model', seg(m[2]), seg(m[3]), seg(m[4]), seg(m[5]))) ?? DECLINE).then(undecline);
};

// d1() wants a Response; a sentinel carries "decline" through it and back out as null.
const DECLINE = new Response(null, { status: 599 });
const undecline = (r: Response) => (r === DECLINE ? null : r);
