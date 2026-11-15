# mlx-community/Qwythos-9B-v2-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant of [empero-ai/Qwythos-9B-v2](https://huggingface.co/empero-ai/Qwythos-9B-v2), a reasoning-tuned Qwen3.5-9B derivative. Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose, reasoning, code, agent, tool-call, and constraint-bearing instructions). Sensitive layers go to 8-bit; robust ones stay at 4-bit.

**Image input works.** The vision tower is kept at bf16 in a sidecar, so this quant takes images as well as text.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit (sensitive) | 134 |
| Layers at 4-bit (robust) | 114 |
| Total quantized layers | 248 |
| Achieved bits per weight | 5.211 |
| Group size | 64 |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) |
| Reference for sensitivity | uniform-4-bit |
| Vision tower | bf16, 333 tensors, in `optiq/optiq_vision.safetensors` |
| Bundled MTP head | `optiq/mtp.safetensors` (4-bit projections, BF16 norms) |
| Size on disk | 7.6 GB (language 6.6 GB, sidecars 1.0 GB), from an 18 GB bf16 base |

We follow the same naming convention `llama.cpp` uses for Q4_K_M and similar mixed-precision quants: the "4-bit" label is the predominant precision, not the weighted average.

Only the language tower is quantized. The vision tower stays at bf16, which is how every OptiQ VLM ships: it is a small fraction of the weights, so quantizing it costs quality for very little disk.

## Usage

### Text

Load it with `mlx-lm` and use it as usual. The sidecars live in an `optiq/` subfolder, so a stock `*.safetensors` glob ignores them and `mlx-lm` sees a clean language model.

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwythos-9B-v2-OptiQ-4bit")
response = generate(
    model, tokenizer,
    prompt="Explain quantum computing in simple terms.",
    max_tokens=512,
)
```

This is a reasoning model: it thinks inside `<think>...</think>` before answering, so give it enough `max_tokens` to finish.

### Images

Image input needs [`mlx-optiq`](https://mlx-optiq.com/), which loads the bf16 vision sidecar and feeds the merged embeddings to the quantized language tower:

```bash
pip install mlx-optiq
```

```python
from PIL import Image
from optiq.runtime.engine import OptiqEngine

engine = OptiqEngine("mlx-community/Qwythos-9B-v2-OptiQ-4bit")
answer = engine.generate(
    "What is in this image?",
    images=[Image.open("photo.jpg")],
    max_tokens=512,
)
print(answer.text)
```

Or serve it over an OpenAI-compatible endpoint that accepts image content parts:

```bash
optiq serve --model mlx-community/Qwythos-9B-v2-OptiQ-4bit
```

### Speculative decoding (MTP)

The base ships a Multi-Token Prediction head, bundled here as `optiq/mtp.safetensors`:

```bash
optiq serve --model mlx-community/Qwythos-9B-v2-OptiQ-4bit --mtp
```

Using the head outside `optiq serve`: `optiq/mtp.safetensors` holds Qwen's original MTP tensors, so its seven RMSNorm weights (`mtp.*norm*`) are zero-centred, applied as 1 + w. The main weights have the +1 folded in, as MLX expects. Add 1.0 to all seven norms when loading the head into another runtime.

## Provenance

Produced with `optiq convert empero-ai/Qwythos-9B-v2 --target-bpw 5.0 --reference uniform_4bit`. The recipe matches [mlx-community/Qwen3.5-9B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit), the quant of the base architecture this model is tuned from, which lands at the same bits per weight.

Text and image generation were both verified on the finished artifact before release. No task benchmarks were run on this quant; for measured quality numbers on the base architecture, see the [Qwen3.5-9B OptiQ card](https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit).

Quantization does not change the alignment characteristics of the base model. Use it under the same terms as [the original](https://huggingface.co/empero-ai/Qwythos-9B-v2).
