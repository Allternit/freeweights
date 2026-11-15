import { actionBar } from '../../../lib/actions.mjs';

export const region = 'head';
export default function (r) {
  return `<div class="act-wrap">${actionBar(r)}</div>`;
}
