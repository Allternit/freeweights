import { rowsJson } from '../../../lib/cards.mjs';

export const region = 'after';
export default function (r, ctx) {
  const { rel } = ctx;
  return rowsJson(rel);
}
