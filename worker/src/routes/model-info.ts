import type { Env } from '../types';
import { effective, isPaidOrigin, isTakenDown, originGuardOn, sourceSummary, totalsFor } from '../db';
import { ROWS, summary } from '../catalog';
import { getManifest, revOk } from '../manifests';
import { err, gone, json, seg } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';

async function detail(env: Env, id: string): Promise<Response> {
  if (await isTakenDown(env, id)) return gone(id); // before the catalog lookup: stays 451 after the row is rebuilt away
  const r = ROWS.get(id);
  if (!r) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  const m = await getManifest(env, id);
  const totals = await totalsFor(env, 'model', [id]);
  if (!m) { // link-only row: listed with its license and source link, no files served here
    return json({ ...summary(r, totals.get(id) ?? 0), sha: null, siblings: [], sources: [], upstream_url: r.upstream_url, catalog: r });
  }
  const guard = await originGuardOn(env);
  const sources = [] as unknown[];
  for (const s of [...m.sources].sort((a, b) => a.priority - b.priority)) {
    const rows = await sourceSummary(env, `${m.id}|${s.type}|${s.priority}|`);
    const eff = rows.map((x) => effective(x, env));
    const paidSkipped = guard && s.type === 'hosted' && isPaidOrigin(env, s.url);
    const state = paidSkipped ? 'skipped'
      : eff.includes('failed') ? 'failed' : eff.length && eff.every((e) => e === 'live') ? 'live'
      : eff.includes('skipped') ? 'skipped' : 'stale';
    const last = rows.length ? new Date(Math.max(...rows.map((x) => x.checked_at))).toISOString() : s.last_checked;
    sources.push({
      type: s.type, state, priority: s.priority, last_checked: last,
      ...(paidSkipped ? { reason: 'origin_budget_used' } : rows.find((x) => x.reason) ? { reason: rows.find((x) => x.reason)!.reason } : {}),
    });
  }
  if (guard) { // seeded first while the guard is on
    (sources as { type: string }[]).sort((a, b) => Number(b.type === 'seeded') - Number(a.type === 'seeded'));
  }
  return json({
    ...summary(r, totals.get(id) ?? 0),
    siblings: m.files.map((f) => ({ rfilename: f.path })),
    sources, manifest_url: r.manifest_url, upstream_url: r.upstream_url, catalog: r,
  });
}

async function tree(env: Env, id: string, rev: string): Promise<Response> {
  if (await isTakenDown(env, id)) return gone(id);
  const m = await getManifest(env, id);
  if (!m) return err(404, 'model_not_found', `No model ${id} in the catalog.`);
  if (!revOk(m, rev)) return err(404, 'revision_not_found', `Revision ${rev} is not pinned for ${id}. Use main or ${m.upstream.commit}.`);
  return json(m.files.map((f) => ({
    type: 'file', path: f.path, size: f.size, oid: f.sha256,
    // huggingface_hub reads lfs.pointerSize unconditionally (client matrix bug B1). It is the byte
    // length of the git-lfs pointer file: "version …/spec/v1\noid sha256:<64 hex>\nsize <n>\n".
    ...(f.lfs ? { lfs: { oid: f.sha256, size: f.size, pointerSize: 125 + String(f.size).length } } : {}),
  })));
}

export const treeRoute: Handler = ({ env }, mt) => tree(env, `${seg(mt[1])}/${seg(mt[2])}`, seg(mt[3]));
export const modelInfoRoute: Handler = ({ env }, mt) => {
  const did = `${seg(mt[1])}/${seg(mt[2])}`;
  return d1(() => detail(env, did));
};
