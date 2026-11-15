import path from 'node:path';
import { ROOT } from './env.mjs';
import { ls, readJSON } from './util.mjs';

// Enrichment overlays: catalog/overlay/<name>.json = { "<model id>": { ...fields } }.
// Each lane writes its own file (cloud.json, readme.json, facets.json, ...); rows get
// r.overlay.<name> = that entry. Overlays never change signed manifest data.
export const OVERLAY = {};
for (const f of ls(path.join(ROOT, 'catalog', 'overlay'), /\.json$/)) {
  const name = path.basename(f, '.json');
  try {
    const data = readJSON(f);
    for (const [id, v] of Object.entries(data || {})) {
      if (id.startsWith('_')) continue; // _meta keys (source, generated_at)
      (OVERLAY[id] ||= {})[name] = v;
    }
  } catch (e) { console.warn('skip unreadable overlay', f, e.message); }
}
export const overlayOf = (id) => OVERLAY[id] || {};
