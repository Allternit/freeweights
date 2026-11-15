# diffusiongemma-26B-A4B-it-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**OptiQ data-driven mixed-precision quant** of Google's [DiffusionGemma-26B-A4B-it](https://huggingface.co/google/diffusiongemma-26B-A4B-it), a **block/masked-diffusion** LLM (image-text-to-text), the first diffusion model in the OptiQ lineup.

Instead of uniform 4-bit, OptiQ measures each layer's quantization sensitivity — KL on the **denoising-canvas logits**, sampled across the denoising schedule the model actually walks — and spends an 8-bit budget where the measurement says it matters. The SigLIP vision tower is not quantized at all: it rides at **bf16 in a sidecar**, so the image path keeps full precision and the entire bit budget goes to the language tower.

**247 of 299 language tensors at 8-bit, 52 at 4-bit — 4.685 bits-per-weight. Vision: bf16.**

> ⚠️ **Requires [`mlx-optiq`](https://pypi.org/project/mlx-optiq/) ≥ 0.3.2.** DiffusionGemma is not loadable by stock `mlx-lm`/`mlx-vlm`; OptiQ ships a vendored, dependency-free decoder for it.

## Capability Score

Full 6-metric OptiQ Capability Score (`optiq eval --task all --score`):

| Benchmark | Score |
|---|---|
| MMLU (1000, 5-shot) | 56.1 |
| GSM8K (1000) | 94.4 |
| IFEval (strict) | 72.5 |
| BFCL v3 | 69.0 |
| HumanEval (pass@1) | 83.5 |
| HashHop | 34.0 |
| **Capability Score** | **68.25** |
| Disk | **16.7 GB** (from 51.6 GB bf16) |

## Vision

The vision tower is bf16, so image understanding is not degraded by the quant. Asked to describe four photos in one sentence:

| image | output |
|---|---|
| a brown bear | *"A close-up portrait of a large brown bear sitting in a grassy field."* |
| two cats on a blanket | *"Two tabby cats are sleeping on a pink blanket next to two television remotes."* |
| a tiled bathroom | *"A bathroom features a white floor-level toilet, a large white pipe…"* |
| an inverted stop sign | *"A red octagonal stop sign is mounted upside down on a metal post."* |

## Usage

```python
from optiq.vlm.diffusion_gemma import load, generate

model, tokenizer = load("mlx-community/diffusiongemma-26B-A4B-it-OptiQ-4bit")

# text
print(generate(model, tokenizer, "Write a haiku about Apple Silicon."))

# image + text
from PIL import Image
print(generate(model, tokenizer, "What is in this image?", images=[Image.open("photo.jpg")]))
```

### Best inference config

DiffusionGemma decodes by iteratively un-masking a fixed 256-token canvas. The sampler choice dominates speed:

| sampler | code | prose |
|---|---|---|
| `entropy-bound` (model default) | 12.7 tok/s | 1.8 tok/s |
| **`confidence-threshold`** (OptiQ default) | **58 tok/s** | **9 tok/s** |

OptiQ defaults to **`confidence-threshold`** (`generate(..., sampler="confidence-threshold")`), **4.6–5× faster** than the model's default, with no quality loss. On code it's comparable to the autoregressive Gemma-4 26B-A4B (~60 tok/s); on prose it's slower (diffusion's strength is structured/parallel-friendly output).

### LoRA fine-tuning

OptiQ ships a diffusion-native LoRA trainer (the model's denoising objective, not autoregressive cross-entropy):

```python
from optiq.vlm.diffusion_gemma.lora import train_diffusion_lora, load_diffusion_lora
train_diffusion_lora(model_path, "data/", "adapter/", rank=8)   # data/train.jsonl: {prompt, completion}
model, tok = load_diffusion_lora(model_path, "adapter/")
```

## Feature support

| OptiQ feature | DiffusionGemma |
|---|---|
| Mixed-precision quant | ✅ |
| Text + image generation | ✅ (vision tower at bf16) |
| LoRA fine-tuning | ✅ (diffusion-native denoising loss) |
| MTP / speculative / assistant draft | N/A (diffusion is not autoregressive; parallel canvas un-masking is the native analog) |
| KV-cache quant | N/A (fixed 256-token canvas; the cache holds only the prompt) |

## How it was made

```bash
pip install mlx-optiq
optiq convert google/diffusiongemma-26B-A4B-it --target-bpw 4.66 --candidate-bits 4,8
```

`optiq convert` detects the diffusion architecture and routes to the masked-canvas pipeline: it builds a uniform-4-bit reference, measures per-layer KL on the denoising-canvas logits (sampled at several points along the denoising schedule, seeded so the sweep is reproducible), runs the greedy-knapsack allocator, and quantizes. The vision/audio towers are excluded from the bit budget and written to `optiq/optiq_vision.safetensors` at bf16 — a `*.safetensors` glob does not descend into the subfolder, so third-party loaders ignore the sidecar while OptiQ loads it.

Built with [OptiQ](https://mlx-optiq.com). Vendored DiffusionGemma decoder derived from [mlx-vlm](https://github.com/Blaizzy/mlx-vlm) (MIT).

## Quantize your own

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # full local workbench: chat, compare, quantize, fine-tune
```
