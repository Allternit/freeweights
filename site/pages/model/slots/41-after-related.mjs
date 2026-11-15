import { esc } from '../../../lib/util.mjs';
import { sectionUrl } from '../../../lib/catalog.mjs';
import { cards } from '../../../lib/cards.mjs';

export const region = 'after';
export default function (r, ctx) {
  const { rel } = ctx;
  return rel.length ? `<div class="wrap sec"><div class="sec-h"><h2 class="h2">Related models</h2><a class="more" href="${sectionUrl(r.section)}">All of ${esc(r.section)} →</a></div>${cards(rel)}</div>` : '';
}
