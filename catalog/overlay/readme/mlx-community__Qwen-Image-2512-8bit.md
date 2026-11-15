# Qwen-Image 8-bit MLX

MLX-optimized 8-bit quantized version of [Qwen-Image](https://huggingface.co/Qwen/Qwen-Image) for Apple Silicon.

**First MLX port of Qwen-Image!** 🎉

## Quick Start

```bash
pip install mflux

mflux-generate-qwen \
  --model mlx-community/Qwen-Image-2512-8bit \
  --prompt "A photorealistic cat wearing a tiny top hat" \
  --steps 20
```

## Performance

| Metric | Value |
|--------|-------|
| Size | 34GB (8-bit quantized) |
| Speed | ~8.5s/step on M-series Mac |
| 20 steps | ~2:50 total |

## Model Details

- **Base Model:** Qwen/Qwen-Image (Dec 2025)
- **Quantization:** 8-bit
- **Framework:** MLX (Apple Silicon optimized)
- **Converted with:** mflux 0.14.0

## Hardware Requirements

- Apple Silicon Mac (M1/M2/M3/M4/M5)
- ~40GB unified memory recommended for 8-bit

## Sample Output

Generated with prompt: "A photorealistic cat wearing a tiny top hat, studio lighting"

## All Quantizations

- [8-bit](https://huggingface.co/mlx-community/Qwen-Image-2512-8bit) (34GB)
- [6-bit](https://huggingface.co/mlx-community/Qwen-Image-2512-6bit) (29GB)
- [5-bit](https://huggingface.co/mlx-community/Qwen-Image-2512-5bit) (27GB)
- [4-bit](https://huggingface.co/mlx-community/Qwen-Image-2512-4bit) (24GB)
- [3-bit](https://huggingface.co/mlx-community/Qwen-Image-2512-3bit) (22GB)

## License

Apache 2.0 (same as base model)

## Credits

- Original model: [Qwen Team](https://huggingface.co/Qwen)
- MLX framework: [Apple ML Explore](https://github.com/ml-explore/mlx)
- mflux: [filipstrand](https://github.com/filipstrand/mflux)
