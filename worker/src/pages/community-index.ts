// STUB from lane "scan": the real module is PR #12 (branch uploads/site-upload). Same exported signature; at
// merge the coordinator keeps #12's file and drops this one.
import type { Env } from '../types';

export const COMMUNITY_INDEX_KEY = 'alt.freeweights.community/index.html';
export async function renderCommunityIndex(_env: Env): Promise<{ key: string; repos: number }> {
  return { key: COMMUNITY_INDEX_KEY, repos: 0 };
}
