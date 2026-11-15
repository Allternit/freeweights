# mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, prune, fine-tune, and serve LLMs locally on Apple Silicon. [All OptiQ models](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**13.8 GB instead of 23.0 GB. 11.6 GB of memory to run instead of 24.5 GB. Capability Score 76.57 against the parent's 80.03.**

| | Parent | This model | |
|---|---|---|---|
| On disk | 23.0 GB | **13.8 GB** | −40% |
| Peak memory | 24.5 GB | **11.6 GB** | −53% |
| Parameters | 35.1B | **18.8B** | −47% |
| Decode | 47.0 | **54.7** | |
| Capability Score | 80.03 | **76.57** | -3.47 |

50% of the routed experts are removed from [mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit); active parameters per token are unchanged, since top-8 routing is preserved and only the stored expert bank shrinks. That is why it gets smaller without getting slower.

Retained experts are copied bit-for-bit from the parent quant. Nothing is dequantized, re-quantized, merged, or retrained.

## What pruning costs

| Benchmark | Parent | This model | Δ |
|---|---|---|---|
| MMLU | 83.7 | 62.3 | -21.4 |
| GSM8K | 87.9 | 90.5 | +2.6 |
| IFEval | 72.6 | 76.9 | +4.3 |
| BFCL-V3 | 92.5 | 91.5 | -1.0 |
| HumanEval | 91.5 | 90.2 | -1.3 |
| HashHop | 52.0 | 48.0 | -4.0 |
| **Capability Score** | **80.03** | **76.57** | **-3.47** |



## Details

| Property | Value |
|---|---|
| Experts retained | 128 of 256 per layer |
| Active experts per token | 8 (unchanged) |
| Allocation | uniform (128 of 256 in every layer) |
| Size | 13.8 GB (parent 23.0 GB) |
| Parameters | 18.8B (parent 35.1B) |
| Selection | REAP — mean of router weight × expert output norm, over the tokens each expert served |
| Calibration | optiq six-domain mix, 8 samples |
| MTP sidecar | absent |

## Use it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
```

```python
from mlx_lm import load, generate
model, tok = load("mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B")
print(generate(model, tok, prompt="Hello", max_tokens=64))
```

## Method

Expert pruning follows **REAP** (Cerebras Research, ICLR 2026 — [*REAP the Experts: Why Pruning Prevails for One-Shot MoE Compression*](https://arxiv.org/abs/2510.13999)). Experts are ranked by the conditional mean of router weight × expert output norm over calibration data; the lowest-ranked are removed and the router is sliced to match.

OptiQ applies it **in the quantized domain** — directly on a quantized checkpoint, with no BF16 parent and no dequantization of survivors — via `optiq prune-experts`. See the [pruning docs](https://mlx-optiq.com/docs/prune).

