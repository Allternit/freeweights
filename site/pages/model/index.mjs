// Model detail pages. The page is assembled from slots in ./slots/ (see slots/README.md):
// each file there is loaded in file-name order and returns one HTML string for a model.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc, fmtTime, licName } from '../../lib/util.mjs';
import { ROWS, modelUrl, sectionUrl } from '../../lib/catalog.mjs';
import { FWC } from '../../lib/faces.mjs';
import { cardRow } from '../../lib/cards.mjs';
import { badges, sampleTag } from '../../lib/layout.mjs';
import { page } from '../../lib/registry.mjs';
import { modelContext } from './context.mjs';

const SLOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'slots');
const byPrefix = (a, b) => (parseInt(a, 10) - parseInt(b, 10)) || (a < b ? -1 : a > b ? 1 : 0);
const slotFiles = fs.readdirSync(SLOT_DIR).filter((f) => /^\d+-.+\.mjs$/.test(f)).sort(byPrefix);
export const SLOTS = [];
for (const f of slotFiles) {
  const mod = await import(pathToFileURL(path.join(SLOT_DIR, f)).href);
  if (typeof mod.default !== 'function') throw new Error(`model slot ${f} must export a default function`);
  if (!['head', 'tab', 'side', 'after'].includes(mod.region)) throw new Error(`model slot ${f} must export region: head, tab, side or after`);
  if (mod.region === 'tab' && !(Array.isArray(mod.tab) && mod.tab.length === 2)) throw new Error(`model slot ${f} is a tab and must export tab = [id, label]`);
  SLOTS.push({ file: f, region: mod.region, tab: mod.tab, render: mod.default });
}
const inRegion = (region) => SLOTS.filter((s) => s.region === region);

export function modelPage(r) {
  const ctx = modelContext(r);
  const run = (region) => inRegion(region).map((s) => s.render(r, ctx));
  const tabs = inRegion('tab').map((s) => [s.tab[0], s.tab[1], s.render(r, ctx)]);
  return {
    path: modelUrl(r), nav: 'catalog', file: `${r.section}/${r.id}/index.html`, detail: true, title: r.name,
    desc: `${r.name} (${r.id}): free download with license, sha256 for every file and a manifest. ${licName(r.license)}.`,
    body: `
<div class="wrap page-head m-head">
  <div class="eyebrow mono"><a class="more" href="${sectionUrl(r.section)}">${esc(r.section)}</a> / <b>${esc(r.name)}</b></div>
  ${FWC.combined(cardRow(r), { h1: true, cls: 'fwk-hero' })}
  <div class="meta m-meta"><span class="badges">${badges(r)}</span><span class="mono m-id">${esc(r.id)}</span>${r.sample ? sampleTag() : ''}${r.sourceOnly ? '' : `<span>Last check: ${fmtTime(r.lastCheck)}</span>`}</div>
  ${run('head').join('\n  ')}
</div>
<div class="wrap mgrid">
  <div class="col">
    <div class="mtabs" role="tablist" aria-label="Model details" data-tabs>${tabs.map(([id, l], i) => `<a role="tab" href="#${id}" id="tab-${id}" aria-controls="${id}" aria-selected="${i === 0}">${l}</a>`).join('')}</div>
    ${tabs.map(([id, l, h]) => `<section class="mpanel" id="${id}" role="tabpanel" aria-labelledby="tab-${id}"><h2 class="panel-h h2">${l}</h2>${h}</section>`).join('')}
  </div>
  <div class="col side">
    ${run('side').join('\n    ')}
  </div>
</div>
${run('after').join('\n')}`,
  };
}

export function build() {
  ROWS.forEach((r) => page(modelPage(r)));
}
