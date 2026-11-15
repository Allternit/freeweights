import path from 'node:path';
import { esc, exists, fmtBytes, plural } from '../../../lib/util.mjs';
import { summary } from '../../../lib/rows.mjs';

export const region = 'tab';
export const tab = ['files', 'Files'];
export default function (r, ctx) {
  const { files, signed, ncNote } = ctx;
  const total = files.reduce((a, f) => a + (f.size || 0), 0);
  const filesTable = files.length ? (() => { const t = `<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>File</th><th class="r">Size</th><th>sha256</th></tr></thead><tbody>${files.map((f) => `<tr><td class="path">${esc(f.path)}</td><td class="r mono">${fmtBytes(f.size)}</td><td class="hash full">${esc(f.sha256)}</td></tr>`).join('')}</tbody></table></div>`;
    return `<details class="files"${files.length <= 20 ? ' open' : ''}><summary class="pad">${files.length <= 20 ? 'Hide' : 'Show'} all ${files.length} files with their sha256</summary>${t}</details>`; })() : '';
  return r.linkOnly ? `${ncNote}<p class="sub" style="margin-top:12px">There is no manifest and no file list for a link-only model.</p>` : files.length ? `<div class="box"><div class="pad files-h"><b>${plural(files.length, 'file')} · ${fmtBytes(total)}</b><span class="sub small">${r.weight ? `Weights ${fmtBytes(r.weight)} (${esc(r.weightLabel)}).` : ''} Sizes and sha256 from the ${signed ? 'signed ' : ''}manifest.</span></div>${filesTable}</div>` : '<div class="empty"><b>No manifest yet.</b><span>No files are listed until a manifest exists.</span></div>';
}
