# mlx-community/gemma-4-e4b-it-qat-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), built on Google's quantization-aware-trained (QAT) Gemma-4 base. OptiQ's sensitivity-guided per-layer bit allocation is applied on top of weights that were trained to survive low-bit quantization, and it still beats a uniform 4-bit quant of the same QAT base by +1.19 Capability Score points.

This is a quant of [google/gemma-4-E4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose, reasoning, code, agent, tool-call, constraint-bearing instructions). Sensitive layers go to 8-bit, robust ones stay at 4-bit.

## Quantization details

| Property | Value |
|---|---|
| Base | google/gemma-4-E4B-it-qat-q4_0-unquantized (QAT) |
| Predominant precision | 4-bit |
| Components at 8-bit (sensitive) | 221 |
| Components at 4-bit (robust) | 122 |
| Total quantized components | 343 |
| Achieved bits-per-weight | 5.17 |
| Group size | 64 |
| Reference for sensitivity | uniform-4-bit baseline (bf16 does not fit in RAM at this size) |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) |
| Vision | bf16 sidecar (`optiq_vision.safetensors`), image+text via optiq |
| Speculative drafter | [`google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`](https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant) via `optiq serve --drafter` |

## Capability Score

Six-metric mean (MMLU, GSM8K, IFEval, BFCL, HumanEval, HashHop), scored against the published uniform 4-bit quant of the same QAT base ([`mlx-community/gemma-4-E4B-it-qat-4bit`](https://huggingface.co/mlx-community/gemma-4-E4B-it-qat-4bit)). That comparison isolates what the mixed-precision allocation adds, holding the base fixed.

| Benchmark | This model (OptiQ, QAT base) | Uniform-4 (QAT base) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | **57.7%** | 57.4% | +0.3 |
| GSM8K (1000) | **80.0%** | 79.5% | +0.5 |
| IFEval (full, strict) | **69.1%** | 67.8% | +1.3 |
| BFCL-V3 simple (200) | **87.5%** | 87.5% | +0.0 |
| HumanEval (pass@1, 164) | **81.7%** | 78.7% | +3.0 |
| HashHop (long-context) | **36.0%** | 34.0% | +2.0 |
| **Capability Score** (mean) | **68.67** | 67.48 | **+1.19** |

The mixed-precision allocation adds +1.19 points over uniform 4-bit on the QAT base, with the largest gains on HumanEval and the long-context HashHop task. The mixed quant is 5.17 bits-per-weight (about 7.0 GB on disk) versus 4.0 bits-per-weight (about 6.3 GB) for uniform 4-bit: the gain comes from spending the extra budget on the layers that need it.

## Usage

[mlx-lm](https://github.com/ml-explore/mlx-lm) loads it directly for text:

```python
from mlx_lm import load, generate
model, tokenizer = load("mlx-community/gemma-4-e4b-it-qat-OptiQ-4bit")
print(generate(model, tokenizer, "Explain mixed-precision quantization.", max_tokens=256))
```

Image+text input and the speculative drafter run through [mlx-optiq](https://mlx-optiq.com/):

```bash
pip install mlx-optiq
optiq serve --model mlx-community/gemma-4-e4b-it-qat-OptiQ-4bit \
            --drafter google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
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

[Gemma Terms of Use](https://ai.google.dev/gemma/terms). Built on google/gemma-4-E4B-it-qat-q4_0-unquantized.
