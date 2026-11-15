// Shared response helpers: CORS headers, JSON/error responses, the 451 takedown answers.

// Browsers may read paging (Link), caching (ETag) and the pinned commit; without expose-headers CORS hides them.
export const CORS = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'Link, ETag, X-Repo-Commit, X-Total-Count' };
export const PREFLIGHT = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'If-None-Match, Authorization, Range, Content-Type', 'access-control-max-age': '86400' };
export const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS, ...extra } });
export const err = (status: number, error: string, message: string, extra: HeadersInit = {}) => json({ error, message }, status, extra);
// 451 after a takedown (D1 `takedowns`, checked before any R2 read so a removed manifest or page is never served
// from R2 or the edge cache). Not cached, so a restore after an appeal shows at once.
const TAKEDOWN_NOTE = 'It is counted at https://freeweights.allternit.com/operating-statement/#takedown-counter.';
export const gone = (id: string) => err(451, 'removed_after_takedown', `${id} was removed after a takedown. ${TAKEDOWN_NOTE}`, { 'cache-control': 'no-store' });
export const gonePage = (id: string) => new Response(
  `<!doctype html><meta charset="utf-8"><title>451 Removed</title><h1>Removed after a takedown</h1><p>${id.replace(/[<>&"]/g, '')} was removed after a takedown. <a href="/operating-statement/#takedown-counter">Takedown counter</a>.</p>`,
  { status: 451, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...CORS } });
export const seg = (s: string) => decodeURIComponent(s);
