import path from 'node:path';
import { esc } from '../lib/util.mjs';
import { later } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';

export function build() {
  const engines = [['Allternit Tune (our fork)', 'training'], ['Upstream Unsloth (unmodified)', 'training'], ['Axolotl', 'training'], ['TRL + PEFT', 'training'], ['LLaMA-Factory', 'training'], ['torchtune', 'training'], ['mlx-lm', 'training on Mac'], ['Allternit engine', 'local inference'], ['llama.cpp', 'local inference'], ['MLX', 'local inference'], ['Ollama', 'local inference'], ['vLLM', 'server inference'], ['SGLang', 'server inference']];
  page({ path: '/studio/', nav: 'studio', file: 'studio/index.html', title: 'Studio status', desc: 'Freeweights Studio: fine-tuning and running open models. Honest status per engine.', body: `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.studio</div>
  <h1 class="ph1">Freeweights Studio</h1>
  <p class="lead">Studio fine-tunes and runs Freeweights models on your computer, a paired computer or a Compute box, from one job file for every engine. It arrives in Phase 3. Until then this page shows the honest status of each engine.</p>
  <div style="margin-top:16px;max-width:520px">${later('Fine-tune in Freeweights Studio', 'Phase 3')}</div>
</div>
<div class="wrap sec">
  <h2 class="h2">Engines</h2>
  <div class="box" style="margin-top:14px"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Engine</th><th>Kind</th><th>Status</th></tr></thead><tbody>${engines.map((e) => `<tr><td style="font-weight:600">${esc(e[0])}</td><td>${esc(e[1])}</td><td class="sub">Not started</td></tr>`).join('')}</tbody></table></div></div>
</div>` });
}
