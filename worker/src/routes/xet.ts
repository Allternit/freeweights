import { isTakenDown } from '../db';
import { getManifest, revOk } from '../manifests';
import { CORS, err, gone, seg } from '../http';
import type { Handler } from '../router';

// "From source" files that live in Hugging Face's Xet storage: after following our redirect the
// client asks THIS endpoint for a Xet read token. Pass the anonymous public token request through
// to the upstream host for catalog models only, pinned to the manifest commit (client matrix retest).
export const xetRoute: Handler = async ({ env }, mt) => {
  const id = `${seg(mt[1])}/${seg(mt[2])}`;
  if (await isTakenDown(env, id)) return gone(id);
  const m = await getManifest(env, id);
  if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  if (!revOk(m, seg(mt[3]))) return err(404, 'revision_not_found', `Revision ${seg(mt[3])} is not pinned for ${id}.`);
  if (m.upstream.host !== 'huggingface.co') return err(404, 'xet_not_available', 'This source does not use Xet storage.');
  const up = await fetch(`https://huggingface.co/api/models/${m.upstream.repo}/xet-read-token/${m.upstream.commit}`, { headers: { accept: 'application/json' } });
  return new Response(up.body, { status: up.status, headers: { 'content-type': up.headers.get('content-type') ?? 'application/json', 'cache-control': 'no-store', ...CORS } });
};
