import { esc } from '../../../lib/util.mjs';
import { ICON } from '../../../lib/faces.mjs';

export const region = 'side';
export default function (r, ctx) {
  return `<div class="box pad"><div class="box-h">Source</div><a class="link mono small" href="${esc(r.upstream)}" rel="noopener" style="overflow-wrap:anywhere">${esc(String(r.upstream || '').replace(/^https?:\/\//, ''))} ${ICON.ext}</a></div>`;
}
