import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DETAILS_STATIC, OUT, OUT_R2, ROOT, SITE } from './env.mjs';
import { exists } from './util.mjs';
import { ROWS, manifestFile, manifests, minisig } from './catalog.mjs';
import { MONO_SPRITE } from './faces.mjs';
import { inline } from './markdown.mjs';
import { cards } from './cards.mjs';
import { layout } from './layout.mjs';
import { page, pages } from './registry.mjs';

export function resetOut() {
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
if (!DETAILS_STATIC) { fs.mkdirSync(OUT_R2, { recursive: true }); for (const f of fs.readdirSync(OUT_R2)) fs.rmSync(path.join(OUT_R2, f), { recursive: true, force: true }); }
}
export const writeTo = (root, rel, s) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
export const write = (rel, s) => writeTo(OUT, rel, s);
// Large inline SVGs (the lockups in the header and footer, the monogram words on cards) repeat on every
// page. They move into the shared sprite (assets/mono.svg) as symbols and each page keeps a <use> with the
// same outer <svg> attributes, the pattern the section monograms already use. This keeps a detail page
// near 30 KB (B5) instead of ~90 KB. SVGs with ids or url(#…) references stay inline.
export const SPRITE_MIN = 600;
export const spriteize = (html) => html.replace(/<svg([^>]*)>([\s\S]*?)<\/svg>/g, (all, attrs, body) => {
  if (body.length < SPRITE_MIN || /\bid=|url\(#|<use\b/.test(body)) return all;
  const vb = (attrs.match(/viewBox="([^"]+)"/) || [])[1]; if (!vb) return all;
  const key = 's' + crypto.createHash('sha256').update(vb + '|' + body).digest('hex').slice(0, 12);
  if (!MONO_SPRITE[key]) MONO_SPRITE[key] = { vb, body };
  return `<svg${attrs}><use href="/assets/mono.svg#m-${key}"/></svg>`;
});
export function emitPages(pages) {
  let detailBytes = 0, detailCount = 0, detailMax = 0;
for (const p of pages) {
  const html = spriteize(layout(p));
  if (p.detail) { writeTo(OUT_R2, p.file, html); detailCount++; detailBytes += html.length; detailMax = Math.max(detailMax, html.length); }
  else write(p.file, html);
}
  return { detailBytes, detailCount, detailMax };
}
const serveable = (src) => /[\\/]README\.md$/.test(src) ? false : !(fs.statSync(src).isDirectory() && fs.readdirSync(src).length > 0 && fs.readdirSync(src).every((f) => f === 'README.md'));
export function copyStatic() {
fs.cpSync(path.join(SITE, 'assets'), path.join(OUT, 'assets'), { recursive: true, filter: serveable }); // README files document a folder; they are not served, and a folder with only a README is skipped
write('assets/mono.svg', `<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(MONO_SPRITE).sort().map(([m, x]) => `<symbol id="m-${m}" viewBox="${x.vb}">${x.body}</symbol>`).join('')}</svg>`);
for (const r of ROWS) if (r.manifest) {
  fs.mkdirSync(path.join(OUT_R2, 'manifests', r.org), { recursive: true });
  fs.copyFileSync(manifestFile[r.id], path.join(OUT_R2, 'manifests', `${r.id}.json`));
  if (minisig[r.id]) fs.copyFileSync(minisig[r.id], path.join(OUT_R2, 'manifests', `${r.id}.json.minisig`));
}
for (const f of ['chain.jsonl', 'head.json', 'head.json.minisig', 'registry.jsonl', 'registry-head.json', 'registry-head.json.minisig', 'snapshot.json', 'snapshot.json.minisig']) if (exists(path.join(ROOT, 'ledger', f))) fs.copyFileSync(path.join(ROOT, 'ledger', f), path.join(OUT, 'ledger', f));
if (exists(path.join(ROOT, 'spec/keys/freeweights-v0.pub'))) { fs.mkdirSync(path.join(OUT, 'keys'), { recursive: true }); fs.copyFileSync(path.join(ROOT, 'spec/keys/freeweights-v0.pub'), path.join(OUT, 'keys/freeweights-v0.pub')); }
}
