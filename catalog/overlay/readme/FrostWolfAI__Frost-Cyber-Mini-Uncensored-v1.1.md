# Frost Cyber Mini Uncensored v1.1

**By Vatsal Bajpai ([@xblack](https://huggingface.co/xblack)) · [FrostWolfAI Labs](https://huggingface.co/FrostWolfAI).**

<a href="https://buymeacoffee.com/vatsalbajpai"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="136" alt="Buy me a coffee"></a>

<sub>Everything here is released openly. If it's useful to you and you'd like to support more open-source work on AI, a coffee goes a long way — entirely optional.</sub>

A compact cybersecurity and software-engineering assistant from FrostWolfAI Labs, for security testing, CTI, secure coding and agentic tool-use workflows. It is a full LoRA SFT fine-tune of [Spark-X2.6-4B-abliterated](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated), with the adapters merged into the weights.

> **v1.1 public release.** Benchmarked — see [Benchmarks](#benchmarks). GGUF builds are available in the [GGUF repo](https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF).

## What's in this revision

v1.1 now includes an **additional agentic fine-tuning phase** on top of the cybersecurity SFT. This phase trains the model to follow a full agentic tool-use loop — read the task, inspect with tools, act, observe each tool result, recover from errors, and give a final answer — rather than emitting one-shot answers. The base cyber/CTI/secure-coding knowledge from the first SFT phase is retained. Training/loss curves for both phases are in [Training](#training).

## Benchmarks

Evaluated in **thinking mode** (native), `temperature 0.0`, greedy single-sample, served as Q8_0 GGUF via llama.cpp at 232k context.

> ⚠️ **Always run this model with thinking enabled.** With thinking disabled it degrades severely — it echoes JSON instead of answering. Non-think scores are invalid for this model.

### Cyber knowledge

| Benchmark | **Frost v1.1** | Notes |
|---|---|---|
| CyberMetric-80 | **85.00%** (68/80) | 0 parse failures |
| CyberMetric-500 | **84.80%** (424/500) | stable ~85% throughout the run |
| CTIBench cti-mcq (500-Q sample) | **58.20%** (291/500) | sampled from the 2,500-question set |
| CTIBench cti-rcm (CVE→CWE) | **66.60%** (666/1000) | full set, 0 errors |
| CTIBench cti-vsp (CVSS v3.1) | **MAD 1.54** | 869/1000 answered, exact vector 24% |
| CTIBench cti-ate (ATT&CK extraction) | **F1 13.8%** | micro-P 9.1% / R 28.7% |
| CTIBench cti-taa (threat actor attribution) | **6.00%** (3/50) | strict exact-name match |

### General reasoning

| Benchmark | Score | Reference |
|---|---|---|
| GPQA Diamond (partial, 198 Q) | 34.1% (41/198) | random = 25%, non-expert human = 34%, PhD expert = 65% |

**Agentic benchmarks** (Terminal-Bench 2.1/4.0, DeepSWE, AutomationBench) are queued — results will be added to this card as they land.

**Takeaways:** strong cyber knowledge (CyberMetric ~85%) and CVE→CWE mapping (66.6%, GPT-4 territory) with solid CVSS severity estimation (MAD 1.54); extraction/attribution-style CTI tasks (ATE, TAA) are the weak spot — the agentic training makes the model emit tool calls on those prompt shapes instead of answering. Thinking mode is mandatory for this model.

## Model

| | |
|---|---|
| Base | FrostWolfAI/Spark-X2.6-4B-abliterated (Heretic abliteration of XHToken/Spark-X2.6-4B) |
| Architecture | `Spark2_5ForCausalLM` (custom code, 36 layers, hidden size 2560) |
| Weights | BF16, about 4.1B parameters, 8.2 GB |
| Context | 131,072 native (served at up to 232k with RoPE, see below) |
| Requires | `transformers` v5 and `trust_remote_code=True` |

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

repo = "FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1"
tok = AutoTokenizer.from_pretrained(repo, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(repo, dtype=torch.bfloat16, device_map="cuda", trust_remote_code=True)
prompt = tok.apply_chat_template([{"role": "user", "content": "Who are you?"}], add_generation_prompt=True, tokenize=False, enable_thinking=True)  # keep thinking ON — see Benchmarks
x = tok(prompt, return_tensors="pt", add_special_tokens=False).to(model.device)
print(tok.decode(model.generate(**x, max_new_tokens=200)[0][x.input_ids.shape[1]:], skip_special_tokens=True))
```

## Reasoning / thinking control

The chat template supports a thinking channel. Control it per request with `reasoning_effort`:

- `off` / `none` / `false` / `0` — thinking disabled, direct answer. **Not recommended for this model** — it was trained with thinking and degrades severely without it (see [Benchmarks](#benchmarks)).
- `low` (default) and `high` — thinking enabled. On a 4B these behave very similarly; treat it as on/off in practice.

A **hard thinking-token ceiling** is enforced at the server, not the template (see `--reasoning-budget` below). A budget is a ceiling, not a target: it truncates runaway thinking but does not make the model think longer.

## Serving with llama.cpp (Windows)

GGUF builds are published in the [GGUF repo](https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF). Serve them with [llama.cpp](https://github.com/ggml-org/llama.cpp)'s `llama-server`. The custom `spark2_5` architecture is supported by llama.cpp's `convert_hf_to_gguf.py` converter.

The chat template must be supplied explicitly (`--chat-template-file`); it is included in this repo as `chat_template.jinja`.

```bat
REM Windows (cmd/PowerShell). Q8_0 GGUF, full 232k context, 2 unified-KV slots.
llama-server.exe ^
  -m Frost-Cyber-Mini-Uncensored-v1.1-Q8_0.gguf ^
  -ngl 99 ^
  -np 2 -kvu -c 232000 ^
  --host 127.0.0.1 --port 8080 ^
  -fa on -ctk q8_0 -ctv q8_0 ^
  -b 4096 -ub 2048 ^
  --jinja --chat-template-file chat_template.jinja ^
  --reasoning-budget 8192
```

Flag notes:

| Flag | Why |
|---|---|
| `-np 2 -kvu` | 2 parallel slots sharing a **unified** KV cache, so each slot can use the full `-c` window instead of `-c / n_slots`. Drop `-kvu` and each slot only gets half. |
| `-c 232000` | Context window. Native is 131k; 232k works via RoPE but validate quality past 131k for your use. |
| `-ctk q8_0 -ctv q8_0` | Quantized KV cache; keeps 232k affordable in VRAM. |
| `--reasoning-budget 8192` | Hard ceiling on thinking tokens (server-wide). `-1` = unlimited, `0` = no thinking. |

**Do not use DRY or other repetition-penalty samplers with this model for agentic coding.** They penalize repeated token sequences, but agentic coding requires reproducing file paths, identifiers and edit targets *byte-for-byte* — a repetition penalty mutates those verbatim strings (e.g. changes case, swaps an extension, inserts a space) and corrupts tool calls. If a small model falls into a repeat loop in your agent, break it at the client level (de-duplicate identical tool calls, cap steps per turn) and/or use a small sampling temperature (~0.3–0.4) rather than a sequence penalty.

VRAM, Q8_0 at 232k / 2 unified slots: about 12 GB. BF16 at the same settings: about 16 GB.

## Training

Two phases, both LoRA SFT with assistant-token-only loss, merged into the weights after training.

### Phase 1 — cybersecurity / CTI / secure-coding SFT

| Metric | Value |
|---|---|
| Epochs | 2 |
| Optimizer steps | 6,432 |
| Train rows | 178,976 |
| Validation rows | 1,816 |
| Tokens processed | 119.8M |
| Final validation loss | 0.8406 |
| Final validation token accuracy | 73.20% |
| Train loss / token acc (step 10 → 6430) | 1.6574 / 64.76% → 0.8552 / 77.61% |

Phase-1 validation curve:

| Step | Epoch | Val loss | Val token accuracy | Val entropy |
|---:|---:|---:|---:|---:|
| 100 | 0.03 | 1.1484 | 67.11% | 1.153 |
| 1600 | 0.50 | 0.9212 | 71.44% | 0.935 |
| 3200 | 1.00 | 0.8673 | 72.55% | 0.878 |
| 4800 | 1.49 | 0.8467 | 73.06% | 0.830 |
| 6432 | 2.00 | 0.8406 | 73.20% | 0.823 |

### Phase 2 — agentic tool-use fine-tuning

Continued from the Phase-1 weights on an internal set of agentic tool-use trajectories (not publicly released), trained whole-trace at a 16k window so the model learns the full loop in context.

| Metric | Value |
|---|---|
| Epochs | 3 |
| Optimizer steps | 168 |
| Sequence length | 16,384, wrapped packing |
| Learning rate | 1e-4, cosine |
| Batch | 1 × 8 grad accumulation (effective 8) |
| Final validation loss | **0.5489** |
| Final validation token accuracy | **85.41%** |
| Final validation entropy | 0.515 |

Phase-2 curve (validation at checkpoints, train at log steps):

| Step | Train loss | Train token acc | Val loss | Val token acc |
|---:|---:|---:|---:|---:|
| 10 | 0.8280 | 77.39% | — | — |
| 50 | 0.7145 | 78.30% | — | — |
| 100 | 0.7374 | 77.52% | 0.5829 | 84.68% |
| 150 | 0.6414 | 82.20% | — | — |
| 168 | ~0.65 | ~78% | **0.5489** | **85.41%** |

Validation loss tracked *below* train loss and improved monotonically to the end with no overfit — a clean learning signal for the agentic loop.

### Hyperparameters (both phases)

| | |
|---|---|
| Method | LoRA SFT with TRL, merged after training |
| Target modules | `q_k_v_proj`, `g_proj`, `out_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Phase-1 LoRA | r=32, alpha=64, dropout=0; LR 2e-4 cosine, 100 warmup; seq 2048 |
| Phase-1 batch | 2 × 16 grad accumulation (effective 32) |
| Loss | Assistant tokens only |
| Precision / optimizer | BF16, `adamw_torch_fused`, max grad norm 1.0 |
| Gradient checkpointing | On |
| Seed | 42 |
| Frameworks | Transformers 5.x, TRL 1.x, PEFT 0.21.x, PyTorch 2.6.0 |

## Intended use

For authorized security testing, research, defense and education. This model has its refusals removed, so you are responsible for how you use it and for following applicable law.
