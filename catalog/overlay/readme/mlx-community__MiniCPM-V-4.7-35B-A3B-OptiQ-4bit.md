# mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**MiniCPM-V 4.7 35B-A3B, quantized with OptiQ 4-bit, for Apple Silicon.**

This is OpenBMB's [MiniCPM-V 4.7 35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B), an image-text model with a SigLIP NaViT vision tower and a Qwen3.5-MoE language tower (40 layers, 256 routed experts, 8 active per token). OptiQ keeps 417 of its 510 layers at 8-bit and puts 93 at 4-bit, keeping the vision tower at bf16 in a sidecar file. Its Capability Score of 87.61 is the highest of any MoE we ship and second only to Qwen3.8-27B in the OptiQ lineup. It runs resident on a 36 GB Mac; on smaller machines, `--stream-experts on` keeps about 4.6 GB resident at the cost of speed.

## It works on image and text

Both ran through this quantized model with `optiq serve`, MLX only:

**Image** (the words "OPTIQ 42" on a white background, "What text is in the image?"):
> OPTIQ 42

**Text** ("What is the capital of France? One word."):
> Paris

## What it is

| Property | Value |
|---|---|
| Base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Language tower | Qwen3.5-MoE, 40 layers, 256 routed experts + 1 shared, 8 active per token, hybrid linear/full attention, 262k context |
| Method | OptiQ mixed-precision, sensitivity-driven (uniform-4-bit reference); every expert bank measured |
| Allocation | 93 layers at 4-bit, 417 at 8-bit |
| Vision tower | SigLIP NaViT, bf16, in `optiq/optiq_vision.safetensors` |
| On disk | 24.4 GB language + 1.1 GB vision |
| KV cache | `kv_config.json`, mixed 4/8-bit on the full-attention layers |

Want it smaller? [MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B](https://huggingface.co/mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B) removes half the routed experts: 13.5 GB, Capability Score 81.91.

## Capability Score

Six-metric mean (the standard OptiQ text eval).

| Metric | Score |
|---|---:|
| MMLU (5-shot, 969 samples) | 86.2% |
| GSM8K (1000 samples) | 94.6% |
| IFEval (full set, strict) | 85.0% |
| BFCL-V3 simple (200 calls) | 93.0% |
| HumanEval (164 problems, pass@1) | 90.9% |
| HashHop (long-context retrieval) | 76.0% |
| **Capability Score** (mean of 6) | **87.61** |

## Run it

MiniCPM-V 4.7 needs OptiQ 0.5.25 or later. Stock mlx-lm does not know the `minicpmv4_7` architecture, so `import optiq` registers it, and OptiQ loads the vision sidecar.

```bash
pip install "mlx-optiq>=0.5.25"
```

For image input, serve it with an OpenAI- and Anthropic-compatible endpoint:

```bash
optiq serve --model mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit
```

For the measured mixed-precision KV cache, fetch `kv_config.json` from this repo and pass it in:

```bash
hf download mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit kv_config.json --local-dir .
optiq serve --model mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit --kv-config kv_config.json
```

Then send an image as `image_url` content. Text-only generation also loads directly:

```python
import optiq  # registers minicpmv4_7 and the vision sidecar
from mlx_lm import load, generate

model, tok = load("mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit")
msgs = [{"role": "user", "content": "Explain why the sky is blue."}]
prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt=prompt, max_tokens=512))
```

On a Mac with less than 36 GB, stream the experts from the SSD:

```bash
optiq serve --model mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit --stream-experts on
```

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Family guide:** [mlx-optiq.com/docs/minicpm](https://mlx-optiq.com/docs/minicpm)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [openbmb/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B)
