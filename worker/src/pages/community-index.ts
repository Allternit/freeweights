import type { Env } from '../types';
import { esc } from '../../../site/lib/md-core.mjs';
import { communityShell, repoPagePath } from './repo';

/** R2 key (bucket FW) of the community index, served at /alt.freeweights.community/. */
export const COMMUNITY_INDEX_KEY = 'alt.freeweights.community/index.html';
const LIMIT = 200;

export interface CommunityListing { namespace: string; name: string; kind: string; license_id: string | null; bytes: number; updated_at: string }

const size = (n: number) => { const u = ['B', 'KB', 'MB', 'GB']; let i = 0; let v = Number(n) || 0; while (v >= 1000 && i < 3) { v /= 1000; i++; } return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)) + ' ' + u[i]; };

/** The community index HTML for a list of live public repos (pure). */
export function communityIndexHtml(repos: CommunityListing[], truncated = false): string {
  const rows = repos.map((r) => {
    const href = `/${repoPagePath(r)}/`;
    return `<tr><td class="path"><a class="link" href="${esc(href)}">${esc(r.namespace)}/${esc(r.name)}</a></td><td>${r.kind === 'dataset' ? 'Dataset' : 'Model'}</td><td>${esc(r.license_id || 'not stated')}</td><td class="r mono">${size(r.bytes)}</td><td class="mono">${esc(String(r.updated_at).slice(0, 10))}</td></tr>`;
  }).join('');
  const body = `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.community</div>
  <h1 class="ph1">Community uploads</h1>
  <p class="lead">Models and datasets shared by Allternit account holders. Each file was scanned before it went live. The scan is not a review of the contents or the licence.</p>
  <p><a class="btn" href="/new/">Upload your own</a></p>
</div>
<div class="wrap" style="padding-bottom:40px">
  ${repos.length ? `<div class="box"><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Repo</th><th>Kind</th><th>License</th><th class="r">Size</th><th>Updated</th></tr></thead><tbody>${rows}</tbody></table></div></div>${truncated ? `<p class="small sub">Showing the newest ${LIMIT}.</p>` : ''}`
    : '<div class="empty"><b>Nothing here yet.</b> Community repos appear after their files pass the scan.</div>'}
</div>`;
  return communityShell({ path: '/alt.freeweights.community/', title: 'Community uploads', desc: 'Models and datasets uploaded by Allternit account holders, scanned before download.', body });
}

/**
 * Rebuild the community index from D1 (accounts DB) into R2. Lists public community model and dataset repos that
 * have a served commit (head_commit set, not removed), newest first, up to 200. A repo whose newer commit is
 * scanning or held still serves its last clean head (spec/accounts-v1.md 11.6), so it stays listed. The scan promote step calls it after renderRepoPage / removeRepoPage.
 *   renderCommunityIndex(env) -> Promise<{ key: string; repos: number }>
 */
export async function renderCommunityIndex(env: Env): Promise<{ key: string; repos: number }> {
  if (!env.ACC) throw new Error('renderCommunityIndex: accounts database is not configured');
  const rs = await env.ACC.prepare(
    `SELECT namespace, name, kind, license_id, bytes, updated_at FROM repos
      WHERE source = 'community' AND status <> 'removed' AND head_commit IS NOT NULL AND private = 0 AND kind IN ('model', 'dataset')
      ORDER BY updated_at DESC LIMIT ?1`).bind(LIMIT + 1).all<CommunityListing>();
  const all = rs.results || [];
  const html = communityIndexHtml(all.slice(0, LIMIT), all.length > LIMIT);
  await env.FW.put(COMMUNITY_INDEX_KEY, html, { httpMetadata: { contentType: 'text/html; charset=utf-8', cacheControl: 'public, max-age=300, no-transform' } });
  return { key: COMMUNITY_INDEX_KEY, repos: Math.min(all.length, LIMIT) };
}
