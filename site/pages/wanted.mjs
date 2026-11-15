import path from 'node:path';
import { esc, fmtBytes, fmtTime, plural } from '../lib/util.mjs';
import { WANTED, modelUrl } from '../lib/catalog.mjs';
import { REFUSED } from '../lib/data.mjs';
import { WANTED_DOC } from '../lib/markdown.mjs';
import { sampleTag } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';
import { contentShell } from '../lib/shell.mjs';

export function build() {
  const wantedTable = WANTED.length ? `<div class="box"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Model</th><th>Section</th><th class="r">Size</th><th>Why</th></tr></thead><tbody>${WANTED.map((r) => `<tr><td><a class="link" href="${modelUrl(r)}">${esc(r.name)}</a>${r.sample ? sampleTag() : ''}<div class="mono small sub">${esc(r.id)}</div></td><td class="mono small">${esc(r.section)}</td><td class="r mono">${fmtBytes(r.size)}</td><td class="small">${r.failedAt ? `Source check failed at ${fmtTime(r.failedAt)}` : !r.manifest ? 'No manifest yet' : r.unsigned ? 'Manifest not signed yet' : 'Marked wanted'}</td></tr>`).join('')}</tbody></table></div></div>`
    : `<div class="empty"><b>Nothing is wanted right now.</b><span>Every listed model passed its last source check. When a source changes or disappears, the model moves here with the reason and the time.</span></div>`;
  const refusedTable = REFUSED.length ? `<div class="box tblbox"><div class="pad"><b>${plural(REFUSED.length, 'refusal')}</b> <span class="sub small">from catalog/refused.json at build time</span></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Model</th><th>License found</th><th>Reason</th></tr></thead><tbody>${REFUSED.map((x) => `<tr><td class="path small full">${x.upstream_url ? `<a class="link" href="${esc(x.upstream_url)}" rel="noopener">${esc(x.id || x.repo)}</a>` : esc(x.id || x.repo)}</td><td class="small">${esc(x.license_id || '')}</td><td class="small full">${esc(x.reason || '')}</td></tr>`).join('')}</tbody></table></div></div>`
    : '<div class="empty"><b>No refusals logged.</b></div>';
  const live = `<h3 class="h3" style="margin:18px 0 10px">Wanted now (${WANTED.length})</h3>${wantedTable}`;
  const fallback = `<section class="csec"><h2 class="h2">Wanted now</h2>${wantedTable}</section><section class="csec" id="refused"><h2 class="h2">Refused, with reasons</h2>${refusedTable}</section>`;
  page({ path: '/wanted/', nav: 'wanted', file: 'wanted/index.html', title: 'Wanted', desc: (WANTED_DOC && WANTED_DOC.fm.summary) || 'Models that failed a source check or lost their source, and how to help seed them.',
    body: contentShell({ eyebrow: 'wanted', title: 'Wanted', lead: WANTED_DOC ? WANTED_DOC.fm.summary : 'Models that failed a check or lost their source.', doc: WANTED_DOC,
      inject: { 'what-wanted-means': (h) => h + live, refused: (h) => h.replace(/<div class="box tblbox">[\s\S]*?<\/table><\/div><\/div>/, refusedTable) },
      after: WANTED_DOC ? '' : fallback }) });
}
