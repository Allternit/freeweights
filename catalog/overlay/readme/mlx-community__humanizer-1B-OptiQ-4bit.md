# humanizer-1B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon (no PyTorch, no cloud). [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 1B model that scores the same as the human reference set on the RADAR AI detector. Stacked SFT + DPO LoRA adapters on top of `mlx-community/MiniCPM5-1B-OptiQ-4bit` close 100% of the gap to human writing on a 200-draft held-out evaluation.

| | P(AI) (RADAR-Vicuna-7B) |
| --- | ---: |
| Source AI drafts (Qwen3.5-4B + Gemma-4-e4b output) | 0.51 |
| `humanizer-1B-OptiQ-4bit` (SFT + DPO stacked) | **0.37** |
| Human reference (EditLens ICLR 2026, n=200) | 0.37 |

Build, recipe, and discussion: <https://mlx-optiq.com/blog/humanizer-stacked-lora>

## What's in this repo

```
humanizer-1B-OptiQ-4bit/
  model.safetensors, config.json, tokenizer*    base MiniCPM5-1B-OptiQ-4bit
  optiq_metadata.json                            per-layer bit assignments
  adapters/
    humanizer-sft/                               SFT humanizer LoRA
      adapters.safetensors
      adapter_config.json
      optiq_lora_config.json
    humanizer-dpo/                               DPO continuation LoRA
      adapters.safetensors
      adapter_config.json
      optiq_lora_config.json
```

- **Base**. `mlx-community/MiniCPM5-1B-OptiQ-4bit`. OptiQ mixed-precision quant of `openbmb/MiniCPM5-1B`. 875 MB on disk, Capability Score 30.28.
- **SFT adapter**. Trained on canonical SFT data derived from the EditLens ICLR 2026 corpus. `--preset large` (ranks 32 and 64, with the `by_bits` overlay), 600 iters, `mask_prompt=True`.
- **DPO adapter**. Trained as a delta on top of the SFT via `optiq lora train --method dpo --mount-adapter`. The reference KL is anchored against base + SFT (the textbook SFT then DPO continuation), so the saved adapter contains only the DPO delta. 300 iters, beta 0.1, LR 5e-5 with linear warmup then cosine decay (the OptiQ DPO defaults).

The DPO adapter is meaningful only when applied alongside the SFT adapter. It is a delta from the SFT distribution, not a standalone LoRA. Apply both at inference for the headline result.

## Use

You need `mlx-optiq >= 0.1.4` for the multi-LoRA serving and stacking syntax:

```bash
pip install 'mlx-optiq>=0.1.4'

# Download the repo
huggingface-cli download mlx-community/humanizer-1B-OptiQ-4bit \
  --local-dir ./humanizer-1B-OptiQ-4bit

# Serve with both adapters mounted
optiq serve \
  --model ./humanizer-1B-OptiQ-4bit \
  --adapter ./humanizer-1B-OptiQ-4bit/adapters/humanizer-sft \
  --adapter ./humanizer-1B-OptiQ-4bit/adapters/humanizer-dpo \
  --port 8080
```

Send requests with both adapters active via the `+` stacking syntax in the request body:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "./humanizer-1B-OptiQ-4bit",
    "adapter": "humanizer-sft+humanizer-dpo",
    "messages": [
      {"role": "system", "content": "Rewrite AI-generated drafts into natural human-style prose, preserving meaning, facts, names, numbers, citations, URLs, quotes, and formatting."},
      {"role": "user", "content": "STYLE: direct technical blog\nTONE: analytical, clear, non-corporate\nLENGTH: preserve within 15%\n\nDraft to rewrite:\n\n[your AI-generated draft here]"}
    ],
    "temperature": 0.4,
    "max_tokens": 1600,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

The OpenAI-compatible endpoint is a drop-in for Open WebUI, Continue, Cursor, your own scripts. Send `"adapter": "humanizer-sft"` to use SFT alone, or `"adapter": "base"` to bypass adapters entirely (useful for A/B comparisons).

## Held-out evaluation

200 AI-generated drafts from the [EditLens ICLR 2026](https://huggingface.co/datasets/pangram/editlens_iclr) held-out set, rewritten by each system and scored by [RADAR-Vicuna-7B](https://huggingface.co/TrustSafeAI/RADAR-Vicuna-7B). Lower P(AI) is more human-like.

| Pipeline | P(AI) | Delta vs source | Slop / 1K tokens |
| --- | ---: | ---: | ---: |
| Source AI draft (Qwen3.5-4B + Gemma-4-e4b) | 0.51 |, | 0.6 |
| SFT humanizer alone | 0.50 | -0.01 | 0.2 |
| **SFT + DPO stacked (this repo)** | **0.37** | **-0.14** | **0.0** |
| Human reference (target) | 0.37 | -0.14 | 0.1 |

The stacked pipeline produces fewer slop phrases per 1K tokens (0.0) than the human reference set itself (0.1).

## Intended use and limitations

- **Intended use**. Rewriting AI-generated drafts (blog posts, articles, reports) into more natural-sounding prose. Preserves facts, names, numbers, URLs, citations.
- **Trained on**. The EditLens ICLR 2026 corpus filtered through the OptiQ Labs dataset-building pipeline. Qwen3.5-4B and Gemma-4-e4b were the source AI models, the original EditLens human-written prose was the target.
- **AI-detector caveat**. RADAR-Vicuna-7B is one detector out of many. Matching the human reference on RADAR means the rewrites land at the same point on RADAR's scale as the EditLens human-written set. Other detectors will give different numbers, and detector arms races mean any specific score has a shelf life. The reproducible claim is the delta from source and the gap closure against a fixed human reference. Both held up across the entire 200-draft held-out set.
- **Length**. The rewrites tend to over-generate (length ratio around 3 to 4 times the source). Apply a max-tokens or post-truncation step if you need length-faithful output.
- **Capability outside humanization**. This LoRA stack is heavily specialized for the rewrite-this-AI-draft format. Out-of-format prompts will degrade behavior. Serve `"adapter": "base"` for general MiniCPM5-1B inference.


## Quantize your own

This quant was produced by [mlx-optiq](https://mlx-optiq.com). Point it at any Hugging Face model to get the same sensitivity-aware mixed precision:

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # full local workbench: chat, compare, quantize, fine-tune
```

## License

- Base model: `openbmb/MiniCPM5-1B` (Apache-2.0).
- LoRA adapters: Apache-2.0, this release.
- Training data: derived from [EditLens ICLR 2026](https://huggingface.co/datasets/pangram/editlens_iclr) (research use).
