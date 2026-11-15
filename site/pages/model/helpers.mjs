import { ORIGIN } from '../../lib/env.mjs';
import { esc, fmtBytes, plural } from '../../lib/util.mjs';
import { LISTED, manifests, modelUrl } from '../../lib/catalog.mjs';
import { dir } from '../../lib/data.mjs';
import { isData } from '../../lib/rows.mjs';
import { VARIANTS } from '../../lib/paging.mjs';
import { LOGO_OWNER, TOOL_ROLE, runsWith } from '../../lib/cards.mjs';
import { listRow } from '../../lib/list.mjs';
import { page } from '../../lib/registry.mjs';

export function useSnippets(r) {
  const m = r.manifest || {}; const files = m.files || []; const commit = (m.upstream && m.upstream.commit) || '';
  const has = (n) => files.some((f) => f.path === n); const t = r.tasks[0] || '';
  const env = `<span class="k">HF_ENDPOINT</span>=${ORIGIN}`;
  const out = [];
  if (r.manifest) out.push(['fw.py', 'Checks the signature and every sha256, tries each source in order, resumes.', `<span class="c">$ </span>python3 fw.py get ${ORIGIN}/manifests/${esc(r.id)}.json --dir ./${esc(r.repo)}\n<span class="c">$ </span>python3 fw.py verify ./${esc(r.repo)} ./${esc(r.key)}.json`]);
  out.push(['hf', 'The Hugging Face CLI with one setting. Same repo id.', `<span class="c">$ </span>${env} hf download ${esc(r.id)}${commit ? ` --revision ${esc(commit)}` : ''} --local-dir ./${esc(r.repo)}`]);
  if (isData(r)) out.push(['datasets', 'Load it with the datasets library.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> datasets <span class="c">import</span> load_dataset\nds = load_dataset("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})`]);
  else if (r.formats.includes('safetensors') && has('config.json')) {
    const cls = t === 'text-generation' ? ['AutoModelForCausalLM', 'AutoTokenizer', 'tok'] : t === 'image-text-to-text' ? ['AutoModelForImageTextToText', 'AutoProcessor', 'processor'] : ['feature-extraction', 'sentence-similarity'].includes(t) ? ['AutoModel', 'AutoTokenizer', 'tok'] : null;
    if (t === 'automatic-speech-recognition') out.push(['transformers', 'Speech recognition with the transformers pipeline.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> transformers <span class="c">import</span> pipeline\nasr = pipeline("automatic-speech-recognition", model="${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})\nprint(asr("audio.wav")["text"])`]);
    else if (cls) out.push(['transformers', 'Load the weights in Python.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> transformers <span class="c">import</span> ${cls[0]}, ${cls[1]}\n${cls[2]} = ${cls[1]}.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})\nmodel = ${cls[0]}.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''}, device_map="auto")`]);
  }
  if (r.formats.includes('safetensors') && ['feature-extraction', 'sentence-similarity'].includes(t) && (has('modules.json') || has('sentence_bert_config.json'))) out.push(['sentence-transformers', 'Embed text with sentence-transformers.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> sentence_transformers <span class="c">import</span> SentenceTransformer\nmodel = SentenceTransformer("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})\nvectors = model.encode(["Hello"])`]);
  if (r.formats.includes('safetensors') && has('model_index.json') && /text-to-image|image-to-image/.test(t)) out.push(['diffusers', 'Run the pipeline with diffusers.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> diffusers <span class="c">import</span> DiffusionPipeline\npipe = DiffusionPipeline.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})`]);
  if (r.formats.includes('gguf') && r.wi && r.wi.first) {
    const inc = r.wi.variant.endsWith('/') ? r.wi.variant + '*' : r.wi.variant + '*';
    out.push(['llama.cpp', `Download one GGUF variant (${esc(r.wi.variant.replace(/\/$/, ''))}, ${fmtBytes(r.weight)}), then serve it.`, `<span class="c">$ </span>${env} hf download ${esc(r.id)} --include "${esc(inc)}" --local-dir ./${esc(r.repo)}\n<span class="c">$ </span>llama-server -m ./${esc(r.repo)}/${esc(r.wi.first)}`]);
    out.push(['Ollama', 'Make an Ollama model from the downloaded file.', `<span class="c">$ </span>printf 'FROM ./${esc(r.repo)}/${esc(r.wi.first)}\\n' &gt; Modelfile\n<span class="c">$ </span>ollama create ${esc(r.repo.toLowerCase().replace(/[^a-z0-9.-]+/g, '-'))} -f Modelfile`]);
  }
  if (r.formats.includes('safetensors') && has('config.json') && ['text-generation', 'image-text-to-text'].includes(t)) out.push(['vLLM', 'Serve an OpenAI-compatible API.', `<span class="c">$ </span>${env} vllm serve ${esc(r.id)}${commit ? ` --revision ${esc(commit)}` : ''}`]);
  if (r.formats.includes('mlx') && t === 'text-generation') out.push(['mlx-lm (Python)', 'Load and generate from Python on Apple silicon.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> mlx_lm <span class="c">import</span> load, generate\nmodel, tokenizer = load("${esc(r.id)}")\nprint(generate(model, tokenizer, prompt="Hello"))`]);
  if (r.formats.includes('mlx')) out.push(['MLX', 'Run on Apple silicon with mlx-lm.', `<span class="c">$ </span>pip install mlx-lm\n<span class="c">$ </span>${env} mlx_lm.generate --model ${esc(r.id)} --prompt "Hello"`]);
  return out;
}
export function toolChip(tr) { const lg = LOGO_OWNER(tr); return `<a class="tchip" href="${modelUrl(tr)}">${lg ? `<img class="org" src="${lg}" alt="" width="16" height="16" loading="lazy" decoding="async">` : ''}${esc(tr.name)}</a>`; }
export const REL_LABEL = { quant: 'Quantized', adapter: 'Adapter', finetune: 'Fine-tune', merge: 'Merge', base: 'Base' };
export function variantNote(r) {
  const p = r.relation && r.relation.parent; const base = p && LISTED.find((x) => x.id === p);
  return base ? `<p class="sub small variant-of">${esc(REL_LABEL[r.relation.type] || 'Variant')} of <a class="link" href="${modelUrl(base)}">${esc(base.name)}</a>.</p>` : '';
}
export function variantsHtml(r) {
  const vs = VARIANTS[r.id]; if (!vs || !vs.length) return '';
  const MAXV = 60; const shown = vs.slice(0, MAXV);
  return `<div class="wrap sec" id="variants"><div class="sec-h"><h2 class="h2">Variants</h2>${vs.length > MAXV ? `<a class="more" href="/alt.freeweights/?q=${encodeURIComponent(r.repo)}">All ${vs.length} →</a>` : ''}</div>
<p class="sub" style="margin:6px 0 10px">${plural(vs.length, 'quantized or adapter build')} of ${esc(r.name)}. Each has its own license check and page.</p>
<div class="view-list variants"><div class="list-h"><span>Subject</span><span class="r">Size</span><span class="r">Params</span><span>License</span><span>Date</span></div>${shown.map((v) => listRow(v, false)).join('')}</div></div>`;
}
// "Works with" section: one tab per job. Order and labels live here, in one place.
const WW_TABS = [['runs', 'Run'], ['trains', 'Fine-tune'], ['converts', 'Convert'], ['evals', 'Evaluate'], ['scans', 'Scan'], ['uses', 'Apps']];
const WW_CAP = 12;
// Fit first: a tool gated on this model's own format/task (works_with.match, or formats + tasks both matched) outranks a
// tool that only needs one of them; ties go to GitHub stars. Nothing here widens what toolFits already allows.
const wwFit = (tr) => { const w = tr.tool.works_with || {}; return w.match ? 3 : w.formats && w.tasks ? 2 : 1; };
const wwStars = (tr) => (tr.tool.github && tr.tool.github.stars) || 0;
const wwSort = (a, b) => wwFit(b) - wwFit(a) || wwStars(b) - wwStars(a) || a.name.localeCompare(b.name);
export function runsWithHtml(r) {
  const tools = runsWith(r); if (!tools.length) return '';
  const tabs = WW_TABS.map(([k, label]) => [k, label, tools.filter((t) => t.tool.works_with.role === k).sort(wwSort)]).filter(([, , g]) => g.length);
  const fmt = (r.formats || []).join(', ');
  const tile = (tr) => { const lg = LOGO_OWNER(tr); return `<a class="wt" href="${modelUrl(tr)}">${lg ? `<img class="org" src="${lg}" alt="" width="20" height="20" loading="lazy" decoding="async">` : `<span class="wt-m" aria-hidden="true">${esc(tr.mono)}</span>`}<span class="wt-n">${esc(tr.name)}</span></a>`; };
  return `<section class="ww" aria-labelledby="ww-h" data-ww><h2 class="ww-h" id="ww-h">Works with</h2>
<div class="ww-tabs" role="tablist" aria-label="Works with">${tabs.map(([k, label, g], i) => `<a class="ww-tab" role="tab" href="#ww-${k}" id="ww-t-${k}" aria-controls="ww-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}<span class="ww-c">${g.length}</span></a>`).join('')}</div>
${tabs.map(([k, label, g], i) => `<div class="ww-panel" role="tabpanel" id="ww-${k}" aria-labelledby="ww-t-${k}"${i ? ' data-off' : ''}><h3 class="ww-ph">${TOOL_ROLE[k][0]}</h3>${k === 'runs' && fmt ? `<p class="ww-note">Ranked by fit to this model (${esc(fmt)}), then by GitHub stars.</p>` : ''}<div class="ww-grid">${g.slice(0, WW_CAP).map(tile).join('')}</div>${g.length > WW_CAP ? `<details class="ww-more"><summary>Show all ${g.length}</summary><div class="ww-grid">${g.slice(WW_CAP).map(tile).join('')}</div></details>` : ''}</div>`).join('')}</section>`;
}
