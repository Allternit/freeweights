// Promotion (spec/accounts-v1.md 11.6, plan U8). A clean file is copied by binding from QUARANTINE to FW at
// the same key (repos/<repo id>/blobs/<sha256>), then the quarantine copy is deleted. The repo's head moves
// only when every scan of a commit is clean (scan-state.ts promotableChain); then the commit's tree JSON is
// written to FW at its tree_key and head_commit moves. Until then nothing of that commit is reachable:
// community reads and resolve only follow the head and the commits before it.
//
// Interface with the commit route (plan step 7): the commit writes its tree JSON to QUARANTINE at
// commits.tree_key (repos/<repo id>/trees/<oid>.json), sets uploads.status = 'committed' for each new file
// (regular files too, with transfer 'basic'), and queues one scans row per new file.
import type { Env, RepoRow, RepoStatus, ScanStatus } from '../types';
import { iso, parseTree, promotableChain, repoStatusFrom, type PendingCommit, type TreeFile } from './scan-state';
import { renderRepoPage } from '../pages/repo';
import { renderCommunityIndex } from '../pages/community-index';

export const blobKey = (repoId: string, sha256: string) => `repos/${repoId}/blobs/${sha256}`;
export const treeKey = (repoId: string, oid: string) => `repos/${repoId}/trees/${oid}.json`;

/** Moves an upload's bytes from quarantine_bytes to public_bytes on the owner's row, once (the bucket flag). */
const OWNER = `((owner_user_id IS NOT NULL AND owner_user_id = (SELECT owner_user_id FROM repos WHERE id = ?1))
  OR (owner_org_id IS NOT NULL AND owner_org_id = (SELECT owner_org_id FROM repos WHERE id = ?1)))`;
const QBYTES = `(SELECT COALESCE(SUM(size), 0) FROM uploads WHERE repo_id = ?1 AND oid = ?2 AND status = 'committed' AND bucket = 'quarantine')`;

export type BlobResult = 'copied' | 'already' | 'missing';

/**
 * Copies one clean blob to FW and deletes the quarantine copy (unless another scan of the same bytes in this
 * repo still needs it). Safe to repeat. R2 checks the sha256 on the put, so a copy that does not match the
 * oid fails here as well as in the scanner. Throws when the copy fails; the scan then stays claimed and
 * the scanner sends the result again.
 */
export async function promoteBlob(env: Env, repoId: string, sha256: string, scanId: string): Promise<BlobResult> {
  const key = blobKey(repoId, sha256);
  const src = await env.QUARANTINE!.get(key);
  let res: BlobResult;
  if (!src) {
    res = (await env.FW.head(key)) ? 'already' : 'missing';
  } else {
    const { readable, writable } = new FixedLengthStream(src.size);
    await Promise.all([
      src.body.pipeTo(writable),
      env.FW.put(key, readable, { sha256, httpMetadata: { contentType: 'application/octet-stream' } }),
    ]);
    res = 'copied';
  }
  if (res === 'missing') return res;

  const now = iso(Date.now());
  await env.ACC!.batch([
    env.ACC!.prepare(`UPDATE storage_usage SET quarantine_bytes = MAX(0, quarantine_bytes - ${QBYTES}),
      public_bytes = public_bytes + ${QBYTES}, updated_at = ?3 WHERE ${OWNER}`).bind(repoId, sha256, now),
    env.ACC!.prepare(`UPDATE uploads SET bucket = 'public', updated_at = ?3
      WHERE repo_id = ?1 AND oid = ?2 AND status = 'committed' AND bucket = 'quarantine'`).bind(repoId, sha256, now),
  ]);
  if (src) {
    const other = await env.ACC!.prepare(`SELECT 1 FROM scans WHERE repo_id = ? AND sha256 = ? AND id <> ? AND status IN ('queued', 'scanning') LIMIT 1`)
      .bind(repoId, sha256, scanId).first();
    if (!other) await env.QUARANTINE!.delete(key);
  }
  return res;
}

/** A served commit tree from FW, or null. */
export async function readServedTree(env: Env, key: string): Promise<TreeFile[] | null> {
  const o = await env.FW.get(key);
  if (!o) return null;
  try { return parseTree(await o.json()); } catch { return null; }
}

/** Writes the commit's tree into FW (from its quarantine copy). False when neither copy exists or it is malformed. */
async function publishTree(env: Env, key: string): Promise<boolean> {
  const q = await env.QUARANTINE!.get(key);
  if (!q) return !!(await env.FW.head(key)); // published by an earlier settle
  const text = await q.text();
  try { if (!parseTree(JSON.parse(text))) return false; } catch { return false; }
  await env.FW.put(key, text, { httpMetadata: { contentType: 'application/json' } });
  await env.QUARANTINE!.delete(key);
  return true;
}

/** Commits after the head, at most this many per settle (a repo has few commits in flight). */
const MAX_PENDING = 20;

/**
 * Brings a repo up to date after a scan changed: moves the head over every commit that is now fully clean
 * (in order), then sets the repo state. Returns the new state. Safe to call any time (admin release uses it).
 */
export async function settleRepo(env: Env, repoId: string): Promise<RepoStatus> {
  const db = env.ACC!;
  const repo = await db.prepare(`SELECT status, head_commit FROM repos WHERE id = ?`).bind(repoId).first<{ status: RepoStatus; head_commit: string | null }>();
  if (!repo) return 'removed';
  if (repo.status === 'removed') return 'removed';

  const after = repo.head_commit
    ? ((await db.prepare(`SELECT rowid AS rid FROM commits WHERE oid = ?`).bind(repo.head_commit).first<{ rid: number }>())?.rid ?? 0)
    : 0;
  const commits = (await db.prepare(`SELECT oid, parent_oid, tree_key, bytes FROM commits
      WHERE repo_id = ? AND ref = 'refs/heads/main' AND rowid > ? ORDER BY rowid LIMIT ${MAX_PENDING}`).bind(repoId, after)
    .all<{ oid: string; parent_oid: string | null; tree_key: string; bytes: number }>()).results;
  const scanRows = commits.length
    ? (await db.prepare(`SELECT commit_oid, status, sha256 FROM scans WHERE repo_id = ? AND commit_oid IN (SELECT oid FROM commits WHERE repo_id = ? AND rowid > ?)`)
      .bind(repoId, repoId, after).all<{ commit_oid: string; status: ScanStatus; sha256: string }>()).results
    : [];
  const by = new Map<string, ScanStatus[]>();
  const heldBy = new Map<string, string[]>();
  for (const s of scanRows) {
    by.set(s.commit_oid, [...(by.get(s.commit_oid) ?? []), s.status]);
    if (s.status === 'held') heldBy.set(s.commit_oid, [...(heldBy.get(s.commit_oid) ?? []), s.sha256]);
  }
  const pending: PendingCommit[] = commits.map((c) => ({ oid: c.oid, parent_oid: c.parent_oid, statuses: by.get(c.oid) ?? [], heldShas: heldBy.get(c.oid) }));
  // A commit after a held one is served only if its tree carries no held file: read those trees (rare: only
  // while a fix for a held file is in flight). The pending tree is in QUARANTINE (FW once published).
  const firstHeld = pending.findIndex((p) => p.statuses.includes('held'));
  if (firstHeld >= 0) {
    for (const p of pending.slice(firstHeld + 1)) {
      if (p.statuses.includes('held')) continue;
      const key = commits.find((x) => x.oid === p.oid)!.tree_key;
      const o = (await env.QUARANTINE!.get(key)) ?? (await env.FW.get(key));
      let files: TreeFile[] | null = null;
      try { files = o ? parseTree(await o.json()) : null; } catch { files = null; }
      p.treeShas = files ? files.map((f) => f.sha256) : null;
    }
  }

  let head = repo.head_commit;
  for (const oid of promotableChain(pending, head)) {
    const c = commits.find((x) => x.oid === oid)!;
    if (!(await publishTree(env, c.tree_key))) break; // tree missing or bad: leave the head, stay scanning
    const moved = await db.prepare(`UPDATE repos SET head_commit = ?, bytes = ?, updated_at = ? WHERE id = ? AND head_commit IS ? AND status <> 'removed'`)
      .bind(oid, c.bytes, iso(Date.now()), repoId, head).run();
    if (!moved.meta.changes) break; // someone else moved it; the next settle picks up from there
    head = oid;
  }

  const waiting = pending.slice(pending.findIndex((p) => p.oid === head) + 1).map((p) => p.statuses);
  const status = repoStatusFrom(repo.status, waiting, !!head);
  if (status !== repo.status) {
    await db.prepare(`UPDATE repos SET status = ?, updated_at = ? WHERE id = ? AND status <> 'removed'`).bind(status, iso(Date.now()), repoId).run();
  }
  // Render when the served head moved (even if a later commit still waits) or the repo just came back live.
  if (head && (head !== repo.head_commit || (status === 'live' && repo.status !== 'live'))) await publishPage(env, repoId);
  return status;
}

/** README.md text read for the page, at most this many bytes (pages/repo.ts caps it the same). */
const README_MAX = 200 * 1024;

/**
 * Renders the community repo page (PR #12 pages/repo.ts writes it to FW itself) and the community index,
 * from the head tree, every file clean. A page failure never undoes the promotion: the API and resolve already
 * serve the repo, and the next promotion renders the page again.
 */
export async function publishPage(env: Env, repoId: string): Promise<void> {
  try {
    const repo = await env.ACC!.prepare(`SELECT * FROM repos WHERE id = ?`).bind(repoId).first<RepoRow>();
    // Any repo with a served head gets a page (a newer commit scanning or held leaves the head served).
    if (!repo || repo.status === 'removed' || repo.private || !repo.head_commit) return;
    const c = await env.ACC!.prepare(`SELECT tree_key FROM commits WHERE oid = ?`).bind(repo.head_commit).first<{ tree_key: string }>();
    const files = c ? await readServedTree(env, c.tree_key) : null;
    if (!files) return;
    const rd = files.find((f) => f.path === 'README.md');
    let readme: string | null = null;
    if (rd && rd.size <= README_MAX) readme = (await (await env.FW.get(blobKey(repo.id, rd.sha256)))?.text()) ?? null;
    await renderRepoPage(env, repo, { commit: repo.head_commit, files: files.map((f) => ({ path: f.path, size: f.size, sha256: f.sha256, state: 'clean' as const })), readme, owner: repo.namespace });
    await renderCommunityIndex(env);
  } catch { /* logged by the caller's tail only; see doc comment */ }
}
