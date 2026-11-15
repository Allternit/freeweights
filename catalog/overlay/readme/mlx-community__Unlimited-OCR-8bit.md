# Unlimited-OCR — MLX 8bit

This repository contains the **8-bit affine quantized MLX conversion** of Baidu's official [`baidu/Unlimited-OCR`](https://huggingface.co/baidu/Unlimited-OCR) checkpoint. It is published for Apple Silicon inference with [`mlx-vlm`](https://github.com/Blaizzy/mlx-vlm) and maintained for use by [`shuuul/aimd`](https://github.com/shuuul/aimd).

The model architecture, tokenizer, processor configuration, prompts, and MIT license come from the official checkpoint. Refer to the [official model card](https://huggingface.co/baidu/Unlimited-OCR) and [Unlimited-OCR repository](https://github.com/baidu/Unlimited-OCR) for model details, capabilities, limitations, and attribution.

## Conversion details

| Setting | Value |
|---|---|
| Source | `baidu/Unlimited-OCR` |
| Tool | `mlx-vlm 0.6.8` |
| MLX runtime used for conversion | `mlx 0.32.0` |
| Output precision | `8bit` |
| Quantization | `affine, group size 64` |
| Repository size | 3.66 GiB |

The language-model weights use uniform affine quantization with group size 64. mlx-vlm intentionally leaves unsupported or quality-sensitive multimodal modules at higher precision, so total repository size is larger than a theoretical all-layer quantization.

Conversion command:

```bash
mlx_vlm.convert \
  --hf-path baidu/Unlimited-OCR \
  --mlx-path ./Unlimited-OCR-8bit \
  --quantize --q-bits 8 --q-group-size 64 --q-mode affine
```

## Use with AIMD

On macOS/Apple Silicon, install AIMD and run OCR directly:

```bash
uv tool install --force "aimd-tool @ git+https://github.com/shuuul/aimd.git@main"
aimd scan.pdf --task ocr --model unlimited_ocr_8bit
```

`unlimited_ocr` defaults to the 4-bit repository. AIMD runs each page in Unlimited-OCR's single-image gundam mode with prompt `document parsing.`, `cropping=True`, `base_size=1024`, `image_size=640`, and a sliding-window no-repeat n-gram guard. See the [AIMD README](https://github.com/shuuul/aimd#ocr-for-scanned-pdfs-and-images) for the complete runtime behavior.

## Use with mlx-vlm

```bash
pip install -U "mlx-vlm>=0.6.8"
python -m mlx_vlm.generate \
  --model mlx-community/Unlimited-OCR-8bit \
  --image scan.png \
  --prompt "document parsing." \
  --max-tokens 8192 \
  --temperature 0
```

Unlimited-OCR support first shipped in `mlx-vlm 0.6.4`; `0.6.8` or newer is recommended to match the conversion environment.

## Available MLX weights

| Precision | Repository | Size |
|---|---|---:|
| 4bit | [`mlx-community/Unlimited-OCR-4bit`](https://huggingface.co/mlx-community/Unlimited-OCR-4bit) | 2.29 GiB |
| 6bit | [`mlx-community/Unlimited-OCR-6bit`](https://huggingface.co/mlx-community/Unlimited-OCR-6bit) | 2.98 GiB |
| 8bit | [`mlx-community/Unlimited-OCR-8bit`](https://huggingface.co/mlx-community/Unlimited-OCR-8bit) | 3.66 GiB |
| bf16 | [`mlx-community/Unlimited-OCR-bf16`](https://huggingface.co/mlx-community/Unlimited-OCR-bf16) | 6.22 GiB |

## License and attribution

The upstream checkpoint is released under the MIT license. This repository is a format conversion and does not modify the upstream model architecture or claim ownership of Baidu's model.
