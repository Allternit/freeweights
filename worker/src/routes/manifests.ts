import { HOSTED } from '../data.generated';
import { isTakenDown } from '../db';
import { manifestKey, serveObject } from '../manifests';
import { err, gone, seg } from '../http';
import type { Handler } from '../router';

export const manifestsRoute: Handler = async ({ req, env, ctx }, mt) => {
  const mid = `${seg(mt[1])}/${seg(mt[2])}`;
  if (await isTakenDown(env, mid)) return gone(mid);
  const res = Object.hasOwn(HOSTED, mid) ? await serveObject(req, env, ctx, manifestKey(mid, !!mt[3]), mt[3] ? 'text/plain; charset=utf-8' : 'application/json') : null;
  return res ?? err(404, 'manifest_not_found', 'No such manifest.');
};
