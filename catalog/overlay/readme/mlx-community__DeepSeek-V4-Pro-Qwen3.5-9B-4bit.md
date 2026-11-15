# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-4bit

This model [mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-4bit](https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-4bit) was converted
to MLX format from [`Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`](https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B)
using mlx-vlm version **0.4.4**.

This is a 4bit MLX quantized conversion. It keeps the source model's chat template and
multimodal processor configuration for text/coding, image, and video-style
inputs. The language model weights were quantized with MLX 4-bit affine quantization; the multimodal vision components are preserved for image/video inputs.

Refer to the [original model card](https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) for
model details, license, and intended use.

## Use with mlx

```bash
pip install -U mlx-vlm
```

### Image input

```bash
python -m mlx_vlm.generate \
  --model mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-4bit \
  --max-tokens 512 \
  --temperature 0.0 \
  --prompt "Describe this image." \
  --image <path_to_image>
```

### Text / coding input

```bash
python -m mlx_vlm.generate \
  --model mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-4bit \
  --max-tokens 512 \
  --temperature 0.2 \
  --prompt "Write a Python function that parses a JSONL file and counts records by label."
```

## Notes

- This is a 4bit MLX quantized version of `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`.
- The model is intended for Apple Silicon inference with MLX.
- For multimodal usage, prefer `mlx-vlm` rather than plain `mlx-lm`.
- License: Apache 2.0, inherited from the source model metadata.

## Conversion

```bash
mlx_vlm.convert \
  --hf-path Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B \
  --mlx-path DeepSeek-V4-Pro-Qwen3.5-9B-4bit \
  --quantize \
  --q-bits 4 \
  --q-group-size 64 \
  --q-mode affine
```
