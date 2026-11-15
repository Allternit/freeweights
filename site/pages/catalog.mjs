import path from 'node:path';
import { esc, plural } from '../lib/util.mjs';
import { LISTED, SECTIONS, manifests, sectionUrl } from '../lib/catalog.mjs';
import { ICON } from '../lib/faces.mjs';
import { CHARTER_LABEL, CHARTER_PATH, content, md } from '../lib/markdown.mjs';
import { summary } from '../lib/rows.mjs';
import { COLLECTIONS, PAGE, VARIANT_ROWS, bySection } from '../lib/paging.mjs';
import { ENTRIES, FACETS, FACET_ORDER, TOOL_ROWS, cards, catalogJson, facetLabel, facetVals, kindCount, secCount } from '../lib/cards.mjs';
import { SINGLE_OK } from '../lib/facets.mjs';
import { listRow, preview } from '../lib/list.mjs';
import { goal, goalPct, page } from '../lib/registry.mjs';

export function facetsHtml(rows, skipSec) {
  return FACETS.filter(([k]) => !(skipSec && k === 'sec')).map(([k, label, f]) => {
    const counts = {}; rows.forEach((r) => facetVals(k, f, r).forEach((v) => (counts[v] = (counts[v] || 0) + 1)));
    let vals = Object.keys(counts); if (vals.length < (SINGLE_OK.has(k) ? 1 : 2) && k !== 'lc') return '';
    vals = FACET_ORDER[k] ? FACET_ORDER[k].filter((v) => counts[v]) : vals.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    const opt = (v) => `<label class="opt"><input type="checkbox" name="${k}" value="${esc(v)}"><span class="ol">${esc(facetLabel(k, v))}</span><span class="oc mono" data-oc>${counts[v]}</span></label>`;
    return `<fieldset class="facet" data-facet="${k}"><legend>${esc(label)}</legend>${vals.slice(0, 6).map(opt).join('')}${vals.length > 6 ? `<details class="more-opts"><summary>Show ${vals.length - 6} more</summary>${vals.slice(6).map(opt).join('')}</details>` : ''}</fieldset>`;
  }).join('');
}
export function catalogPage({ sec, coll, pageNo = 1 }) {
  const rows = sec ? (sec.id === 'alt.freeweights.tools' ? TOOL_ROWS : bySection(sec.id)) : coll ? coll.rows : ENTRIES();
  const label = sec ? sec.id : coll ? coll.name : 'alt.freeweights.*';
  const base = sec ? sectionUrl(sec.id) : coll ? `/collections/${coll.slug}/` : '/alt.freeweights/';
  const scope = sec ? 'sec:' + sec.family : coll ? 'coll:' + coll.slug : 'all';
  const nPages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pgUrl = (n) => (n === 1 ? base : `${base}page/${n}/`);
  const pageRows = rows.slice((pageNo - 1) * PAGE, pageNo * PAGE);
  const pager = nPages > 1 ? `<nav class="pager" aria-label="Pages" data-pager>${pageNo > 1 ? `<a class="btn sm" rel="prev" href="${pgUrl(pageNo - 1)}">&larr; Previous</a>` : '<span></span>'}<span class="mono small">Page ${pageNo} of ${nPages}</span>${pageNo < nPages ? `<a class="btn sm" rel="next" href="${pgUrl(pageNo + 1)}">Next &rarr;</a>` : '<span></span>'}</nav>` : '';
  const secDoc = sec && content(`sections/${sec.family}.md`);
  const intro = sec && sec.id === 'alt.freeweights.tools' ? `<p>${esc(sec.description)} ${plural(TOOL_ROWS.length, 'tool')}, newest release first. Freeweights links to the project and does not host tool binaries.</p>` : secDoc ? md(secDoc.body).html : sec ? `<p>${esc(sec.description)} ${rows.length ? `${plural(rows.length, 'model')}, best first.` : ''} Order is never for sale.</p>` : coll ? `<p>${esc(coll.blurb)}</p>` : '<p>Sections are families; modality is a filter. Official lab repos and base models come first, then by downloads. Order is never for sale.</p>';
  const tree = `<a href="/alt.freeweights/"${!sec && !coll ? ' aria-current="page"' : ''} class="mono"><span>alt.freeweights.*</span><span class="c">${ENTRIES().length}</span></a>` +
    SECTIONS.map((s) => { const n = secCount(s); return `<a href="${sectionUrl(s.id)}" class="d mono${n ? '' : ' zero'}"${sec && sec.id === s.id ? ' aria-current="page"' : ''}><span>${esc(s.family)}</span><span class="c">${n || ''}</span></a>`; }).join('');
  const collLinks = COLLECTIONS.map((c) => `<a href="/collections/${c.slug}/"${coll && coll.slug === c.slug ? ' aria-current="page"' : ''}><span>${esc(c.name)}</span><span class="c">${c.rows.length}</span></a>`).join('');
  const chips = `<nav class="chips" aria-label="Sections"><a class="chip mono" href="/alt.freeweights/"${!sec && !coll ? ' aria-current="page"' : ''}>all ${ENTRIES().length}</a>${COLLECTIONS.map((c) => `<a class="chip" href="/collections/${c.slug}/"${coll && coll.slug === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)} ${c.rows.length}</a>`).join('')}${SECTIONS.filter((s) => secCount(s)).map((s) => `<a class="chip mono" href="${sectionUrl(s.id)}"${sec && sec.id === s.id ? ' aria-current="page"' : ''}>${esc(s.family)} ${secCount(s)}</a>`).join('')}</nav>`;
  const KIND = { inference: 'Inference', training: 'Training', ui: 'App', format: 'Format', ours: 'Ours' };
  const emptyMsg = sec
    ? `<div class="empty"><b>No models in ${esc(sec.id)} yet.</b><span>A model shows up here only after its license passes the audit and every file has a size and sha256 in a signed manifest. Listed means downloadable, so there are no placeholder rows.</span><span><a class="link" href="/wanted/">See what is wanted</a> &nbsp;·&nbsp; <a class="link" href="/docs/licenses/">What gets listed</a></span></div>`
    : `<div class="empty"><b>No models here yet.</b><span>Rows appear when the license audit and the manifests are done.</span><span><a class="link" href="/docs/licenses/">What gets listed</a></span></div>`;
  const seg = (attr, items) => items.map(([v, l, ic]) => `<button type="button" class="segb" data-${attr}="${v}" aria-pressed="false" title="${esc(l)}">${ic || ''}<span${ic ? ' class="segl"' : ''}>${esc(l)}</span></button>`).join('');
  return {
    path: pgUrl(pageNo), nav: 'catalog', file: pgUrl(pageNo).slice(1) + 'index.html', wide: true,
    title: pageNo > 1 ? `${label} · page ${pageNo}` : label, desc: sec ? `${sec.name} models on Allternit Freeweights: ${sec.description}` : coll ? `${coll.name}: ${coll.blurb}` : 'Every open model on Allternit Freeweights, by section, with license, size and where the bytes come from.',
    body: `
<div class="wrap page-head cat-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.* &nbsp;·&nbsp; ${SECTIONS.length} sections &nbsp;·&nbsp; ${plural(LISTED.length, 'model')} listed${VARIANT_ROWS.length ? ` (${VARIANT_ROWS.length} shown under their base as variants)` : ''}${coll ? ' &nbsp;·&nbsp; collection' : ''}</div>
  <h1 class="ph1${coll ? '' : ' mono'}">${esc(label)}</h1>
  <div class="lead">${intro}</div>
</div>
<div class="cat" data-catalog data-base="${base}" data-scope="${scope}" data-page="${pageNo}" data-total="${rows.length}">
  <aside class="rail" aria-label="Sections and filters">
    <div class="rail-h"><b>Filters</b><button type="button" class="btn sm" data-rail-toggle>Done</button></div>
    <div class="pane-h">Sections</div><div class="tree">${tree}</div>
    <div class="pane-h h2x">Collections</div><div class="tree">${collLinks}</div>
    ${rows.length > 1 ? `<form class="facets" data-facets data-needs-js aria-label="Filter models"><div class="pane-h h2x">Filter</div>${facetsHtml(rows, !!sec)}</form>` : ''}
  </aside>
  <div class="cat-main">
    ${chips}
    ${rows.length ? `<div class="toolbar" data-needs-js>
      <label class="q">${ICON.search}<span class="sr">Search models</span><input type="search" name="q" data-search data-q placeholder="Search ${rows.length} ${rows.every((r) => r.kind === 'tool') ? 'tools' : 'entries'}" autocomplete="off"><i class="kbd mono hide-ph" aria-hidden="true">/</i></label>
      <div class="tools">
        <button type="button" class="btn sm show-ph" data-rail-toggle>${ICON.filter}Filters<span class="mono" data-fcount></span></button>
        <label class="sort"><span class="sr">Sort</span><select data-sort><option value="rank">Best first</option><option value="new">Newest</option><option value="size">Size: largest</option><option value="small">Size: smallest</option><option value="params">Parameters: most</option><option value="name">Name A to Z</option><option value="dl" disabled>Downloads (counted from launch)</option></select></label>
        <div class="seg" role="group" aria-label="View">${seg('view-btn', [['list', 'List', ICON.list], ['grid', 'Grid', ICON.grid], ['deck', 'Deck', ICON.deck]])}</div>
      </div>
    </div>
    <div class="results-h"><span data-count aria-live="polite">${kindCount(rows)}</span><div class="fchips" data-chips></div></div>
    <div class="view-list" data-list>
      <div class="list-h"><span>Subject</span><span class="r">Size</span><span class="r">Params</span><span>License</span><span>Date</span></div>
      ${pageRows.map((r, i) => listRow(r, i === 0)).join('')}
    </div>
    ${pager}
    <div class="load-more" data-more hidden><button type="button" class="btn sm" data-more-btn>Load more</button><span class="sub small" data-more-n></span></div>
    <div class="view-grid cards tiles" data-grid hidden></div>
    <div class="view-deck" data-deck hidden>
      <div class="deck-nav"><button type="button" class="iconbtn" data-deck-prev aria-label="Previous model">${ICON.left}</button><span class="mono deck-count" data-deck-count aria-live="polite"></span><button type="button" class="iconbtn" data-deck-next aria-label="Next model">${ICON.right}</button></div>
      <div class="deck-stage" data-deck-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Models, one card at a time"><div class="deck-track" data-deck-track></div></div>
      <p class="sub small deck-hint">Slide, drag, or use the arrow keys.</p>
    </div>
    <div class="empty" data-nomatch hidden><b>No model matches these filters.</b><span>Remove a filter or search for something shorter.</span><span><button type="button" class="btn sm" data-clear>Clear all filters</button></span></div>
    <p class="sub small list-foot">Every row is downloadable or links to its source.<span class="hide-ph"> Press / to search, n and p to move in the list.</span></p>` : emptyMsg}
  </div>
  <aside class="pane preview" data-preview aria-live="polite" aria-label="Preview">${pageRows[0] ? preview(pageRows[0]) : '<p class="sub small">Nothing to preview yet.</p>'}</aside>
</div>
${catalogJson(pageRows.slice(0, 20))}
<div class="statusbar mono"><span>${esc(goal[0])}: ${esc(goal[3])}</span><span class="meter"><i style="width:${goalPct}%"></i></span><span>${goalPct}% funded</span><a class="end" href="${CHARTER_PATH}">README: ${esc(CHARTER_LABEL.toLowerCase())}</a><span>Allternit, the open source alternative</span></div>`,
  };
}
export function catalogPages(o) {
  const rows = o.sec ? (o.sec.id === 'alt.freeweights.tools' ? TOOL_ROWS : bySection(o.sec.id)) : o.coll ? o.coll.rows : ENTRIES();
  const n = Math.max(1, Math.ceil(rows.length / PAGE));
  for (let i = 1; i <= n; i++) page(catalogPage({ ...o, pageNo: i }));
}
export function build() {
  catalogPages({});
}
