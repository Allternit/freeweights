import path from 'node:path';
import { esc } from '../lib/util.mjs';
import { LISTED, modelUrl, sectionUrl } from '../lib/catalog.mjs';
import { FWC, ICON } from '../lib/faces.mjs';
import { TOOL_ROLE, TOOL_ROWS, cardRow, rowsJson, toolFits, toolKind } from '../lib/cards.mjs';
import { codeBlock, lcTag } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';

export function toolPage(r) {
  const t = r.tool; const g = t.github || {}; const rel = g.release || {}; const c = cardRow(r); const ext = /^https?:/.test(r.upstream);
  const fits = LISTED.filter((x) => toolFits(t, x)); const role = (t.works_with || {}).role;
  const note = `<p class="sub small" style="margin-top:12px">Freeweights links to the project and does not host tool binaries.</p>`;
  const facts = [['Kind', toolKind(t)], ['License', r.license || 'see project'], ['Language', g.language || 'not stated'], ['Platforms', (t.platforms || []).join(', ') || 'see project'], ['Latest release', rel.tag ? `${rel.tag} (${rel.date})` : 'no release'], ['Repository', g.repo || 'not published yet']];
  const installHtml = (t.install_verified && t.install && t.install.length) ? `${codeBlock('t-install', t.install.map((l) => `<span class="c">$ </span>${esc(l)}`).join('\n'))}<p class="sub small" style="margin-top:10px">Checked against the project's README on ${esc(g.fetched || 'the last fetch')}. The project's own instructions win when they differ: <a class="link" href="${esc(t.install_docs || r.upstream)}" rel="noopener">install docs ${ICON.ext}</a></p>`
    : `<div class="box pad"><p>${t.id === 'fw-py' ? 'Copy <span class="mono">scripts/fw.py</span> from the Freeweights repository. See the <a class="link" href="/docs/fw/">fw.py reference</a>.' : `Follow the project's install instructions: <a class="link" href="${esc(t.install_docs || r.upstream)}" rel="noopener">install docs ${ICON.ext}</a>`}</p></div>`;
  const fitList = fits.length ? `<div class="runs runs-list">${fits.slice(0, 60).map((x) => `<a class="tchip" href="${modelUrl(x)}">${esc(x.name)}</a>`).join('')}</div>${fits.length > 60 ? `<p class="sub small">and ${fits.length - 60} more.</p>` : ''}` : '<p class="sub">No catalog model matches yet.</p>';
  const tabs = [
    ['overview', 'Overview', `<p class="m-sum">${esc(t.what)}</p><dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${(g.topics || []).length ? `<div class="runs"><span class="runs-l">Topics</span>${g.topics.slice(0, 12).map((x) => `<span class="tchip mono">${esc(x)}</span>`).join('')}</div>` : ''}${note}`],
    ['install', 'Install', `<div class="lead-face">${FWC.action(c)}</div>${installHtml}${note}`],
    ['use', 'Use with Freeweights', `<div class="box pad"><div class="box-h">${(TOOL_ROLE[role] || TOOL_ROLE.runs)[1]}</div>${t.use ? codeBlock('t-use', `<span class="c">$ </span>${esc(t.use)}`) : ''}<p class="sub small" style="margin-top:8px">Download the weights from Freeweights first (<a class="link" href="/docs/hf-endpoint/">HF_ENDPOINT</a> or <a class="link" href="/docs/fw/">fw.py</a>), then point the tool at the folder.</p></div><h3 class="h3" style="margin:18px 0 8px">${role === 'trains' ? 'Catalog models it can fine-tune' : 'Catalog models it can run'} (${fits.length})</h3>${fitList}`],
    ['license', 'License', `<div class="box pad"><dl class="kv"><dt>License</dt><dd class="mono">${esc(r.license || 'see project')}</dd><dt>Class</dt><dd>${lcTag(r)}</dd></dl>${t.license_note ? `<p class="sub" style="margin-top:12px">${esc(t.license_note)}</p>` : ''}${ext ? `<p style="margin-top:14px"><a class="btn" href="${esc(r.upstream)}/blob/${esc(g.default_branch || 'main')}/LICENSE" rel="noopener">Read the license ${ICON.ext}</a></p>` : ''}</div>${note}`],
    ['provenance', 'Provenance', `<div class="lead-face">${FWC.record(c, 'head', { link: false })}</div><div class="box pad"><dl class="kv"><dt>Repository</dt><dd>${ext ? `<a class="link mono small" href="${esc(r.upstream)}" rel="noopener">${esc(g.repo)} ${ICON.ext}</a>` : 'Not published yet'}</dd><dt>Pinned release</dt><dd class="mono small">${rel.tag ? `<a class="link" href="${esc(rel.url)}" rel="noopener">${esc(rel.tag)}</a>, ${esc(rel.date)}` : 'none'}</dd><dt>Release commit</dt><dd class="mono small" style="word-break:break-all">${esc(rel.commit || 'not known')}</dd><dt>Default branch</dt><dd class="mono small" style="word-break:break-all">${esc(g.default_branch || '')} ${esc(g.branch_commit || '')}</dd><dt>Fetched</dt><dd>${esc(g.fetched || 'not fetched')}</dd><dt>Takedowns</dt><dd>None.</dd></dl></div>${note}`],
  ];
  return {
    path: modelUrl(r), nav: 'catalog', file: `${r.section}/${r.id}/index.html`, detail: true, title: r.name,
    desc: `${r.name}: ${t.what} Install, the catalog models it ${role === 'trains' ? 'fine-tunes' : 'runs'}, license and the pinned release.`,
    body: `
<div class="wrap page-head m-head">
  <div class="eyebrow mono"><a class="more" href="${sectionUrl(r.section)}">${esc(r.section)}</a> / <b>${esc(r.name)}</b></div>
  ${FWC.combined(c, { h1: true, cls: 'fwk-hero' })}
</div>
<div class="wrap mgrid">
  <div class="col">
    <div class="mtabs" role="tablist" aria-label="Tool details" data-tabs>${tabs.map(([id, l], i) => `<a role="tab" href="#${id}" id="tab-${id}" aria-controls="${id}" aria-selected="${i === 0}">${l}</a>`).join('')}</div>
    ${tabs.map(([id, l, h]) => `<section class="mpanel" id="${id}" role="tabpanel" aria-labelledby="tab-${id}"><h2 class="panel-h h2">${l}</h2>${h}</section>`).join('')}
  </div>
  <div class="col side">
    <div class="box pad act"><div class="box-h" style="margin:0">Get it</div><a class="btn pri" href="#install" data-tab-link="install">Install</a>${ext ? `<a class="btn" href="${esc(r.upstream)}" rel="noopener">Project repository ${ICON.ext}</a>` : `<a class="btn" href="/docs/fw/">fw.py reference</a>`}</div>
    <div class="box pad"><div class="box-h">Works with</div><p class="small">${fits.length} catalog ${fits.length === 1 ? 'model' : 'models'}. <a class="link" href="#use" data-tab-link="use">See the list</a></p></div>
  </div>
</div>
${rowsJson([])}`,
  };
}
export function build() {
  TOOL_ROWS.forEach((r) => page(toolPage(r)));
}
