import { esc } from './util.mjs';
import { isData } from './rows.mjs';
import { codeBlock } from './layout.mjs';

// Where each action goes. Plain links, no tracking parameters.
export const API_BASE = 'https://api.allternit.com/v1';
export const CONSOLE_URL = 'https://platform.allternit.com/';
// The console's own Cloud page links here to create an inference key (CloudPage.tsx KEY_PATH).
export const CONSOLE_KEY_URL = 'https://platform.allternit.com/api-keys?create=inference';
export const AI_URL = 'https://ai.allternit.com/';
export const COMPUTE_URL = 'https://compute.allternit.com/';
export const SERVICES_URL = 'https://services.allternit.com/';
// "Run at home" shows for hosted rows that fit this many bytes (the biggest Compute box).
export const COMPUTE_MAX_BYTES = 96 * 1e9;
const STUDIO_TASKS = /^(text-generation|image-text-to-text|text2text-generation|feature-extraction|sentence-similarity|text-classification|token-classification|fill-mask|question-answering|summarization|translation|conversational)$/;

// Does the model fit a Compute box? Order: overlay device.quants (catalog/overlay/device.json, may be absent):
// yes when the memory any quant needs (ram_est, else the C1 rule in scripts/build_device_overlay.mjs needOf)
// is within COMPUTE_MAX_BYTES. Not best_for "workstation": that means "needs more than 12 GB", no upper bound.
// Without it, the smallest runnable weights from the manifest: the smallest .gguf file, else the sum of the
// .safetensors files. catalog total_size is not used, it adds every quant in a repo.
// Same as scripts/build_device_overlay.mjs needOf (spec/on-device/fit.md): webgpu/onnx size x 1.2, native + 0.4 GB.
const quantNeed = (q) => Number(q.ram_est) > 0 ? Number(q.ram_est) : Number(q.size) > 0 ? (q.engine === 'webgpu' || q.format === 'onnx' ? q.size * 1.2 : q.size * 1.2 + 0.4e9) : 0;
export function fitsCompute(r) {
  const q = r.overlay && r.overlay.device && r.overlay.device.quants;
  if (Array.isArray(q) && q.length) {
    return q.some((x) => { const n = x && quantNeed(x); return n > 0 && n <= COMPUTE_MAX_BYTES; });
  }
  const files = (r.manifest && r.manifest.files) || [];
  const gguf = files.filter((f) => /\.gguf$/i.test(f.path) && f.size > 0).map((f) => f.size);
  const bytes = gguf.length ? Math.min(...gguf) : files.filter((f) => /\.safetensors$/i.test(f.path)).reduce((a, f) => a + (f.size || 0), 0);
  return bytes > 0 && bytes <= COMPUTE_MAX_BYTES;
}

export const chatUrl = (cloud) => `${AI_URL}?model=${encodeURIComponent(cloud.model)}`;
export const studioUrl = (r) => `${AI_URL}?view=model-lab&model=${encodeURIComponent(r.id)}`;

// Which actions apply to row r, in display order.
export function actionsFor(r) {
  const cloud = r.overlay && r.overlay.cloud || null;
  const hosted = !r.linkOnly && r.kind !== 'tool' && !isData(r);
  return {
    cloud: hosted && cloud ? cloud : null,
    chat: hosted && cloud ? chatUrl(cloud) : null,
    studio: hosted && (r.tasks || []).some((t) => STUDIO_TASKS.test(t)) ? studioUrl(r) : null,
    home: hosted && fitsCompute(r) ? COMPUTE_URL : null,
    help: SERVICES_URL,
  };
}

export const curlSnippet = (cloud) => `<span class="c">$ </span>curl ${API_BASE}/chat/completions \\\n  -H "Authorization: Bearer $ALLTERNIT_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${esc(cloud.model)}", "messages": [{"role": "user", "content": "Hello"}]}'`;

export function actionBar(r) {
  const a = actionsFor(r);
  // Exactly one primary button: the first action that applies (Run, else Chat, Fine-tune, Run at home, Get help).
  const items = [
    a.cloud && [CONSOLE_KEY_URL, 'Run with Allternit Cloud'],
    a.chat && [a.chat, 'Chat with it'],
    a.studio && [a.studio, 'Fine-tune in Studio'],
    a.home && [a.home, 'Run at home'],
    [a.help, 'Get help'],
  ].filter(Boolean);
  const btns = items.map(([href, label], i) => `<a class="btn${i === 0 ? ' pri' : ''}" href="${esc(href)}" rel="noopener">${label}</a>`).join('');
  const cloud = a.cloud ? `<div class="fw-actions-cloud"><p class="sub small">This model is served on Allternit Cloud as <b class="mono">${esc(a.cloud.model)}</b>${a.cloud.via_parent ? ' (the original model it was made from)' : ''}. Get a key in the <a class="link" href="${CONSOLE_KEY_URL}" rel="noopener">console</a>, then call the OpenAI-compatible API.</p>${codeBlock('cloud-curl', curlSnippet(a.cloud))}</div>` : '';
  return `<div class="fw-actions" role="group" aria-label="Use this model">${btns}</div><p class="sub small fw-actions-help">Get help: custom fine-tune or private deploy. We review your setup before we quote.</p>${cloud}`;
}
