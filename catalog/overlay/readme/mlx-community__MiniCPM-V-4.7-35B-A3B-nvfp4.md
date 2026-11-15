# MiniCPM-V-4.7-35B-A3B-nvfp4

Converted from [openbmb/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B) at revision `17e651151c161dce119cd0ac57570f60da8a0b40` with [MLX-VLM main](https://github.com/Blaizzy/mlx-vlm/commit/e928101a144a3f11a27c7ef8d71b6d889b2d250c) (`e928101a144a3f11a27c7ef8d71b6d889b2d250c`, version 0.7.8). Support was added in [PR #2499](https://github.com/Blaizzy/mlx-vlm/pull/2499).

NVFP4 weight quantization (nvfp4, group size 16). This is mixed precision: vision modules, visual mergers, embeddings, output heads, and linear attention remain BF16; recurrent `A_log` tensors retain their source precision. The 35B-A3B expert routers use 8-bit affine quantization.

See the [original model card](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B) for the architecture, intended uses, and limitations. This conversion retains the source model's apache-2.0 license.

## Usage

Install MLX-VLM from `main` with MiniCPM-V 4.7 support:

```bash
pip install -U git+https://github.com/Blaizzy/mlx-vlm.git@main
mlx_vlm.generate --model mlx-community/MiniCPM-V-4.7-35B-A3B-nvfp4 --image path/to/image.jpg --prompt "Describe this image." --max-tokens 200 --temperature 0
```

The native NumPy/Pillow processor requires neither PyTorch nor remote code. It supports text, images, multiple images, and video. The default visual downsampling is `16x`; pass `--processor-kwargs '{"downsample_mode": "4x"}'` for finer detail.

## Reproduce conversion

```bash
mlx_vlm.convert --hf-path openbmb/MiniCPM-V-4.7-35B-A3B --revision 17e651151c161dce119cd0ac57570f60da8a0b40 --mlx-path MiniCPM-V-4.7-35B-A3B-nvfp4 --dtype bfloat16 -q --q-bits 4 --q-group-size 16 --q-mode nvfp4
```

For the exact converter version, install MLX-VLM at commit `e928101a144a3f11a27c7ef8d71b6d889b2d250c`. Conversion options, per-module quantization overrides, and weight SHA-256 hashes are recorded in [conversion.json](conversion.json).

## Validation

The saved checkpoint passed strict reloading, quantization configuration checks, greedy text generation, and cat-image generation in both `16x` and `4x` downsampling modes on JarvisLabs RTX PRO 6000 Blackwell (cuda) with MLX 0.32.3. See [validation.json](validation.json) for the outputs and environment. These are smoke checks, not a quality benchmark. Floating-point 4-bit formats can differ in output quality from affine quantization.
