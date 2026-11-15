# mlx-community/LFM3-VL-2B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

An OptiQ mixed-precision quant of [LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B), Liquid's LFM3 vision-language model. It reads images and text and answers in text. It is 1.7 GB on disk, down from 3.9 GB at bf16, with a 128k context.

The language model is the LFM3 backbone: short convolutions and attention, with sliding-window attention, so only 6 of its 24 layers keep a full-length KV cache. OptiQ measures each layer's sensitivity and assigns its bit-width from that. The vision tower stays at bf16 in a sidecar, `optiq_vision.safetensors`.

## What it is

| Property | Value |
|---|---|
| Base | [LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B) |
| Architecture | `lfm3_vl`: LFM3 language model (24 layers: 13 convolution, 5 sliding-window attention of 256 tokens, 6 full attention) plus a vision tower |
| Method | OptiQ mixed-precision, sensitivity-driven (bf16 reference); vision tower at bf16 |
| On disk | 1.7 GB (bf16: 3.9 GB) |
| Context | 128k |

About half of the language model's weight matrices stay at 8-bit (75 of 153), the ones whose quantization moved the output most. The rest are at 4-bit.

## Capability Score

Six-metric mean, the standard OptiQ eval, run in reasoning mode because the model thinks before it answers by default. The baseline is a uniform 4-bit quant of the same model, scored the same way.

| Metric | OptiQ | Uniform 4-bit |
|---|---:|---:|
| MMLU (generative) | 68.9% | 70.6% |
| GSM8K | 83.2% | 76.4% |
| IFEval (strict) | 44.4% | 35.7% |
| BFCL-V3 simple (200 calls) | 91.0% | 90.5% |
| HumanEval (164 problems, pass@1) | 55.5% | 43.9% |
| HashHop (long-context retrieval) | 3.0% | 0.0% |
| **Capability Score** (mean of 6) | **57.67** | **52.85** |

The OptiQ quant is ahead by 4.8 points overall, with the largest gains on code (+11.6), instruction following (+8.7) and math (+6.8).

## Run it

```bash
pip install -U mlx-optiq
optiq serve --model mlx-community/LFM3-VL-2B-OptiQ-4bit
```

That gives you an OpenAI and Anthropic compatible endpoint that takes images as well as text, with mixed-precision KV cache (`kv_config.json` in this repo), tool calling, and prompt caching. Send an image as an `image_url` content part, as with any OpenAI vision request.

The model reasons before it answers, so give it a generous `max_tokens`. Liquid's recommended sampling (`temperature 0.1`, `top_k 50`, `repetition_penalty 1.1`) ships in `generation_config.json`, and `optiq serve` applies it automatically.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
