import { ICON } from '../../../lib/faces.mjs';

export const region = 'head';
export default function (r, ctx) {
  return r.unsigned && !r.failedAt ? `<div class="notice err" role="alert" style="margin-top:16px">${ICON.alert}<div><b>Manifest not signed yet.</b> This model stays off the catalog and on the <a class="link" href="/wanted/">Wanted</a> list until its manifest is signed.</div></div>` : '';
}
