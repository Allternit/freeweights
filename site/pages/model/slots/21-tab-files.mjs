import path from 'node:path';
import { esc, exists, fmtBytes, fmtTime, plural } from '../../../lib/util.mjs';
import { summary } from '../../../lib/rows.mjs';

export const region = 'tab';
export const tab = ['files', 'Files'];
export default function (r, ctx) {
  const { files, signed, ncNote } = ctx;
  const total = files.reduce((a, f) => a + (f.size || 0), 0);
  const filesTable = files.length ? (() => { const t = `<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>File</th><th class="r">Size</th><th>sha256</th></tr></thead><tbody>${files.map((f) => `<tr><td class="path">${esc(f.path)}</td><td class="r mono">${fmtBytes(f.size)}</td><td class="hash full">${esc(f.sha256)}</td></tr>`).join('')}</tbody></table></div>`;
    return `<details class="files"${files.length <= 20 ? ' open' : ''}><summary class="pad">${files.length <= 20 ? 'Hide' : 'Show'} all ${files.length} files with their sha256</summary>${t}</details>`; })() : '';
  const hist = (r.overlay && r.overlay.history) || [];
  const hurl = (c) => `https://huggingface.co/${r.id}/commit/${c}`;
  const versions = hist.length ? `<div class="box versions"><div class="pad files-h"><b>Versions</b><span class="sub small">Each time the pinned upstream commit or file list changed in this repo. Newest first.</span></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Upstream commit</th><th>Date</th><th class="r">Contents</th></tr></thead><tbody>${hist.map((v, i) => `<tr><td class="path"><a class="link mono" href="${esc(hurl(v.commit))}" rel="noopener">${esc(v.commit.slice(0, 10))}</a>${i === 0 ? ' <span class="sub small">pinned now</span>' : ''}${v.same_pin ? ' <span class="sub small">manifest updated, same commit</span>' : ''}</td><td class="mono small">${esc(fmtTime(v.date))}</td><td class="r mono small full">${plural(v.files, 'file')} · ${fmtBytes(v.size)}</td></tr>`).join('')}</tbody></table></div></div>` : '';
  return r.linkOnly ? `${ncNote}<p class="sub" style="margin-top:12px">There is no manifest and no file list for a link-only model.</p>` : files.length ? `<div class="box"><div class="pad files-h"><b>${plural(files.length, 'file')} · ${fmtBytes(total)}</b><span class="sub small">${r.weight ? `Weights ${fmtBytes(r.weight)} (${esc(r.weightLabel)}).` : ''} Sizes and sha256 from the ${signed ? 'signed ' : ''}manifest.</span></div>${filesTable}</div>${versions}` : '<div class="empty"><b>No manifest yet.</b><span>No files are listed until a manifest exists.</span></div>';
}
