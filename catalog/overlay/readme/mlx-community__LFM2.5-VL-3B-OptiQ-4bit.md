# mlx-community/LFM2.5-VL-3B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**Liquid's on-device vision-language model, quantized for a Mac.** This is an OptiQ mixed-precision quant of [LiquidAI/LFM2.5-VL-3B-MLX-bf16](https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-bf16). 2.8 GB on disk, down from 6.3 GB.

LFM2.5-VL pairs a SigLIP2 encoder with the LFM2.5 hybrid language tower: short convolutional blocks alternate with full-attention blocks, and only the attention blocks carry a KV cache, so memory grows slowly as context does. OptiQ quantizes the language tower to mixed 4/8-bit and keeps the vision tower at bf16 in a sidecar, so one checkpoint does text and images.

## It reads images

Ran through this quantized model on Apple Silicon, MLX only:

| Input | Output |
|---|---|
| a blue square on white | "A blue square." |
| a green triangle on white | "Green triangle." |
| a red circle on white | "A red circle." |

## What it is

| Property | Value |
|---|---|
| Base | LiquidAI/LFM2.5-VL-3B-MLX-bf16 (SigLIP2 + LFM2.5, ~3B params) |
| Method | OptiQ mixed-precision, sensitivity-driven (bf16 reference) |
| Language tower | per-layer 4/8-bit: 88 layers at 4-bit, 78 at 8-bit |
| Vision tower | bf16, kept in `optiq/optiq_vision.safetensors` (441 tensors) |
| On disk | 1.98 GB language + 0.85 GB vision |
| Resolution | native aspect ratio; position embeddings resampled per image |

The vision tower runs natively in MLX with no PyTorch and no mlx-vlm at runtime. It was checked against the reference implementation across four patch grids and matches to bf16 round-off, so image answers are the base model's rather than an approximation.

Following `llama.cpp`'s naming for mixed quants, the "4bit" label denotes the family, not the weighted average.

## Capability Score

Six-metric mean (the standard OptiQ text eval).

| Metric | Score |
|---|---:|
| MMLU (5-shot, 969 samples) | 54.3% |
| GSM8K (1000 samples) | 44.6% |
| IFEval (full set, strict) | 77.4% |
| BFCL-V3 simple (200 calls) | 0.0% |
| HumanEval (164 problems, pass@1) | 40.2% |
| HashHop (long-context retrieval) | 11.0% |
| **Capability Score** (mean of 6) | **37.93** |

**It does not initiate tool calls.** The 0.0% is a real result, not a harness artifact: on BFCL's prompts this model works the answer out itself rather than calling the function. Asked "find the area of a triangle with base 10 and height 5" it derives the formula and answers 25, while its text-only sibling [LFM2.5-1.2B-Instruct](https://huggingface.co/mlx-community/LFM2.5-1.2B-Instruct-OptiQ-4bit) calls `calculate_triangle_area` and scores 45.0%. Both were run through the same harness with the same chat template logic.

It emits correct calls when told to use a tool — `<|tool_call_start|>[get_weather(city="Paris")]<|tool_call_end|>` parses cleanly — so the capability is there; the model just does not reach for it unprompted. If you need agentic tool use at this size, take the text 1.2B or 2.6B instead.

Long-context retrieval also falls off quickly: 40% at one hop, near zero beyond. That is what a hybrid with few attention layers predicts, and it is the trade that keeps its KV cache small.

## Run it

```bash
pip install "mlx-optiq>=0.4.20"
```

For image input, serve it with an OpenAI + Anthropic-compatible endpoint:

```bash
optiq serve --model mlx-community/LFM2.5-VL-3B-OptiQ-4bit
```

Then send an image as `image_url` content. Text-only generation also loads directly:

```python
import optiq  # registers the lfm2_vl arch + vision sidecar
from mlx_lm import load, generate

model, tok = load("mlx-community/LFM2.5-VL-3B-OptiQ-4bit")
msgs = [{"role": "user", "content": "Explain why the sky is blue."}]
prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt=prompt, max_tokens=400))
```

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Family guide:** [mlx-optiq.com/docs/lfm2.5](https://mlx-optiq.com/docs/lfm2.5)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [LiquidAI/LFM2.5-VL-3B-MLX-bf16](https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-bf16)
