import path from 'node:path';
import { esc, exists, mdBullets, mdInline, mdSection } from '../lib/util.mjs';
import { ETHOS, MISSION, TAKEDOWNS, policyMd } from '../lib/data.mjs';
import { CHARTER_LABEL, CHARTER_PATH, MISSION_DOC, OLD_CHARTER } from '../lib/markdown.mjs';
import { page } from '../lib/registry.mjs';
import { contentShell } from '../lib/shell.mjs';

export function build() {
  const counter = `<div class="stats" style="margin:14px 0"><div class="stat"><div class="v mono">${TAKEDOWNS.length}</div><div class="l">Removals, all time</div></div><div class="stat"><div class="v mono">${TAKEDOWNS.filter((t) => /copyright|dmca/i.test(t.reason || t.type || '')).length}</div><div class="l">Copyright notices acted on</div></div><div class="stat"><div class="v mono">${TAKEDOWNS.filter((t) => /appeal/i.test(t.status || '')).length}</div><div class="l">Appeals</div></div></div>`;
  const allowed = mdBullets(mdSection(policyMd, 'Allowed')); const banned = mdBullets(mdSection(policyMd, 'Banned'));
  const legacy = `<section class="csec"><h2 class="h2">Mission</h2><p class="mission">${esc(MISSION)}</p></section><section class="csec"><div class="two"><div class="card"><h3>We always</h3><ul>${ETHOS.map((r) => `<li>${esc(r[0])}</li>`).join('')}</ul></div><div class="card never"><h3>We never</h3><ul>${ETHOS.map((r) => `<li>${esc(r[1])}</li>`).join('')}</ul></div></div></section><section class="csec"><h2 class="h2">Content policy</h2><div class="two"><div class="card"><h3>Allowed</h3><ul>${allowed.map((t) => `<li>${mdInline(t)}</li>`).join('')}</ul></div><div class="card never"><h3>Never listed or hosted</h3><ul>${banned.map((t) => `<li>${mdInline(t)}</li>`).join('')}</ul></div></div></section><section class="csec" id="takedowns"><h2 class="h2">Takedowns</h2>${counter}</section>`;
  page({ path: CHARTER_PATH, nav: 'charter', file: CHARTER_PATH.slice(1) + 'index.html', title: CHARTER_LABEL, desc: (MISSION_DOC && MISSION_DOC.fm.summary) || 'Why Freeweights exists, what we always do and never do.',
    body: contentShell({ eyebrow: CHARTER_PATH.replace(/\//g, ''), title: (MISSION_DOC && MISSION_DOC.fm.title) || CHARTER_LABEL, lead: MISSION_DOC ? MISSION_DOC.fm.summary : '', doc: MISSION_DOC,
      inject: { 'we-always': (h) => `<div class="pledge ok">${h}</div>`, 'we-never': (h) => `<div class="pledge never">${h}</div>` },
      after: MISSION_DOC ? `<section class="csec" id="takedown-counter"><h2 class="h2">Takedown counter<a class="anchor" href="#takedown-counter" aria-label="Link to Takedown counter">#</a></h2><p>Every removal is counted here, read from policy/takedowns.json when this page was built.</p>${counter}</section>${MISSION_DOC.fm.updated ? `<p class="sub small" style="margin-top:24px">Updated ${esc(MISSION_DOC.fm.updated)}.</p>` : ''}` : legacy }) });
  // Old paths keep working without the _redirects file (meta refresh fallback).
  for (const old of OLD_CHARTER) page({ path: old, nav: '', file: old.slice(1) + 'index.html', title: CHARTER_LABEL, redirect: CHARTER_PATH, body: `<div class="wrap page-head" style="padding-bottom:60px"><h1 class="ph1">${esc(CHARTER_LABEL)}</h1><p class="lead">This page moved to <a class="link" href="${CHARTER_PATH}">${esc(CHARTER_LABEL)}</a>.</p></div>` });
}
