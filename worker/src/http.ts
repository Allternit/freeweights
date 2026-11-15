// Shared response helpers: CORS headers, JSON/error responses, the 451 takedown answers.
import { PAGE_SECURITY_HEADERS } from './data.generated';

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
// ---- HTML pages (static Pages passthrough, R2 detail pages, 451 pages) -----------------------------------------
// One policy for every HTML page, from site/lib/csp.mjs (baked into data.generated.ts at build time) so the
// Worker and Pages' _headers can never differ. Never overrides a header already set (auth replies carry
// their own stricter CSP). Always returns a new Response: replies from Pages and the edge cache are immutable.
export function withPageSecurity(res: Response): Response {
  if (!/^text\/html/i.test(res.headers.get('content-type') || '')) return res;
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(PAGE_SECURITY_HEADERS)) if (!h.has(k)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
export const seg = (s: string) => decodeURIComponent(s);

// ---- Authenticated replies (spec/accounts-v1.md section 10) ----------------------------------------------
// Every reply on an auth route (success or error) is private and never stored, and carries a CSP that lets
// the JSON load nothing and be framed by nobody. CORS stays "*": the credential is a bearer header, never a
// cookie, so no credentialed CORS is needed.
export const AUTH_HEADERS = {
  'cache-control': 'private, no-store',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};
export const authJson = (body: unknown, status = 200, extra: HeadersInit = {}) => json(body, status, { ...AUTH_HEADERS, ...extra });
export const authErr = (status: number, error: string, message: string, extra: HeadersInit = {}) => authJson({ error, message }, status, extra);
/** CORS preflight for an auth route: its own methods, and Authorization allowed (bearer, no credentials mode). */
export const authPreflight = (methods: Iterable<string>) => ({
  'access-control-allow-origin': '*', 'access-control-allow-methods': [...methods, 'OPTIONS'].join(', '),
  'access-control-allow-headers': 'Authorization, Content-Type, If-None-Match', 'access-control-max-age': '86400',
});
