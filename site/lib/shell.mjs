import { esc } from './util.mjs';
import { renderContent, tocHtml } from './markdown.mjs';
import { page } from './registry.mjs';

export function contentShell({ eyebrow, title, lead, doc, inject, before = '', after = '', toc = true }) {
  const c = doc ? renderContent(doc, inject) : { html: '', toc: [] };
  return `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.${esc(eyebrow)}</div>
  <h1 class="ph1">${esc(title)}</h1>
  ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
</div>
${before}
<div class="wrap cpage${toc && c.toc.length ? '' : ' notoc'}">
  ${toc && c.toc.length ? `<aside class="cside">${tocHtml(c.toc.filter((t) => t.lv === 2))}</aside>` : ''}
  <div class="prose cbody">${c.html}${after}</div>
</div>`;
}
