# mlx-community/gpt-oss-20b-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A sensitivity-driven **mixed-precision 4-bit** MLX quant of OpenAI's [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b), produced by [mlx-optiq](https://mlx-optiq.com/). OptiQ measures each layer's quantization sensitivity and assigns per-layer bit-widths (4 or 8) under a target budget, instead of quantizing every layer to the same width.

gpt-oss ships natively in MXFP4 (its experts are already 4-bit). That makes a naive uniform-4-bit re-quantization unusually lossy, since it compounds error on top of weights that are already at the 4-bit floor. OptiQ keeps the layers that matter at 8-bit, so it recovers most of what uniform-4 drops.

## Capability Score

Six-benchmark mean (MMLU, GSM8K, IFEval, BFCL, HumanEval, HashHop), measured against a **genuine uniform-4-bit** baseline built from the same weights.

| Benchmark | OptiQ-4bit | uniform-4 | Δ |
|---|---|---|---|
| MMLU (5-shot) | 54.7 | 38.0 | **+16.7** |
| GSM8K | 83.0 | 74.3 | **+8.7** |
| IFEval (strict) | 61.9 | 55.3 | **+6.7** |
| BFCL (simple) | 70.5 | 59.5 | **+11.0** |
| HumanEval (pass@1) | 82.9 | 76.8 | **+6.1** |
| HashHop (multi-hop retrieval) | 78.0 | 19.0 | **+59.0** |
| **Capability Score** | **71.84** | **53.81** | **+18.03** |

OptiQ wins all six. The largest gap is **HashHop** (long-context multi-hop retrieval), where uniform-4 collapses to 19% while OptiQ holds 78%: uniform 4-bit erodes the long-range attention precision that retrieval depends on, and OptiQ's mixed precision keeps those layers at 8-bit.

## What it is

| Property | Value |
|---|---|
| Base | openai/gpt-oss-20b (24-layer MoE, 32 experts, 4 active per token, attention sinks) |
| Method | OptiQ mixed-precision (per-layer sensitivity, 4/8-bit knapsack) |
| Bit allocation | 33 layers @ 4-bit, 88 @ 8-bit |
| Achieved bits-per-weight | 5.03 |
| On disk | 11 GB |
| Resident while running | ~11.6 GB |

## Run it

gpt-oss needs **mlx-lm** and **`import optiq`** (keep it for the rest of the toolkit):

```bash
pip install -U mlx-optiq "mlx-lm @ git+https://github.com/ml-explore/mlx-lm.git"
```

```python
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler

model, tok = load("mlx-community/gpt-oss-20b-OptiQ-4bit")
prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Explain mixed-precision quantization in one sentence."}],
    tokenize=False, add_generation_prompt=True, reasoning_effort="low",
)
print(generate(model, tok, prompt=prompt, max_tokens=512, sampler=make_sampler(temp=0.7)))
```

gpt-oss is a reasoning model using the **harmony** response format: it emits an `analysis` channel before a `final` channel. Pass `reasoning_effort` (`"low"`, `"medium"`, `"high"`) to control how much it reasons, and read the answer from the `final` channel.

Serve it with the OptiQ Lab + OpenAI-compatible API:

```bash
optiq serve --model mlx-community/gpt-oss-20b-OptiQ-4bit
```

## Notes

- **No KV-cache quantization.** gpt-oss uses attention sinks, which mlx-lm's quantized-SDPA path does not support, so this quant ships without a `kv_config.json`. Weight quantization (the OptiQ result above) is unaffected.
- This is a **weight-only** quant; it loads under stock `mlx-lm` as a standard `gpt_oss` model.
- The full method is described at [mlx-optiq.com/docs](https://mlx-optiq.com/docs/).
