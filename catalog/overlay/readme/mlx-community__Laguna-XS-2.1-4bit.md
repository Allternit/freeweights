# Laguna-XS-2.1 (MLX, 4bit)

Converted from [poolside/Laguna-XS-2.1](https://huggingface.co/poolside/Laguna-XS-2.1)
to MLX format, quantized to 4 bits (group size 64, 4.503 bpw effective).

## Notes

- Works with **mlx-vlm** and **oMLX** (forcing the model's vlm mode). mlx-lm
  doesn't support the `laguna` architecture yet — there's an open PR:
  [mlx-lm#1223](https://github.com/ml-explore/mlx-lm/pull/1223).
- Sometimes I got an empty `</think>` tag at the start of responses, which
  isn't that common. It won't affect anything tho.

## Performance

Measured with oMLX's benchmark harness on a **Macbook Pro M5 Max 128GB 40 GPU**
(single request, 128 generated tokens):

| prompt | gen tok/s | prefill tok/s | TTFT ms | peak GB |
|---|---|---|---|---|
| 1k | 126.0 | 2797 | 367 | 18.2 |
| 4k | 121.2 | 4052 | 1011 | 18.8 |
| 8k | 116.6 | 3785 | 2165 | 18.9 |
| 16k | 109.1 | 3122 | 5248 | 19.2 |
| 32k | 91.3 | 2462 | 13312 | 19.8 |

## Variants

| Variant | bpw | Disk | gen tok/s (1k → 32k) |
|---|---|---|---|
| [bf16](https://huggingface.co/mlx-community/Laguna-XS-2.1-bf16) | 16 | 62 GB | 70.6 → 58.7 |
| [8bit](https://huggingface.co/mlx-community/Laguna-XS-2.1-8bit) | 8.500 | 33 GB | 95.4 → 76.7 |
| [6bit](https://huggingface.co/mlx-community/Laguna-XS-2.1-6bit) | 6.501 | 25 GB | 102.9 → 80.9 |
| [5bit](https://huggingface.co/mlx-community/Laguna-XS-2.1-5bit) | 5.502 | 21 GB | 115.9 → 87.7 |
| **4bit** (this repo) | 4.503 | 18 GB | 126.0 → 91.3 |
| [3bit](https://huggingface.co/mlx-community/Laguna-XS-2.1-3bit) | 3.503 | 14 GB | 137.2 → 98.8 |

## Usage

```bash
uvx --from mlx-vlm mlx_vlm.generate --model mlx-community/Laguna-XS-2.1-4bit --prompt "..." --max-tokens 300
```

## License

[OpenMDW-1.1](https://huggingface.co/poolside/Laguna-XS-2.1/blob/main/LICENSE.md),
inherited from the base model.
