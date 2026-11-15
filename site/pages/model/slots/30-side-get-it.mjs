import { ICON } from '../../../lib/faces.mjs';
import { codeBlock, hfLine } from '../../../lib/layout.mjs';
import { studioUrl } from '../../../lib/actions.mjs';

export const region = 'side';
export default function (r, ctx) {
  return `<div class="box pad act">
      <div class="box-h" style="margin:0">Get it</div>
      <a class="btn pri" href="#use" data-tab-link="use">${r.linkOnly ? 'License and source' : r.requiresTerms ? 'Read license, then download' : ICON.down + 'Download'}</a>
      ${r.linkOnly ? '' : codeBlock('side-cmd', hfLine(r.id))}
      ${r.linkOnly ? '' : `<a class="btn" href="${studioUrl(r)}" rel="noopener">Open in Freeweights Studio</a><p class="sub small" style="margin:6px 0 0">Pull, verify and run it in the Allternit app on Desktop, web or phone.</p>`}
    </div>`;
}
