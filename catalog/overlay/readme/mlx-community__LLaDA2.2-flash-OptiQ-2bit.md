# LLaDA2.2-flash-OptiQ-2bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to
> quantize, fine-tune, and serve LLMs locally on Apple Silicon (no PyTorch, no
> cloud). [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ
> quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

An [OptiQ](https://mlx-optiq.com) mixed-precision MLX quant of
**LLaDA2.2-flash**, a ~100B **diffusion** language model with a 256-routed-expert
sparse MoE. This is an extreme 2-bit build.

- **Mixed 2/4-bit `static` build** — per-layer bit-widths assigned to a 2.5
  target bits-per-weight.
- **192 GB bf16 to 36 GB on disk** (5.3x).

## Requirements

Needs `optiq >= 0.4.4`, which ships the vendored `llada2_moe` decoder (the
256-expert diffusion MoE) and the block-diffusion decode loop. Stock `mlx-lm`
has no `llada2_moe` arch and cannot load or generate from this repo.

```bash
pip install -U optiq
```

## Running it

LLaDA2 is a masked-diffusion model, not autoregressive — it denoises a canvas
block by block. `optiq serve` detects the arch and routes it through OptiQ's
vendored decoder and the block-diffusion decode loop automatically:

```bash
optiq serve --model mlx-community/LLaDA2.2-flash-OptiQ-2bit
```

Then call the OpenAI-compatible endpoint at `http://localhost:8000/v1`, or use
it from the [OptiQ Lab](https://mlx-optiq.com/docs/lab/) and `optiq code`.
