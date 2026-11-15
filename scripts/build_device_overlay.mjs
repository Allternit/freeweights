#!/usr/bin/env node
// Builds the per-quant device overlay from signed manifests (sizes and file lists only, no network):
//   catalog/overlay/device.json           { "<id>": {quants, device_formats}, "_recommended": {...}, "_meta": {...} }
//   catalog/overlay/device-siblings.json  { "<base id>": [{id, formats}] }  (GGUF/MLX/ONNX repos built from a base)
// Sizes come from manifest file entries, never from catalog total_size. ram_est is omitted: manifests list file
// names and sizes but not config.json contents, so no KV cache can be computed offline; clients then use the fit
// spec fallback need = size * 1.2 + 0.4 GB. Output is deterministic (generated_at = newest manifest time).
// _recommended is validated against catalog/overlay/device-recommended.src.json and a name denylist.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GB = 1e9;
const ENGINE = { gguf: 'llama.cpp', mlx: 'mlx', onnx: 'webgpu' };
const BIT = { phone: 1, laptop: 2, workstation: 4, browser: 8 };
const CLASSES = Object.keys(BIT);
// Recommended ids must never match these (case-insensitive, on the id). The catalog `abliterated` flag is not used.
const MAINSTREAM = /^(Q2_K|Q3_K_M|Q4_0|Q4_K_S|Q4_K_M|Q5_K_M|Q6_K|Q8_0|IQ4_XS|F16|BF16|MXFP4)$/;
// A recommended model needs a usable-quality quant (about 4-bit or better) that fits the class, not a 1-2 bit squeeze.
const GOOD = /^(Q4_K_M|Q4_K_S|Q4_0|IQ4_XS|Q5_K_M|Q6_K|Q8_0|F16|BF16|MXFP4|[4-8]bit|bf16|fp16|q4|q4f16|int8)$/;
export const DENY = /abliterat|uncensor|obliterat|heretic|nsfw|erotic|lewd|\brp\b|[-_/]rp[-_]|roleplay|jailbreak|unfilter|dolphin-.*uncens/i;

const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

// ---- quant grouping -------------------------------------------------------------------------------------
const GGUF_Q = /(?<![A-Za-z0-9])((?:UD-)?(?:IQ|TQ|Q)\d(?:_[A-Z0-9]{1,3})*|BF16|F16|F32|FP16|MXFP4(?:_MOE)?)(?![A-Za-z0-9])/i;
export function ggufQuants(files) {
  const groups = new Map();
  const mm = [];
  for (const f of files) {
    if (!f.path.toLowerCase().endsWith('.gguf')) continue;
    const base = basename(f.path);
    if (/mmproj/i.test(base)) { mm.push(f); continue; }
    if (/imatrix/i.test(base) || /(^|\/)mtp[-_\/]/i.test(f.path) || /draft|eagle|medusa|lora|vocoder/i.test(base)) continue; // imatrix data, MTP/draft/Eagle heads, LoRA
    const m = GGUF_Q.exec(base) || GGUF_Q.exec(f.path);
    if (!m) continue;
    const name = m[1].toUpperCase().replace(/^FP16$/, 'F16');
    const g = groups.get(name) || { name, files: [], size: 0 };
    g.files.push(f.path); g.size += f.size; groups.set(name, g);
  }
  // Vision projector: prefer F16, then BF16, then the smallest.
  const rank = (f) => (/f16/i.test(f.path) && !/bf16/i.test(f.path) ? 0 : /bf16/i.test(f.path) ? 1 : 2);
  const proj = mm.sort((a, b) => rank(a) - rank(b) || a.size - b.size)[0];
  return [...groups.values()].map((g) => ({
    name: g.name, format: 'gguf', files: g.files.sort(), size: g.size, ...(proj ? { mmproj: proj.path } : {}),
  }));
}
export function mlxQuant(id, files) {
  const st = files.filter((f) => f.path.endsWith('.safetensors'));
  if (!st.length || /(^|[-_])MTP([-_]|$)/i.test(id)) return []; // MTP repos are draft heads, not models
  const n = id.split('/')[1];
  const bits = /(\d+)\s*-?bit/i.exec(n);
  const name = bits ? `${bits[1]}bit` : /mxfp4|nvfp4|fp8/i.exec(n)?.[0].toLowerCase() || (/bf16/i.test(n) ? 'bf16' : /fp16/i.test(n) ? 'fp16' : 'mlx');
  const keep = files.filter((f) => /\.(safetensors|json|txt|jinja|model)$/.test(f.path) && !f.path.includes('/'));
  const size = st.reduce((a, f) => a + f.size, 0);
  if (size < 50e6) return [];
  return [{ name, format: 'mlx', files: keep.map((f) => f.path).sort(), size }];
}
const ONNX_DT = /_(fp16|q4f16|q4|int8|uint8|bnb4|quantized|q8|fp32)$/;
export function onnxQuants(files) {
  const on = files.filter((f) => /\.onnx(_data(_\d+)?)?$/.test(f.path));
  if (!on.length) return [];
  const groups = new Map();
  const stem = (p) => basename(p).replace(/\.onnx(_data(_\d+)?)?$/, '');
  const merged = new Set(on.filter((f) => /merged/.test(f.path)).map((f) => stem(f.path).replace(/_merged.*/, '')));
  for (const f of on) {
    const s = stem(f.path);
    // A merged decoder replaces decoder_model / decoder_with_past_model.
    if (!/merged/.test(s) && /decoder(_with_past)?_model/.test(s) && [...merged].some((p) => s.startsWith(p.replace(/_model$/, '')) || /decoder/.test(p))) continue;
    const dt = ONNX_DT.exec(s)?.[1] || 'fp32';
    const name = dt === 'quantized' ? 'int8' : dt;
    const g = groups.get(name) || { name, files: [], size: 0 };
    g.files.push(f.path); g.size += f.size; groups.set(name, g);
  }
  const small = files.filter((f) => !f.path.includes('/') && /\.(json|txt|model)$/.test(f.path));
  return [...groups.values()].map((g) => ({
    name: g.name, format: 'onnx', files: [...small.map((f) => f.path), ...g.files].sort(), size: g.size + small.reduce((a, f) => a + f.size, 0),
  }));
}

export function bestFor(q) {
  const need = q.ram_est ?? q.size * 1.2 + 0.4 * GB; // fit spec fallback
  const out = [];
  if (need <= 3.2 * GB) out.push('phone');
  if (need <= 12 * GB) out.push('laptop');
  else out.push('workstation');
  if (q.format === 'onnx' && q.size <= 2 * GB) out.push('browser');
  return out;
}
const mask = (b) => b.reduce((a, c) => a | BIT[c], 0);

// ---- main -----------------------------------------------------------------------------------------------
function main() {
  const rows = {};
  for (const n of readdirSync(join(ROOT, 'catalog', 'rows'))) if (n.endsWith('.json')) { const r = readJSON(join(ROOT, 'catalog', 'rows', n)); rows[r.id] = r; }
  const own = {}; // id -> quants
  let noSizes = 0, newest = '';
  for (const n of readdirSync(join(ROOT, 'manifests'))) {
    if (!n.endsWith('.json')) continue;
    const m = readJSON(join(ROOT, 'manifests', n));
    if (m.created_at > newest) newest = m.created_at;
    const files = (m.files || []).filter((f) => f.path);
    if (files.some((f) => !(f.size > 0))) noSizes++;
    files.splice(0, files.length, ...files.filter((f) => f.size > 0));
    const [org] = m.id.split('/');
    const fmts = new Set(rows[m.id]?.formats || []);
    let qs = ggufQuants(files);
    if (org === 'mlx-community' || fmts.has('mlx') || /(^|[-_])mlx([-_]|$)/i.test(m.id)) qs = qs.concat(mlxQuant(m.id, files));
    qs = qs.concat(onnxQuants(files));
    if (!qs.length) continue;
    own[m.id] = qs.map((q) => ({ ...q, engine: ENGINE[q.format] })).sort((a, b) => a.size - b.size || a.name.localeCompare(b.name));
  }

  // Siblings: a quant/format repo points at its base model (row.base_model or relation.parent), else a unique name match.
  const norm = (id) => id.split('/')[1].toLowerCase().replace(/[-_.](gguf|mlx|onnx|awq|gptq|\d+-?bit|[iu]?q\d[a-z0-9_]*|bf16|fp16|fp8|int[48]|web|quantized)\b/g, '').replace(/[-_.](gguf|mlx|onnx|\d+bit)$/g, '');
  const byNorm = new Map();
  for (const r of Object.values(rows)) if (!own[r.id] && r.tier !== 'variant') { const k = norm(r.id); byNorm.set(k, [...(byNorm.get(k) || []), r.id]); }
  const sib = {};
  for (const id of Object.keys(own)) {
    const r = rows[id] || {};
    let base = r.base_model || r.relation?.parent;
    if (!base || !rows[base] || base === id) {
      const c = (byNorm.get(norm(id)) || []).filter((x) => x !== id);
      base = c.length === 1 ? c[0] : null;
    }
    if (!base || !rows[base]) continue;
    (sib[base] ||= []).push(id);
  }
  const dl = (id) => rows[id]?.signals?.downloads_30d || 0;
  const entries = {};
  for (const [id, qs] of Object.entries(own)) entries[id] = [...qs];
  const siblings = {};
  for (const [base, ids] of Object.entries(sib)) {
    ids.sort((a, b) => dl(b) - dl(a) || a.localeCompare(b));
    siblings[base] = ids.map((id) => ({ id, formats: [...new Set(own[id].map((q) => q.format))] }));
    const have = new Set((entries[base] || []).map((q) => q.engine + '/' + q.name));
    for (const id of ids) for (const q of own[id]) {
      const k = q.engine + '/' + q.name;
      if (have.has(k)) continue;
      // Base entries carry the mainstream GGUF quants only; every quant stays on its own repo's entry.
      if (q.format === 'gguf' && !MAINSTREAM.test(q.name)) continue;
      have.add(k);
      (entries[base] ||= []).push({ ...q, repo: id });
    }
  }
  const out = {};
  for (const id of Object.keys(entries).sort()) {
    const quants = entries[id].map((q) => ({ ...q, best_for: bestFor(q) }))
      .sort((a, b) => a.format.localeCompare(b.format) || a.size - b.size || a.name.localeCompare(b.name));
    out[id] = { quants: quants.map(({ name, format, engine, files, size, best_for, repo, mmproj }) => ({ name, format, engine, files, size, best_for, ...(repo ? { repo } : {}), ...(mmproj ? { mmproj } : {}) })),
      device_formats: [...new Set(quants.map((q) => q.format))] };
  }

  // ---- _recommended: curated allowlist, validated ------------------------------------------------------
  const src = readJSON(join(ROOT, 'catalog', 'overlay', 'device-recommended.src.json'));
  const rec = {}, bad = [];
  for (const c of CLASSES) {
    rec[c] = [];
    for (const id of src[c] || []) {
      const r = rows[id], e = out[id];
      if (DENY.test(id) || DENY.test(r?.display_name || '')) bad.push(`${c}: ${id} matches the denylist`);
      else if (!r) bad.push(`${c}: ${id} not in catalog`);
      else if (r.license_class !== 'permissive') bad.push(`${c}: ${id} licence_class ${r.license_class}`);
      else if (!e) bad.push(`${c}: ${id} has no device data`);
      else if (!e.quants.some((q) => GOOD.test(q.name) && q.best_for.includes(c))) bad.push(`${c}: ${id} has no 4-bit-or-better quant that fits ${c}`);
      else rec[c].push(id);
    }
  }
  if (bad.length) { console.error('device-recommended.src.json invalid:\n  ' + bad.join('\n  ')); process.exit(1); }

  const meta = { generated_at: newest, source: 'scripts/build_device_overlay.mjs', ram_est: 'omitted (no config in manifests)' };
  writeFileSync(join(ROOT, 'catalog', 'overlay', 'device.json'), JSON.stringify({ _meta: meta, _recommended: rec, ...out }, null, 0) + '\n');
  writeFileSync(join(ROOT, 'catalog', 'overlay', 'device-siblings.json'), JSON.stringify({ _meta: meta, ...Object.fromEntries(Object.entries(siblings).sort()) }) + '\n');

  const byEngine = {};
  let nq = 0, viaSibling = 0;
  for (const e of Object.values(out)) for (const q of e.quants) { nq++; byEngine[q.engine] = (byEngine[q.engine] || 0) + 1; if (q.repo) viaSibling++; }
  console.log(`device overlay: rows total ${Object.keys(rows).length}, rows with device data ${Object.keys(out).length} (own ${Object.keys(own).length}, base entries via siblings ${Object.keys(out).length - Object.keys(own).length})`);
  console.log(`  quants ${nq}: ${Object.entries(byEngine).map(([k, v]) => `${k} ${v}`).join(', ')}; via sibling repo ${viaSibling}`);
  console.log(`  manifests with entries lacking per-file sizes: ${noSizes}`);
  console.log(`  recommended: ${CLASSES.map((c) => `${c} ${rec[c].length}`).join(', ')}`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
