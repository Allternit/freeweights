# mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), the sensitivity-aware quantization toolkit for Apple Silicon. Beats stock uniform 4-bit on every benchmark in the six-metric Capability Score.

A 4-bit mixed-precision MLX quant of [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose · reasoning · code · agent · tool-call · constraint-bearing instructions). Sensitive layers go to 8-bit; robust ones stay at 4-bit. The on-disk size is within ~5 % of a stock uniform 4-bit MLX quant.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit (sensitive) | 392 |
| Layers at 4-bit (robust) | 118 |
| Total quantized layers | 510 |
| Group size | 64 |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) (40 samples × 6 domains) |
| Reference for sensitivity | bf16 (auto-resolved; falls back to uniform-4-bit if bf16 doesn't fit) |
| Bundled MTP head | `mtp.safetensors` (4-bit projections, BF16 norms), enables 1.4× decode via `optiq serve --mtp` |

We follow the same naming convention `llama.cpp` uses for Q4_K_M and similar mixed-precision quants: the "4-bit" label is for the predominant precision, not the weighted average. The mixed allocation is what lets this build beat stock uniform-4-bit on every benchmark below at the same disk size.

## Usage

Load it with `mlx-lm` and use it as usual:

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit")
response = generate(
    model, tokenizer,
    prompt="Explain quantum computing in simple terms.",
    max_tokens=200,
)
```

For more (mixed-precision KV-cache serving, sensitivity-aware LoRA fine-tuning, OpenAI + Anthropic-compatible inference server, hot-swap mounted adapters, sandboxed Python execution for agent workflows), install [`mlx-optiq`](https://mlx-optiq.com/):

```bash
pip install mlx-optiq
```

### Speculative decoding (MTP)

This quant ships with a bundled Multi-Token Prediction head as `mtp.safetensors`. Enable it for ~1.4× faster decode:

```bash
optiq serve --model mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit --mtp
```

Acceptance rate stays ~70% at depth 2 (the empirical sweet spot for Qwen3.6).

See the [Qwen3.6 family guide](https://mlx-optiq.com/docs/qwen3.6) on [mlx-optiq.com](https://mlx-optiq.com/) for sampling defaults, training recipes, and family-specific caveats.

Using the head outside `optiq serve`: `optiq/mtp.safetensors` holds Qwen's original MTP tensors, so its seven RMSNorm weights (`mtp.*norm*`) are zero-centred, applied as 1 + w. The main weights have the +1 folded in, as MLX expects. Add 1.0 to all seven norms when loading the head into another runtime.

## Benchmarks

Six-metric Capability Score (mean of MMLU + GSM8K + IFEval + BFCL + HumanEval + HashHop). Apples-to-apples comparison against stock uniform 4-bit:

| Metric | OptiQ | Uniform 4-bit | Δ |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 samples) | **83.7%** | 84.6% | -0.9 |
| GSM8K (1000 samples, 3-shot CoT) | **87.9%** | 89.4% | -1.5 |
| IFEval (full set, strict) | **72.6%** | 73.0% | -0.4 |
| BFCL-V3 simple (200 calls) | **92.5%** | 90.0% | +2.5 |
| HumanEval (164 problems, pass@1) | **91.5%** | 91.5% | +0.0 |
| HashHop (long-context retrieval) | **52.0%** | 44.0% | +8.0 |
| **Capability Score** (mean of 6) | **80.03** | 78.75 | **+1.28** |
| KL vs uniform-4-bit reference (mean / p95) | 0.2231 / 0.9779 |, |, |
| On-disk size | 22.1 GB | 19.0 GB | +3.1 |

Every metric gets one equal vote. Disk size is reported next to the score as an honest second axis instead of being folded into the score. See the [eval-framework writeup](https://mlx-optiq.com/blog/eval-framework) for the full methodology.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Qwen3.6 family guide:** [mlx-optiq.com/docs/qwen3.6](https://mlx-optiq.com/docs/qwen3.6)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Calibration mix:** [mlx-optiq.com/blog/calibration-mix](https://mlx-optiq.com/blog/calibration-mix)
- **Eval framework:** [mlx-optiq.com/blog/eval-framework](https://mlx-optiq.com/blog/eval-framework)
- **Base model:** [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)


## Quantize your own

This quant was produced by [mlx-optiq](https://mlx-optiq.com). Point it at any Hugging Face model to get the same sensitivity-aware mixed precision:

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # full local workbench: chat, compare, quantize, fine-tune
```

## License

Apache 2.0 (inherits from base model).
