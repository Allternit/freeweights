import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../lib/env.mjs';
import { esc } from '../lib/util.mjs';
import { LISTED } from '../lib/catalog.mjs';
import { FWC, ICON } from '../lib/faces.mjs';
import { isData, summary } from '../lib/rows.mjs';
import { TOOL_ROWS, cardRow, cards, refCards, rowsJson } from '../lib/cards.mjs';
import { badge } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';

export function build() {
  const pick = ['Qwen/Qwen3.6-27B', 'openai/whisper-large-v3-turbo'].map((id) => LISTED.find((r) => r.id === id)).filter(Boolean);
  const lo = LISTED.find((r) => r.linkOnly); if (lo) pick.push(lo);
  while (pick.length < 3 && LISTED.find((r) => !pick.includes(r))) pick.push(LISTED.find((r) => !pick.includes(r)));
  const STYLES = [['a', 'Spec sheet', 'Now the FACTS face. Params, size, formats, license class, source badge and the terms flag.'], ['b', 'Newsgroup post', 'Now the RECORD face. From, Newsgroups, Subject, Date, Commit and Signed lines in mono, then a one-line summary.'], ['c', 'Element tile', 'Now the IDENTITY face. The family monogram in dot lettering, a big size figure and a small facts row.'], ['d', 'Terminal', 'Now the ACTION face. The fw get command, the manifest sha256 prefix and fw verify. Link-only rows say so instead.']];
  // The CLI example is real fw.py output, made when the site is built.
  let cli = '';
  try { cli = execFileSync('python3', [path.join(ROOT, 'scripts/fw.py'), 'info', pick[0].id, '--width', '68'], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' }, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { cli = ''; }
  const anat = (r) => `<div class="anat">${FWC.combined(cardRow(r), { open: true })}</div>`;
  page({ path: '/design/cards/', nav: '', file: 'design/cards/index.html', title: 'Card system', desc: 'One Freeweights card with four faces: Identity, Facts, Record and Action. Where each face shows, on desktop, phone and in the terminal.', wide: true, body: `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.design</div>
  <h1 class="ph1">One card, four faces</h1>
  <p class="lead">Every model has one card. It has four faces that share the same data and the same dot lettering. <b>Identity</b> is the element tile, <b>Facts</b> is the spec sheet, <b>Record</b> is the newsgroup header and <b>Action</b> is the terminal. Each view shows the faces that fit it.</p>
</div>
<div class="wrap sec">
  <div class="faces-key">
    <div><b class="mono">Identity</b><span>Grid front, home, related models. Monogram, size, publisher logo.</span></div>
    <div><b class="mono">Facts</b><span>Grid back (hover, tap or Enter flips it). Next to Identity in the deck and on the model page.</span></div>
    <div><b class="mono">Record</b><span>The list rows, the strip under each tile, the top of every combined card and the Provenance tab.</span></div>
    <div><b class="mono">Action</b><span>The foot of the combined card, the Use it tab and <span class="mono">fw.py info</span> in the terminal.</span></div>
  </div>
  <h2 class="h2" style="margin-top:28px">Anatomy, desktop</h2>
  <div class="anat-row">${pick.map(anat).join('')}</div>
  <h2 class="h2" style="margin-top:28px">Phone, 390 px</h2>
  <div class="anat-phones">${pick.map((r) => `<div class="phone-frame">${anat(r)}${cards([r])}</div>`).join('')}</div>
  <h2 class="h2" style="margin-top:28px">Tools and datasets</h2>
  <p class="sub" style="margin:6px 0 12px">Every catalog entry is built the same way. A tool shows its latest release where a model shows its size, and its Action face is the install command. A dataset's Action face is <span class="mono">load_dataset</span>.</p>
  <div class="anat-row two">${[TOOL_ROWS.find((t) => t.tool.id === 'llama-cpp'), LISTED.find((r) => isData(r) && !r.linkOnly)].filter(Boolean).map(anat).join('')}</div>
  ${cards([...TOOL_ROWS.slice(0, 3), ...LISTED.filter((r) => isData(r)).slice(0, 2)])}
  <h2 class="h2" style="margin-top:28px">In the terminal</h2>
  <p class="sub" style="margin:6px 0 12px">The same card in <span class="mono">fw.py info</span> and <span class="mono">fw.py search</span>: Record lines, key facts and the Action commands. Color only on a terminal, never when NO_COLOR is set. <a class="link" href="/docs/fw/#info">fw.py reference</a></p>
  ${cli ? `<div class="code-block cli-ex"><pre class="block"><code id="cli-ex">${esc(cli)}</code></pre><button class="copy" type="button" data-copy="cli-ex">${ICON.copy}Copy</button></div>` : `<p class="sub small">Run <span class="mono">python3 fw.py info ${esc(pick[0].id)}</span> to see it.</p>`}
</div>
<div class="wrap sec refs">
  <div class="sec-h"><h2 class="h2">The four original styles</h2><div class="seg" role="group" aria-label="Show reference style" data-needs-js>${[['all', 'All'], ['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D']].map(([k, l]) => `<button type="button" class="segb" data-ref-btn="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('')}</div></div>
  <p class="sub" style="margin:6px 0 4px">Kept as references. Each one became a face of the card above.</p>
</div>
${STYLES.map(([k, name, d]) => `<div class="wrap sec dstyle" id="style-${k}" data-ref="${k}">
  <div class="sec-h"><h3 class="h2"><span class="mono style-k">${k.toUpperCase()}</span> ${esc(name)}</h3></div>
  <p class="sub" style="margin:6px 0 16px">${esc(d)}</p>
  <div class="dstyle-row"><div class="dstyle-desk"><div class="box-h">Desktop</div>${refCards(pick, k)}</div><div class="dstyle-phone"><div class="box-h">Phone, 390 px</div><div class="phone-frame">${refCards(pick.slice(0, 2), k)}</div></div></div>
</div>`).join('')}
${rowsJson(pick)}` });
}
