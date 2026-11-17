import path from 'node:path';
import { KEY_ID, ORIGIN } from '../lib/env.mjs';
import { esc, plural, usd } from '../lib/util.mjs';
import { LISTED, SECTIONS, manifests, minisig } from '../lib/catalog.mjs';
import { MIRRORS, MISSION, PUBKEY, costMonth, curMonth } from '../lib/data.mjs';
import { FWC, ICON } from '../lib/faces.mjs';
import { CHARTER_LABEL, CHARTER_PATH, HOME, MISSION_DOC, inline, mapHref, md, mdSections, plain } from '../lib/markdown.mjs';
import { COLLECTIONS, TOP } from '../lib/paging.mjs';
import { cards, rowsJson, secCount } from '../lib/cards.mjs';
import { CHAIN, HEAD, short } from '../lib/chain.mjs';
import { codeBlock, hfLine } from '../lib/layout.mjs';
import { collTile, filesVerified, goal, goalPct, page, sectionCard } from '../lib/registry.mjs';

export function build() {
  const hs = HOME ? Object.fromEntries(mdSections(HOME.body, true).map((s) => [s.id, s])) : {};
  const hero = (hs.hero && hs.hero.fields) || {};
  const tagline = hero.tagline || 'Open models, free to download.';
  const subline = hero.subline || 'Find, check and download open AI models. Free. No account. By Allternit, the open source alternative.';
  const cta1 = hero.cta_primary || { label: 'Browse the catalog', href: '/alt.freeweights/' };
  const cta2 = hero.cta_secondary || { label: `Read the ${CHARTER_LABEL.toLowerCase()}`, href: CHARTER_PATH };
  const first = ['Qwen/Qwen3-Embedding-0.6B', 'onnx-community/Kokoro-82M-v1.0-ONNX'].map((id) => LISTED.find((r) => r.id === id)).find(Boolean) || LISTED[0];
  const steps = hs['how-it-works'] ? mdSections(hs['how-it-works'].md.replace(/^###/gm, '##')).filter((s) => s.id !== '_intro') : [
    { title: '1. Find', md: 'Search by name, task, license, format or size.' }, { title: '2. Check', md: 'Every model has a license and a signed manifest.' }, { title: '3. Download', md: 'Use fw.py, the Hugging Face tools with one setting, or plain links.' }];
  const trust = hs.trust ? md(hs.trust.md).html : '';
  const explore = hs.explore || null;
  const sorted = [...SECTIONS].sort((a, b) => secCount(b) - secCount(a));
  const latest = [...TOP].sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || a.name.localeCompare(b.name)).slice(0, 6);
  const mission = MISSION_DOC ? (mdSections(MISSION_DOC.body).find((s) => s.id === 'mission') || {}).md || '' : MISSION;
  const verifyEx = LISTED.find((r) => r.manifest && minisig[r.id] && !r.requiresTerms) || first;
  // Dataset markup for search engines and directories. The catalog data is CC0 (README, catalog/LICENSE-CC0.txt);
  // the models themselves keep their own licenses.
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Allternit Freeweights catalog',
    description: `A catalog of ${LISTED.length} open AI models that are free to download with no account. Each entry lists the model's own license, file checksums and a signed manifest. The catalog data is CC0; each model keeps its own license.`,
    url: `${ORIGIN}/alt.freeweights/`,
    sameAs: 'https://github.com/Allternit/freeweights',
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    keywords: ['open models', 'open weights', 'AI models', 'model catalog', 'checksums'],
    creator: { '@type': 'Organization', name: 'Allternit LLC', url: 'https://allternit.com' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://raw.githubusercontent.com/Allternit/freeweights/main/catalog/catalog.json' }],
  };
  page({ path: '/', nav: 'home', file: 'index.html', desc: HOME && HOME.fm.summary, jsonld, body: `
<div class="wrap hero">
  <div class="hero-mark">${FWC.lockup('stack', 92, 'lockup stack hero-lockup')}</div>
  <p class="tag">${esc(tagline)}</p>
  <p class="lead hero-sub">${esc(subline)}</p>
  <form class="search" action="/alt.freeweights/" method="get" role="search">${ICON.search}<label class="sr" for="q">Search models</label><input id="q" name="q" data-search placeholder="${esc(hero.search_placeholder || 'Search ' + LISTED.length + ' models')}" autocomplete="off"><i class="kbd mono" aria-hidden="true">/</i><button class="btn pri sm" type="submit">Search</button></form>
  <div class="hero-cta"><a class="btn pri" href="${esc(mapHref(cta1.href))}">${esc(cta1.label)}</a><a class="btn" href="${esc(mapHref(cta2.href))}">${esc(cta2.label)}</a></div>
  ${first ? codeBlock('hf-home', hfLine(first.id)) : ''}
</div>
<div class="wrap sec">
  <div class="stats">
    <div class="stat"><div class="v mono">${LISTED.length}</div><div class="l">Models listed</div><div class="n">Listed means downloadable. Read from the catalog.</div></div>
    <div class="stat"><div class="v mono">${filesVerified.toLocaleString('en-US')}</div><div class="l">Files with a signed sha256</div><div class="n">Every file in a signed manifest.</div></div>
    <div class="stat"><div class="v mono">Not live</div><div class="l">Download starts</div><div class="n">Counted by the download Worker from launch day. No number until then.</div></div>
  </div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">How it works</h2></div>
  <div class="steps">${steps.map((s) => `<div class="step"><b>${inline(s.title)}</b>${md(s.md).html}</div>`).join('')}</div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Collections</h2><a class="more" href="/alt.freeweights/">Full catalog →</a></div>
  <p class="sub" style="margin-top:6px">Worked out from the real files in each signed manifest, not from model names.</p>
  <div class="colls">${COLLECTIONS.map(collTile).join('')}</div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Latest additions</h2><a class="more" href="/alt.freeweights/?sort=new">Newest first →</a></div>
  ${cards(latest)}
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Sections</h2><a class="more" href="/alt.freeweights/">All ${SECTIONS.length} sections →</a></div>
  ${explore && explore.fields.intro ? `<p class="sub" style="margin-top:6px;max-width:720px">${esc(explore.fields.intro)}</p>` : ''}
  <div class="groups">${sorted.slice(0, 6).map(sectionCard).join('')}</div>
</div>
<div class="wrap sec">
  <div class="two-wide">
    <div>
      <h2 class="h2">Check every byte</h2>
      <p class="sub" style="margin:6px 0 14px">A model is three things you can check with stock tools: a signed manifest, the sha256 of each file, and the license text.</p>
      <ol class="verify-steps">
        <li><b>The manifest is signed.</b> minisign, Ed25519, key <span class="mono">${KEY_ID}</span>.</li>
        <li><b>Every file has a size and sha256.</b> A file that does not match is thrown away and the next source is tried.</li>
        <li><b>The upstream commit is pinned.</b> The bytes are the publisher's release at that commit.</li>
      </ol>
      ${verifyEx ? `<pre class="block">curl -O ${ORIGIN}/manifests/${esc(verifyEx.id)}.json
curl -O ${ORIGIN}/manifests/${esc(verifyEx.id)}.json.minisig
minisign -Vm ${esc(verifyEx.repo)}.json -P ${esc(PUBKEY)}</pre>` : ''}
      <a class="link" href="/docs/verify/">How to verify a download</a>
    </div>
    <div>${trust ? `<h2 class="h2">Why you can trust it</h2><div class="prose trust">${trust}</div>` : ''}</div>
  </div>
</div>
<div class="wrap sec">
  <div class="snap">
    <a class="snap-c" href="/ledger/"><span class="box-h">Ledger</span><b class="mono">${usd(costMonth)}</b><span class="sub small">Costs${curMonth ? ', ' + curMonth : ''}. ${CHAIN.length ? `${plural(CHAIN.length, 'entry')} in the signed hash chain, head ${esc(short(HEAD && HEAD.entry_hash))}.` : 'No entries yet.'}</span></a>
    <a class="snap-c" href="/ledger/#goals"><span class="box-h">${esc(goal[0])}</span><b class="mono">${usd(goal[4])} <span class="sub">of ${usd(goal[2])}</span></b><span class="meter" role="img" aria-label="${goalPct}% funded"><i style="width:${goalPct}%"></i></span><span class="sub small">${esc(goal[1])}. Support is not open yet.</span></a>
    <a class="snap-c" href="/mirrors/"><span class="box-h">Mirrors</span><b class="mono">${MIRRORS.length}</b><span class="sub small">${MIRRORS.length ? 'Hosts carrying Freeweights files.' : 'No mirrors yet. Have spare disk and bandwidth? Run the first one.'}</span></a>
  </div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">The ${esc(CHARTER_LABEL.toLowerCase())}</h2><a class="more" href="${CHARTER_PATH}">Read the ${esc(CHARTER_LABEL.toLowerCase())} →</a></div>
  <p class="mission">${inline(String(mission).trim().split('\n\n')[0] || '')}</p>
</div>
${rowsJson(latest)}` });
}
