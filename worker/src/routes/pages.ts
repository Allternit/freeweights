import { isTakenDown } from '../db';
import { serveObject } from '../manifests';
import { gonePage, seg } from '../http';
import type { Handler } from '../router';

// Model and tool detail pages (B5) live in R2 at <section>/<org>/<repo>/index.html, on the same
// URLs as before. Section list pages (/<section>/page/<n>/) and anything not in R2 go to Pages
// (this handler returns null, so matching continues and then falls to the passthrough).
export const pagesRoute: Handler = async ({ req, env, ctx, url }, mt) => {
  if (mt[2] === 'page') return null;
  if (await isTakenDown(env, `${seg(mt[2])}/${seg(mt[3])}`)) return gonePage(`${seg(mt[2])}/${seg(mt[3])}`);
  if (!mt[4]) return new Response(null, { status: 301, headers: { location: url.pathname + '/' + url.search } });
  return serveObject(req, env, ctx, `${mt[1]}/${seg(mt[2])}/${seg(mt[3])}/index.html`, 'text/html; charset=utf-8');
};
