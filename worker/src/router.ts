import type { Env } from './types';

// Table-driven router. A route is a path pattern plus a handler; routes are tried in table order and the
// first handler that returns a Response wins. A handler returns null to decline, and matching continues
// with the next route (this keeps the old fall-through order, e.g. R2 page miss -> resolve -> passthrough).
// Only GET and HEAD reach the table (index.ts answers other methods), so entries carry no method.
export interface Ctx { req: Request; env: Env; ctx: ExecutionContext; url: URL; }
export type Handler = (c: Ctx, m: RegExpMatchArray) => Response | null | Promise<Response | null>;
export interface Route { pattern: RegExp; handler: Handler; }

export const route = (pattern: RegExp, handler: Handler): Route => ({ pattern, handler });

export async function dispatch(routes: Route[], c: Ctx): Promise<Response | null> {
  const p = c.url.pathname;
  for (const r of routes) {
    const m = p.match(r.pattern);
    if (!m) continue;
    const res = await r.handler(c, m);
    if (res) return res;
  }
  return null; // nothing owned it: index.ts passes it to Pages or answers 404
}
