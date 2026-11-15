import { CATALOG_JSON, CATALOG_ETAG } from '../data.generated';
import { CORS } from '../http';
import type { Handler } from '../router';

export const catalogRoute: Handler = ({ req }) => {
  if (req.headers.get('if-none-match') === CATALOG_ETAG) return new Response(null, { status: 304, headers: { etag: CATALOG_ETAG, ...CORS } });
  return new Response(CATALOG_JSON, { headers: { 'content-type': 'application/json', etag: CATALOG_ETAG, 'cache-control': 'public, max-age=300', ...CORS } });
};
