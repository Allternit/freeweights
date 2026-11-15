# mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant of [XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B), a distillation of the Qwen3.5 9B architecture. Sensitive layers are kept at 8-bit and robust ones at 4-bit, rather than crushing everything to a uniform width.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit | 134 |
| Layers at 4-bit | 116 |
| Bits per weight | 6.34 |
| Size on disk | 6.77 GB (from ~18 GB bf16) |
| Group size | 64 |

## How the bit-widths were chosen

Honestly stated, because it differs from most OptiQ quants: **the per-layer
allocation was not measured on this model.** It was transferred from
[mlx-community/Qwen3.5-9B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit),
whose allocation came from a KL-divergence sensitivity pass over a six-domain
calibration mix (prose, reasoning, code, agent, tool-call, instructions).

That transfer is sound here because the two models share an architecture
exactly — `qwen3_5`, 32 layers with 8 full-attention and 24 linear-attention,
16 heads, 4 KV heads, head_dim 256, hidden 4096, vocab 248,320 — so every
layer in the recipe has a counterpart with the same role and shape. All **250
tensors matched with none unmatched**, which is the check that matters: an
unmatched tensor would silently fall back to flat 4-bit and make this a
uniform quant wearing a mixed-precision name.

What sensitivity measures is how much a layer's *role in the architecture*
suffers from precision loss. What it cannot know is whether this model's own
training moved that sensitivity around. If you are quantizing your own
fine-tune and want the allocation measured against it, run
`optiq convert` and let the sweep do it.

## What was verified

- 250/250 tensors matched the recipe, 0 unmatched.
- Generation compared against the **bf16 parent on identical prompts** — factual recall, arithmetic with working shown, an iterative Fibonacci implementation, and a technical explanation. The answers agree; the quant runs 2.4–7× faster.
- OptiQ's release contract (artifact layout, metadata, mixed-precision assertions).

**Not run for this model:** the six-metric Capability Score. The published
scores for the Qwen3.5-9B quant describe *that* model, not this one, and are
not claimed here.

## Use it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit
```

Or with `mlx-lm` directly:

```python
from mlx_lm import generate, load

model, tokenizer = load("mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Explain write-ahead logging in two sentences."}],
    add_generation_prompt=True, tokenize=False)
print(generate(model, tokenizer, prompt=prompt, max_tokens=256))
```

The per-layer bit map is in `optiq/metadata.json` and in the `quantization`
block of `config.json`.
