# mlx-community/Groot-19B-A3B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon. [All OptiQ models](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant of [GrootTeam/Groot-19B-A3B-261023](https://huggingface.co/GrootTeam/Groot-19B-A3B-261023), a reasoning model post-trained from Qwen3.6-35B-A3B. It has 128 routed experts per layer and activates 8 per token. Text, tool calling and image input all work.

| | |
|---|---|
| On disk | 13.5 GB, including the 0.9 GB vision tower and 0.3 GB MTP head (source BF16 38.9 GB) |
| Parameters | 19B total, about 3B active per token |
| Precision | 118 tensors at 4-bit, 394 at 8-bit, vision tower at bf16 |
| Capability Score | 78.37 |

## Benchmarks

Six-metric Capability Score, the mean of MMLU, GSM8K, IFEval, BFCL, HumanEval and HashHop, measured on a 24 GB M4 with mlx-optiq 0.8.0. The comparison column is from the card of [Qwen3.6-35B-A3B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit), the model Groot was post-trained from, measured with an earlier mlx-optiq version.

| Metric | This model | Qwen3.6-35B-A3B-OptiQ-4bit | Δ |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 samples) | **70.6%** | 83.7% | -13.1 |
| GSM8K (1000 samples) | **94.4%** | 87.9% | +6.5 |
| IFEval (full set, strict) | **77.1%** | 72.6% | +4.5 |
| BFCL-V3 simple (200 calls) | **92.5%** | 92.5% | 0.0 |
| HumanEval (164 problems, pass@1) | **89.6%** | 91.5% | -1.9 |
| HashHop (long-context retrieval) | **46.0%** | 52.0% | -6.0 |
| **Capability Score** (mean of 6) | **78.37** | 80.03 | **-1.66** |

At 13.5 GB against 23.0 GB, it scores 1.66 lower than the 35B quant. It also scores 1.80 above [Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B) (76.57), the pruned quant of about the same size.

## How it was made

The per-layer bit allocation is reused from [Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B), which has the same 128-expert layout. All 512 tensors matched. No sensitivity sweep was run on this checkpoint. The KV config was measured on this model.

## Use it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/Groot-19B-A3B-OptiQ-4bit
```

```python
from mlx_lm import load, generate
model, tok = load("mlx-community/Groot-19B-A3B-OptiQ-4bit")
print(generate(model, tok, prompt="Hello", max_tokens=64))
```
