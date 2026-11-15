import { fmtTime } from '../../../lib/util.mjs';
import { ICON } from '../../../lib/faces.mjs';

export const region = 'head';
export default function (r, ctx) {
  return r.failedAt ? `<div class="notice err" role="alert" style="margin-top:16px">${ICON.alert}<div><b>Source check failed at ${fmtTime(r.failedAt)}.</b> The source did not answer, or its file no longer matches the manifest. This model is on the <a class="link" href="/wanted/">Wanted</a> list until a source passes again.</div></div>` : '';
}
