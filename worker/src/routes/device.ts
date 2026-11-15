import { HOSTED } from '../data.generated';
import { isTakenDown } from '../db';
import { serveObject } from '../manifests';
import { CORS, err, gone, json, seg } from '../http';
import type { Handler } from '../router';

// On-device overlay (catalog/overlay/device.json, scripts/build_device_overlay.mjs). The data is not bundled:
// site/build.mjs writes device/<org>/<repo>.json and device/index.json into the R2 tree and scripts/sync_r2.py
// uploads them with the manifests. Overlay only: it never changes a signed manifest.
const ORIGIN = 'https://freeweights.allternit.com';

// GET /api/models/:org/:name/device
export const deviceRoute: Handler = async ({ req, env }, mt) => {
  const id = `${seg(mt[1])}/${seg(mt[2])}`;
  if (await isTakenDown(env, id)) return gone(id);
  const obj = await env.FW.get(`device/${id}.json`);
  if (!obj) return err(404, 'no_device_data', 'No on-device data for this model.');
  const d = JSON.parse(await obj.text()) as { quants: unknown[]; device_formats: string[]; generated_at: string | null };
  // The signed manifest of this id, when Freeweights hosts one. A base model whose quants live in sibling
  // repos (quants[].repo) may have none: then url and sig_url are null and signed is false.
  const hosted = Object.hasOwn(HOSTED, id);
  const etag = obj.httpEtag;
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { etag, 'cache-control': 'public, max-age=300', ...CORS } });
  return json({
    id, quants: d.quants, device_formats: d.device_formats,
    manifest: hosted ? { url: `${ORIGIN}/manifests/${id}.json`, sig_url: `${ORIGIN}/manifests/${id}.json.minisig`, signed: true } : { url: null, sig_url: null, signed: false },
    generated_at: d.generated_at,
  }, 200, { etag, 'cache-control': 'public, max-age=300' });
};

// GET /api/device/index: one small table for every model with device data. R2 etag, 304 on If-None-Match,
// edge cached 5 minutes like the manifests.
export const deviceIndexRoute: Handler = async ({ req, env, ctx }) => {
  const res = await serveObject(req, env, ctx, 'device/index.json', 'application/json');
  return res ?? err(404, 'no_device_index', 'The device index has not been published yet.');
};
