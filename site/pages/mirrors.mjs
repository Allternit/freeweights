import path from 'node:path';
import { esc } from '../lib/util.mjs';
import { MIRRORS } from '../lib/data.mjs';
import { MIRRORS_DOC } from '../lib/markdown.mjs';
import { page } from '../lib/registry.mjs';
import { contentShell } from '../lib/shell.mjs';

export function build() {
  const reg = MIRRORS.length ? `<div class="box tblbox"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Host</th><th>Region</th><th class="r">Capacity</th><th>Protocols</th><th>Since</th></tr></thead><tbody>${[...MIRRORS].sort((a, b) => String(a.name).localeCompare(String(b.name))).map((x) => `<tr><td style="font-weight:600">${x.url ? `<a class="link" href="${esc(x.url)}" rel="noopener">${esc(x.name)}</a>` : esc(x.name)}</td><td>${esc(x.region || '')}</td><td class="r mono">${x.capacity_tb != null ? esc(x.capacity_tb) + ' TB' : ''}</td><td class="mono small">${esc([].concat(x.protocols || []).join(', '))}</td><td class="mono small">${esc(x.since || '')}</td></tr>`).join('')}</tbody></table></div></div>`
    : `<div class="empty"><b>No mirrors yet.</b><span>The registry (mirrors/registry.json) is empty. Each mirror is listed here with name, capacity, region and start date once its agreement is signed and its files pass the checksum check.</span><span><a class="btn sm" href="#join">How to join</a></span></div>`;
  const stats = `<div class="wrap"><div class="stats" style="margin-top:0;margin-bottom:8px"><div class="stat"><div class="v mono">${MIRRORS.length}</div><div class="l">Mirrors</div></div><div class="stat"><div class="v mono">${MIRRORS.reduce((a, x) => a + (Number(x.capacity_tb) || 0), 0)} TB</div><div class="l">Pledged capacity</div></div><div class="stat"><div class="v mono">${new Set(MIRRORS.map((x) => x.region).filter(Boolean)).size}</div><div class="l">Regions</div></div></div></div>`;
  page({ path: '/mirrors/', nav: 'mirrors', file: 'mirrors/index.html', title: 'Mirrors', desc: (MIRRORS_DOC && MIRRORS_DOC.fm.summary) || 'Organizations that carry Freeweights files, and how to run a mirror.',
    body: contentShell({ eyebrow: 'mirrors', title: 'Mirrors', lead: MIRRORS_DOC ? MIRRORS_DOC.fm.summary : 'Partners carry the bytes; Freeweights keeps the list, the rules and the checksums.', doc: MIRRORS_DOC, before: stats,
      inject: { list: (h) => (MIRRORS.length ? reg + h.replace(/<p><b>No mirrors yet[\s\S]*?<\/p>/, '') : reg) },
      after: MIRRORS_DOC ? '' : `<section class="csec" id="list"><h2 class="h2">Mirror list</h2>${reg}</section>` }) });
}
