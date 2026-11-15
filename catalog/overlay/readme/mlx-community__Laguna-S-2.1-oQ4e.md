# Laguna-S-2.1-oQ4e

Calibrated 4-bit MLX quantization of [poolside/Laguna-S-2.1](https://huggingface.co/poolside/Laguna-S-2.1)
(118B total, 8B activated per token), produced with [oMLX](https://github.com/jundot/omlx) oQ at
level 4 enhanced — **4.60 bits/weight effective**, 64 GB on disk. Data-driven mixed precision:
bits are allocated per tensor from an imatrix-calibrated sensitivity map, not a fixed rule.
For Apple Silicon.

- **64 GB** on disk, down from 235 GB BF16
- 48 layers, 47 of them MoE with 256 routed experts + 1 shared, top-10 (L0 is a dense MLP);
  interleaved attention (12 global with YaRN to 1M context, 36 sliding-window 512)
- Peak memory in my tests: **60.4 GB** at 1k context, 63.5 GB at 64k — fits a 96 GB Mac
- Converted and tested on a **Macbook Pro M5 Max 128GB 40 GPU**

## Requirements

mlx-lm doesn't support the `laguna` architecture yet — there's an open PR:
[mlx-lm#1223](https://github.com/ml-explore/mlx-lm/pull/1223). Until it lands, use **mlx-vlm**
(0.6.3+), which implements laguna as a text-only model:

```bash
uvx --from mlx-vlm mlx_vlm.generate --model mlx-community/Laguna-S-2.1-oQ4e --prompt "..."
```

oMLX serves it directly from **0.5.3** on — it vendors that PR and patches it into mlx-lm at
import, so no model setting is needed. On earlier builds, discovery decides between the mlx-lm and
mlx-vlm loaders by looking for a vision sub-config, and laguna has none — so it lands on mlx-lm and
fails with `Model type laguna not supported`. Set **`model_type_override: "vlm"`** in the model's
settings, then refresh discovery (`omlx restart`): the load failure is cached per entry until the
next discovery pass, so setting the override alone won't clear it.

## Quantization

oQ4e allocates bits per tensor from an importance-matrix calibration pass over calibration data.
The 4-bit base lands on the experts; the dense spine — attention, embeddings, `lm_head`, routers,
386 tensors in total — came out mixed, 284 at 8 bits, 1 at 6 and 101 at 5. Output is standard MLX
affine quantization — no custom kernels or runtime required.

## How it was quantized

oQ at level 4 enhanced — imatrix-calibrated, group size 128. I had to patch omlx to route laguna
through the mlx-vlm loader. At 235 GB the model doesn't fit in 128 GB of RAM, so calibration ran
against a uniform 4-bit proxy on disk rather than the FP weights, which shifts the bit allocation
slightly.

## Conversion check

Smoke-tested after conversion with `mlx_vlm.generate`: coherent — solved `17 * 24 = 408`, broke it
down by the distributive property and verified the result a second way, no repetition loop.

## Performance

Measured with oMLX's benchmark harness on a **Macbook Pro M5 Max 128GB 40 GPU**, single request,
128 generated tokens:

| prompt | gen tok/s | prefill tok/s | TTFT ms | peak GB |
|---|---|---|---|---|
| 1k | 55.9 | 1087.7 | 942 | 60.40 |
| 4k | 56.6 | 1075.7 | 3809 | 60.55 |
| 8k | 55.7 | 946.9 | 8653 | 60.74 |
| 16k | 53.5 | 865.4 | 18934 | 61.11 |
| 32k | 48.0 | 812.1 | 40352 | 61.90 |
| 64k | 39.8 | 722.4 | 90717 | 63.52 |

Continuous batching at 1k prompt / 128 generated:

| batch | tg tok/s | speedup | TTFT ms | E2E s |
|---|---|---|---|---|
| 1 | 55.9 | 1.00x | 942 | 3.24 |
| 2 | 79.5 | 1.42x | 2577 | 5.80 |
| 4 | 106.8 | 1.91x | 4186 | 9.06 |
| 8 | 144.6 | 2.59x | 5708 | 14.35 |

## Benchmarks & Variants

mmlu_pro, mathqa and winogrande, n=300 seeded samples each, thinking off, identical questions across
every variant. The bf16 row is the hosted API, measured the same way. Standard error at this n is
around 2.5 points, so oQ4e through oQ6e aren't separated by this run.

![Accuracy vs bits per weight, three benchmarks, n=300](ladder.png)

| Variant | Size | bpw | gen tok/s (1k → 64k) | mmlu_pro | mathqa | winogrande |
|---|---|---|---|---|---|---|
| [Laguna-S-2.1-oQ2e-fast](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ2e-fast) | 35 GB | 2.60 | 78.8 → 48.6 | 0.700 | 0.850 | 0.713 |
| [Laguna-S-2.1-oQ2e](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ2e) | 36 GB | 2.70 | 61.5 → 38.8 | 0.703 | 0.840 | 0.707 |
| [Laguna-S-2.1-oQ3e-fast](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ3e-fast) | 49 GB | 3.56 | 77.2 → 48.4 | 0.750 | 0.887 | 0.760 |
| [Laguna-S-2.1-oQ3e](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ3e) | 49 GB | 3.59 | 67.5 → 40.1 | 0.750 | 0.880 | 0.760 |
| [Laguna-S-2.1-oQ4e-fast](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ4e-fast) | 63 GB | 4.54 | 69.3 → 45.5 | 0.787 | 0.873 | 0.777 |
| [**Laguna-S-2.1-oQ4e**](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ4e) (this repo) | 64 GB | 4.60 | 55.9 → 39.8 | 0.757 | 0.887 | 0.777 |
| [Laguna-S-2.1-oQ5e](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ5e) | 78 GB | 5.30 | 57.5 → 38.1 | 0.773 | 0.883 | 0.797 |
| [Laguna-S-2.1-oQ6e](https://huggingface.co/mlx-community/Laguna-S-2.1-oQ6e) | 92 GB | 6.27 | 53.0 → 32.9 | 0.763 | 0.873 | 0.777 |
| [Laguna S 2.1 (API, bf16)](https://openrouter.ai/poolside/laguna-s-2.1) | — | 16 | — | 0.773 | 0.880 | 0.810 |

Treat this as a rough sighting, not a verdict. Three benchmarks at n=300 cover a narrow slice of what
the model does — no long-context work, no agentic loops, no real code — and at this sample size most
of the ladder above 3.6 bpw sits inside the error bars. I ran them to size the drop between levels,
not to rank the variants against each other. Test the one you're considering on your own workload
before trusting any of it.

## Usage

```bash
# mlx-vlm — plain mlx-lm doesn't support the laguna architecture
uvx --from mlx-vlm mlx_vlm.generate --model mlx-community/Laguna-S-2.1-oQ4e \
  --prompt "Explain Bayes' theorem in two sentences." --max-tokens 300

# oMLX — discovers the model from the HF cache; set model_type_override: "vlm" first
omlx serve
```

## License

[OpenMDW-1.1](https://huggingface.co/poolside/Laguna-S-2.1/blob/main/LICENSE.md), inherited from
the base model. Refer to the original model card for architecture, benchmarks, and intended use.
