import { esc, isCustom } from '../../../lib/util.mjs';
import { TOOLS } from '../../../lib/catalog.mjs';
import { FWC, ICON } from '../../../lib/faces.mjs';
import { summary } from '../../../lib/rows.mjs';
import { cardRow } from '../../../lib/cards.mjs';
import { codeBlock, later } from '../../../lib/layout.mjs';
import { page } from '../../../lib/registry.mjs';
import { useSnippets } from '../helpers.mjs';

export const region = 'tab';
export const tab = ['use', 'Use it'];
export default function (r, ctx) {
  const { licLink, ncNote } = ctx;
  const termsNote = r.terms && !r.linkOnly ? `<div class="notice" role="note" style="margin-top:12px">${ICON.info}<div><b>Terms that come with these files.</b> ${esc(r.terms)}</div></div>` : '';
  const snippets = r.linkOnly ? [] : useSnippets(r);
  const snipHtml = snippets.map(([name, what, code], i) => `<div class="snip"><div class="snip-h"><b class="mono">${esc(name)}</b><span class="sub small">${what}</span></div>${codeBlock(`use-${i}`, code)}</div>`).join('');
  const gate = (html) => `<details class="box gate"><summary class="pad"><b>Custom license (${esc(r.licClass || 'custom')}).</b> <span class="sub">Read the <a class="link" href="${esc(licLink)}" rel="noopener">license text</a> first. Open this panel to show the commands once you accept its terms.</span></summary><div class="pad">${html}</div></details>`;
  const comfy = TOOLS.find((t) => t.id === 'comfyui');
  const comfyNote = comfy && (/^alt\.freeweights\.(video|music|image)$/.test(r.section) || r.tasks.some((t) => /text-to-(image|video)|image-to-(image|video)|text-to-audio/.test(t)) || /comfy/i.test(r.id)) ? `<div class="notice" role="note" style="margin-top:12px">${ICON.info}<div><b>Packaged for ComfyUI.</b> Most image, video and music models run in <a class="link" href="${esc(comfy.url)}" rel="noopener">ComfyUI ${ICON.ext}</a>. Check the publisher's page for the workflow. Freeweights does not host it.</div></div>` : '';
  const useHtml = (r.linkOnly ? `${ncNote}<p style="margin-top:14px"><a class="btn pri" href="${esc(licLink)}" rel="noopener">Read the license</a> <a class="btn" href="${esc(r.upstream)}" rel="noopener">Open the source ${ICON.ext}</a></p>`
    : termsNote + ((r.requiresTerms || isCustom(r.license)) ? gate(snipHtml) : snipHtml)) + comfyNote;
  return `<div class="lead-face">${FWC.action(cardRow(r))}</div>${useHtml}<div class="later-row">${r.linkOnly ? '' : later('Run in Allternit Desktop', 'Phase 1') + later('Fine-tune in Freeweights Studio', 'Phase 3')}</div>`;
}
