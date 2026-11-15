import path from 'node:path';
import { ROOT, OUT_R2 } from './env.mjs';
import { exists, readJSON } from './util.mjs';
import { writeTo } from './assets.mjs';

// Device overlay as static objects for the Worker (catalog/overlay/device.json, scripts/build_device_overlay.mjs).
// Written into the R2 tree, so scripts/sync_r2.py uploads them with the manifests:
//   device/<org>/<repo>.json   {id, quants, device_formats, generated_at}   read by GET /api/models/:org/:name/device
//   device/index.json          {generated_at, models:{id:[[engine,name,size,ram_est,mask]]}, recommended}
// They are not bundled into the Worker (device.json is about 7 MB; the index about 230 KB gzip).
const BIT = { phone: 1, laptop: 2, workstation: 4, browser: 8 };
export function emitDeviceStatic() {
  const f = path.join(ROOT, 'catalog', 'overlay', 'device.json');
  if (!exists(f)) return 0;
  const all = readJSON(f);
  const generated_at = all._meta?.generated_at || null;
  const models = {};
  let n = 0;
  for (const [id, e] of Object.entries(all)) {
    if (id.startsWith('_')) continue; // _meta, _recommended: not models
    writeTo(OUT_R2, `device/${id}.json`, JSON.stringify({ id, quants: e.quants, device_formats: e.device_formats, generated_at }));
    models[id] = e.quants.map((q) => [q.engine, q.name, q.size, q.ram_est ?? null, q.best_for.reduce((a, c) => a | BIT[c], 0)]);
    n++;
  }
  writeTo(OUT_R2, 'device/index.json', JSON.stringify({ generated_at, models, recommended: all._recommended || {} }));
  return n;
}
