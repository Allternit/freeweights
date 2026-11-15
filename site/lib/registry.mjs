import { esc, plural } from './util.mjs';
import { LISTED, TOOLS, minisig, sectionUrl } from './catalog.mjs';
import { GOALS } from './data.mjs';
import { FWC } from './faces.mjs';
import { MONO } from './rows.mjs';
import { bySection } from './paging.mjs';

export const pages = [];
export const page = (o) => pages.push(o);
export const goal = GOALS[0]; export const goalPct = Math.min(100, Math.round((goal[4] / goal[2]) * 100));
export const filesVerified = LISTED.reduce((a, r) => a + (r.manifest && minisig[r.id] ? (r.manifest.files || []).length : 0), 0);
export function sectionCard(s) {
  const ms = bySection(s.id); const nTools = s.id === 'alt.freeweights.tools' ? TOOLS.length : 0;
  return `<a class="g" href="${sectionUrl(s.id)}"><span class="g-top"><span class="g-mono">${FWC.word(MONO[s.family] || s.family.slice(0, 2), 14, 'mono-svg')}</span><span class="p mono">alt.freeweights.<i>${esc(s.family)}</i></span></span><p>${esc(s.description)}</p><span class="m">${nTools ? `${plural(nTools, 'tool')}: ${esc(TOOLS.slice(0, 2).map((m) => m.name).join(', '))}` : ms.length ? `${plural(ms.length, 'model')}: ${esc(ms.slice(0, 2).map((m) => m.name).join(', '))}` : 'No models yet'}</span></a>`;
}
export const collTile = (c) => `<a class="coll" href="/collections/${c.slug}/"><b>${esc(c.name)}</b><span class="sub small">${esc(c.blurb.split('. ')[0].replace(/\.$/, ''))}.</span><span class="mono small coll-n">${plural(c.rows.length, 'model')}</span></a>`;
