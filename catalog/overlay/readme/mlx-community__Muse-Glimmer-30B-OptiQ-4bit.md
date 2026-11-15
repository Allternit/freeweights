# mlx-community/Muse-Glimmer-30B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**A 30B image-text reasoning model, running locally on a Mac.** This is an OptiQ mixed-precision quant of [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B). Its Capability Score is 87.36. 18.6 GB on disk for the language tower, plus a 3.8 GB bf16 vision sidecar.

Muse-Glimmer thinks before it answers, and keeps the two apart: reasoning goes to a `self` channel and the reply to a `user` channel. OptiQ quantizes the language tower to mixed 4/8-bit and keeps the vision tower at bf16 in a sidecar, so the same checkpoint does text and images.

## It works on image and text

Both ran through this quantized model on Apple Silicon, MLX only:

**Image** (a red circle on a white background):
> A red circle on a light grey background.

**Text** (GSM8K-style):
> In April she sold 48 clips. Half as many in May is 48 ÷ 2 = 24 clips. April + May = 48 + 24 = 72 clips altogether.

## What it is

| Property | Value |
|---|---|
| Base | meta-models/Muse-Glimmer-30B (~30B params, 52 decoder layers) |
| Method | OptiQ mixed-precision, sensitivity-driven (uniform-4-bit reference) |
| Language tower | per-layer 4/8-bit: 169 layers at 4-bit, 248 at 8-bit |
| Vision tower | bf16, kept in `optiq/optiq_vision.safetensors` (809 tensors) |
| On disk | 18.6 GB language + 3.8 GB vision |
| Attention | gated, sliding window 2048 on 3 layers in 4, NoPE on the 13 global layers |

All 417 projections were measured. Sensitivity falls with depth, so the early layers keep precision and the back half is compressed harder:

| Layers | Mean bits |
|---|---:|
| 0–12 | 6.88 |
| 13–25 | 6.50 |
| 26–38 | 6.27 |
| 39–51 | 5.85 |

The vision tower was reimplemented in MLX and matched against the reference to 4e-07 relative; the language tower to 1.8e-06. Following `llama.cpp`'s naming for mixed quants, the "4bit" label denotes the family, not the weighted average.

## Capability Score

Six-metric mean (the standard OptiQ text eval), with perfect long-context retrieval.

| Metric | Score |
|---|---:|
| MMLU (5-shot, 969 samples) | 83.1% |
| GSM8K (1000 samples) | 92.1% |
| IFEval (full set, strict) | 80.6% |
| BFCL-V3 simple (200 calls) | 88.5% |
| HumanEval (164 problems, pass@1) | 79.9% |
| HashHop (long-context retrieval) | 100.0% |
| **Capability Score** (mean of 6) | **87.36** |

## Run it

Muse-Glimmer ships under an architecture stock mlx-lm does not know, so `import optiq` registers it, and OptiQ loads the vision sidecar:

```bash
pip install "mlx-optiq>=0.4.20"
```

For image input, serve it with an OpenAI + Anthropic-compatible endpoint:

```bash
optiq serve --model mlx-community/Muse-Glimmer-30B-OptiQ-4bit
```

Then send an image as `image_url` content. Text-only generation also loads directly:

```python
import optiq  # registers the muse_glimmer arch + vision sidecar
from mlx_lm import load, generate

model, tok = load("mlx-community/Muse-Glimmer-30B-OptiQ-4bit")
msgs = [{"role": "user", "content": "Explain why the sky is blue."}]
prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt=prompt, max_tokens=800))
```

Give it room. It is a reasoning model, and a short token budget cuts it off mid-thought before the answer channel opens.

## Reading the output

The model answers in two channels. Read the final one:

```
to=self<|message|>April: 48. May: half as many = 24. Total 72.<|eom|>
<|start|>assistant to=user<|message|>In April she sold 48 clips.
48 + 24 = 72 clips altogether.
```

The reasoning channel restates the question and floats candidates it then rejects, so parsing the raw string picks up numbers the model did not commit to. Tool calls arrive in an `<atem:invoke>` block rather than the more common `<tool_call>` JSON.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Family guide:** [mlx-optiq.com/docs/muse-glimmer](https://mlx-optiq.com/docs/muse-glimmer)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
