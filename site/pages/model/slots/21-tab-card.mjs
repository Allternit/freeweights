import fs from 'node:fs';
import path from 'node:path';
import { esc } from '../../../lib/util.mjs';
import { ROOT } from '../../../lib/env.mjs';
import { mdSafe } from '../../../lib/markdown.mjs';

// The publisher's own README, stored by scripts/readme_fetch.py at the commit the manifest pins and rendered
// with the safe renderer (no raw HTML, no third-party loads). Display only; it is not part of any signature
// beyond the README.md entry in the manifest.
export const region = 'tab';
export const tab = ['card', 'Model card'];
const DIR = path.join(ROOT, 'catalog', 'overlay', 'readme');
export default function (r, ctx) {
  const { commit, treeUrl } = ctx;
  let text = null;
  try { text = fs.readFileSync(path.join(DIR, `${r.key}.md`), 'utf8'); } catch (e) { /* none stored */ }
  const src = treeUrl ? `<a class="link" href="${esc(treeUrl)}" rel="noopener">${esc(r.upstream || treeUrl)}</a>` : '';
  if (!text) {
    return `<div class="empty"><b>No model card stored here.</b><span>${r.linkOnly ? 'This model is listed with a link to the publisher.' : 'No README was stored for this model.'} ${src ? `Read the publisher's page: ${src}` : ''}</span></div>`;
  }
  const base = commit && /^[0-9a-f]{7,64}$/.test(commit) ? `https://huggingface.co/${r.id}/blob/${commit}/` : null;
  const from = commit ? `From the publisher at commit <a class="link mono" href="${esc(treeUrl)}" rel="noopener">${esc(commit.slice(0, 7))}</a>` : 'From the publisher';
  return `<div class="card-from sub small">${from}. Shown as plain text with links; images open at the publisher.</div><div class="prose card-md">${mdSafe(text, { base })}</div>`;
}
