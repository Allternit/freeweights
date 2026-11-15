// STUB from lane "scan": the real module is PR #12 (branch uploads/site-upload), which renders the community
// repo page into R2. Same exported signatures; at merge the coordinator keeps #12's file and drops this one.
import type { Env, RepoRow } from '../types';

export interface RepoTreeFile { path: string; size: number; sha256: string; state?: 'clean' | 'scanning' | 'held' }
export interface RepoTree { commit: string; files: RepoTreeFile[]; readme?: string | null; owner?: string }
export const repoPageKey = (repo: Pick<RepoRow, 'namespace' | 'name'>) => `alt.freeweights.community/${repo.namespace}/${repo.name}/index.html`;

/** #12 writes the page to FW at `key` itself. The stub writes nothing. */
export async function renderRepoPage(_env: Env, repo: RepoRow, _tree: RepoTree): Promise<{ key: string; bytes: number }> {
  return { key: repoPageKey(repo), bytes: 0 };
}
export async function removeRepoPage(_env: Env, _repo: Pick<RepoRow, 'namespace' | 'name'>): Promise<void> {}
