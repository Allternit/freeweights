import type { Caller, Env, LimitKey, RepoKind, RepoRow, UserRow } from '../types';
import { authJson } from '../http';
import { authenticate } from '../auth';
import { readLimits, type LimitsState } from '../storage/quota';

// Shared by the upload routes (repos.ts, commit.ts, lfs.ts): error replies Hugging Face clients can read,
// the upload gate (spec/accounts-v1.md 11.2), repo lookup and write access, and ids.

// huggingface_hub (utils/_http.py hf_raise_for_status) prints the X-Error-Message header and the body's
// `error` field, not `message`. Our `error` is a stable code, so the plain sentence also goes in
// X-Error-Message. X-Error-Code RepoNotFound / RevisionNotFound makes the client raise its own typed error.
// Header values must be ASCII; messages are written in ASCII.
export function fwErr(status: number, error: string, message: string, extra: { paths?: string[]; url?: string; limit?: LimitKey; perk?: string; plans_url?: string; headers?: Record<string, string>; hfCode?: string } = {}): Response {
  const { headers, hfCode, ...fields } = extra;
  const h: Record<string, string> = { 'x-error-message': message.replace(/[^\x20-\x7e]/g, ' '), ...(headers || {}) };
  if (hfCode) h['x-error-code'] = hfCode;
  return authJson({ error, message, ...fields }, status, h);
}
export const repoNotFound = () => fwErr(404, 'repo_not_found', 'No such repo, or it is not yours.', { hfCode: 'RepoNotFound' });

export async function readJson<T>(req: Request, max = 1 << 20): Promise<T | null> {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > max) return null;
  try { const t = await req.text(); return t.length > max ? null : (JSON.parse(t) as T); } catch { return null; }
}

// ---- Kinds, names, URLs ------------------------------------------------------------------------------------

/** URL segment or singular type -> kind. spaces/apps are app repos (not open for uploads at launch). */
export function kindOf(s: string | null | undefined): RepoKind | null {
  if (s === undefined || s === null || s === '' || s === 'model' || s === 'models') return 'model';
  if (s === 'dataset' || s === 'datasets') return 'dataset';
  if (s === 'space' || s === 'spaces' || s === 'app' || s === 'apps') return 'app';
  return null;
}
/** Repo names: 1-96 of A-Z a-z 0-9 . _ -, no "..", no "--", not ending in .git (the repos table CHECKs). */
export const validName = (n: unknown): n is string =>
  typeof n === 'string' && /^[A-Za-z0-9._-]{1,96}$/.test(n) && !n.includes('..') && !n.includes('--') && !/\.git$/i.test(n) && !/^[.-]/.test(n);
const PREFIX: Record<RepoKind, string> = { model: '', dataset: 'datasets/', app: 'spaces/' };
export const repoUrl = (origin: string, kind: RepoKind, ns: string, name: string) => `${origin}/${PREFIX[kind]}${ns}/${name}`;

// ULID-like ids: 48-bit time + 80 random bits, Crockford base32, after a prefix (rp_, up_, sc_).
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function newId(prefix: string, now = Date.now()): string {
  let t = '', n = now;
  for (let i = 0; i < 10; i++) { t = B32[n % 32] + t; n = Math.floor(n / 32); }
  const r = crypto.getRandomValues(new Uint8Array(16));
  let s = '';
  for (let i = 0; i < 16; i++) s += B32[r[i] % 32];
  return `${prefix}${t}${s}`;
}
export const blobKey = (repoId: string, sha256: string) => `repos/${repoId}/blobs/${sha256}`;
export const treeKey = (repoId: string, commit: string) => `repos/${repoId}/trees/${commit}.json`;
export const isoIn = (s: number, now = Date.now()) => new Date(now + s * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');

// ---- Callers and the gate ---------------------------------------------------------------------------------

/** The credential, with a scope that can write: freeweights.write, or freeweights.repo:<id> for that repo. */
export const canWrite = (c: Caller, repoId?: string) => c.scopes.includes('freeweights.write') || (!!repoId && c.scopes.includes(`freeweights.repo:${repoId}`));
export const noScope = () => fwErr(403, 'insufficient_scope', 'This key cannot write. Use a key with freeweights.write (or freeweights.repo:<id> for one repo).');

export async function caller(req: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Caller | Response> {
  return authenticate(req, env, url.origin, ctx);
}

export interface Gate { user: UserRow; limits: LimitsState }

/** The two upload-only checks (rules, switch), separate so repo create can answer 409 for an existing repo first. */
export function openCheck(g: Gate): Response | null {
  if (!g.user.rules_accepted_at) return fwErr(403, 'rules_not_accepted', 'Accept the upload rules first: https://freeweights.allternit.com/account/ (or acceptRules: true on POST /api/fw/v1/account).');
  if (g.user.staff === 1 ? g.limits.missing.length > 0 : !g.limits.open) {
    return fwErr(403, 'uploads_paused', 'Uploads are paused right now. See https://freeweights.allternit.com/api/fw/v1/limits for the current state.', { limit: 'uploads_open' });
  }
  return null;
}
/**
 * The account checks every upload write runs (spec 11.2): a profile, not suspended, and with
 * `upload` also accepted rules and the upload switch. Staff pass the switch, not the caps: a staff upload
 * still needs every cap key set, so the caps never read as "no limit".
 */
export async function gate(env: Env, c: Caller, upload: boolean): Promise<Gate | Response> {
  const user = await env.ACC!.prepare('SELECT * FROM users WHERE id = ?1').bind(c.userId).first<UserRow>();
  if (!user || user.status === 'deleted') return fwErr(404, 'profile_not_found', 'Signed in, but no Freeweights profile yet. Pick a handle at https://freeweights.allternit.com/account/ (POST /api/fw/v1/account).');
  if (user.status === 'suspended') return fwErr(403, 'account_suspended', 'This account is suspended. Write to the takedown mailbox to appeal.');
  const g = { user, limits: await readLimits(env.ACC!) };
  return (upload && openCheck(g)) || g;
}

// ---- Repos --------------------------------------------------------------------------------------------------

export async function findRepo(env: Env, kind: RepoKind, ns: string, name: string): Promise<RepoRow | null> {
  return env.ACC!.prepare('SELECT * FROM repos WHERE kind = ?1 AND namespace = ?2 AND name = ?3').bind(kind, ns, name).first<RepoRow>();
}
/**
 * A community repo the caller may write: theirs (org repos are not open at launch), not removed, and a
 * credential with write scope for it. Not found and not yours read the same (404), except a public repo of
 * someone else, which is 403.
 */
export async function writableRepo(env: Env, c: Caller, kind: RepoKind, ns: string, name: string, repoScopeOk = true): Promise<RepoRow | Response> {
  const repo = await findRepo(env, kind, ns, name);
  if (!repo || repo.status === 'removed' || repo.source !== 'community' || (repo.private === 1 && repo.owner_user_id !== c.userId)) return repoNotFound();
  if (repo.owner_user_id !== c.userId) return fwErr(403, 'forbidden', 'Only the owner can write to this repo.');
  if (!canWrite(c, repoScopeOk ? repo.id : undefined)) return noScope();
  return repo;
}

export function audit(env: Env, actor: string, action: string, targetId: string, meta?: Record<string, unknown>): D1PreparedStatement {
  return env.ACC!.prepare('INSERT INTO audit_log (actor_user_id, action, target_type, target_id, meta) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(actor, action, 'repo', targetId, meta ? JSON.stringify(meta) : null);
}
