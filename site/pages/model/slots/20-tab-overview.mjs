import path from 'node:path';
import { BADGE, esc, fmtBytes, fmtTime, licName } from '../../../lib/util.mjs';
import { FWC } from '../../../lib/faces.mjs';
import { isData, taskName } from '../../../lib/rows.mjs';
import { badge } from '../../../lib/layout.mjs';

export const region = 'tab';
export const tab = ['overview', 'Overview'];
export default function (r, ctx) {
  const { srcs, files, ncNote } = ctx;
  const kind = { host: 'Allternit origin or registered mirror', seed: 'Peers (community seeded)', src: 'Publisher at the pinned commit' };
  const srcRows = srcs.map((s) => { const k = BADGE[s.type]; let host = s.url || s.magnet || ''; try { host = new URL(s.url).host; } catch (e) {} const bad = s.status === 'failed' || s.ok === false || s.check === 'failed';
    return `<tr><td>${k ? badge(k) : esc(s.type)}</td><td class="path">${esc(host)}</td><td>${fmtTime(s.last_checked)}</td><td>${bad ? '<span style="color:var(--bad)">failed</span>' : s.last_checked ? '<span style="color:var(--ok)">passed</span>' : 'not checked'}</td></tr>`; }).join('');
  const facts = [['Size', fmtBytes(r.size)], ['Weights', r.weight ? `${fmtBytes(r.weight)} (${r.weightLabel})` : isData(r) ? 'dataset' : 'see files'], ['Parameters', r.params ? FWC.params(r.params) : 'not stated'], ['Formats', r.formats.join(', ') || 'see files'], ['Task', r.tasks.map(taskName).join(', ') || 'not tagged'], ['License', `${licName(r.license)} (${r.licClass || 'see card'})`], ['Files', r.manifest ? `${files.length}, each with a sha256` : 'link only'], ['Publisher', r.org], ['Added', r.added ? String(r.added).slice(0, 10) : 'unknown'], ['Section', r.section]];
  return `
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="box pad"><div class="box-h">Lineage</div>${r.abliterated || r.changed ? `<p><b>Changed from the base model.</b> ${esc(r.changed || 'The card does not say what changed yet.')}</p>` : '<p class="sub">Original release from the publisher.</p>'}${r.base ? `<p class="sub small" style="margin-top:6px">Base model: <span class="mono">${esc(r.base)}</span></p>` : ''}</div>
      ${r.linkOnly ? ncNote : `<div class="box pad"><div class="box-h">Where these bytes come from</div><div class="flow">${srcs.map((s) => `<span class="n">${esc(kind[BADGE[s.type]] || s.type)}</span>`).join('→')}${srcs.length ? '→' : ''}<span class="n">You</span></div><p class="sub small" style="margin-top:10px">Sources are tried in order. A file counts only when its size and sha256 match the manifest. Sources are checked when you ask for them, not on a timer.</p></div>
      ${srcs.length ? `<div class="box"><div class="pad"><b>Sources</b></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Badge</th><th>Host</th><th>Last check</th><th>Result</th></tr></thead><tbody>${srcRows}</tbody></table></div></div>` : ''}`}`;
}
