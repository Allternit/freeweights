import path from 'node:path';
import { ORIGIN } from './env.mjs';
import { SUPPORT_LINE, esc, fmtTime } from './util.mjs';
import { LOGO_LINE } from './catalog.mjs';
import { FWC, ICON } from './faces.mjs';
import { CHARTER_LABEL, CHARTER_PATH, content, inline } from './markdown.mjs';
import { HOW, howTag, summary } from './rows.mjs';
import { cards, facetLabel } from './cards.mjs';

export const NAV = [['catalog', 'Catalog', '/alt.freeweights/'], ['wanted', 'Wanted', '/wanted/'], ['mirrors', 'Mirrors', '/mirrors/'], ['ledger', 'Ledger', '/ledger/'], ['charter', CHARTER_LABEL, CHARTER_PATH], ['docs', 'Docs', '/docs/']];
export const sampleTag = (t = 'sample') => `<span class="sample">${t}</span>`;
export function badge(k, r) {
  const t = r && r.lastByType && r.lastByType[k] ? ` title="Last checked ${fmtTime(r.lastByType[k])}"` : '';
  if (k === 'host') return `<span class="b"${t}><i class="d"></i>Hosted by Allternit</span>`;
  if (k === 'seed') return `<span class="b seed"${t}><i class="d"></i>Community seeded${r && r.seeders ? `<span class="n mono">${r.seeders}</span>` : ''}</span>`;
  return `<span class="b src"${t}><i class="d"></i>From source</span>`;
}
export const PUBLISHER_LINE = "From the publisher: downloads come from the publisher's own release. Freeweights never hosts a copy.";
export const badges = (r) => r.failedAt ? '<span class="b fail"><i class="d"></i>Source check failed</span>' : r.sourceOnly ? `<span class="b src"><i class="d"></i>${esc(HOW(r))}</span>` : r.badges.map((k) => badge(k, r)).join('') + (r.kind === 'tool' ? '' : howTag(r));
export const lcTag = (r) => `<span class="lc lc-${esc(r.licClass || 'unknown')}">${esc(facetLabel('lc', r.licClass || 'unknown').replace(' (link only)', ''))}</span>`;
export const codeBlock = (id, html) => `<div class="code mono"><code id="${id}">${html}</code><button class="copy" type="button" data-copy="${id}">${ICON.copy}Copy</button></div>`;
export const hfLine = (repo) => `<span class="c">$ </span><span class="k">HF_ENDPOINT</span>=${ORIGIN} hf download ${esc(repo)}`;
export const later = (label, phase) => `<div class="later"><b>${esc(label)}</b><span class="when mono">coming in ${phase}</span></div>`;

export function layout({ path: p, title, desc, nav, body, wide, bodyClass, redirect }) {
  const full = title ? `${title} · Allternit Freeweights` : 'Allternit Freeweights: open models, free to download';
  const links = NAV.map(([k, l, h]) => `<a href="${h}"${k === nav ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc || 'Open AI models, free to download with no account. Every file has a license and a checksum. Run by Allternit, the open source alternative.')}">
<link rel="canonical" href="${ORIGIN}${p}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:url" content="${ORIGIN}${p}">
<meta name="color-scheme" content="light dark">${redirect ? `\n<meta http-equiv="refresh" content="0; url=${redirect}">\n<meta name="robots" content="noindex">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<script>(function(d){d.classList.add('js');try{var t=localStorage.getItem('fw-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}})(document.documentElement)</script>
<link rel="stylesheet" href="/assets/fw.css">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
  <a class="brand" href="/" aria-label="Allternit Freeweights home">${FWC.lockup('inline', 13, 'lockup inline hide-ph')}${FWC.lockup('stack', 26, 'lockup stack show-ph')}</a>
  <nav class="nav" aria-label="Main">${links}</nav>
  <details class="menu"><summary class="iconbtn" aria-label="Menu">${ICON.menu}</summary><div class="panel">${links}<a href="/studio/">Studio status</a><a href="/design/cards/">Card system</a></div></details>
  <button class="iconbtn theme" type="button" data-theme-toggle aria-label="Change theme">${ICON.sun}${ICON.moon}</button>
</div></header>
<main id="main"${wide ? ' class="wide"' : ''}>
${body}
</main>
<footer class="foot"><div class="wrap">
  <div class="f-top"><a class="f-brand" href="/" aria-label="Allternit Freeweights home">${FWC.lockup('stack', 34, 'lockup stack')}</a>
  <nav aria-label="Footer"><a href="/alt.freeweights/">Catalog</a><a href="/collections/mac-256/">Collections</a><a href="${CHARTER_PATH}">${esc(CHARTER_LABEL)}</a><a href="${CHARTER_PATH}#takedown-counter">Takedowns</a><a href="/ledger/">Ledger</a><a href="/mirrors/">Mirrors</a><a href="/docs/">Docs</a><a href="/studio/">Studio status</a><a href="/design/cards/">Card system</a></nav></div>
  ${/class="org[ "]/.test(body) ? `<p class="f-logos small">${esc(LOGO_LINE)}</p>` : ''}
  <div class="f-line"><b>Allternit, the open source alternative.</b> Freeweights code is published under an open license. ${esc(SUPPORT_LINE)} Support never buys ranking, placement or access.</div>
</div></footer>
<script src="/assets/fw-cards.js" defer></script>
<script src="/assets/facetlogic.js" defer></script>
<script src="/assets/fw.js" defer></script>
</body>
</html>
`;
}
