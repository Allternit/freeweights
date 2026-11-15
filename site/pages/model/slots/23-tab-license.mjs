import { esc, licName } from '../../../lib/util.mjs';
import { ICON } from '../../../lib/faces.mjs';
import { auditLine, howTag } from '../../../lib/rows.mjs';
import { lcTag } from '../../../lib/layout.mjs';

export const region = 'tab';
export const tab = ['license', 'License'];
export default function (r, ctx) {
  const { lic, licLink, ncNote } = ctx;
  return `<div class="box pad"><dl class="kv"><dt>Name</dt><dd>${esc(lic.name || licName(r.license))}</dd><dt>Id</dt><dd class="mono">${esc(lic.id || r.license || 'see card')}</dd><dt>Class</dt><dd>${lcTag(r)}</dd><dt>Redistribution</dt><dd>${esc(r.redistribution || 'see card')}</dd><dt>Listing</dt><dd>${howTag(r)}</dd>${r.terms ? `<dt>Terms</dt><dd>${esc(r.terms)}</dd>` : ''}${auditLine(r)}${lic.file_path ? `<dt>Text in</dt><dd class="mono">${esc(lic.file_path)}</dd>` : ''}${lic.file_sha256 ? `<dt>Text sha256</dt><dd class="mono small" style="word-break:break-all">${esc(lic.file_sha256)}</dd>` : ''}<dt>Terms gate</dt><dd>${r.requiresTerms ? 'Yes. The commands stay folded until you open them after reading the license.' : 'No extra terms beyond the license.'}</dd></dl>
      <p style="margin-top:14px"><a class="btn" href="${esc(licLink)}" rel="noopener">Read the license text ${ICON.ext}</a></p></div>
      ${r.linkOnly ? ncNote : ''}
      <p class="sub small" style="margin-top:12px">Licenses are checked against the <a class="link" href="/docs/licenses/">license table</a>. A custom license passes only after a person reads it.</p>`;
}
