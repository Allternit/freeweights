import { KEY_ID, ORIGIN } from '../../../lib/env.mjs';
import { esc, fmtTime } from '../../../lib/util.mjs';
import { manifests } from '../../../lib/catalog.mjs';
import { PUBKEY } from '../../../lib/data.mjs';
import { FWC, ICON } from '../../../lib/faces.mjs';
import { cardRow } from '../../../lib/cards.mjs';
import { codeBlock } from '../../../lib/layout.mjs';

export const region = 'tab';
export const tab = ['provenance', 'Provenance'];
export default function (r, ctx) {
  const { m, commit, treeUrl, mf, signed, ncNote } = ctx;
  return `<div class="lead-face">${FWC.record(cardRow(r), 'head', { link: false })}</div>` + (r.manifest ? `<div class="box pad"><dl class="kv"><dt>Upstream</dt><dd><a class="link mono small" href="${esc(treeUrl)}" rel="noopener">${esc((m.upstream && m.upstream.repo) || r.id)} ${ICON.ext}</a></dd><dt>Pinned commit</dt><dd class="mono small" style="word-break:break-all">${esc(commit || 'not pinned')}</dd><dt>Manifest</dt><dd><a class="link mono small" href="/manifests/${esc(mf)}">${esc(r.repo)}.json</a>${signed ? ` · <a class="link mono small" href="/manifests/${esc(mf)}.minisig">.minisig</a>` : ' (not signed yet)'}</dd><dt>Manifest sha256</dt><dd class="mono small" style="word-break:break-all">${esc(r.mSha || '')}</dd><dt>Signature</dt><dd>${signed ? `minisign, Ed25519, key <span class="mono">${KEY_ID}</span>` : 'not signed yet'}</dd><dt>Created</dt><dd>${fmtTime(m.created_at)}</dd>${m.generator ? `<dt>Generator</dt><dd class="mono small">${esc(typeof m.generator === 'string' ? m.generator : JSON.stringify(m.generator))}</dd>` : ''}<dt>Takedowns</dt><dd>None.</dd></dl></div>
      <h3 class="h3" style="margin:18px 0 8px">How to verify</h3>
      ${codeBlock('verify-cmd', `<span class="c">$ </span>curl -O ${ORIGIN}/manifests/${esc(mf)}${signed ? `\n<span class="c">$ </span>curl -O ${ORIGIN}/manifests/${esc(mf)}.minisig\n<span class="c">$ </span>minisign -Vm ${esc(r.repo)}.json -P ${esc(PUBKEY)}` : ''}\n<span class="c">$ </span>shasum -a 256 &lt;file&gt;   <span class="c"># compare with the Files tab</span>`)}
      <p class="sub small" style="margin-top:10px">${signed ? 'A manifest whose signature fails must be rejected. ' : 'This manifest is not signed yet, so only the sha256 check applies. '}A file whose size or sha256 does not match must be discarded. <a class="link" href="/docs/verify/">Verify a download</a></p>`
      : `${ncNote}<div class="box pad" style="margin-top:12px"><dl class="kv"><dt>Source</dt><dd><a class="link mono small" href="${esc(r.upstream)}" rel="noopener">${esc(String(r.upstream || '').replace(/^https?:\/\//, ''))} ${ICON.ext}</a></dd><dt>Manifest</dt><dd>None: Freeweights does not pin or sign link-only models.</dd><dt>Takedowns</dt><dd>None.</dd></dl></div>`);
}
