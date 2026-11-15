# mlx-community/Sage-A1.5-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

This repository contains a mixed-precision MLX quantization of [InternScience/Sage-A1.5](https://huggingface.co/InternScience/Sage-A1.5) for Apple Silicon. Sage-A1.5 is a 35B mixture-of-experts agentic model from Shanghai AI Laboratory with approximately 3B active parameters per token, designed for long-horizon scientific problem solving, tool use and code. Its architecture is Qwen3.6-35B-A3B: 40 layers, 256 experts, 8 routed per token, with a Qwen3-VL vision tower.

OptiQ quantizes the language tower to mixed 4-bit and 8-bit precision and keeps the vision tower at bf16 in a sidecar file, so a single checkpoint handles both text and images. The checkpoint is 22 GB on disk, down from about 72 GB in bf16.

## What it is

| Property | Value |
|---|---|
| Base | InternScience/Sage-A1.5 (Qwen3.6-35B-A3B architecture) |
| Language tower | per-layer 4/8-bit: 118 tensors at 4-bit, 394 at 8-bit (512 total) |
| Vision tower | bf16, kept in `optiq_vision.safetensors` (333 tensors) |
| MTP head | `optiq/mtp.safetensors` |
| On disk | 20.6 GB language + 0.9 GB vision + 0.5 GB MTP head |
| Group size | 64 |
| Context | 262,144 tokens |

Following `llama.cpp`'s naming for mixed quants, the "4bit" label denotes the predominant precision, not the weighted average.

## How the bit-widths were chosen

The per-layer bit allocation was not measured on this model. It was copied from [mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit), whose allocation came from a KL-divergence sensitivity sweep over a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix).

This is sound because Sage-A1.5 has the same architecture: same layer count, expert count, hidden size 2048, vocabulary 248,320. Its chat template is Qwen3.6's with one addition, an optional verification-protocol switch. All 512 tensors matched the recipe with none unmatched. An unmatched tensor would silently fall back to flat 4-bit.

Sensitivity reflects a layer's role in the architecture. Fine-tuning can shift it, and that was not measured here. Running `optiq convert` on the model performs the full sweep.

## Sampling

The upstream repository ships no `generation_config.json`. This repository adds one with the sampling parameters the Sage-A1.5 authors recommend on their model card: temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 1.5.

Without presence_penalty, the quant reasoned past 16,384 tokens without answering on two open-ended prompts, a one-sentence explanation and a short coding task. With the recommended values, both prompts finished with correct answers, using about 4,900 and 800 reasoning tokens respectively. `optiq serve` reads the file automatically. Other runtimes should pass these values explicitly.

## What was verified

Run through this quantized model with `optiq serve` on Apple Silicon:

| Input | Output |
|---|---|
| Capital of France, one word | Paris |
| 17 × 23 | 391 |
| 240 km in 3 hours, average speed | 80 |
| "What's the weather in Paris?" with a `get_weather` tool | `get_weather({"city": "Paris"})` |
| An image of an OptiQ release banner | Read the product name, date and listed features correctly |
| One sentence on why the sky is blue | Shorter blue wavelengths scatter more |
| An iterative Fibonacci function | Correct, with the base cases handled |

Also checked: 512/512 tensors matched the recipe, and the artifact layout, sidecars and metadata follow OptiQ's release contract.

**Not run for this model:** the six-metric Capability Score. The published scores for the Qwen3.6-35B-A3B quant describe that model, not this one, and are not claimed here.

## Use it

```bash
pip install mlx-optiq
optiq serve --model mlx-community/Sage-A1.5-OptiQ-4bit --ngram-draft 16
```

`--mtp` is not supported on this model yet: the MTP head of the Qwen3.6-35B-A3B family does not load into OptiQ's speculator. N-gram drafting (`--ngram-draft 16`) is the speed-up to use.

Images through the Python API:

```python
from optiq.runtime.engine import OptiqEngine

eng = OptiqEngine("mlx-community/Sage-A1.5-OptiQ-4bit")
st = eng.generate("What is in this image?", images=["figure.png"], max_tokens=2048)
print(st.text)
```

Text-only works under stock `mlx-lm` as well. It globs `model*.safetensors` and ignores the sidecar, so the same repo loads either way:

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Sage-A1.5-OptiQ-4bit")
print(generate(model, tokenizer, prompt="Explain KV caching.", max_tokens=2048))
```

The per-layer bit map is in `optiq/metadata.json` and in the `quantization` block of `config.json`.

Using the head outside `optiq serve`: `optiq/mtp.safetensors` holds Qwen's original MTP tensors, so its seven RMSNorm weights (`mtp.*norm*`) are zero-centred, applied as 1 + w. The main weights have the +1 folded in, as MLX expects. Add 1.0 to all seven norms when loading the head into another runtime.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [InternScience/Sage-A1.5](https://huggingface.co/InternScience/Sage-A1.5)
- **Technical report:** [arXiv 2610.28578](https://arxiv.org/abs/2610.28578)
