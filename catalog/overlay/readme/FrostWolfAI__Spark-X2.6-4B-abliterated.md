# Spark-X2.6-4B-abliterated

**By Vatsal Bajpai** ([@xblack](https://huggingface.co/xblack)) at [FrostWolfAI](https://huggingface.co/FrostWolfAI).

<a href="https://buymeacoffee.com/vatsalbajpai"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="136" alt="Buy me a coffee"></a>

<sub>Everything here is released openly. If it's useful to you and you'd like to support more open-source work on AI, a coffee goes a long way — entirely optional.</sub>

A decensored variant of [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B), produced with
[Heretic](https://github.com/p-e-w/heretic) v2.0.0.dev0 using **Arbitrary-Rank Ablation (ARA)**.
Spark-X2.6's architecture is untouched - 36 layers in a 3:1 pattern of sliding-window (512) and global
attention, head-wise sigmoid attention gates, fused QKV, tied embeddings and the 1,048,576-token context -
along with its DeepSeek-style chat template, controllable thinking and `<tool_call>` format. Refusal
behaviour is suppressed with a low-rank weight edit to the attention output projections (`out_proj`) and
MLP down-projections of layers 9-19, not by fine-tuning.

**Who this is for:** local agents, coding and security research on a single consumer GPU or a laptop.
Spark-X2.6-4B is XHToken's post-trained 4B on-device model, built for coding, agentic tool use and
long-context work, with a configurable thinking budget (none / low / high). The abliteration removes
refusals; it does not add capability.

Refusals drop from **100/100 to 2/100** at a **KL divergence of 0.0177** - a tight edit with little drift
in phrasing or format on harmless prompts.

## Abliteration parameters

Trial 46 of a 60-trial Heretic v2 run (seed `2026102902`), modifier `heretic.modifiers.ara.ARA`.

| Parameter | Value |
| :-------- | :---: |
| **start_layer_index** | 9 |
| **end_layer_index** | 19 |
| **preserve_good_behavior_weight** | 0.8871 |
| **steer_bad_behavior_weight** | 0.0004 |
| **overcorrect_relative_weight** | 0.9891 |
| **neighbor_count** | 4 |

ARA settings were Heretic v2 defaults: LoRA rank 50, row magnitudes preserved
(magnitude-preserving orthogonal ablation), merged into the BF16 weights at export.

## Performance

| Metric | This model | Original model ([XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)) |
| :----- | :--------: | :---------------------------: |
| **KL divergence** | 0.0177 | 0 *(by definition)* |
| **Refusals** | 2/100 | 100/100 |

Heretic's numbers are measured on `mlabonne/harmful_behaviors` (`test[:100]`) for refusals and
`mlabonne/harmless_alpaca` (`test[:100]`) for first-token KL divergence, with the thinking block closed.
The base model refused every one of the 100 evaluation prompts; 98 of them now clear.

### Thinking on vs. off

Spark-X2.6 thinks by default, and a reasoning model can talk itself back into a refusal inside `<think>`.
We checked both modes on the first 40 held-out `harmful_behaviors` test prompts with greedy decoding:

| Mode | Refusals |
| :--- | :------: |
| `enable_thinking=False` (150 new tokens) | **0/40** |
| `enable_thinking=True` (1,200 new tokens) | **0/22** that finished reasoning *(18 were still thinking at the token cap)* |

Benign coding and explanation prompts stayed coherent and on-format in both modes.

## Why abliteration instead of fine-tuning

Fine-tuning a "helpful" persona on top of RLHF'd refusals fights the base model's training and tends to
degrade coherence. Abliteration instead finds and edits the specific weight directions responsible for
refusal, leaving the rest of the network (and its capabilities) untouched. Heretic v2's ARA goes beyond
classic single-direction ablation: it optimizes a low-rank edit that steers harmful-prompt activations
toward harmless ones while explicitly preserving behaviour on harmless prompts, which handles refusal
spread over several directions. See the [Heretic repo](https://github.com/p-e-w/heretic) and the
[original abliteration writeup](https://huggingface.co/blog/mlabonne/abliteration) for the mechanism.

## Files

### Safetensors

| File | Size |
|---|---|
| `model-00001-of-00002.safetensors` | 4.97 GB |
| `model-00002-of-00002.safetensors` | 3.25 GB |

BF16, 4,112,079,360 parameters (4.11B). The `reproduce/` directory carries the full Heretic recipe -
`config.toml`, `requirements.txt`, the Optuna study journal, `reproduce.json` and SHA-256 sums - so this
exact model can be regenerated. See [`reproduce/README.md`](reproduce/README.md).

### GGUF quantizations

Published separately at
**[FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF)**:
BF16 + 14 quants (Q2_K to Q8_0, IQ3_S, IQ4_XS; 44.53 GB total), each tested in `llama-server` for
thinking on/off and tool calls. Requires a llama.cpp build with `spark2_5` support.

```bash
llama-server -hf FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF:Q4_K_M --jinja -ngl 99 -fa on
```

## Quickstart

```python
# transformers >= 5 (the checkpoint ships custom code)
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "FrostWolfAI/Spark-X2.6-4B-abliterated"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name, device_map="auto", dtype="bfloat16", trust_remote_code=True
)

messages = [{"role": "user", "content": "Explain how a TLS 1.3 handshake works."}]
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    enable_thinking=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)
out = model.generate(
    **inputs, do_sample=True, temperature=1.0, top_p=0.95, top_k=0, max_new_tokens=4096
)
print(tokenizer.decode(out[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True))
```

> [!IMPORTANT]
> The upstream Spark-X2.6-4B code targets `transformers==4.57.1`. The `modeling_spark.py` shipped here is
> patched for **transformers 5.x** (tied-weights dict, `inputs_embeds` mask keyword, `hidden_states`
> output). It was tested with transformers 5.21.1. The weights are identical in layout to the original,
> so SGLang and vLLM recipes from the [base model card](https://huggingface.co/XHToken/Spark-X2.6-4B)
> apply unchanged.

### Generation parameters

XHToken's recommended settings (also in `generation_config.json`):
`temperature=1.0, top_p=0.95, top_k=0` (disabled), `repetition_penalty=1.0`.

### Chat template and thinking

Spark uses DeepSeek-style turn markers (`<｜start▁of▁sentence｜><|User|>...<|Bot|>`). Thinking is on by
default and arrives in a `<think>...</think>` block. Control it per request:

- `enable_thinking=False` - no reasoning, direct answer
- `reasoning_effort="low"` / `"high"` (default) - reasoning budget

With an OpenAI-compatible server, pass them via `"chat_template_kwargs"`, e.g. `{"enable_thinking": false}`.

### Tool use

Pass function schemas with `tools=...` to `tokenizer.apply_chat_template()`. Note that the template
requires `tool_calls[].function.arguments` as a **dict**, not a JSON string. Calls come back as:

```text
<tool_call>get_weather<arg_key>city</arg_key><arg_value>Paris</arg_value></tool_call>
```

Feed results back under a `tool` role; they are rendered inside `<tool_response>...</tool_response>`.
Servers: SGLang `--tool-call-parser spark25 --reasoning-parser qwen3`.

## Runs anywhere

| Device | Recommended format | Weights |
| :--- | :--- | :--- |
| RTX 3090 / 4090 / 5090 (24 GB+) | BF16 safetensors | 8.22 GB |
| RTX 3060 / 4060 (8-12 GB) | [GGUF](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF) Q6_K / Q8_0 | 3.4-4.4 GB |
| Laptop / Apple Silicon (16 GB) | [MLX 4-bit](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX) / [8-bit](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit), or [GGUF](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF) Q4_K_M | 2.3-2.6 GB |

Weights only. Three of every four layers use a 512-token sliding window, so the KV cache grows far more
slowly than in a pure global-attention 4B - but at the full 1M-token window it is still a server workload.

## Model details

| | |
|---|---|
| **Architecture** | `Spark2_5ForCausalLM` (`model_type: spark2_5`, custom code) |
| **Parameters** | 4.11B |
| **Layers** | 36: 27 sliding-window attention + 9 global attention (3:1 pattern) |
| **Attention** | 16 heads / 4 KV heads, head dim 256, fused QKV, head-wise sigmoid output gate |
| **Hidden / intermediate** | 2560 / 10240, GELU MLP |
| **Position embedding** | RoPE; global layers theta 5e6 with partial rotary 0.25, sliding layers theta 1e4 (full rotary) |
| **Sliding window** | 512 |
| **Context length** | 1,048,576 |
| **Vocab** | 131,072 |
| **Embeddings** | Tied (no separate `lm_head` tensor) |
| **Precision** | bfloat16 |
| **Languages** | English, Chinese |
| **Base model** | [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B) (commit `d1b5f26`) |

## Responsible use

Refusal suppression is deliberate and works as intended: this model will comply with requests the base
model would refuse, including some it should not. There is no safety filtering layered on top. You are
responsible for how you deploy it - don't put it behind an unmoderated public-facing endpoint serving
third parties. It inherits Spark-X2.6-4B's factual limitations; abliteration removes refusal directions,
it does not add capability or judgment.

> Made by **[Vatsal Bajpai](https://huggingface.co/xblack)** · **[FrostWolfAI](https://huggingface.co/FrostWolfAI)** -
> the uncensored base behind the upcoming Frost Cyber Mini 1.1.

## License

[Apache-2.0](LICENSE), inherited from [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B).

## Related

- [FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF) - GGUF quantizations for llama.cpp
- [FrostWolfAI/Spark-X2.6-4B-abliterated-MLX](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX) - 4-bit MLX for Apple silicon
- [FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit](https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit) - 8-bit MLX for Apple silicon
- [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B) - the post-trained base model
- [XHToken/Spark-X2.6-4B-Base](https://huggingface.co/XHToken/Spark-X2.6-4B-Base) - the pretrained checkpoint
- [p-e-w/heretic](https://github.com/p-e-w/heretic) - the abliteration tool
- [FrostWolfAI/Frost-Cyber-Mini-1.0](https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0) - our cybersecurity assistant

## Abliteration hardware

Recorded in `reproduce/reproduce.json`:

- **GPU:** NVIDIA GeForce RTX 4090 (23.99 GB VRAM), power-limited to 360 W
- **OS:** Windows 11 Pro
- **CUDA / driver:** CUDA 13.2, driver 617.42
- **Software:** PyTorch 2.15.0, Transformers 5.21.1, Heretic 2.0.0.dev0 (git `efb1be6`)

Heretic notes that KL-divergence and refusal numbers can vary slightly with hardware and library versions.
