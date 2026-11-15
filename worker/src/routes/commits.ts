import { ROWS } from '../catalog';
import { HISTORY } from '../data.generated';
import { isTakenDown } from '../db';
import { err, gone, json, seg } from '../http';
import { getManifest } from '../manifests';
import type { Handler } from '../router';

// GET /api/models/{org}/{repo}/commits/{rev}: the shape huggingface_hub's list_repo_commits reads
// (id, authors[{user}], date, title, message, formatted_title, formatted_message), newest first. Our commits are
// the pinned upstream commits this repo has recorded for the model (one per pin change). Models with only one
// pin are answered from the manifest, so the bundle only carries history for the few that moved.
type Version = { id: string; date: string; files: number; size: number };

const entry = (v: Version) => {
  const title = `Pinned upstream commit ${v.id.slice(0, 7)}`;
  const message = `${v.files} files, ${v.size} bytes.`;
  return { id: v.id, authors: [], date: v.date, title, message, formatted_title: title, formatted_message: `<p>${message}</p>` };
};

export const commitsRoute: Handler = async ({ env }, m) => {
  const id = `${seg(m[1])}/${seg(m[2])}`; const rev = seg(m[3]);
  if (await isTakenDown(env, id)) return gone(id);
  if (!ROWS.has(id)) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  const man = await getManifest(env, id);
  if (!man) return err(404, 'model_not_found', `${id} is listed with a link to the publisher only; no commit history is kept here.`);
  const hist = HISTORY[id];
  const versions: Version[] = hist
    ? hist.map(([c, d, f, s]) => ({ id: c, date: d, files: f, size: s }))
    : [{ id: man.upstream.commit, date: man.created_at ?? new Date(0).toISOString(), files: man.files.length, size: man.files.reduce((a, f) => a + f.size, 0) }];
  const at = rev === 'main' ? 0 : versions.findIndex((v) => v.id === rev);
  if (at < 0) return err(404, 'revision_not_found', `Revision ${rev} is not a pinned commit for ${id}. Use main or one of the commits listed.`);
  return json(versions.slice(at).map(entry), 200, { 'x-repo-commit': versions[at].id });
};
