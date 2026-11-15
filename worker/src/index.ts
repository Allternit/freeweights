import type { Env, Manifest, CatalogRow, ManifestSource } from './types';
import { CATALOG_JSON, CATALOG_ETAG, HOSTED, LOGOS } from './data.generated';
import {
  addDownload, addOriginBytes, allTotals, bumpCounter, effective, isPaidOrigin,
  originGuardOn, sourceSummary, totalsFor,
} from './db';
import { pickSource } from './check';
import { countRule, isDailyCapError, pausedBody } from './rules';

const CATALOG: { sections: unknown[]; models: CatalogRow[] } = JSON.parse(CATALOG_JSON);
const ROWS = new Map(CATALOG.models.map((r) => [r.id, r]));
// Manifests live in R2 (B3), not in the bundle. Parsed manifests are kept per isolate (small LRU);
// HOSTED (bundled, id -> pinned commit) says which ids have one, so link-only rows never touch R2.
const MANIFEST_CACHE_MAX = 512;
const manifestCache = new Map<string, Manifest>();
const countCache = new Map<string, (path: string) => boolean>();
const counts = (m: Manifest, path: string) => {
  let rule = countCache.get(m.id);
  if (!rule) { rule = countRule(m.files); countCache.set(m.id, rule); }
  return rule(path);
};
const manifestKey = (id: string, sig = false) => `manifests/${id}.json${sig ? '.minisig' : ''}`;
async function getManifest(env: Env, id: string): Promise<Manifest | null> {
  if (!Object.hasOwn(HOSTED, id)) return null;
  let m = manifestCache.get(id);
  if (m) { manifestCache.delete(id); manifestCache.set(id, m); return m; } // LRU touch
  const obj = await env.FW.get(manifestKey(id));
  if (!obj) return null; // listed as hosted but not uploaded yet: treated like a missing manifest
  m = JSON.parse(await obj.text()) as Manifest;
  manifestCache.set(id, m);
  if (manifestCache.size > MANIFEST_CACHE_MAX) manifestCache.delete(manifestCache.keys().next().value!);
  return m;
}

// ---- Static objects from R2 (B6 fallback) -----------------------------------------------------
// Manifests, signatures and model detail pages are served from R2 on their public URLs. The edge
// cache holds each response for 5 minutes, so R2 is read about once per object per colo per 5 minutes;
// If-None-Match answers 304 from the R2 etag. Exact stored bytes, never re-serialized.
async function serveObject(req: Request, env: Env, ctx: ExecutionContext, key: string, type: string): Promise<Response | null> {
  const cache = (globalThis as unknown as { caches?: { default: Cache } }).caches?.default;
  const ckey = new Request(new URL(req.url).origin + '/' + key, { method: 'GET' });
  let res = cache ? await cache.match(ckey) : undefined;
  if (!res) {
    const obj = await env.FW.get(key);
    if (!obj) return null;
    res = new Response(obj.body, { headers: { 'content-type': type, etag: obj.httpEtag, 'cache-control': 'public, max-age=300', ...CORS } });
    if (cache) ctx.waitUntil(cache.put(ckey, res.clone()));
  }
  const etag = res.headers.get('etag');
  if (etag && req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { etag, 'cache-control': 'public, max-age=300', ...CORS } });
  return req.method === 'HEAD' ? new Response(null, { status: res.status, headers: res.headers }) : res;
}

// Browsers may read paging (Link), caching (ETag) and the pinned commit; without expose-headers CORS hides them.
const CORS = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'Link, ETag, X-Repo-Commit, X-Total-Count' };
const PREFLIGHT = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'If-None-Match, Authorization, Range, Content-Type', 'access-control-max-age': '86400' };
const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS, ...extra } });
const err = (status: number, error: string, message: string, extra: HeadersInit = {}) => json({ error, message }, status, extra);

// ---- Pause at the daily cap -------------------------------------------------------------------
// After a D1 daily-limit error this isolate answers D1-backed routes with 503 until 00:00 UTC
// without trying D1 again. Catalog, manifests, tree and the Xet token pass do not use D1 and stay up.
let pausedUntil = 0;
const pause = () => {
  const now = Date.now();
  const { body, retryAfter } = pausedBody(now);
  pausedUntil = Date.parse(body.resumes_at);
  return json(body, 503, { 'retry-after': String(retryAfter), 'cache-control': 'no-store' });
};
const notePause = (e: unknown) => { if (isDailyCapError(e)) pause(); else throw e; }; // for waitUntil work
const d1 = async (run: () => Promise<Response>): Promise<Response> => {
  if (Date.now() < pausedUntil) return pause();
  try { return await run(); } catch (e) { if (isDailyCapError(e)) return pause(); throw e; }
};

// ---- Auth -------------------------------------------------------------------------------------
// hf_ tokens are refused; alt_ is reserved. The token value is never logged, stored or echoed.
function tokenKind(req: Request, url: URL): 'hf' | 'alt' | null {
  const vals: string[] = [];
  const a = req.headers.get('authorization');
  if (a) vals.push(a.replace(/^\s*bearer\s+/i, '').trim());
  const x = req.headers.get('x-hf-token'); if (x) vals.push(x.trim());
  for (const [k, v] of url.searchParams) { if (/token/i.test(k) || /^(hf|alt)_/.test(v)) vals.push(v); }
  if (vals.some((v) => v.startsWith('hf_'))) return 'hf';
  if (vals.some((v) => v.startsWith('alt_'))) return 'alt';
  return null;
}

// ---- Model views ------------------------------------------------------------------------------
// m is undefined for link-only rows (non-commercial, territory-limited or gated at the source): no manifest, no files.
// The publisher's logo as the site serves it (Pages, same host), or null when there is none.
const SITE_ORIGIN = 'https://freeweights.allternit.com';
const publisherLogo = (id: string) => { const f = LOGOS[id.split('/')[0]]; return f ? `${SITE_ORIGIN}/assets/orgs/${encodeURIComponent(f)}` : null; };

// The pinned commit comes from the bundled HOSTED map, so search never reads a manifest.
function summary(r: CatalogRow, downloads: number) {
  return {
    id: r.id, modelId: r.id, sha: HOSTED[r.id] ?? null,
    pipeline_tag: r.tasks[0], library_name: r.formats[0],
    tags: [...r.tasks, ...r.formats, `license:${r.license_id}`, r.section],
    downloads, lastModified: r.added_at, section: r.section, license: r.license_id, badges: r.badges,
    publisher_logo: publisherLogo(r.id),
  };
}

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

async function search(env: Env, url: URL): Promise<Response> {
  const q = url.searchParams;
  const needle = (q.get('search') || '').toLowerCase();
  const maxSize = q.get('max_size') ? Number(q.get('max_size')) : null;
  const limit = Math.min(1000, Math.max(1, Number(q.get('limit')) || 50));
  const offset = Math.max(0, Number(q.get('cursor')) || 0);
  // With a search term the default order is rank (same rule as the site): official lab repos and
  // base models first, then fine-tunes, then quants and adapters. Order is never for sale.
  const sort = q.get('sort') || (needle ? 'rank' : 'added');
  let rows = CATALOG.models.filter((r) =>
    (!needle || r.id.toLowerCase().includes(needle) || r.display_name.toLowerCase().includes(needle)) &&
    (!q.get('section') || r.section === q.get('section')) &&
    (!q.get('author') || r.id.split('/')[0].toLowerCase() === q.get('author')!.toLowerCase()) &&
    (!q.get('pipeline_tag') || r.tasks.includes(q.get('pipeline_tag')!)) &&
    // license ids are SPDX case in the catalog (Apache-2.0); a filter matches either case (apache-2.0)
    (!q.get('license') || r.license_id.toLowerCase() === q.get('license')!.toLowerCase()) &&
    (!q.get('library') || r.formats.includes(q.get('library')!)) &&
    (!q.get('source') || r.badges.includes(q.get('source')!)) &&
    // total_size 0 = unknown (gated link-only rows have no file listing), so a size filter never matches them.
    (maxSize === null || (r.total_size > 0 && r.total_size <= maxSize)));
  // Sorting by downloads needs every total; any other sort reads totals for the page only.
  let totals = sort === 'downloads' ? await allTotals(env, 'model') : new Map<string, number>();
  const dl = (r: CatalogRow) => totals.get(r.id) ?? 0;
  const dl30 = (r: CatalogRow) => Number((r.signals as { downloads_30d?: number } | undefined)?.downloads_30d) || 0;
  const cmp: Record<string, (a: CatalogRow, b: CatalogRow) => number> = {
    added: (a, b) => b.added_at.localeCompare(a.added_at) || a.id.localeCompare(b.id),
    downloads: (a, b) => dl(b) - dl(a) || a.id.localeCompare(b.id),
    size: (a, b) => a.total_size - b.total_size || a.id.localeCompare(b.id),
    name: (a, b) => a.id.localeCompare(b.id),
    // "Best first", the site's byRank: rank, then 30-day downloads at the source, then newest, then name
    rank: (a, b) => rankOf(a) - rankOf(b) || dl30(b) - dl30(a) || b.added_at.localeCompare(a.added_at) || a.id.localeCompare(b.id),
  };
  rows = rows.sort(cmp[sort] || cmp.added);
  const page = rows.slice(offset, offset + limit);
  if (sort !== 'downloads') totals = await totalsFor(env, 'model', page.map((r) => r.id));
  const headers: Record<string, string> = {};
  if (offset + limit < rows.length) {
    const next = new URL(url); next.searchParams.set('cursor', String(offset + limit));
    headers.Link = `<${next.pathname}${next.search}>; rel="next"`;
  }
  return json(page.map((r) => summary(r, dl(r))), 200, headers);
}

async function detail(env: Env, id: string): Promise<Response> {
  const r = ROWS.get(id);
  if (!r) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  const m = await getManifest(env, id);
  const totals = await totalsFor(env, 'model', [id]);
  if (!m) { // link-only row: listed with its license and source link, no files served here
    return json({ ...summary(r, totals.get(id) ?? 0), sha: null, siblings: [], sources: [], upstream_url: r.upstream_url, catalog: r });
  }
  const guard = await originGuardOn(env);
  const sources = [] as unknown[];
  for (const s of [...m.sources].sort((a, b) => a.priority - b.priority)) {
    const rows = await sourceSummary(env, `${m.id}|${s.type}|${s.priority}|`);
    const eff = rows.map((x) => effective(x, env));
    const paidSkipped = guard && s.type === 'hosted' && isPaidOrigin(env, s.url);
    const state = paidSkipped ? 'skipped'
      : eff.includes('failed') ? 'failed' : eff.length && eff.every((e) => e === 'live') ? 'live'
      : eff.includes('skipped') ? 'skipped' : 'stale';
    const last = rows.length ? new Date(Math.max(...rows.map((x) => x.checked_at))).toISOString() : s.last_checked;
    sources.push({
      type: s.type, state, priority: s.priority, last_checked: last,
      ...(paidSkipped ? { reason: 'origin_budget_used' } : rows.find((x) => x.reason) ? { reason: rows.find((x) => x.reason)!.reason } : {}),
    });
  }
  if (guard) { // seeded first while the guard is on
    (sources as { type: string }[]).sort((a, b) => Number(b.type === 'seeded') - Number(a.type === 'seeded'));
  }
  return json({
    ...summary(r, totals.get(id) ?? 0),
    siblings: m.files.map((f) => ({ rfilename: f.path })),
    sources, manifest_url: r.manifest_url, upstream_url: r.upstream_url, catalog: r,
  });
}

const revOk = (m: Manifest, rev: string) => rev === 'main' || rev === m.upstream.commit;

async function tree(env: Env, id: string, rev: string): Promise<Response> {
  const m = await getManifest(env, id);
  if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  if (!revOk(m, rev)) return err(404, 'revision_not_found', `Revision ${rev} is not pinned for ${id}. Use main or ${m.upstream.commit}.`);
  return json(m.files.map((f) => ({
    type: 'file', path: f.path, size: f.size, oid: f.sha256,
    // huggingface_hub reads lfs.pointerSize unconditionally (client matrix bug B1). It is the byte
    // length of the git-lfs pointer file: "version …/spec/v1\noid sha256:<64 hex>\nsize <n>\n".
    ...(f.lfs ? { lfs: { oid: f.sha256, size: f.size, pointerSize: 125 + String(f.size).length } } : {}),
  })));
}

// ---- Resolve ----------------------------------------------------------------------------------
async function resolve(env: Env, ctx: ExecutionContext, req: Request, id: string, rev: string, path: string): Promise<Response> {
  const m = await getManifest(env, id);
  if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  if (m.takedown) return err(451, 'removed_after_takedown', `${id} was removed after a takedown.`);
  if (!revOk(m, rev)) return err(404, 'revision_not_found', `Revision ${rev} is not pinned for ${id}. Use main or ${m.upstream.commit}.`);
  const f = m.files.find((x) => x.path === path);
  if (!f) return err(404, 'file_not_found', `No file ${path} in ${id} at ${m.upstream.commit}.`);

  const guard = await originGuardOn(env);
  const res = await pickSource(env, m, f, guard);
  if (res.outcome === 'timeout') return err(503, 'no_live_source_in_time', 'No source answered within the time limit. Try again shortly.', { 'retry-after': '30' });
  if (res.outcome === 'wanted') return err(404, 'model_wanted', `${id} has no live source and is listed as Wanted.`);

  const headers = new Headers({
    location: res.url!, 'x-repo-commit': m.upstream.commit, etag: `"${f.sha256}"`,
    'x-freeweights-source': res.source!.type, 'cache-control': 'private, no-store', ...CORS,
  });
  if (f.lfs) { headers.set('x-linked-size', String(f.size)); headers.set('x-linked-etag', `"${f.sha256}"`); }
  if (guard) headers.set('x-freeweights-origin-guard', 'on');
  if (req.method === 'HEAD') {
    // Metadata checks are answered here with 200, not a redirect. huggingface_hub 2.x follows a HEAD
    // redirect to the upstream host, picks up its Xet headers and then fails ("Xet headers have not
    // been correctly set by the server"). All metadata it needs is in these headers; the bytes still
    // come from the source on GET (client matrix retest, 2026-11-14).
    headers.delete('location');
    headers.set('content-length', String(f.size));
    return new Response(null, { status: 200, headers });
  } else {
    ctx.waitUntil((async () => {
      if (counts(m, f.path)) await addDownload(env, 'model', id); // once per entry download (rules.ts)
      if (isPaidOrigin(env, res.url)) await addOriginBytes(env, f.size);
    })().catch(notePause));
  }
  return new Response(null, { status: 302, headers });
}

// ---- Router -----------------------------------------------------------------------------------
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    // CORS preflight for the routes the Worker owns, so a browser client may send If-None-Match,
    // Authorization, Range or Content-Type. The token rules apply to the real request, not here.
    if (req.method === 'OPTIONS' && (/^\/(api|manifests)\//.test(url.pathname) || /^\/[^/]+\/[^/]+\/resolve\/[^/]+\/.+$/.test(url.pathname))) {
      return new Response(null, { status: 204, headers: PREFLIGHT });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return err(405, 'method_not_allowed', 'Read-only API.', { allow: 'GET, HEAD' });

    const kind = tokenKind(req, url);
    if (kind === 'hf') {
      ctx.waitUntil(bumpCounter(env, 'hf_token_rejected').catch(notePause)); // fact only, never the value
      return err(401, 'hf_token_rejected', 'Freeweights does not accept Hugging Face tokens. Downloads need no token.');
    }
    if (kind === 'alt') return err(401, 'alt_tokens_not_yet', 'alt_ tokens are reserved and not yet accepted. Public reads need no token.');

    const p = url.pathname;
    let mt: RegExpMatchArray | null;
    const seg = (s: string) => decodeURIComponent(s);
    try {
      if (p === '/api/models') return await d1(() => search(env, url));
      if (p === '/api/catalog') {
        if (req.headers.get('if-none-match') === CATALOG_ETAG) return new Response(null, { status: 304, headers: { etag: CATALOG_ETAG, ...CORS } });
        return new Response(CATALOG_JSON, { headers: { 'content-type': 'application/json', etag: CATALOG_ETAG, 'cache-control': 'public, max-age=300', ...CORS } });
      }
      // "From source" files that live in Hugging Face's Xet storage: after following our redirect the
      // client asks THIS endpoint for a Xet read token. Pass the anonymous public token request through
      // to the upstream host for catalog models only, pinned to the manifest commit (client matrix retest).
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)\/xet-read-token\/([^/]+)$/))) {
        const id = `${seg(mt[1])}/${seg(mt[2])}`;
        const m = await getManifest(env, id);
        if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
        if (!revOk(m, seg(mt[3]))) return err(404, 'revision_not_found', `Revision ${seg(mt[3])} is not pinned for ${id}.`);
        if (m.upstream.host !== 'huggingface.co') return err(404, 'xet_not_available', 'This source does not use Xet storage.');
        const up = await fetch(`https://huggingface.co/api/models/${m.upstream.repo}/xet-read-token/${m.upstream.commit}`, { headers: { accept: 'application/json' } });
        return new Response(up.body, { status: up.status, headers: { 'content-type': up.headers.get('content-type') ?? 'application/json', 'cache-control': 'no-store', ...CORS } });
      }
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)\/tree\/([^/]+)$/))) return await tree(env, `${seg(mt[1])}/${seg(mt[2])}`, seg(mt[3]));
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)(?:\/revision\/[^/]+)?$/))) {
        const did = `${seg(mt[1])}/${seg(mt[2])}`;
        return await d1(() => detail(env, did));
      }
      if ((mt = p.match(/^\/manifests\/([^/]+)\/([^/]+?)\.json(\.minisig)?$/))) {
        const mid = `${seg(mt[1])}/${seg(mt[2])}`;
        const res = Object.hasOwn(HOSTED, mid) ? await serveObject(req, env, ctx, manifestKey(mid, !!mt[3]), mt[3] ? 'text/plain; charset=utf-8' : 'application/json') : null;
        return res ?? err(404, 'manifest_not_found', 'No such manifest.');
      }
      // Model and tool detail pages (B5) live in R2 at <section>/<org>/<repo>/index.html, on the same
      // URLs as before. Section list pages (/<section>/page/<n>/) and anything not in R2 go to Pages.
      if ((mt = p.match(/^\/(alt\.freeweights\.[a-z0-9.-]+)\/([^/]+)\/([^/]+)(\/(?:index\.html)?)?$/)) && mt[2] !== 'page') {
        if (!mt[4]) return new Response(null, { status: 301, headers: { location: p + '/' + url.search } });
        const res = await serveObject(req, env, ctx, `${mt[1]}/${seg(mt[2])}/${seg(mt[3])}/index.html`, 'text/html; charset=utf-8');
        if (res) return res;
      }
      if ((mt = p.match(/^\/([^/]+)\/([^/]+)\/resolve\/([^/]+)\/(.+)$/)) && mt[1] !== 'api' && mt[1] !== 'manifests') {
        const [o, r, rev, path] = [seg(mt[1]), seg(mt[2]), seg(mt[3]), seg(mt[4])];
        return await d1(() => resolve(env, ctx, req, `${o}/${r}`, rev, path));
      }
    } catch (e) {
      if (e instanceof URIError) return err(400, 'bad_request', 'Malformed URL encoding.');
      return err(500, 'internal_error', 'Internal error.'); // no request data in the message
    }
    // Production runs on the route freeweights.allternit.com/* because Cloudflare routes cannot
    // match /*/resolve/* mid-path. Everything the Worker does not own goes to the Pages origin.
    if (env.PASSTHROUGH === '1') return env.PAGES_ORIGIN ? fetch(new Request(env.PAGES_ORIGIN + p + url.search, req)) : fetch(req);
    return err(404, 'not_found', 'No such route.');
  },
} satisfies ExportedHandler<Env>;
