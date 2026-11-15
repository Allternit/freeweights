import { esc, fmtBytes } from '../../../lib/util.mjs';
import { ROWS, modelUrl } from '../../../lib/catalog.mjs';

// Model tree: the parent a model was made from and everything in the catalog made from it, counted per
// relation type. Built once from relation.parent / base_model on the catalog rows, so link-only rows work too.
export const region = 'tab';
export const tab = ['tree', 'Model tree'];
const KINDS = [['finetune', 'Fine-tunes', 'finetune'], ['adapter', 'Adapters', 'adapter'], ['quant', 'Quantizations', 'quantization'], ['merge', 'Merges', 'merge'], ['variant', 'Variants', 'variant']];
const BY_ID = new Map(ROWS.map((x) => [x.id, x]));
const parentOf = (x) => (x.relation && x.relation.parent) || x.base || null;
const kidsOf = new Map();
for (const x of ROWS) { const p = parentOf(x); if (p && p !== x.id) { if (!kidsOf.has(p)) kidsOf.set(p, []); kidsOf.get(p).push(x); } }
for (const list of kidsOf.values()) list.sort((a, b) => (b.dl || 0) - (a.dl || 0) || a.id.localeCompare(b.id));
const SHOW = 30;
const typeOf = (x) => (x.relation && x.relation.type) || 'variant';
const link = (x) => `<a class="link" href="${modelUrl(x)}">${esc(x.id)}</a>`;
export default function (r) {
  const p = parentOf(r); const pr = p && BY_ID.get(p);
  const kids = kidsOf.get(r.id) || [];
  const parent = p ? `<div class="box pad"><div class="box-h">Parent</div><p>${pr ? link(pr) : `<a class="link" href="https://huggingface.co/${esc(p)}" rel="noopener">${esc(p)}</a> <span class="sub small">(not in this catalog)</span>`}${r.relation && r.relation.type && r.relation.type !== 'base' ? ` <span class="sub small">· this model is a ${esc((KINDS.find((k) => k[0] === r.relation.type) || [0, 0, r.relation.type])[2])} of it</span>` : ''}</p></div>` : '';
  const groups = KINDS.map(([t, label]) => [label, kids.filter((x) => typeOf(x) === t)]).filter(([, l]) => l.length);
  const other = kids.filter((x) => !KINDS.some(([t]) => t === typeOf(x)));
  if (other.length) groups.push(['Other', other]);
  const counts = groups.length ? `<dl class="facts tree-counts">${groups.map(([l, list]) => `<div><dt>${l}</dt><dd>${list.length}</dd></div>`).join('')}</dl>` : '';
  const lists = groups.map(([l, list]) => `<div class="box"><div class="pad"><b>${l}</b> <span class="sub small">${list.length}</span></div><ul class="tree-list">${list.slice(0, SHOW).map((x) => `<li>${link(x)}<span class="sub small mono">${x.size ? fmtBytes(x.size) : ''}</span></li>`).join('')}</ul>${list.length > SHOW ? `<div class="pad sub small">and ${list.length - SHOW} more, most downloaded shown first.</div>` : ''}</div>`).join('');
  if (!parent && !kids.length) return '<div class="empty"><b>No related models in this catalog.</b><span>Nothing here lists this model as its parent, and it names no parent.</span></div>';
  return `${parent}${kids.length ? `<p class="sub">${kids.length} ${kids.length === 1 ? 'model in' : 'models in'} the catalog name this one as their parent.</p>${counts}${lists}` : '<p class="sub">No model in the catalog names this one as its parent.</p>'}`;
}
