import type { Env, CatalogRow } from '../types';
import { allTotals, takenDownIds, totalsFor } from '../db';
import { CATALOG, summary } from '../catalog';
import { CLOUD, FACETS } from '../data.generated';
import { json } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';

const TIER_RANK: Record<string, number> = { T0: 0, T1: 1, T2: 2 };
const REL_RANK: Record<string, number> = { base: 0, finetune: 1, merge: 1, quant: 2, adapter: 2 };
const normKey = (s: unknown) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
// Mirrors rkOf() in site/build.mjs. An untiered base model whose publisher matches its family
// (deepseek-ai in deepseek) reads as an official repo.
function rankOf(r: CatalogRow): number {
  const rel = (r.relation as { type?: string } | undefined)?.type || 'base';
  let t = TIER_RANK[String(r.tier || '')];
  if (t === undefined) {
    // the site's family is the section's last part (alt.freeweights.deepseek -> deepseek)
    const o = normKey(r.id.split('/')[0]), f = normKey(r.section.replace(/^alt\.freeweights\./, ''));
    t = rel === 'base' && f && o && (o.includes(f) || f.includes(o)) ? 0.5 : rel === 'base' ? 2.5 : 3;
  }
  return Math.round(t * 10) + (REL_RANK[rel] ?? 1);
}

const lc = (a: string[]) => a.map((x) => x.toLowerCase());
// Comma-separated values of one query parameter; a row matches when it has every listed value (apps, language) or any (library).
const listOf = (v: string | null) => (v ? v.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : []);
// Parameter count: the catalog's own, else the one read from the model name (facets overlay).
const paramsOf = (r: CatalogRow): number => Number(r.params) || FACETS[r.id]?.[4] || 0;

async function search(env: Env, url: URL): Promise<Response> {
  const q = url.searchParams;
  const needle = (q.get('search') || '').toLowerCase();
  const maxSize = q.get('max_size') ? Number(q.get('max_size')) : null;
  const libs = listOf(q.get('library')), langs = listOf(q.get('language')), apps = listOf(q.get('apps'));
  const pMin = q.get('params_min') ? Number(q.get('params_min')) : null, pMax = q.get('params_max') ? Number(q.get('params_max')) : null;
  const limit = Math.min(1000, Math.max(1, Number(q.get('limit')) || 50));
  const offset = Math.max(0, Number(q.get('cursor')) || 0);
  // With a search term the default order is rank (same rule as the site): official lab repos and
  // base models first, then fine-tunes, then quants and adapters. Order is never for sale.
  const sort = q.get('sort') || (needle ? 'rank' : 'added');
  const removed = await takenDownIds(env); // taken down since this bundle was built
  let rows = (sort === 'downloads' ? CATALOG.models : ordered(sort)).filter((r) => !removed.has(r.id) &&
    (!needle || r.id.toLowerCase().includes(needle) || r.display_name.toLowerCase().includes(needle)) &&
    (!q.get('section') || r.section === q.get('section')) &&
    (!q.get('author') || r.id.split('/')[0].toLowerCase() === q.get('author')!.toLowerCase()) &&
    (!q.get('pipeline_tag') || r.tasks.includes(q.get('pipeline_tag')!)) &&
    // license ids are SPDX case in the catalog (Apache-2.0); a filter matches either case (apache-2.0)
    (!q.get('license') || r.license_id.toLowerCase() === q.get('license')!.toLowerCase()) &&
    (!libs.length || libs.some((l) => r.formats.includes(l) || lc(FACETS[r.id]?.[0] || []).includes(l))) &&
    (!langs.length || langs.every((l) => lc(FACETS[r.id]?.[1] || []).includes(l))) &&
    (!apps.length || apps.every((a) => lc(FACETS[r.id]?.[2] || []).includes(a))) &&
    // a row with no parameter count never matches a parameter bound
    ((pMin === null && pMax === null) || (paramsOf(r) > 0 && (pMin === null || paramsOf(r) >= pMin) && (pMax === null || paramsOf(r) < pMax))) &&
    // cloud=1: only models Allternit Cloud serves (the same map as the allternit field)
    (!['1', 'true', 'yes'].includes((q.get('cloud') || '').toLowerCase()) || !!CLOUD[r.id]) &&
    (!q.get('source') || r.badges.includes(q.get('source')!)) &&
    // total_size 0 = unknown (gated link-only rows have no file listing), so a size filter never matches them.
    (maxSize === null || (r.total_size > 0 && r.total_size <= maxSize)));
  // Sorting by downloads needs every total; any other sort reads totals for the page only.
  let totals = sort === 'downloads' ? await allTotals(env, 'model') : new Map<string, number>();
  const dl = (r: CatalogRow) => totals.get(r.id) ?? 0;
  if (sort === 'downloads') rows = rows.sort((a, b) => dl(b) - dl(a) || a.id.localeCompare(b.id));
  const page = rows.slice(offset, offset + limit);
  if (sort !== 'downloads') totals = await totalsFor(env, 'model', page.map((r) => r.id));
  const headers: Record<string, string> = {};
  if (offset + limit < rows.length) {
    const next = new URL(url); next.searchParams.set('cursor', String(offset + limit));
    headers.Link = `<${next.pathname}${next.search}>; rel="next"`;
  }
  return json(page.map((r) => summary(r, dl(r))), 200, headers);
}

// Every order except downloads depends only on the bundled catalog, so each is sorted once per isolate
// and a request filters the sorted list. Re-sorting ~9k rows with localeCompare on every call cost
// ~20 ms CPU (p90 25 ms after batch 3, over the free plan's 10 ms). Each comparator ends on the id,
// so filtering a sorted list gives the same rows in the same order as sorting the filtered list.
type Cmp = (a: CatalogRow, b: CatalogRow) => number;
const dl30 = (r: CatalogRow) => Number((r.signals as { downloads_30d?: number } | undefined)?.downloads_30d) || 0;
const STATIC_CMP: Record<string, Cmp> = {
  added: (a, b) => b.added_at.localeCompare(a.added_at) || a.id.localeCompare(b.id),
  size: (a, b) => a.total_size - b.total_size || a.id.localeCompare(b.id),
  name: (a, b) => a.id.localeCompare(b.id),
  // "Best first", the site's byRank: rank, then 30-day downloads at the source, then newest, then name
  rank: (a, b) => rankOf(a) - rankOf(b) || dl30(b) - dl30(a) || b.added_at.localeCompare(a.added_at) || a.id.localeCompare(b.id),
};
const SORTED = new Map<string, CatalogRow[]>();
function ordered(sort: string): CatalogRow[] {
  const key = Object.hasOwn(STATIC_CMP, sort) ? sort : 'added'; // unknown sort values fall back to newest first
  let rows = SORTED.get(key);
  if (!rows) { rows = [...CATALOG.models].sort(STATIC_CMP[key]); SORTED.set(key, rows); }
  return rows;
}

export const modelsRoute: Handler = ({ env, url }) => d1(() => search(env, url));
