import type { Env, Manifest } from './types';
import { HOSTED } from './data.generated';
import { countRule } from './rules';
import { CORS } from './http';

// Manifests live in R2 (B3), not in the bundle. Parsed manifests are kept per isolate (small LRU);
// HOSTED (bundled, id -> pinned commit) says which ids have one, so link-only rows never touch R2.
const MANIFEST_CACHE_MAX = 512;
const manifestCache = new Map<string, Manifest>();
const countCache = new Map<string, (path: string) => boolean>();
export const counts = (m: Manifest, path: string) => {
  let rule = countCache.get(m.id);
  if (!rule) { rule = countRule(m.files); countCache.set(m.id, rule); }
  return rule(path);
};
export const manifestKey = (id: string, sig = false) => `manifests/${id}.json${sig ? '.minisig' : ''}`;
export async function getManifest(env: Env, id: string): Promise<Manifest | null> {
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
export const revOk = (m: Manifest, rev: string) => rev === 'main' || rev === m.upstream.commit;

// ---- Static objects from R2 (B6 fallback) -----------------------------------------------------
// Manifests, signatures and model detail pages are served from R2 on their public URLs. The edge
// cache holds each response for 5 minutes, so R2 is read about once per object per colo per 5 minutes;
// If-None-Match answers 304 from the R2 etag. Exact stored bytes, never re-serialized.
export async function serveObject(req: Request, env: Env, ctx: ExecutionContext, key: string, type: string): Promise<Response | null> {
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
