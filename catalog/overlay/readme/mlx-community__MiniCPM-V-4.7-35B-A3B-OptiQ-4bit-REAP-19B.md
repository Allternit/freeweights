# mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**19B parameters at 13.5 GB, down from 35B at 24.4 GB, trading Capability Score 87.61 for 81.91.**

Half the routed experts are gone. Each of the 40 language layers kept 128 of its 256 experts; top-8 routing is unchanged, so every token still activates 8 experts plus the shared one. The retained experts were copied bit-for-bit from the parent quant, nothing re-quantized or retrained. The cost is uneven: MMLU falls from 86.2 to 63.8, a 22.4 point drop, while GSM8K holds at 90.0, IFEval at 79.9, BFCL at 92.0, and HumanEval at 87.8. Knowledge questions suffer; skills largely survive. Pick it over the parent on a 24 GB Mac, where the parent doesn't fit in memory; pick the parent if knowledge questions matter.

| | Parent | This model | |
|---|---|---|---|
| Language tower on disk | 24.4 GB | **13.5 GB** | −45% |
| Vision sidecar | 1.1 GB | 1.1 GB | |
| Parameters | 35.2B | **18.9B** | −46% |
| Capability Score | 87.61 | **81.91** | −5.70 |

## It works on image and text

Both ran through this quantized model with `optiq serve`, MLX only:

**Image** (the words "OPTIQ 42" on a white background, "What text is in the image?"):
> OPTIQ 42

**Text** ("What is the capital of France? One word."):
> Paris

## What pruning costs

| Benchmark | Parent | This model | Δ |
|---|---:|---:|---:|
| MMLU | 86.2 | 63.8 | −22.4 |
| GSM8K | 94.6 | 90.0 | −4.6 |
| IFEval | 85.0 | 79.9 | −5.1 |
| BFCL-V3 | 93.0 | 92.0 | −1.0 |
| HumanEval | 90.9 | 87.8 | −3.1 |
| HashHop | 76.0 | 78.0 | +2.0 |
| **Capability Score** | **87.61** | **81.91** | **−5.70** |

## Details

| Property | Value |
|---|---|
| Parent | [mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit](https://huggingface.co/mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit) |
| Experts retained | 128 of 256 per layer, every layer |
| Active experts per token | 8 + 1 shared (unchanged) |
| Selection | REAP, conditional mean of router weight × expert output norm |
| KL vs the unpruned parent | 0.077 |
| Calibration | optiq six-domain mix, 8 samples; expert coverage min 95.3%, median 100% |
| Vision tower | bf16 sidecar, unchanged from the parent |
| KV cache | `kv_config.json`, mixed 4/8-bit on the full-attention layers |

## Run it

MiniCPM-V 4.7 needs OptiQ 0.5.25 or later. Stock mlx-lm does not know the `minicpmv4_7` architecture, so `import optiq` registers it, and OptiQ loads the vision sidecar.

```bash
pip install "mlx-optiq>=0.5.25"
```

For image input, serve it with an OpenAI- and Anthropic-compatible endpoint:

```bash
optiq serve --model mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B
```

For the measured mixed-precision KV cache, fetch `kv_config.json` from this repo and pass it in:

```bash
hf download mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B kv_config.json --local-dir .
optiq serve --model mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B --kv-config kv_config.json
```

Then send an image as `image_url` content. Text-only generation also loads directly:

```python
import optiq  # registers minicpmv4_7 and the vision sidecar
from mlx_lm import load, generate

model, tok = load("mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B")
msgs = [{"role": "user", "content": "Explain why the sky is blue."}]
prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt=prompt, max_tokens=512))
```

## Method

Expert pruning follows **REAP** (Cerebras Research, ICLR 2026, [*REAP the Experts: Why Pruning Prevails for One-Shot MoE Compression*](https://arxiv.org/abs/2510.13999)). OptiQ applies it in the quantized domain, directly on the quantized checkpoint with no bf16 parent, via `optiq prune-experts`. See the [pruning docs](https://mlx-optiq.com/docs/prune).

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Family guide:** [mlx-optiq.com/docs/minicpm](https://mlx-optiq.com/docs/minicpm)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [openbmb/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B)
