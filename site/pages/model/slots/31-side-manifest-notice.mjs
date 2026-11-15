import { KEY_ID } from '../../../lib/env.mjs';
import { esc } from '../../../lib/util.mjs';
import { manifests } from '../../../lib/catalog.mjs';
import { ICON } from '../../../lib/faces.mjs';

export const region = 'side';
export default function (r, ctx) {
  const { mf, signed } = ctx;
  return r.linkOnly ? '' : `<div class="notice">${ICON.shield}<div><b>${signed ? 'Signed manifest' : r.manifest ? 'Manifest (not signed yet)' : 'No manifest yet'}</b><div class="small">${signed ? `minisign, key <span class="mono">${KEY_ID}</span>. ` : ''}${r.manifest ? `<a class="link" href="/manifests/${esc(mf)}">${esc(r.repo)}.json</a>. <a class="link" href="#provenance" data-tab-link="provenance">Provenance</a>. ` : ''}Takedown history: none.</div></div></div>`;
}
