# mlx-community/gemma-4-31B-it-qat-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), built on Google's quantization-aware-trained (QAT) Gemma-4 base. This is the **flagship** of the family: the 31B dense Gemma-4, and the strongest OptiQ quant on the Capability Score. OptiQ's sensitivity-guided per-layer bit allocation is applied on top of weights already trained to survive low-bit quantization, and it still beats a uniform 4-bit quant of the same QAT base by +1.65 Capability Score points.

This is a quant of [google/gemma-4-31B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose, reasoning, code, agent, tool-call, constraint-bearing instructions). Sensitive layers go to 8-bit, robust ones stay at 4-bit.

## Quantization details

| Property | Value |
|---|---|
| Base | google/gemma-4-31B-it-qat-q4_0-unquantized (QAT, dense) |
| Predominant precision | 4-bit |
| Components at 8-bit (sensitive) | 186 |
| Components at 4-bit (robust) | 224 |
| Total quantized components | 410 |
| Achieved bits-per-weight | 5.20 |
| Group size | 64 |
| Reference for sensitivity | uniform 4-bit (streamed) |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) |
| Vision | bf16 sidecar (`optiq_vision.safetensors`), image+text via optiq |
| Speculative drafter | [`google/gemma-4-31B-it-qat-q4_0-unquantized-assistant`](https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized-assistant) via `optiq serve --drafter` |

## Capability Score

Six-metric mean (MMLU, GSM8K, IFEval, BFCL, HumanEval, HashHop), scored against a uniform 4-bit quant of the same QAT base. That comparison isolates what the mixed-precision allocation adds, holding the base fixed.

| Benchmark | This model (OptiQ, QAT base) | Uniform-4 (QAT base) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | **72.7%** | 72.4% | +0.3 |
| GSM8K (1000) | 96.3% | **96.6%** | -0.3 |
| IFEval (full, strict) | **77.8%** | 77.4% | +0.4 |
| BFCL-V3 simple (200) | **93.0%** | 93.0% | +0.0 |
| HumanEval (pass@1, 164) | **93.3%** | 92.7% | +0.6 |
| HashHop (long-context) | **59.0%** | 50.0% | +9.0 |
| **Capability Score** (mean) | **82.01** | 80.36 | **+1.65** |

OptiQ adds +1.65 points over uniform 4-bit on this QAT base, the largest margin in the Gemma-4 family alongside the small QAT models (E2B +2.09, E4B +1.19, 12B +1.37). The gain concentrates in **long-context retrieval** (HashHop +9.0): the per-layer allocation puts 8-bit on the attention and projection layers that carry the retrieval signal, which the larger model leans on most. The mixed quant is 5.20 bits-per-weight (about 20.8 GB on disk) versus 4.0 bits-per-weight (about 16.1 GB) for uniform 4-bit, with the extra budget spent on the layers that need it.

## Usage

This is a Gemma-4 (`model_type: gemma4`, `gemma4_text`), so it needs **mlx-lm from main** and **`import optiq`** (the Gemma-4 text tower is not in the 0.31.3 PyPI release; the main build also reports `0.31.3`, so install from git, not a version pin):

```bash
pip install -U mlx-optiq "mlx-lm @ git+https://github.com/ml-explore/mlx-lm.git"
```

```python
import optiq  # registers the OptiQ model paths
from mlx_lm import load, generate
model, tokenizer = load("mlx-community/gemma-4-31B-it-qat-OptiQ-4bit")
print(generate(model, tokenizer, "Explain mixed-precision quantization.", max_tokens=256))
```

Image+text input and the speculative drafter run through [mlx-optiq](https://mlx-optiq.com/):

```bash
pip install mlx-optiq
optiq serve --model mlx-community/gemma-4-31B-it-qat-OptiQ-4bit \
            --drafter google/gemma-4-31B-it-qat-q4_0-unquantized-assistant
```

The language and image+text paths both run through optiq. The bf16 vision tower rides in `optiq_vision.safetensors`, which mlx-lm ignores (it globs `model*.safetensors`), so both paths work from one artifact.
