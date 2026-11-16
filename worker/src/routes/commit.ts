import type { Caller, Env, FileClass, ManifestFile, RepoKind, RepoRow } from '../types';
import type { Handler } from '../router';
import { authJson, seg } from '../http';
import { d1 } from '../pause';
import { readUsage, refuseSet, releaseStatements, reserve, type Refusal } from '../storage/quota';
import { sha256Hex } from '../storage/presign';
import { publishPage, settleRepo } from '../storage/promote';
import { blobKey, caller, fwErr, gate, isoIn, kindOf, newId, repoUrl, treeKey, writableRepo, type Gate } from './repo-access';

// Preupload and commit (plan step 7, spec/accounts-v1.md 11.2-11.3, spec/parts/write-api.yaml "upload").
// Same routes and shapes as the Hugging Face Hub, so `huggingface_hub` upload_file / upload_folder /
// create_commit work with HF_HUB_DISABLE_XET=1 and an alt_ key. Preupload is where the limits answer first,
// before any byte moves. A commit writes the tree, sets the repo to `scanning` and queues one scan per new
// file; nothing of it is served until the scanner clears it (plan step 9).

/** Regular (inline, non-LFS) files: text only, each at most 512 KiB, and at most 512 KiB per commit, so a
 *  commit body stays well inside the Worker's CPU time. Everything else goes through LFS. */
export const REGULAR_FILE_MAX = 512 * 1024;
export const REGULAR_COMMIT_MAX = 512 * 1024;
const COMMIT_BODY_MAX = 2 * 1024 * 1024;
const PATH_MAX = 1000;

// ---- File types (U12: executables and archives are refused at preupload) --------------------------------
// Binary files must have a known model, data or media extension. Text files (by their first 512 bytes) are
// accepted with any extension except scripts that run as programs. Archives and executables are refused by
// extension and by magic bytes, except the zip-based weight formats (torch .pt/.bin, numpy .npz, .keras).

const BINARY_OK = new Set(('safetensors gguf ggml bin pt pth ckpt pkl pickle joblib npy npz onnx ort h5 hdf5 keras msgpack tflite pb '
  + 'mlmodel model spm ot parquet arrow feather avro orc lance png jpg jpeg gif webp bmp tif tiff wav mp3 flac ogg opus m4a mp4 webm pdf').split(' '));
const DENY = new Set(('exe dll so dylib msi apk app jar class com scr sys bat cmd ps1 vbs sh bash zsh command '
  + 'zip tar gz tgz bz2 xz 7z rar zst lz4 lzma cab iso dmg deb rpm whl egg mar nemo').split(' '));
const ZIP_WEIGHTS = new Set(['pt', 'pth', 'bin', 'ckpt', 'npz', 'keras']);
const WEIGHTS = new Set(['safetensors', 'gguf', 'ggml', 'onnx', 'tflite', 'h5', 'hdf5', 'msgpack', 'mlmodel', 'ot']);
const PICKLE = new Set(['bin', 'pt', 'pth', 'ckpt', 'pkl', 'pickle', 'joblib', 'npy', 'npz']);

const extOf = (path: string) => { const b = path.slice(path.lastIndexOf('/') + 1); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i + 1).toLowerCase() : ''; };
const startsWith = (b: Uint8Array, sig: number[], at = 0) => sig.every((x, i) => b[at + i] === x);

/** What kind of executable or archive the bytes start with, or null. */
export function magicKind(b: Uint8Array): 'zip' | 'executable' | 'archive' | null {
  if (startsWith(b, [0x50, 0x4b, 0x03, 0x04]) || startsWith(b, [0x50, 0x4b, 0x05, 0x06])) return 'zip';
  if (startsWith(b, [0x7f, 0x45, 0x4c, 0x46])) return 'executable'; // ELF
  for (const s of [[0xfe, 0xed, 0xfa, 0xce], [0xfe, 0xed, 0xfa, 0xcf], [0xce, 0xfa, 0xed, 0xfe], [0xcf, 0xfa, 0xed, 0xfe], [0xca, 0xfe, 0xba, 0xbe]]) if (startsWith(b, s)) return 'executable'; // Mach-O, fat/Java
  if (startsWith(b, [0x4d, 0x5a]) && b.length >= 0x40) { // MZ, then the PE header where e_lfanew points
    const off = b[0x3c] | (b[0x3d] << 8) | (b[0x3e] << 16) | (b[0x3f] << 24);
    if (off > 0 && off + 4 <= b.length && startsWith(b, [0x50, 0x45, 0, 0], off)) return 'executable';
  }
  if (startsWith(b, [0x1f, 0x8b]) || startsWith(b, [0x42, 0x5a, 0x68]) || startsWith(b, [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00])
    || startsWith(b, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]) || startsWith(b, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]) || startsWith(b, [0x28, 0xb5, 0x2f, 0xfd])) return 'archive';
  if (b.length >= 262 && startsWith(b, [0x75, 0x73, 0x74, 0x61, 0x72], 257)) return 'archive'; // tar "ustar"
  return null;
}
/** Text = no NUL byte and valid UTF-8 (a cut multi-byte character at the end of the sample is fine). */
export function isText(b: Uint8Array): boolean {
  if (b.includes(0)) return false;
  try { new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(b, { stream: true }); return true; } catch { return false; }
}
/** Why this file type is refused, or null. `head` is the file's first bytes (the preupload sample). */
export function typeRefusal(path: string, head: Uint8Array): string | null {
  const ext = extOf(path);
  if (DENY.has(ext)) return `.${ext} files are not accepted`;
  const magic = magicKind(head);
  if (magic === 'executable') return 'executables are not accepted';
  if (magic === 'archive' || (magic === 'zip' && !ZIP_WEIGHTS.has(ext))) return 'archives are not accepted; upload the files inside instead';
  if (!isText(head) && !BINARY_OK.has(ext)) return ext ? `binary .${ext} files are not accepted` : 'binary files with no extension are not accepted';
  return null;
}
/** The scan class (U12): weights get a header check, pickles picklescan + modelscan, the rest ClamAV. */
export function fileClass(path: string): FileClass {
  const ext = extOf(path);
  return PICKLE.has(ext) ? 'pickle' : WEIGHTS.has(ext) ? 'weights' : 'other';
}
/** Repo-relative paths: no leading "/", no "." / ".." / ".git" segment, no backslash or control character. */
export function validPath(p: unknown): p is string {
  if (typeof p !== 'string' || !p || p.length > PATH_MAX || p.startsWith('/') || p.endsWith('/') || /[\\\x00-\x1f\x7f]/.test(p)) return false;
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..' && s.toLowerCase() !== '.git');
}
function b64bytes(s: string): Uint8Array | null {
  try { return Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0)); } catch { return null; }
}

// ---- Shared ----------------------------------------------------------------------------------------------

export interface Tree { commit: string; parent: string | null; files: ManifestFile[] }
export interface Tip { oid: string; tree_key: string }

/**
 * The tip of main: the newest commit, which may be ahead of repos.head_commit. head_commit is the last commit
 * whose files are all clean (the one downloads serve); the scan routes move it (plan step 9, PR #16). New
 * commits chain onto the tip, so an upload never waits for the scanner.
 */
export async function tipOf(env: Env, repo: RepoRow): Promise<Tip | null> {
  return env.ACC!.prepare("SELECT oid, tree_key FROM commits WHERE repo_id = ?1 AND ref = 'refs/heads/main' ORDER BY rowid DESC LIMIT 1")
    .bind(repo.id).first<Tip>();
}
/** The tip's tree: QUARANTINE while its commit is not served yet, FW once promotion published it. */
export async function readTree(env: Env, tip: Tip | null): Promise<Tree> {
  if (!tip) return { commit: '', parent: null, files: [] };
  const o = (await env.QUARANTINE?.get(tip.tree_key)) ?? (await env.FW.get(tip.tree_key));
  if (!o) throw new Error('tree missing');
  return (await o.json()) as Tree;
}

const revOk = (rev: string) => rev === 'main' || rev === 'refs/heads/main';
const noRev = (rev: string) => fwErr(404, 'revision_not_found', `Only the main branch exists (asked for ${rev.slice(0, 80).replace(/[^\x20-\x7e]/g, '?')}).`, { hfCode: 'RevisionNotFound' });
const noPrs = () => fwErr(501, 'not_implemented', 'Pull requests are not open yet. Commit to main.');

async function uploadTarget(req: Request, env: Env, url: URL, ctx: ExecutionContext, m: RegExpMatchArray): Promise<{ c: Caller; repo: RepoRow; g: Gate; kind: RepoKind } | Response> {
  const kind = kindOf(m[1]) as RepoKind;
  const c = await caller(req, env, url, ctx);
  if (c instanceof Response) return c;
  const repo = await writableRepo(env, c, kind, seg(m[2]), seg(m[3]));
  if (repo instanceof Response) return repo;
  const g = await gate(env, c, true);
  if (g instanceof Response) return g;
  const rev = seg(m[4]);
  if (!revOk(rev)) return noRev(rev);
  if (url.searchParams.get('create_pr') === '1') return noPrs();
  return { c, repo, g, kind };
}
const tooMany = (max: number) => fwErr(400, 'too_many_files', `One commit may add or change at most ${max} files. Split the upload into several commits.`, { limit: 'files_per_commit' });
const REFUSAL_TEXT: Record<Refusal, string> = {
  file_too_large: 'is larger than one file may be',
  storage_full: 'would pass this account\'s storage limit',
  site_full: 'would pass the storage Freeweights has for community uploads right now',
};
const LIMIT_OF: Record<Refusal, 'file_max_bytes' | 'user_cap_bytes' | 'site_cap_bytes'> = { file_too_large: 'file_max_bytes', storage_full: 'user_cap_bytes', site_full: 'site_cap_bytes' };
const refused = (r: Refusal, paths: string[]) =>
  fwErr(413, r, `${paths.length === 1 ? paths[0] : `${paths.length} files`} ${REFUSAL_TEXT[r]}. See https://freeweights.allternit.com/api/fw/v1/limits.`, { paths, limit: LIMIT_OF[r] });

// ---- POST /api/{type}s/{ns}/{repo}/preupload/{rev} -----------------------------------------------------------

interface PreFile { path?: unknown; sample?: unknown; size?: unknown }

export const preuploadRoute: Handler = ({ req, env, ctx, url }, m) => d1(async () => {
  const t = await uploadTarget(req, env, url, ctx, m);
  if (t instanceof Response) return t;
  const { c, repo, g } = t;
  let body: { files?: PreFile[] } | null = null;
  try { body = await req.json(); } catch { /* below */ }
  const files = body?.files;
  if (!Array.isArray(files) || !files.length || files.length > 1000) return fwErr(400, 'bad_request', 'Send {"files": [{"path", "sample", "size"}, ...]} with 1 to 1000 files.');
  const lim = g.limits.values;
  if (files.length > lim.files_per_commit!) return tooMany(lim.files_per_commit!);

  const bad: string[] = [], typeBad: string[] = [], reasons: string[] = [];
  const parsed = files.map((f) => {
    const head = typeof f.sample === 'string' ? b64bytes(f.sample) : null;
    if (!validPath(f.path) || !Number.isSafeInteger(f.size) || (f.size as number) < 0 || !head || head.length > 1024) { bad.push(String(f.path ?? '?').slice(0, PATH_MAX)); return null; }
    const why = typeRefusal(f.path, head);
    if (why) { typeBad.push(f.path); reasons.push(`${f.path}: ${why}`); }
    return { path: f.path, size: f.size as number, head };
  });
  if (bad.length) return fwErr(400, 'bad_request', 'Some files have a bad path, size or sample.', { paths: bad });
  if (typeBad.length) return fwErr(400, 'file_type_not_allowed', `Not accepted: ${reasons.slice(0, 5).join('; ')}${reasons.length > 5 ? '; ...' : ''}.`, { paths: typeBad });

  const ok = parsed as { path: string; size: number; head: Uint8Array }[];
  const tip = await tipOf(env, repo);
  const tree = await readTree(env, tip);
  const have = new Map(tree.files.map((f) => [f.path, f]));
  // A path already at head with the same size is most likely unchanged: its bytes are not counted again, and
  // for LFS files its sha256 goes back as `oid`, so the client skips the upload when its own hash matches.
  const changed = ok.filter((f) => have.get(f.path)?.size !== f.size);
  const sets = refuseSet(ok.map((f) => f.size), lim, 0, 0);
  if (sets.tooLarge.length) return refused('file_too_large', sets.tooLarge.map((i) => ok[i].path));
  const use = await readUsage(env.ACC!, c.userId);
  const total = refuseSet(changed.map((f) => f.size), lim, use.userBytes, use.siteBytes).total;
  if (total) return refused(total, changed.map((f) => f.path));

  let inline = 0;
  const out = ok.map((f) => {
    const prev = have.get(f.path);
    if (prev && prev.size === f.size && prev.lfs) return { path: f.path, uploadMode: 'lfs', shouldIgnore: false, oid: prev.sha256 };
    const regular = f.size === 0 || (f.size <= REGULAR_FILE_MAX && inline + f.size <= REGULAR_COMMIT_MAX && isText(f.head));
    if (regular) inline += f.size;
    return { path: f.path, uploadMode: regular ? 'regular' : 'lfs', shouldIgnore: false };
  });
  return authJson({ files: out, ...(tip ? { commitOid: tip.oid } : {}) });
});

// ---- POST /api/{type}s/{ns}/{repo}/commit/{rev} -----------------------------------------------------------------

type Line = { key: string; value: Record<string, unknown> };
interface UpRow { id: string; oid: string; size: number; status: string; bucket: string; r2_key: string }

export const commitRoute: Handler = ({ req, env, ctx, url }, m) => d1(async () => {
  const t = await uploadTarget(req, env, url, ctx, m);
  if (t instanceof Response) return t;
  const { c, repo, g, kind } = t;
  if (!env.QUARANTINE) return fwErr(503, 'accounts_not_configured', 'Uploads are not turned on for this deployment yet.');
  const lim = g.limits.values;
  const acc = env.ACC!;

  // Rate limit first: it is the cheapest refusal and needs no body.
  const rate = await acc.prepare('SELECT COUNT(*) AS n, MIN(created_at) AS first FROM commits WHERE author_user_id = ?1 AND created_at > ?2')
    .bind(c.userId, isoIn(-3600)).first<{ n: number; first: string | null }>();
  if (Number(rate?.n ?? 0) >= lim.commits_per_hour!) {
    const wait = Math.max(1, Math.ceil(((rate?.first ? Date.parse(rate.first) : Date.now()) + 3600_000 - Date.now()) / 1000));
    return fwErr(429, 'rate_limited', 'This account made as many commits as it may in one hour. Try again later.', { limit: 'commits_per_hour', headers: { 'retry-after': String(wait) } });
  }

  if (Number(req.headers.get('content-length') || 0) > COMMIT_BODY_MAX) return fwErr(413, 'file_too_large', 'The commit body is too large. Send files over 512 KiB through LFS.', { limit: 'file_max_bytes' });
  const text = await req.text();
  if (text.length > COMMIT_BODY_MAX) return fwErr(413, 'file_too_large', 'The commit body is too large. Send files over 512 KiB through LFS.', { limit: 'file_max_bytes' });
  let lines: Line[];
  try { lines = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Line); } catch { return fwErr(400, 'bad_request', 'The body is NDJSON: one JSON object per line.'); }
  const header = lines[0];
  const summary = header?.key === 'header' ? header.value?.summary : undefined;
  if (typeof summary !== 'string' || !summary.trim() || summary.length > 500) return fwErr(400, 'bad_request', 'The first line is {"key":"header","value":{"summary":"..."}} with a 1 to 500 character summary.');
  const description = typeof header.value.description === 'string' ? header.value.description.slice(0, 10_000) : null;
  const tip = await tipOf(env, repo);
  const parent = tip?.oid ?? null;
  const asked = typeof header.value.parentCommit === 'string' ? header.value.parentCommit : null;
  if (asked && asked !== parent) return fwErr(412, 'conflict', 'parentCommit is not the head of main. Pull and commit again.');
  const ops = lines.slice(1);
  if (ops.length > lim.files_per_commit!) return tooMany(lim.files_per_commit!);

  const tree = await readTree(env, tip);
  const files = new Map(tree.files.map((f) => [f.path, f]));
  const known = new Set(tree.files.map((f) => f.sha256));
  const regular: { path: string; bytes: Uint8Array }[] = [];
  const lfs: { path: string; oid: string; size?: number }[] = [];
  const bad: string[] = [], typeBad: string[] = [];
  for (const op of ops) {
    const v = op?.value ?? {};
    const path = v.path;
    if (!validPath(path)) { bad.push(String(path ?? '?').slice(0, PATH_MAX)); continue; }
    if (op.key === 'file') {
      const bytes = v.encoding === 'base64' && typeof v.content === 'string' ? b64bytes(v.content) : null;
      if (!bytes) { bad.push(path); continue; }
      if (typeRefusal(path, bytes.subarray(0, 512))) { typeBad.push(path); continue; }
      regular.push({ path, bytes });
    } else if (op.key === 'lfsFile') {
      if (v.algo !== 'sha256' || typeof v.oid !== 'string' || !/^[0-9a-f]{64}$/.test(v.oid)) { bad.push(path); continue; }
      lfs.push({ path, oid: v.oid, size: typeof v.size === 'number' ? v.size : undefined });
    } else if (op.key === 'deletedFile') {
      files.delete(path);
    } else if (op.key === 'deletedFolder') {
      for (const p of [...files.keys()]) if (p.startsWith(path + '/')) files.delete(p);
    } else {
      bad.push(path);
    }
  }
  if (bad.length) return fwErr(400, 'bad_request', 'Some operations have a bad path or value.', { paths: bad });
  if (typeBad.length) return fwErr(400, 'file_type_not_allowed', 'Executables and archives are not accepted.', { paths: typeBad });
  const inline = regular.reduce((a, f) => a + f.bytes.length, 0);
  const bigInline = regular.filter((f) => f.bytes.length > REGULAR_FILE_MAX).map((f) => f.path);
  if (bigInline.length || inline > REGULAR_COMMIT_MAX) return fwErr(413, 'file_too_large', 'Inline files are limited to 512 KiB per commit. Send larger files through LFS (preupload says which).', { paths: bigInline.length ? bigInline : regular.map((f) => f.path) });

  // LFS files must have been uploaded to this repo (or already be in its tree).
  const wanted = [...new Set([...lfs.map((f) => f.oid)])];
  const regularSha = await Promise.all(regular.map((f) => sha256Hex(f.bytes)));
  const allSha = [...new Set([...wanted, ...regularSha])];
  const { results: ups } = allSha.length
    ? await acc.prepare("SELECT id, oid, size, status, bucket, r2_key FROM uploads WHERE repo_id = ?1 AND oid IN (SELECT value FROM json_each(?2)) AND status IN ('pending', 'uploaded', 'verified', 'committed') ORDER BY created_at")
      .bind(repo.id, JSON.stringify(allSha)).all<UpRow>()
    : { results: [] as UpRow[] };
  const byOid = new Map<string, UpRow>();
  for (const u of ups || []) if (!byOid.has(u.oid) || u.status === 'committed') byOid.set(u.oid, u);

  const missing: string[] = [], mismatch: string[] = [];
  const toHead: UpRow[] = [];
  for (const f of lfs) {
    const u = byOid.get(f.oid);
    if (!u) { if (!known.has(f.oid)) missing.push(f.path); continue; }
    if (f.size !== undefined && f.size !== u.size) mismatch.push(f.path);
    if (u.status === 'pending' || u.status === 'uploaded') toHead.push(u);
  }
  // Uploads not verified yet: check the stored size here (a client may skip verify).
  const heads = await Promise.all([...new Set(toHead)].map(async (u) => ({ u, o: await env.QUARANTINE!.head(u.r2_key) })));
  for (const { u, o } of heads) {
    if (!o) missing.push(...lfs.filter((f) => f.oid === u.oid).map((f) => f.path));
    else if (o.size !== u.size) mismatch.push(...lfs.filter((f) => f.oid === u.oid).map((f) => f.path));
  }
  if (missing.length) return fwErr(400, 'file_not_uploaded', 'Some LFS files were not uploaded to this repo. Upload them first (LFS batch, PUT, verify).', { paths: missing });
  if (mismatch.length) return fwErr(422, 'size_mismatch', 'The stored size of some LFS files differs from the size given. Upload them again.', { paths: mismatch });

  // Regular files: reserve their bytes and store them in quarantine, unless this repo already holds the blob.
  const reservations = regular.map((f, i) => ({ f, sha: regularSha[i] })).filter(({ sha }) => !byOid.has(sha) && !known.has(sha))
    .filter(({ sha }, i, a) => a.findIndex((x) => x.sha === sha) === i)
    .map(({ f, sha }) => ({ id: newId('up_'), repoId: repo.id, userId: c.userId, oid: sha, size: f.bytes.length, transfer: 'basic' as const, key: blobKey(repo.id, sha), parts: null, expiresAt: isoIn(3600), status: 'uploaded' as const, bytes: f.bytes }));
  const made = await reserve(acc, reservations);
  const no = made.find((r) => !r.ok);
  const releaseAll = async () => {
    const back = made.filter((r) => r.ok).flatMap((r) => releaseStatements(acc, r.id));
    if (back.length) await acc.batch(back);
  };
  if (no && !no.ok) {
    await releaseAll();
    return refused(no.reason, reservations.filter((r, i) => !made[i].ok).map((r) => regular[regularSha.indexOf(r.oid)].path));
  }
  await Promise.all(reservations.map((r) => env.QUARANTINE!.put(r.key, r.bytes)));
  for (const r of reservations) byOid.set(r.oid, { id: r.id, oid: r.oid, size: r.size, status: 'uploaded', bucket: 'quarantine', r2_key: r.key });

  // The new tree.
  for (const f of lfs) files.set(f.path, { path: f.path, size: byOid.get(f.oid)?.size ?? tree.files.find((x) => x.sha256 === f.oid)!.size, sha256: f.oid, lfs: true });
  regular.forEach((f, i) => files.set(f.path, { path: f.path, size: f.bytes.length, sha256: regularSha[i], lfs: false }));
  const next = [...files.values()].sort((a, b) => (a.path < b.path ? -1 : 1));
  const bytes = next.reduce((a, f) => a + f.size, 0);

  // Scans: one per new file whose bytes this commit brings into quarantine (an upload not yet part of any
  // commit, regular files included). A blob an earlier commit already brought is gated by that commit's
  // scans (the head only moves along the chain when a whole commit is clean); a blob in the old tree is
  // already scanned.
  const freshIds = new Set<string>();
  const scans: { id: string; path: string; sha256: string; file_class: FileClass }[] = [];
  const old = new Map(tree.files.map((f) => [f.path, f.sha256]));
  for (const f of next) {
    const u = byOid.get(f.sha256);
    if (!u || u.status === 'committed' || u.bucket !== 'quarantine') continue;
    freshIds.add(u.id);
    if (old.get(f.path) !== f.sha256) scans.push({ id: newId('sc_'), path: f.path, sha256: f.sha256, file_class: fileClass(f.path) });
  }
  // A commit with nothing to scan (deletes, renames, re-used blobs) on top of the served head is served at
  // once. One on top of a commit still scanning waits in the chain; promotion moves the head past it.
  const direct = !scans.length && parent === repo.head_commit;
  // Same state rule as storage/scan-state.ts repoStatusFrom: a held commit still waiting keeps the repo held.
  const status = direct ? 'live' : repo.status === 'held' ? 'held' : scans.length ? 'scanning' : repo.status;

  const ts = new Date().toISOString();
  const oid = [...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(
    `tree ${await sha256Hex(JSON.stringify(next))}\nparent ${parent ?? ''}\nauthor ${c.userId} ${ts}\nnonce ${newId('')}\n\n${summary}`)))]
    .map((x) => x.toString(16).padStart(2, '0')).join('');
  const tk = treeKey(repo.id, oid);
  const treeJson = JSON.stringify({ commit: oid, parent, files: next } satisfies Tree);
  // The pending tree lives in quarantine until the commit is served; promotion copies it to FW. A commit
  // served at once writes it to FW only (nothing would ever move or delete a quarantine copy of it).
  const treeBucket = direct ? env.FW : env.QUARANTINE;
  await treeBucket.put(tk, treeJson, { httpMetadata: { contentType: 'application/json' } });

  const IS_NEW = 'EXISTS (SELECT 1 FROM commits WHERE oid = ?2)';
  const res = await acc.batch([
    // The one guard: the tip is still the parent we built on, and the repo is not removed.
    acc.prepare(`INSERT INTO commits (oid, repo_id, parent_oid, author_user_id, title, message, tree_key, files_changed, bytes)
      SELECT ?2, ?1, ?3, ?4, ?5, ?6, ?7, ?8, ?9
      WHERE (SELECT oid FROM commits WHERE repo_id = ?1 AND ref = 'refs/heads/main' ORDER BY rowid DESC LIMIT 1) IS ?3
        AND EXISTS (SELECT 1 FROM repos WHERE id = ?1 AND status != 'removed')`)
      .bind(repo.id, oid, parent, c.userId, summary.trim(), description, tk, ops.length, bytes),
    acc.prepare(`UPDATE uploads SET status = 'committed', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id IN (SELECT value FROM json_each(?3)) AND ${IS_NEW}`).bind(repo.id, oid, JSON.stringify([...freshIds])),
    acc.prepare(`INSERT INTO scans (id, repo_id, commit_oid, path, sha256, file_class)
      SELECT json_extract(value, '$.id'), ?1, ?2, json_extract(value, '$.path'), json_extract(value, '$.sha256'), json_extract(value, '$.file_class')
      FROM json_each(?3) WHERE ${IS_NEW}`).bind(repo.id, oid, JSON.stringify(scans)),
    direct
      ? acc.prepare(`UPDATE repos SET status = ?3, head_commit = ?2, bytes = ?4, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ?1 AND status != 'removed' AND head_commit IS ?5 AND ${IS_NEW}`).bind(repo.id, oid, status, bytes, parent)
      : acc.prepare(`UPDATE repos SET status = ?3, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
          WHERE id = ?1 AND status != 'removed' AND ${IS_NEW}`).bind(repo.id, oid, status),
  ]);
  if (res[0].meta.changes !== 1) {
    await releaseAll();
    ctx.waitUntil(treeBucket.delete(tk));
    return fwErr(412, 'conflict', 'main moved while this commit was being made. Commit again.');
  }
  // A commit served at once changed the served tree: render the community page again (promotion does this
  // for scanned commits). The page failing never fails the commit.
  if (direct && res[3].meta.changes === 1) ctx.waitUntil(publishPage(env, repo.id));
  // A commit with nothing to scan that is not on the served head (for example one that deletes a held file)
  // gets no scan result to settle it: settle it now, so it is served as soon as the chain allows.
  if (!direct && !scans.length) ctx.waitUntil(settleRepo(env, repo.id).then(() => undefined));
  const base = repoUrl(url.origin, kind, repo.namespace, repo.name);
  return authJson({ success: true, commitOid: oid, commitUrl: `${base}/commit/${oid}`, pullRequestUrl: null });
});
