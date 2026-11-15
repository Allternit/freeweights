import type { Env } from './types';
import { bumpCounter } from './db';
import { tokenKind } from './auth';
import { authErr, err } from './http';
import { notePause } from './pause';
import { dispatch, pathInfo, READ, type Method } from './router';
import { preflight } from './routes/options';
import { ROUTES } from './routes';

// Thin fetch entry: preflight, method gate, token rules, then the route table, then the Pages passthrough.
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const info = pathInfo(ROUTES, url.pathname);
    const pre = preflight(req, url.pathname, info);
    if (pre) return pre;
    // A path the table knows answers its declared methods; any other path is a public read (or the static
    // Pages origin), so GET and HEAD only. Anything else is 405 with Allow.
    const allowed: readonly Method[] = info.methods.length ? info.methods : READ;
    const fail = info.auth ? authErr : err;
    if (!allowed.includes(req.method as Method)) {
      return fail(405, 'method_not_allowed', info.auth ? `Use ${allowed.join(' or ')} on this route.` : 'Read-only API.', { allow: allowed.join(', ') });
    }

    // hf_ is refused everywhere. An alt_ key or Clerk token is read only by auth routes; on a public read it
    // is ignored and the read is served as anonymous (spec/accounts-v1.md section 1).
    if (tokenKind(req, url) === 'hf') {
      ctx.waitUntil(bumpCounter(env, 'hf_token_rejected').catch(notePause)); // fact only, never the value
      return fail(401, 'hf_token_rejected', 'Freeweights does not accept Hugging Face tokens. Downloads need no token.');
    }

    try {
      const res = await dispatch(ROUTES, { req, env, ctx, url });
      if (res) return res;
    } catch (e) {
      if (e instanceof URIError) return fail(400, 'bad_request', 'Malformed URL encoding.');
      return fail(500, 'internal_error', 'Internal error.'); // no request data in the message
    }
    // Production runs on the route freeweights.allternit.com/* because Cloudflare routes cannot
    // match /*/resolve/* mid-path. Everything the Worker does not own goes to the Pages origin.
    if (env.PASSTHROUGH === '1') return env.PAGES_ORIGIN ? fetch(new Request(env.PAGES_ORIGIN + url.pathname + url.search, req)) : fetch(req);
    return err(404, 'not_found', 'No such route.');
  },
} satisfies ExportedHandler<Env>;
