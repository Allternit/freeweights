# Qwen3.5-9B-MTP-4bit

This repository contains Multi-Token Prediction (MTP) drafter weights split from `Qwen/Qwen3.5-9B` for use with `mlx-vlm` speculative decoding.

This is not a standalone chat or text-generation model. Load it as the draft model alongside a compatible Qwen3.5 9B target checkpoint.

## Use with mlx-vlm

```bash
uv run mlx_vlm.generate \
  --model mlx-community/Qwen3.5-9B-5bit \
  --draft-model mlx-community/Qwen3.5-9B-MTP-4bit \
  --prompt "Hi, how are you?" \
  --max-tokens 256 \
  --enable-thinking
```

For local weights:

```bash
uv run mlx_vlm.generate \
  --model /path/to/target-model \
  --draft-model /path/to/Qwen3.5-9B-mtp-4bit \
  --prompt "Hi, how are you?" \
  --max-tokens 256 \
  --enable-thinking
```

## Model Details

- Model type: `qwen3_5_mtp`
- MTP block size: `2`
- Target architecture: Qwen3.5 9B
- Precision: MLX affine 4-bit, group size 64
- Runtime: MLX / `mlx-vlm`
- Format: Safetensors with MLX-compatible config and tokenizer files

The stored tensors use MLX affine 4-bit quantization as described in `config.json`.

## Intended Use

Use this repo only as a speculative decoding drafter for compatible Qwen3.5 9B checkpoints. The target model verifies drafted tokens, while this MTP model proposes candidate tokens per decoding step.

## Limitations

This checkpoint requires runtime support for Qwen/DeepSeek MTP draft models in `mlx-vlm`. Standard standalone generation through generic Transformers APIs is not expected to work with this repository by itself.

Please refer to the upstream `Qwen/Qwen3.5-9B` model card and license terms for model usage constraints.
