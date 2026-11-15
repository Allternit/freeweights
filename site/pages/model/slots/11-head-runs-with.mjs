import { runsWithHtml } from '../helpers.mjs';

export const region = 'head';
export default function (r, ctx) {
  return runsWithHtml(r);
}
