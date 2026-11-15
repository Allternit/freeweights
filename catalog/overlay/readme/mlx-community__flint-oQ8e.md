# flint-oQ8e

[Recursive Flint](https://huggingface.co/RecursiveSI/flint) (40B total, ~2.5B active per token) quantized for Apple Silicon with [oMLX](https://github.com/jundot/omlx)'s oQ8e: data-driven mixed precision with imatrix-calibrated clipping.

- **42.3 GB** on disk (~8.50 bpw), down from 79.6 GB bf16. Peak memory while generating: ~42.4 GB at short context, ~43.9 GB at 16k.
- MoE: 49 layers (2 dense + 47 MoE), 256 routed experts with top-6 + 1 shared expert. 35 sliding-window (513 tokens) + 14 full-attention layers, 262k context.
- **Loads in oMLX and mlx-vlm ≥ 0.7.10** (see [Runtime](#runtime)).
- Quantized and tested on a MacBook Pro M5 Max 128GB 40 GPU.

The highest-fidelity variant: perplexity within 0.03 of bf16 at about half its size. It needs a 64 GB Mac and generates ~12% slower than oQ4e.

## Quantization

oQ level 8, enhanced (`oQ8e`), group size 64, affine. The allocator measured each layer's sensitivity on the bf16 weights and keeps every tensor at 8 bits, so at this level there is nothing left for it to trade between layers. The "e" adds an imatrix pass (128 calibration samples) that picks the clipping range of each group by activation importance; it doesn't change which tensor gets how many bits, only the scales inside them.

On oQ4e I also tried group size 128 for every tensor. It saved 1.2 GB but lost everything the imatrix bought (mean KL 0.263 vs 0.222) and wasn't faster, so every variant uses 64.

Built with oMLX `e2396c7` (2026-10-27). Output is standard MLX affine quantization: no custom kernels needed to load it.

## Fidelity vs bf16

How closely each variant tracks the bf16 model's next-token distribution, measured over 64 × 2048-token chunks (65,472 scored positions, second half of each chunk), KL truncated to the bf16 top-256.

| Model | Size | bpw | mean KL ↓ | median KL ↓ | perplexity ↓ | top-1 agreement ↑ |
|---|---|---|---|---|---|---|
| [bf16](https://huggingface.co/RecursiveSI/flint) | 79.6 GB | 16 | 0 (ref.) | — | 14.30 | 100% |
| [**flint-oQ8e**](https://huggingface.co/mlx-community/flint-oQ8e) (this repo) | 42.3 GB | 8.50 | **0.038** | **0.010** | **14.33** | **92.3%** |
| [flint-oQ6e](https://huggingface.co/mlx-community/flint-oQ6e) | 32.8 GB | 6.60 | 0.051 | 0.019 | 14.34 | 90.3% |
| [flint-oQ5e](https://huggingface.co/mlx-community/flint-oQ5e) | 28.1 GB | 5.65 | 0.089 | 0.042 | 14.38 | 86.2% |
| [flint-oQ4e](https://huggingface.co/mlx-community/flint-oQ4e) | 23.4 GB | 4.70 | 0.222 | 0.122 | 14.86 | 78.3% |
| [flint-oQ3e](https://huggingface.co/mlx-community/flint-oQ3e) | 18.5 GB | 3.71 | 0.650 | 0.411 | 16.92 | 64.6% |
| [flint-oQ2.7e](https://huggingface.co/mlx-community/flint-oQ2.7e) | 16.2 GB | 3.26 | 1.140 | 0.788 | 22.38 | 55.3% |
| [flint-oQ2.5e](https://huggingface.co/mlx-community/flint-oQ2.5e) | 15.5 GB | 3.11 | 1.242 | 0.873 | 23.42 | 53.7% |
| [flint-oQ2e](https://huggingface.co/mlx-community/flint-oQ2e) | 13.9 GB | 2.80 | 1.519 | 1.081 | 28.99 | 50.2% |

The corpus is English prose from oMLX's bench set, which isn't guaranteed disjoint from oQ's calibration data. That makes the numbers good for ranking these variants against each other, not as a held-out quality score. Truncating to top-256 drops ~0.9% of the probability mass and biases KL slightly low for every row alike. I haven't run task benchmarks yet.

## Speed

Generation tok/s, greedy decode, 256 tokens, median of 3 runs, oMLX's fused Flint decode path enabled, MacBook Pro M5 Max 128GB 40 GPU.

| Variant | ~30-token context | 4k | 16k | Peak memory |
|---|---|---|---|---|
| **oQ8e** (this repo) | 110 | 103 | 95 | 42.4–43.9 GB |
| oQ6e | 108 | 96 | 87 | 32.9–34.4 GB |
| oQ5e | 103 | 97 | 91 | 28.2–29.7 GB |
| oQ4e | 120 | 110 | 105 | 23.5–25.0 GB |
| oQ3e | 109 | 106 | 98 | 18.5–20.0 GB |
| oQ2.7e | 123 | 112 | 105 | 16.3–17.8 GB |
| oQ2.5e | 117 | 106 | 99 | 15.6–17.1 GB |
| oQ2e | 130 | 124 | 113 | 14.0–15.5 GB |

Each variant was timed against oQ4e in the same session; across sessions the absolute numbers drift by up to ~10%, so read differences under that as noise. Below oQ4e, fewer bits buy memory but not speed: at ~2.5B active parameters, decode is mostly bound by kernel-launch overhead. Above it, oQ5e, oQ6e and oQ8e are 5–15% slower.

## Runtime

oQ quantizes Flint through mlx-vlm's model class, so the weights are stored under a `language_model.` prefix. oMLX and mlx-vlm load them as-is; mlx-lm's own `flint` model expects unprefixed names.

oMLX ships a fused MoE routing/combine kernel for one-token Flint decode, worth ~16% generation speed in my runs on oQ4 (~108 → ~125 tok/s at short context). It's on by default in oMLX builds from 2026-10-27 onward.

## Usage

**oMLX** (recommended): download the repo and it shows up as `mlx-community--flint-oQ8e`. The server exposes an OpenAI-compatible API with tool calls and returns reasoning in `reasoning_content`.

```bash
hf download mlx-community/flint-oQ8e
omlx serve
```

**mlx-vlm**:

```bash
pip install -U "mlx-vlm>=0.7.10"
mlx_vlm.generate --model mlx-community/flint-oQ8e \
  --prompt "Write a Python function that merges overlapping intervals." \
  --max-tokens 4096 --temperature 1.0
```

Recursive recommends temperature 1.0, top-p 0.95, top-k 20, and an output budget of at least 32k tokens for hard problems, since reasoning and answer share it. Keep the returned reasoning in the conversation history across turns. The chat template is the upstream one, unchanged.

See the [original model card](https://huggingface.co/RecursiveSI/flint) for training, evaluations, and limitations.

## License

[Apache 2.0](LICENSE), same as the [original weights](https://huggingface.co/RecursiveSI/flint). Flint is developed by [Recursive](https://www.recursive.com); this repo only changes the weight precision. Recursive's hosted API terms are separate from the weight license.
