# mlx-community/gemma-4-e2b-it-qat-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), built on Google's quantization-aware-trained (QAT) Gemma-4 base. OptiQ's sensitivity-guided per-layer bit allocation is applied on top of weights that were trained to survive low-bit quantization, and it still beats a uniform 4-bit quant of the same QAT base by +2.09 Capability Score points.

This is a quant of [google/gemma-4-E2B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose, reasoning, code, agent, tool-call, constraint-bearing instructions). Sensitive layers go to 8-bit, robust ones stay at 4-bit.

## Quantization details

| Property | Value |
|---|---|
| Base | google/gemma-4-E2B-it-qat-q4_0-unquantized (QAT) |
| Predominant precision | 4-bit |
| Components at 8-bit (sensitive) | 144 |
| Components at 4-bit (robust) | 132 |
| Total quantized components | 276 |
| Achieved bits-per-weight | 5.24 |
| Group size | 64 |
| Reference for sensitivity | bf16 |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) |
| Vision | bf16 sidecar (`optiq_vision.safetensors`), image+text via optiq |
| Speculative drafter | [`google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant`](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant) via `optiq serve --drafter` |

## Capability Score

Six-metric mean (MMLU, GSM8K, IFEval, BFCL, HumanEval, HashHop), scored against a uniform 4-bit quant of the same QAT base. That comparison isolates what the mixed-precision allocation adds, holding the base fixed.

| Benchmark | This model (OptiQ, QAT base) | Uniform-4 (QAT base) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | **48.5%** | 46.7% | +1.8 |
| GSM8K (1000) | **58.6%** | 56.2% | +2.4 |
| IFEval (full, strict) | 66.0% | **67.7%** | -1.7 |
| BFCL-V3 simple (200) | **89.5%** | 88.5% | +1.0 |
| HumanEval (pass@1, 164) | **62.8%** | 59.8% | +3.0 |
| HashHop (long-context) | **18.0%** | 12.0% | +6.0 |
| **Capability Score** (mean) | **57.23** | 55.14 | **+2.09** |

OptiQ adds +2.09 points over uniform 4-bit on this QAT base, close to the +2.12 it adds on the vanilla `gemma-4-e2b-it` base, so the per-layer allocation keeps paying off even after QAT has made the weights more quantization-robust. The mixed quant is 5.24 bits-per-weight (about 4.9 GB on disk) versus 4.0 bits-per-weight (about 2.4 GB) for uniform 4-bit: the gain comes from spending the extra budget on the layers that need it.

## Usage

[mlx-lm](https://github.com/ml-explore/mlx-lm) loads it directly for text:

```python
from mlx_lm import load, generate
model, tokenizer = load("mlx-community/gemma-4-e2b-it-qat-OptiQ-4bit")
print(generate(model, tokenizer, "Explain mixed-precision quantization.", max_tokens=256))
```

Image+text input and the speculative drafter run through [mlx-optiq](https://mlx-optiq.com/):

```bash
pip install mlx-optiq
optiq serve --model mlx-community/gemma-4-e2b-it-qat-OptiQ-4bit \
            --drafter google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant
```

The same repo loads text-only under stock mlx-lm and image+text under optiq. The bf16 vision tower rides in `optiq_vision.safetensors`, which mlx-lm ignores (it globs `model*.safetensors`), so both paths work from one artifact.


## Quantize your own

This quant was produced by [mlx-optiq](https://mlx-optiq.com). Point it at any Hugging Face model to get the same sensitivity-aware mixed precision:

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # or open the full local workbench: chat, compare, quantize, fine-tune
```

## License

[Gemma Terms of Use](https://ai.google.dev/gemma/terms). Built on google/gemma-4-E2B-it-qat-q4_0-unquantized.
