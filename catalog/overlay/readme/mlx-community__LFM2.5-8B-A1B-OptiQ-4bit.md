# mlx-community/LFM2.5-8B-A1B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/) · [LFM2.5 family](https://mlx-optiq.com/docs/lfm2.5)

An OptiQ mixed-precision quant of [LiquidAI/LFM2.5-8B-A1B](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B), the sparse mixture-of-experts member of the LFM2.5 family. 5.46 GB on disk, down from 15.8 GB at bf16, with a 128k context.

LFM2.5-8B-A1B pairs the family's hybrid backbone — convolutional blocks interleaved with full attention, so only a few blocks carry a KV cache — with 32 routed experts and 4 active per token. OptiQ measures each layer's sensitivity and assigns per-layer bit-widths across both.

## What it is

| Property | Value |
|---|---|
| Base | [LiquidAI/LFM2.5-8B-A1B](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B) |
| Architecture | `lfm2_moe` — hybrid conv + attention, 24 layers, 32 experts, 4 active |
| Method | OptiQ mixed-precision, sensitivity-driven (uniform-4-bit reference) |
| On disk | 5.46 GB (bf16: 15.8 GB) |
| Context | 128k |

The routed experts carry most of the parameters and mostly tolerate 4-bit: 60 of the 66 fused expert projections land there, with 6 kept at 8-bit alongside attention, the router and the layer edges.

## Capability Score

Six-metric mean, the standard OptiQ eval.

| Metric | Score |
|---|---:|
| MMLU (5-shot, 969 samples) | 46.1% |
| GSM8K (1000 samples) | 54.6% |
| IFEval (full set, strict) | 32.9% |
| BFCL-V3 simple (200 calls) | 45.0% |
| HumanEval (164 problems, pass@1) | 14.0% |
| HashHop (long-context retrieval) | 0.0% |
| **Capability Score** (mean of 6) | **32.11** |

Grade-school maths is the strongest result here and the best in the family. Coding, world knowledge and long-context multi-hop retrieval are the weak spots.

## Run it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/LFM2.5-8B-A1B-OptiQ-4bit
```

That gives you an OpenAI and Anthropic compatible endpoint with mixed-precision KV cache, tool-call healing and prompt caching.

Liquid's recommended sampling for LFM2.5 is `temperature 0.1`, `top_k 50`, `repetition_penalty 1.1`. Those ship in `generation_config.json` in this repo and `optiq serve` applies them automatically, so you get the publisher's settings without passing any flags.

Or from Python:

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/LFM2.5-8B-A1B-OptiQ-4bit")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Extract every date from this email."}],
    add_generation_prompt=True, tokenize=False,
)
print(generate(model, tokenizer, prompt=prompt, max_tokens=512))
```

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [LiquidAI/LFM2.5-8B-A1B](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B)
