import type { Env } from './types';

// Table-driven router. A route is a path pattern, the methods it answers and a handler; routes are tried in
// table order and the first handler that returns a Response wins. A handler returns null to decline, and
// matching continues with the next route (this keeps the old fall-through order, e.g. R2 page miss -> resolve
// -> passthrough). Routes answer GET and HEAD unless they say otherwise; write routes declare POST/PUT/...
// `auth: true` marks a route that takes a credential (spec/accounts-v1.md). Only those read a bearer; every
// other route is a public read that ignores any credential and never ties a request to anyone.
export interface Ctx { req: Request; env: Env; ctx: ExecutionContext; url: URL; }
export type Handler = (c: Ctx, m: RegExpMatchArray) => Response | null | Promise<Response | null>;
export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface Route { pattern: RegExp; handler: Handler; methods: readonly Method[]; auth: boolean }

export const READ: readonly Method[] = ['GET', 'HEAD'];
const ORDER: readonly Method[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'];
export const route = (pattern: RegExp, handler: Handler, opts: { methods?: readonly Method[]; auth?: boolean } = {}): Route =>
  ({ pattern, handler, methods: opts.methods ?? READ, auth: opts.auth ?? false });

/** What the table says about a path: the methods its routes declare (in a fixed order) and whether any is an auth route. */
export function pathInfo(routes: Route[], path: string): { methods: Method[]; auth: boolean } {
  const set = new Set<Method>();
  let auth = false;
  for (const r of routes) {
    if (!r.pattern.test(path)) continue;
    for (const m of r.methods) set.add(m);
    if (r.auth) auth = true;
  }
  return { methods: ORDER.filter((m) => set.has(m)), auth };
}

export async function dispatch(routes: Route[], c: Ctx): Promise<Response | null> {
  const p = c.url.pathname;
  const method = c.req.method as Method;
  for (const r of routes) {
    if (!r.methods.includes(method)) continue;
    const m = p.match(r.pattern);
    if (!m) continue;
    const res = await r.handler(c, m);
    if (res) return res;
  }
  return null; // nothing owned it: index.ts passes it to Pages or answers 404
}
