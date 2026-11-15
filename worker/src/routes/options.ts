import { PREFLIGHT, authPreflight } from '../http';
import type { Method } from '../router';

// CORS preflight. Public routes keep the read-only answer (GET, HEAD, OPTIONS; If-None-Match, Authorization,
// Range, Content-Type). An auth route answers with its own methods. The token rules apply to the real
// request, not here.
export function preflight(req: Request, p: string, info: { methods: Method[]; auth: boolean }): Response | null {
  if (req.method !== 'OPTIONS') return null;
  if (info.auth) return new Response(null, { status: 204, headers: authPreflight(info.methods) });
  if (/^\/(api|manifests)\//.test(p) || /^\/[^/]+\/[^/]+\/resolve\/[^/]+\/.+$/.test(p)) {
    return new Response(null, { status: 204, headers: PREFLIGHT });
  }
  return null;
}
