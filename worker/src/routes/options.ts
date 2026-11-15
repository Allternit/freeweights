import { PREFLIGHT } from '../http';

// CORS preflight for the routes the Worker owns, so a browser client may send If-None-Match,
// Authorization, Range or Content-Type. The token rules apply to the real request, not here.
export function preflight(req: Request, p: string): Response | null {
  if (req.method === 'OPTIONS' && (/^\/(api|manifests)\//.test(p) || /^\/[^/]+\/[^/]+\/resolve\/[^/]+\/.+$/.test(p))) {
    return new Response(null, { status: 204, headers: PREFLIGHT });
  }
  return null;
}
