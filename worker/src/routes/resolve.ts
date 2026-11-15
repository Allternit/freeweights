import type { Env } from '../types';
import { addDownload, addOriginBytes, isPaidOrigin, isTakenDown, originGuardOn } from '../db';
import { pickSource } from '../check';
import { counts, getManifest, revOk } from '../manifests';
import { CORS, err, gone, seg } from '../http';
import { d1, notePause } from '../pause';
import type { Handler } from '../router';

async function resolve(env: Env, ctx: ExecutionContext, req: Request, id: string, rev: string, path: string): Promise<Response> {
  if (await isTakenDown(env, id)) return gone(id);
  const m = await getManifest(env, id);
  if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  if (m.takedown) return err(451, 'removed_after_takedown', `${id} was removed after a takedown.`);
  if (!revOk(m, rev)) return err(404, 'revision_not_found', `Revision ${rev} is not pinned for ${id}. Use main or ${m.upstream.commit}.`);
  const f = m.files.find((x) => x.path === path);
  if (!f) return err(404, 'file_not_found', `No file ${path} in ${id} at ${m.upstream.commit}.`);

  const guard = await originGuardOn(env);
  const res = await pickSource(env, m, f, guard);
  if (res.outcome === 'timeout') return err(503, 'no_live_source_in_time', 'No source answered within the time limit. Try again shortly.', { 'retry-after': '30' });
  if (res.outcome === 'wanted') return err(404, 'model_wanted', `${id} has no live source and is listed as Wanted.`);

  const headers = new Headers({
    location: res.url!, 'x-repo-commit': m.upstream.commit, etag: `"${f.sha256}"`,
    'x-freeweights-source': res.source!.type, 'cache-control': 'private, no-store', ...CORS,
  });
  if (f.lfs) { headers.set('x-linked-size', String(f.size)); headers.set('x-linked-etag', `"${f.sha256}"`); }
  if (guard) headers.set('x-freeweights-origin-guard', 'on');
  if (req.method === 'HEAD') {
    // Metadata checks are answered here with 200, not a redirect. huggingface_hub 2.x follows a HEAD
    // redirect to the upstream host, picks up its Xet headers and then fails ("Xet headers have not
    // been correctly set by the server"). All metadata it needs is in these headers; the bytes still
    // come from the source on GET (client matrix retest, 2026-11-14).
    headers.delete('location');
    headers.set('content-length', String(f.size));
    return new Response(null, { status: 200, headers });
  } else {
    ctx.waitUntil((async () => {
      if (counts(m, f.path)) await addDownload(env, 'model', id); // once per entry download (rules.ts)
      if (isPaidOrigin(env, res.url)) await addOriginBytes(env, f.size);
    })().catch(notePause));
  }
  return new Response(null, { status: 302, headers });
}

export const resolveRoute: Handler = ({ env, ctx, req }, mt) => {
  if (mt[1] === 'api' || mt[1] === 'manifests') return null;
  const [o, r, rev, path] = [seg(mt[1]), seg(mt[2]), seg(mt[3]), seg(mt[4])];
  return d1(() => resolve(env, ctx, req, `${o}/${r}`, rev, path));
};
