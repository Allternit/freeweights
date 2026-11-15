# mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, prune, fine-tune, and serve LLMs locally on Apple Silicon. [All OptiQ models](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**12.8 GB instead of 21.9 GB. 11.7 GB of memory to run.**

| | Parent | This model | |
|---|---|---|---|
| On disk | 21.9 GB | **12.8 GB** | −42% |
| Parameters | 35.1B | **18.8B** | −47% |


50% of the routed experts are removed from [mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit); active parameters per token are unchanged, since top-8 routing is preserved and only the stored expert bank shrinks. That is why it gets smaller without getting slower.

Retained experts are copied bit-for-bit from the parent quant. Nothing is dequantized, re-quantized, merged, or retrained.

**This variant was not separately benchmarked.** It is published under the recipe validated end to end on [Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B), the same architecture at the same 50 % retention: Capability Score 80.03 -> 76.57, with the loss concentrated in MMLU (-21.4) and procedural ability intact (GSM8K +2.6, IFEval +4.3, BFCL -1.0, HumanEval -1.3).

Two things *were* measured on this checkpoint. The ranking rule was chosen by scoring both candidates against the unpruned model, which picked the conditional mean. And the resulting divergence from the unpruned parent is **KL 0.067** — for reference, the checkpoints that degrade visibly under pruning measure above 1.0, and this one is well inside the range where generation is indistinguishable in review.

## Details

| Property | Value |
|---|---|
| Experts retained | 128 of 256 per layer |
| Active experts per token | 8 (unchanged) |
| Allocation | uniform (128 of 256 in every layer) |
| Size | 12.8 GB (parent 21.9 GB) |
| Parameters | 18.8B (parent 35.1B) |
| Selection | REAP — mean of router weight x expert output norm, over the tokens each expert served |
| Calibration | optiq six-domain mix, 8 samples |
| MTP sidecar | absent |

## Use it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B
```

```python
from mlx_lm import load, generate
model, tok = load("mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B")
print(generate(model, tok, prompt="Hello", max_tokens=64))
```

## Method

Expert pruning follows **REAP** (Cerebras Research, ICLR 2026 — [*REAP the Experts: Why Pruning Prevails for One-Shot MoE Compression*](https://arxiv.org/abs/2510.13999)). Experts are ranked by the conditional mean of router weight × expert output norm over calibration data; the lowest-ranked are removed and the router is sliced to match.

OptiQ applies it **in the quantized domain** — directly on a quantized checkpoint, with no BF16 parent and no dequantization of survivors — via `optiq prune-experts`. See the [pruning docs](https://mlx-optiq.com/docs/prune).

