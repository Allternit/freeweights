# mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**MiniCPM-V 4.7 1B for Apple Silicon: an OptiQ 4-bit language tower, with the vision tower kept at bf16.**

This is the OptiQ quant of OpenBMB's [MiniCPM-V 4.7 1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B), an image-text model with a SigLIP NaViT vision tower and a dense Qwen3.5 language tower. OptiQ measured each layer's sensitivity, kept 64 of the 187 layers at 8-bit and put the other 123 at 4-bit. That raises the Capability Score from 48.17 for uniform 4-bit to 52.48, with the biggest gains on HumanEval (50.6 vs 32.9) and GSM8K (69.8 vs 65.1). Function calling is the one loss: BFCL drops from 48.5 to 41.5, mostly on calls the model doesn't make.

## It works on image and text

Both ran through this quantized model with `optiq serve`, MLX only:

**Image** (the words "OPTIQ 42" on a white background, "What text is in the image?"):
> OPTIQ 42

**Text** ("What is the capital of France? One word."):
> Paris

## What it is

| Property | Value |
|---|---|
| Base | openbmb/MiniCPM-V-4.7-1B |
| Language tower | Qwen3.5, dense, 24 layers, hybrid linear/full attention, 262k context |
| Method | OptiQ mixed-precision, sensitivity-driven |
| Allocation | 123 layers at 4-bit, 64 at 8-bit |
| Vision tower | SigLIP NaViT, bf16, in `optiq/optiq_vision.safetensors` |
| On disk | 0.80 GB language + 1.10 GB vision |
| KV cache | `kv_config.json`, mixed 4/8-bit on the full-attention layers |

Following `llama.cpp`'s naming for mixed quants, the "4bit" label denotes the family, not the weighted average.

## Capability Score

Six-metric mean (the standard OptiQ text eval), against a uniform 4-bit quant of the same base.

| Metric | Uniform 4-bit | OptiQ |
|---|---:|---:|
| MMLU (5-shot, 969 samples) | 54.0% | 55.3% |
| GSM8K (1000 samples) | 65.1% | 69.8% |
| IFEval (full set, strict) | 71.5% | 74.7% |
| BFCL-V3 simple (200 calls) | 48.5% | 41.5% |
| HumanEval (164 problems, pass@1) | 32.9% | 50.6% |
| HashHop (long-context retrieval) | 17.0% | 23.0% |
| **Capability Score** (mean of 6) | **48.17** | **52.48** |

## Run it

MiniCPM-V 4.7 needs OptiQ 0.5.25 or later. Stock mlx-lm does not know the `minicpmv4_7` architecture, so `import optiq` registers it, and OptiQ loads the vision sidecar.

```bash
pip install "mlx-optiq>=0.5.25"
```

For image input, serve it with an OpenAI- and Anthropic-compatible endpoint:

```bash
optiq serve --model mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit
```

For the measured mixed-precision KV cache, fetch `kv_config.json` from this repo and pass it in:

```bash
hf download mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit kv_config.json --local-dir .
optiq serve --model mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit --kv-config kv_config.json
```

Then send an image as `image_url` content. Text-only generation also loads directly:

```python
import optiq  # registers minicpmv4_7 and the vision sidecar
from mlx_lm import load, generate

model, tok = load("mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit")
msgs = [{"role": "user", "content": "Explain why the sky is blue."}]
prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt=prompt, max_tokens=512))
```

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Family guide:** [mlx-optiq.com/docs/minicpm](https://mlx-optiq.com/docs/minicpm)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B)
