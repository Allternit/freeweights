# mlx-community/gemma-4-26B-A4B-it-qat-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), built on Google's quantization-aware-trained (QAT) Gemma-4 base. This is the **sparse-MoE** member of the family: 26B total parameters with 128 routed experts (about 4B active per token). OptiQ's sensitivity-guided per-layer bit allocation is applied on top of weights already trained to survive low-bit quantization, and it still beats a uniform 4-bit quant of the same QAT base on the Capability Score.

This is a quant of [google/gemma-4-26B-A4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose, reasoning, code, agent, tool-call, constraint-bearing instructions). On this MoE the sensitivity pass identifies the routed experts as where precision matters most, so the allocation puts 8-bit on the experts that need it (42 of 90 expert tensors) plus the sensitive attention and router layers, and keeps the robust ones at 4-bit.

## Quantization details

| Property | Value |
|---|---|
| Base | google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (QAT, MoE) |
| Architecture | gemma4 · 128 experts, ~4B active per token |
| Predominant precision | 4-bit |
| Components at 8-bit (sensitive) | 275 |
| Components at 4-bit (robust) | 50 |
| Total quantized components | 325 |
| Expert tensors at 8-bit | 42 / 90 |
| Achieved bits-per-weight | 6.01 |
| Group size | 64 |
| Reference for sensitivity | uniform 4-bit (streamed) |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) |
| Vision | bf16 sidecar (`optiq_vision.safetensors`), image+text via optiq |
| Speculative drafter | [`google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant`](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant) via `optiq serve --drafter` |

## Capability Score

Six-metric mean (MMLU, GSM8K, IFEval, BFCL, HumanEval, HashHop), scored against a uniform 4-bit quant of the same QAT base. That comparison isolates what the mixed-precision allocation adds, holding the base fixed.

| Benchmark | This model (OptiQ, QAT base) | Uniform-4 (QAT base) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | **65.9%** | 64.3% | +1.6 |
| GSM8K (1000) | **90.3%** | 89.2% | +1.1 |
| IFEval (full, strict) | **74.1%** | 73.6% | +0.5 |
| BFCL-V3 simple (200) | **92.0%** | 93.0% | -1.0 |
| HumanEval (pass@1, 164) | 89.0% | **90.2%** | -1.2 |
| HashHop (long-context) | 35.0% | 35.0% | 0.0 |
| **Capability Score** (mean) | **74.40** | 74.21 | **+0.19** |

The gain concentrates in the reasoning-heavy benchmarks (MMLU +1.6, GSM8K +1.1, IFEval +0.5), which is where the routed experts carry the most signal. On this sparse-MoE base, where most of the parameters live in 128 experts, the precision has to reach the experts to move capability, and the per-layer allocation puts it there. The mixed quant is 6.01 bits-per-weight (about 19 GB on disk) versus 4.0 bits-per-weight (about 14.5 GB) for uniform 4-bit.

## Usage

This is a Gemma-4 MoE (`model_type: gemma4`, `gemma4_text` experts), so it needs **mlx-lm from main** and **`import optiq`** (the MoE text tower is not in the 0.31.3 PyPI release; the main build also reports `0.31.3`, so install from git, not a version pin):

```bash
pip install -U mlx-optiq "mlx-lm @ git+https://github.com/ml-explore/mlx-lm.git"
```

```python
import optiq  # registers the OptiQ model paths
from mlx_lm import load, generate
model, tokenizer = load("mlx-community/gemma-4-26B-A4B-it-qat-OptiQ-4bit")
print(generate(model, tokenizer, "Explain mixed-precision quantization.", max_tokens=256))
```

Image+text input and the speculative drafter run through [mlx-optiq](https://mlx-optiq.com/):

```bash
pip install mlx-optiq
optiq serve --model mlx-community/gemma-4-26B-A4B-it-qat-OptiQ-4bit \
            --drafter google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant
```

The language and image+text paths both run through optiq. The bf16 vision tower rides in `optiq_vision.safetensors`, which mlx-lm ignores (it globs `model*.safetensors`), so both paths work from one artifact.
