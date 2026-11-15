import { route, type Route } from '../router';
import { modelsRoute } from './models';
import { catalogRoute } from './catalog';
import { xetRoute } from './xet';
import { treeRoute, modelInfoRoute } from './model-info';
import { manifestsRoute } from './manifests';
import { pagesRoute } from './pages';
import { resolveRoute } from './resolve';

// The route table. Order is the match order. To add a route: add a file in routes/ and one line here.
// A handler returns null to decline, so a later route (and finally the Pages passthrough) can answer.
export const ROUTES: Route[] = [
  route(/^\/api\/models$/, modelsRoute),
  route(/^\/api\/catalog$/, catalogRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/xet-read-token\/([^/]+)$/, xetRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)\/tree\/([^/]+)$/, treeRoute),
  route(/^\/api\/models\/([^/]+)\/([^/]+)(?:\/revision\/[^/]+)?$/, modelInfoRoute),
  route(/^\/manifests\/([^/]+)\/([^/]+?)\.json(\.minisig)?$/, manifestsRoute),
  route(/^\/(alt\.freeweights\.[a-z0-9.-]+)\/([^/]+)\/([^/]+)(\/(?:index\.html)?)?$/, pagesRoute),
  route(/^\/([^/]+)\/([^/]+)\/resolve\/([^/]+)\/(.+)$/, resolveRoute),
];
