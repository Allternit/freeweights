# KAT-Coder-V2.5-Dev-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to
> quantize, fine-tune, and serve LLMs locally on Apple Silicon (no PyTorch, no
> cloud). [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ
> quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

An [OptiQ](https://mlx-optiq.com) mixed-precision MLX quant of
**KAT-Coder-V2.5-Dev**, a `qwen3_5_moe` coding model (256-routed-expert sparse
MoE with hybrid linear + full attention).

- **Mixed 4/8-bit `static` build** — per-layer bit-widths assigned to a 4.5
  target bits-per-weight: 400 projections at 4-bit, 111 at 8-bit.
- **~4.51 bits per weight**, 20 GB on disk.

## Requirements

```bash
pip install -U optiq
```

`qwen3_5_moe` loads under stock `mlx-lm` too, but `optiq serve` adds mixed-
precision loading, KV-cache quantization, and the OptiQ Lab.

## Running it

```bash
optiq serve --model mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit
```

Then use the OpenAI-compatible endpoint at `http://localhost:8000/v1`, the
[OptiQ Lab](https://mlx-optiq.com/docs/lab/), or point `optiq code` at it. This
is a reasoning coder — it thinks before it answers.
