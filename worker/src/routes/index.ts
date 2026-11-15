import { route, type Handler, type Method, type Route } from '../router';
import { authenticate } from '../auth';
import { authErr } from '../http';
import { modelsRoute } from './models';
import { catalogRoute } from './catalog';
import { xetRoute } from './xet';
import { treeRoute, modelInfoRoute } from './model-info';
import { commitsRoute } from './commits';
import { manifestsRoute } from './manifests';
import { deviceRoute, deviceIndexRoute } from './device';
import { pagesRoute } from './pages';
import { resolveRoute } from './resolve';
import { whoamiRoute } from './whoami';

// Write API routes (spec/parts/write-api.yaml) whose handlers land in later waves. Each one already checks the
// credential (401 / 503 accounts_not_configured) so clients and tests see the final auth behaviour; past that
// it answers 501 not_implemented. Xet writes are never supported (501 xet_not_supported, by spec).
const pending: Handler = async ({ req, env, ctx, url }) => {
  const a = await authenticate(req, env, url.origin, ctx);
  if (a instanceof Response) return a;
  return authErr(501, 'not_implemented', 'This write route is specified but not built yet.');
};
const xetWrite: Handler = async ({ req, env, ctx, url }) => {
  const a = await authenticate(req, env, url.origin, ctx);
  if (a instanceof Response) return a;
  return authErr(501, 'xet_not_supported', 'Freeweights does not run a Xet server. Set HF_HUB_DISABLE_XET=1 to upload over LFS.');
};
const W = (pattern: RegExp, methods: readonly Method[], handler: Handler = pending): Route => route(pattern, handler, { methods, auth: true });
const RT = '(models|datasets|spaces|apps)';
const REPO = `^/api/${RT}/([^/]+)/([^/]+)`;
const P: readonly Method[] = ['POST'];

// The route table. Order is the match order. To add a route: add a file in routes/ and one line here.
// A handler returns null to decline, so a later route (and finally the Pages passthrough) can answer.
// Routes answer GET/HEAD unless they list methods; `W(...)` rows are auth routes (they read a credential).
export const ROUTES: Route[] = [
  route(/^\/api\/models$/, modelsRoute),
  route(/^\/api\/catalog$/, catalogRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/xet-read-token\/([^/]+)$/, xetRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/tree\/([^/]+)$/, treeRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/commits\/([^/]+)$/, commitsRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)(?:\/revision\/[^/]+)?$/, modelInfoRoute),
  route(/^\/manifests\/([^/]+)\/([^/]+?)\.json(\.minisig)?$/, manifestsRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/device$/, deviceRoute),
  route(/^\/api\/device\/index$/, deviceIndexRoute),
  route(/^\/(alt\.freeweights\.[a-z0-9.-]+)\/([^/]+)\/([^/]+)(\/(?:index\.html)?)?$/, pagesRoute),
  route(/^\/([^/]+)\/([^/]+)\/resolve\/([^/]+)\/(.+)$/, resolveRoute),

  // ---- accounts (spec/accounts-v1.md) ----
  W(/^\/api\/whoami-v2$/, ['GET', 'HEAD'], whoamiRoute),
  W(/^\/api\/repos\/(create|move)$/, P),
  W(/^\/api\/repos\/delete$/, ['DELETE']),
  W(new RegExp(`${REPO}/settings$`), ['PUT']),
  W(new RegExp(`${REPO}/(preupload|commit)/([^/]+)$`), P),
  W(new RegExp(`${REPO}/xet-write-token/([^/]+)$`), ['GET'], xetWrite),
  W(new RegExp(`${REPO}/discussions$`), P),
  W(new RegExp(`${REPO}/discussions/(\\d+)/(comment|status|title|merge)$`), P),
  W(new RegExp(`${REPO}/like$`), ['POST', 'DELETE']),
  W(/^\/(?:(datasets|spaces)\/)?([^/]+)\/([^/]+)\.git\/info\/lfs\/objects\/batch$/, P),
  W(/^\/api\/fw\/v1\/lfs\/([^/]+)\/(complete|verify)$/, P),
  W(/^\/api\/collections$/, P),
  W(/^\/api\/collections\/([^/]+)\/([^/]+)$/, ['PATCH', 'DELETE']),
  W(/^\/api\/collections\/([^/]+)\/([^/]+)\/items$/, P),
  W(/^\/api\/collections\/([^/]+)\/([^/]+)\/items\/([^/]+)$/, ['PATCH', 'DELETE']),
  W(/^\/api\/settings\/webhooks$/, ['GET', 'POST']),
  W(/^\/api\/settings\/webhooks\/([^/]+)$/, ['GET', 'POST', 'DELETE']),
  W(/^\/api\/settings\/webhooks\/([^/]+)\/(enable|disable)$/, P),
  W(/^\/api\/fw\/v1\/account$/, ['GET', 'POST', 'PATCH', 'DELETE']),
  W(/^\/api\/fw\/v1\/follows$/, ['GET', 'POST', 'DELETE']),
  W(/^\/api\/fw\/v1\/posts$/, P),
  W(/^\/api\/fw\/v1\/posts\/([^/]+)$/, ['DELETE']),
  W(/^\/api\/fw\/v1\/papers\/([^/]+)\/vote$/, ['POST', 'DELETE']),
  W(/^\/api\/fw\/v1\/papers\/([^/]+)\/links$/, P),
  W(/^\/api\/fw\/v1\/endpoints$/, ['GET', 'POST']),
  W(/^\/api\/fw\/v1\/endpoints\/([^/]+)$/, ['GET', 'DELETE']),
  W(/^\/api\/fw\/v1\/reports$/, P),
];
