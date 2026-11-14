import type { Env, Manifest, CatalogRow, ManifestSource } from './types';
import { CATALOG_JSON, CATALOG_ETAG, MANIFESTS } from './data.generated';
import {
  addDownload, addOriginBytes, bumpCounter, downloadTotals, effective, getStates, isPaidOrigin,
  originGuardOn, sourceSummary,
} from './db';
import { pickSource, stateKey } from './check';

const CATALOG: { sections: unknown[]; models: CatalogRow[] } = JSON.parse(CATALOG_JSON);
const ROWS = new Map(CATALOG.models.map((r) => [r.id, r]));
const manifestCache = new Map<string, Manifest>();
const getManifest = (id: string): Manifest | null => {
  const raw = MANIFESTS[id];
  if (!raw) return null;
  let m = manifestCache.get(id);
  if (!m) { m = JSON.parse(raw.json) as Manifest; manifestCache.set(id, m); }
  return m;
};

const CORS = { 'access-control-allow-origin': '*' };
const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS, ...extra } });
const err = (status: number, error: string, message: string, extra: HeadersInit = {}) => json({ error, message }, status, extra);

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
function summary(r: CatalogRow, m: Manifest | undefined, downloads: number) {
  return {
    id: r.id, modelId: r.id, sha: m?.upstream.commit ?? null,
    pipeline_tag: r.tasks[0], library_name: r.formats[0],
    tags: [...r.tasks, ...r.formats, `license:${r.license_id}`, r.section],
    downloads, lastModified: r.added_at, section: r.section, license: r.license_id, badges: r.badges,
  };
}

async function search(env: Env, url: URL): Promise<Response> {
  const q = url.searchParams;
  const needle = (q.get('search') || '').toLowerCase();
  const maxSize = q.get('max_size') ? Number(q.get('max_size')) : null;
  const limit = Math.min(1000, Math.max(1, Number(q.get('limit')) || 50));
  const offset = Math.max(0, Number(q.get('cursor')) || 0);
  const sort = q.get('sort') || 'added';
  const totals = await downloadTotals(env);
  let rows = CATALOG.models.filter((r) =>
    (!needle || r.id.toLowerCase().includes(needle) || r.display_name.toLowerCase().includes(needle)) &&
    (!q.get('section') || r.section === q.get('section')) &&
    (!q.get('author') || r.id.split('/')[0].toLowerCase() === q.get('author')!.toLowerCase()) &&
    (!q.get('pipeline_tag') || r.tasks.includes(q.get('pipeline_tag')!)) &&
    (!q.get('license') || r.license_id === q.get('license')) &&
    (!q.get('library') || r.formats.includes(q.get('library')!)) &&
    (!q.get('source') || r.badges.includes(q.get('source')!)) &&
    // total_size 0 = unknown (gated link-only rows have no file listing), so a size filter never matches them.
    (maxSize === null || (r.total_size > 0 && r.total_size <= maxSize)));
  const dl = (r: CatalogRow) => totals.get(r.id) ?? 0;
  const cmp: Record<string, (a: CatalogRow, b: CatalogRow) => number> = {
    added: (a, b) => b.added_at.localeCompare(a.added_at) || a.id.localeCompare(b.id),
    downloads: (a, b) => dl(b) - dl(a) || a.id.localeCompare(b.id),
    size: (a, b) => a.total_size - b.total_size || a.id.localeCompare(b.id),
    name: (a, b) => a.id.localeCompare(b.id),
  };
  rows = rows.sort(cmp[sort] || cmp.added);
  const page = rows.slice(offset, offset + limit);
  const headers: Record<string, string> = {};
  if (offset + limit < rows.length) {
    const next = new URL(url); next.searchParams.set('cursor', String(offset + limit));
    headers.Link = `<${next.pathname}${next.search}>; rel="next"`;
  }
  return json(page.map((r) => summary(r, getManifest(r.id) ?? undefined, dl(r))), 200, headers);
}

async function detail(env: Env, id: string): Promise<Response> {
  const m = getManifest(id), r = ROWS.get(id);
  if (!r) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  const totals = await downloadTotals(env);
  if (!m) { // link-only row: listed with its license and source link, no files served here
    return json({ ...summary(r, undefined, totals.get(id) ?? 0), siblings: [], sources: [], upstream_url: r.upstream_url, catalog: r });
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
    ...summary(r, m, totals.get(id) ?? 0),
    siblings: m.files.map((f) => ({ rfilename: f.path })),
    sources, manifest_url: r.manifest_url, upstream_url: r.upstream_url, catalog: r,
  });
}

const revOk = (m: Manifest, rev: string) => rev === 'main' || rev === m.upstream.commit;

function tree(id: string, rev: string): Response {
  const m = getManifest(id);
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
  const m = getManifest(id);
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
      await addDownload(env, id);
      if (isPaidOrigin(env, res.url)) await addOriginBytes(env, f.size);
    })());
  }
  return new Response(null, { status: 302, headers });
}

// ---- Router -----------------------------------------------------------------------------------
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return err(405, 'method_not_allowed', 'Read-only API.', { allow: 'GET, HEAD' });

    const kind = tokenKind(req, url);
    if (kind === 'hf') {
      ctx.waitUntil(bumpCounter(env, 'hf_token_rejected')); // fact only, never the value
      return err(401, 'hf_token_rejected', 'Freeweights does not accept Hugging Face tokens. Downloads need no token.');
    }
    if (kind === 'alt') return err(401, 'alt_tokens_not_yet', 'alt_ tokens are reserved and not yet accepted. Public reads need no token.');

    const p = url.pathname;
    let mt: RegExpMatchArray | null;
    const seg = (s: string) => decodeURIComponent(s);
    try {
      if (p === '/api/models') return await search(env, url);
      if (p === '/api/catalog') {
        if (req.headers.get('if-none-match') === CATALOG_ETAG) return new Response(null, { status: 304, headers: { etag: CATALOG_ETAG, ...CORS } });
        return new Response(CATALOG_JSON, { headers: { 'content-type': 'application/json', etag: CATALOG_ETAG, 'cache-control': 'public, max-age=300', ...CORS } });
      }
      // "From source" files that live in Hugging Face's Xet storage: after following our redirect the
      // client asks THIS endpoint for a Xet read token. Pass the anonymous public token request through
      // to the upstream host for catalog models only, pinned to the manifest commit (client matrix retest).
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)\/xet-read-token\/([^/]+)$/))) {
        const id = `${seg(mt[1])}/${seg(mt[2])}`;
        const m = getManifest(id);
        if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
        if (!revOk(m, seg(mt[3]))) return err(404, 'revision_not_found', `Revision ${seg(mt[3])} is not pinned for ${id}.`);
        if (m.upstream.host !== 'huggingface.co') return err(404, 'xet_not_available', 'This source does not use Xet storage.');
        const up = await fetch(`https://huggingface.co/api/models/${m.upstream.repo}/xet-read-token/${m.upstream.commit}`, { headers: { accept: 'application/json' } });
        return new Response(up.body, { status: up.status, headers: { 'content-type': up.headers.get('content-type') ?? 'application/json', 'cache-control': 'no-store', ...CORS } });
      }
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)\/tree\/([^/]+)$/))) return tree(`${seg(mt[1])}/${seg(mt[2])}`, seg(mt[3]));
      if ((mt = p.match(/^\/api\/models\/([^/]+)\/([^/]+)(?:\/revision\/[^/]+)?$/))) return await detail(env, `${seg(mt[1])}/${seg(mt[2])}`);
      if ((mt = p.match(/^\/manifests\/([^/]+)\/([^/]+?)\.json(\.minisig)?$/))) {
        const raw = MANIFESTS[`${seg(mt[1])}/${seg(mt[2])}`];
        const body = mt[3] ? raw?.sig : raw?.json; // exact stored bytes, never re-serialized
        if (!body) return err(404, 'manifest_not_found', 'No such manifest.');
        return new Response(req.method === 'HEAD' ? null : body, { headers: { 'content-type': mt[3] ? 'text/plain; charset=utf-8' : 'application/json', 'cache-control': 'public, max-age=300', ...CORS } });
      }
      if ((mt = p.match(/^\/([^/]+)\/([^/]+)\/resolve\/([^/]+)\/(.+)$/)) && mt[1] !== 'api' && mt[1] !== 'manifests') {
        return await resolve(env, ctx, req, `${seg(mt[1])}/${seg(mt[2])}`, seg(mt[3]), seg(mt[4]));
      }
    } catch (e) {
      if (e instanceof URIError) return err(400, 'bad_request', 'Malformed URL encoding.');
      return err(500, 'internal_error', 'Internal error.'); // no request data in the message
    }
    // Production runs on the route freeweights.allternit.com/* because Cloudflare routes cannot
    // match /*/resolve/* mid-path. Everything the Worker does not own goes to the Pages origin.
    if (env.PASSTHROUGH === '1') return fetch(req);
    return err(404, 'not_found', 'No such route.');
  },
} satisfies ExportedHandler<Env>;
