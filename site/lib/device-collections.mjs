import path from 'node:path';
import { ROOT } from './env.mjs';
import { exists, readJSON } from './util.mjs';

// Device collections: rows whose catalog/overlay/device.json entry has a usable quant (about 4-bit or better)
// whose best_for includes the class. best_for comes from scripts/build_device_overlay.mjs (need = size x 1.2 +
// 0.4 GB; phone <= 1.8 GB, laptop <= 12 GB, workstation above, browser = ONNX file size x 1.2 <= 1.6 GB). The hand-picked
// _recommended list comes first. overlay.mjs skips "_" keys, so the file is read directly.
const GOOD = /^(Q4_K_M|Q4_K_S|Q4_0|IQ4_XS|Q5_K_M|Q6_K|Q8_0|F16|BF16|MXFP4|[4-8]bit|bf16|fp16|q4|q4f16|int8)$/; // keep in sync with scripts/build_device_overlay.mjs
const f = path.join(ROOT, 'catalog', 'overlay', 'device.json');
const DEV = exists(f) ? readJSON(f) : {};
const REC = DEV._recommended || {};

const DEFS = [
  { cls: 'phone', slug: 'on-phone', name: 'Runs on a phone', blurb: 'Models with a 4-bit or better build that needs about 1.8 GB or less (file size x 1.2 + 0.4 GB), the room an iPhone gives an app without the increased memory limit. Hand-picked models come first.' },
  { cls: 'laptop', slug: 'on-laptop', name: 'Runs on a laptop', blurb: 'Models with a 4-bit or better build that needs about 12 GB or less (file size x 1.2 + 0.4 GB), so it loads on a 16 GB laptop. Hand-picked models come first.' },
  { cls: 'workstation', slug: 'on-workstation', name: 'Needs a workstation', blurb: 'Models whose smallest good build needs more than 12 GB (file size x 1.2 + 0.4 GB): a GPU with plenty of memory, or a Mac or PC with 32 GB or more. Hand-picked models come first.' },
  { cls: 'browser', slug: 'in-browser', name: 'Runs in the browser', blurb: 'Models with an ONNX build small enough for a browser tab with WebGPU: about 1.33 GB of files or less (a 1.6 GB GPU buffer, file size x 1.2). Hand-picked models come first. Phone browsers allow about 0.36 GB, so only builds of 300 MB or less fit there.' },
];

export const DEVICE_COLLECTIONS = Object.keys(DEV).length ? DEFS.map((d) => {
  const rec = new Map((REC[d.cls] || []).map((id, i) => [id, i]));
  const fits = (id) => (DEV[id]?.quants || []).some((q) => GOOD.test(q.name) && q.best_for.includes(d.cls));
  return { slug: d.slug, name: d.name, blurb: d.blurb, test: (r) => fits(r.id),
    order: (a, b) => (rec.has(a.id) ? rec.get(a.id) : 1e6) - (rec.has(b.id) ? rec.get(b.id) : 1e6) };
}) : [];
