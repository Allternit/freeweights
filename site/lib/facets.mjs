// Catalog filters that come from the facets overlay (catalog/overlay/facets.json, written by
// scripts/facets_extract.py) and the cloud overlay (catalog/overlay/cloud.json, written by the
// cloud-map lane). cards.mjs spreads FACETS_OVERLAY into the filter list; the search index, the
// filter form and fw.js all read the same keys, so a new facet is one entry here.
//   pb     Parameters  (Hugging Face's size bins)
//   lib    Library
//   lang   Language
//   app    Apps that can run the weights
//   cloud  Runs on Allternit Cloud (a row with a cloud overlay entry)
//   device On device: the union of quants[].best_for (phone, laptop, workstation, browser) in catalog/overlay/device.json
//   engine Engine: the union of quants[].engine (llama.cpp, MLX, WebGPU) from the same file
// Both are hidden while device.json is absent.
// A missing overlay file gives rows no value, and a facet with no values anywhere is not drawn.
const fx = (r) => (r.overlay && r.overlay.facets) || null;

export const PB_BINS = [['lt1', 'Under 1B'], ['1-3', '1B to 3B'], ['3-6', '3B to 6B'], ['6-9', '6B to 9B'], ['9-12', '9B to 12B'], ['12-24', '12B to 24B'],
  ['24-32', '24B to 32B'], ['32-64', '32B to 64B'], ['64-128', '64B to 128B'], ['128-500', '128B to 500B'], ['gt500', 'Over 500B']];
export const DEVICE_LABELS = { phone: 'Phone', laptop: 'Laptop', workstation: 'Workstation', browser: 'In the browser' };
const quants = (r) => { const q = r.overlay && r.overlay.device && r.overlay.device.quants; return Array.isArray(q) ? q : []; };
const union = (r, key) => [...new Set(quants(r).flatMap((x) => [].concat(x[key] || [])))];
export const deviceFits = (r) => Object.keys(DEVICE_LABELS).filter((k) => union(r, 'best_for').includes(k));
export const engines = (r) => union(r, 'engine');
// One entry per facet: [key, legend, values(row)]. Labels, order and single-value rules sit below, keyed the same way.
export const FACETS_OVERLAY = [
  ['pb', 'Parameters', (r) => [(fx(r) && fx(r).params_bin) || 'none']],
  ['lib', 'Library', (r) => (fx(r) ? fx(r).libraries || [] : [])],
  ['lang', 'Language', (r) => (fx(r) ? fx(r).languages || [] : [])],
  ['app', 'Apps', (r) => (fx(r) ? fx(r).apps || [] : [])],
  ['cloud', 'Runs on Allternit Cloud', (r) => (r.overlay && r.overlay.cloud ? ['yes'] : [])],
  ['device', 'On device', deviceFits],
  ['engine', 'Engine', engines],
];
let names = null;
const langName = (c) => { if (c === 'multilingual') return 'Multilingual'; try { names ||= new Intl.DisplayNames(['en'], { type: 'language' }); return names.of(c) || c; } catch (e) { return c; } };
export const FACET_LABELS_OVERLAY = {
  pb: { ...Object.fromEntries(PB_BINS), none: 'Not stated' },
  cloud: { yes: 'Yes, served by Allternit Cloud' },
  device: DEVICE_LABELS,
};
export const FACET_LABEL_FN = { lang: langName };
export const FACET_ORDER_OVERLAY = { pb: [...PB_BINS.map(([c]) => c), 'none'], device: Object.keys(DEVICE_LABELS) };
// Facets that are drawn even with one value (the rest need two to be a choice).
export const SINGLE_OK = new Set(['cloud']);
