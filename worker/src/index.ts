import type { Env } from './types';
import { bumpCounter } from './db';
import { tokenKind } from './auth';
import { err } from './http';
import { notePause } from './pause';
import { dispatch } from './router';
import { preflight } from './routes/options';
import { ROUTES } from './routes';

// Thin fetch entry: preflight, method gate, token rules, then the route table, then the Pages passthrough.
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const pre = preflight(req, url.pathname);
    if (pre) return pre;
    if (req.method !== 'GET' && req.method !== 'HEAD') return err(405, 'method_not_allowed', 'Read-only API.', { allow: 'GET, HEAD' });

    const kind = tokenKind(req, url);
    if (kind === 'hf') {
      ctx.waitUntil(bumpCounter(env, 'hf_token_rejected').catch(notePause)); // fact only, never the value
      return err(401, 'hf_token_rejected', 'Freeweights does not accept Hugging Face tokens. Downloads need no token.');
    }
    if (kind === 'alt') return err(401, 'alt_tokens_not_yet', 'alt_ tokens are reserved and not yet accepted. Public reads need no token.');

    try {
      const res = await dispatch(ROUTES, { req, env, ctx, url });
      if (res) return res;
    } catch (e) {
      if (e instanceof URIError) return err(400, 'bad_request', 'Malformed URL encoding.');
      return err(500, 'internal_error', 'Internal error.'); // no request data in the message
    }
    // Production runs on the route freeweights.allternit.com/* because Cloudflare routes cannot
    // match /*/resolve/* mid-path. Everything the Worker does not own goes to the Pages origin.
    if (env.PASSTHROUGH === '1') return env.PAGES_ORIGIN ? fetch(new Request(env.PAGES_ORIGIN + url.pathname + url.search, req)) : fetch(req);
    return err(404, 'not_found', 'No such route.');
  },
} satisfies ExportedHandler<Env>;
