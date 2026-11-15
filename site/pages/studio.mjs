import path from 'node:path';
import { esc } from '../lib/util.mjs';
import { later } from '../lib/layout.mjs';
import { page } from '../lib/registry.mjs';

export function build() {
  // Decision 1 hardware ids. None has been run by Allternit yet, so every row says so (decision 6).
  const hardware = [['Apple silicon (Mac)', 'MLX for LoRA and QLoRA; PyTorch MPS for full fine-tune and DPO'], ['NVIDIA on Linux', 'PyTorch CUDA'], ['NVIDIA on Windows', 'PyTorch CUDA'], ['AMD on Linux', 'PyTorch ROCm'], ['Intel GPU on Linux or Windows', 'PyTorch XPU'], ['CPU (also AMD on Windows and Intel Macs)', 'PyTorch CPU: LoRA only, small models, slow']];
  const engines = [['Allternit Tune (our fork)', 'training'], ['Upstream Unsloth (unmodified)', 'training'], ['Axolotl', 'training'], ['TRL + PEFT', 'training'], ['LLaMA-Factory', 'training'], ['torchtune', 'training'], ['mlx-lm', 'training on Mac'], ['Allternit engine', 'local inference'], ['llama.cpp', 'local inference'], ['MLX', 'local inference'], ['Ollama', 'local inference'], ['vLLM', 'server inference'], ['SGLang', 'server inference']];
  page({ path: '/studio/', nav: 'studio', file: 'studio/index.html', title: 'Studio status', desc: 'Freeweights Studio: fine-tuning and running open models. Honest status per engine.', body: `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.studio</div>
  <h1 class="ph1">Freeweights Studio</h1>
  <p class="lead">Studio fine-tunes and runs Freeweights models from one job file for every engine. Training runs on your own computer: Apple, NVIDIA, AMD, Intel or CPU. It arrives in Phase 3. Until then this page shows the honest status of each engine and each kind of hardware.</p>
  <div style="margin-top:16px;max-width:520px">${later('Fine-tune in Freeweights Studio', 'Phase 3')}</div>
</div>
<div class="wrap sec">
  <h2 class="h2">Hardware</h2>
  <p class="sub" style="margin-top:6px;max-width:640px">Before a run, Studio checks your computer and tells you in plain words if a method or output is not available on it. Speed, memory use and results depend on your hardware and the model.</p>
  <div class="box" style="margin-top:14px"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Hardware</th><th>Backend</th><th>Status</th></tr></thead><tbody>${hardware.map((h) => `<tr><td style="font-weight:600">${esc(h[0])}</td><td>${esc(h[1])}</td><td class="sub">Not yet tested by Allternit on this hardware</td></tr>`).join('')}</tbody></table></div></div>
</div>
<div class="wrap sec">
  <h2 class="h2">Engines</h2>
  <div class="box" style="margin-top:14px"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Engine</th><th>Kind</th><th>Status</th></tr></thead><tbody>${engines.map((e) => `<tr><td style="font-weight:600">${esc(e[0])}</td><td>${esc(e[1])}</td><td class="sub">Not started</td></tr>`).join('')}</tbody></table></div></div>
</div>` });
}
