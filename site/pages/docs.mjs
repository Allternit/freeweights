import path from 'node:path';
import { esc, mdInline } from '../lib/util.mjs';
import { LISTED } from '../lib/catalog.mjs';
import { MAN_FIELDS, PUBKEY } from '../lib/data.mjs';
import { DOCS, md, tocHtml } from '../lib/markdown.mjs';
import { summary } from '../lib/rows.mjs';
import { cards } from '../lib/cards.mjs';
import { codeBlock, hfLine } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';

export function build() {
if (DOCS.length) {
  const groups = []; for (const d of DOCS.filter((x) => x.slug !== 'index')) { let g = groups.find((x) => x.name === d.group); if (!g) groups.push((g = { name: d.group, items: [] })); g.items.push(d); }
  const seq = DOCS.filter((x) => x.slug !== 'index');
  const side = (cur) => `<nav class="dside" aria-label="Docs"><a class="dtop${cur.slug === 'index' ? ' on' : ''}" href="/docs/"${cur.slug === 'index' ? ' aria-current="page"' : ''}>Overview</a>${groups.map((g) => `<div class="dg">${g.name ? `<div class="dg-h">${esc(g.name)}</div>` : ''}${g.items.map((d) => `<a href="${d.url}"${d === cur ? ' aria-current="page"' : ''}>${esc(d.label)}</a>`).join('')}</div>`).join('')}</nav>`;
  const phoneNav = (cur) => `<details class="dnav-ph"><summary>${esc(cur.slug === 'index' ? 'Docs overview' : cur.label)}<span class="sub small">All docs</span></summary>${side(cur)}</details>`;
  for (const d of DOCS) {
    const r = md(d.body); const toc = r.toc.filter((t) => t.lv === 2 || t.lv === 3);
    const i = seq.indexOf(d); const prev = i > 0 ? seq[i - 1] : d.slug === 'index' ? null : null; const next = d.slug === 'index' ? seq[0] : seq[i + 1];
    const index = d.slug === 'index' ? `<div class="doc-cards">${groups.map((g) => g.items.map((x) => `<a class="g" href="${x.url}"><span class="p mono">${esc(g.name || 'Docs')}</span><b>${esc(x.title)}</b><p>${esc(x.fm.summary || '')}</p></a>`).join('')).join('')}</div>` : '';
    page({ path: d.url, nav: 'docs', file: d.url.slice(1) + 'index.html', title: d.slug === 'index' ? 'Docs' : `${d.title} · Docs`, desc: d.fm.summary, body: `
<div class="wrap docs3">
  <aside class="dcol">${side(d)}</aside>
  <article class="dmain">
    ${phoneNav(d)}
    <div class="eyebrow mono"><b>alt</b>.freeweights.docs${d.group ? ' / ' + esc(d.group.toLowerCase()) : ''}</div>
    <h1 class="ph1">${esc(r.title || d.title)}</h1>
    ${d.fm.summary ? `<p class="lead">${esc(d.fm.summary)}</p>` : ''}
    <div class="prose dprose">${r.html}${index}</div>
    <nav class="pn" aria-label="Previous and next">${prev ? `<a href="${prev.url}"><span class="sub small">Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a class="nx" href="${next.url}"><span class="sub small">Next</span><b>${esc(next.title)}</b></a>` : ''}</nav>
    ${d.fm.updated ? `<p class="sub small">Updated ${esc(d.fm.updated)}.</p>` : ''}
  </article>
  <aside class="tcol">${tocHtml(toc)}</aside>
</div>` });
  }
} else {
  page({ path: '/docs/', nav: 'docs', file: 'docs/index.html', title: 'Docs', body: `<div class="wrap page-head"><div class="eyebrow mono"><b>alt</b>.freeweights.docs</div><h1 class="ph1">Docs</h1><p class="lead">Everything works with no account.</p></div><div class="wrap prose" style="padding-bottom:40px"><h2 class="h2">The HF_ENDPOINT line</h2>${codeBlock('d-hf', hfLine((LISTED[0] || { id: 'Qwen/Qwen3-Embedding-0.6B' }).id))}<h2 class="h2">Manifest spec (v0)</h2><div class="box"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody>${MAN_FIELDS.map((f) => `<tr><td class="mono small">${mdInline(f[0])}</td><td class="small">${mdInline(f[1])}</td></tr>`).join('')}</tbody></table></div></div><p style="margin-top:12px">Public key: <code>${esc(PUBKEY)}</code></p></div>` });
}
}
