import { ICON } from '../../../lib/faces.mjs';
import { codeBlock, hfLine, later } from '../../../lib/layout.mjs';

export const region = 'side';
export default function (r, ctx) {
  return `<div class="box pad act">
      <div class="box-h" style="margin:0">Get it</div>
      <a class="btn pri" href="#use" data-tab-link="use">${r.linkOnly ? 'License and source' : r.requiresTerms ? 'Read license, then download' : ICON.down + 'Download'}</a>
      ${r.linkOnly ? '' : codeBlock('side-cmd', hfLine(r.id))}
      ${r.linkOnly ? '' : later('Run in Allternit Desktop', 'Phase 1')}
    </div>`;
}
