# gemma-4-26B-A4B-it-heretic — MLX 2.6 BPW

Mixed-precision MLX quantization of [`coder3101/gemma-4-26B-A4B-it-heretic`](https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic), quantized with MLX Smart Quantize (MSQ) — my own sensitivity-based mixed-precision quantization method for Apple Silicon. It measures per-layer NMSE and assigns optimal bit widths automatically, combining architecture knowledge with measured data.

## Details

- **Type:** Vision (VLM)
- **Average:** 2.6 bits per weight
- **Method:** MLX Smart Quantize (MSQ)
- **AWQ scaling:** applied to 30 groups

## Evaluation

| Benchmark | Score | Samples |
|-----------|-------|---------|
| MMLU | 70.2% | 285 |
| MMMLU | — | — |
| HellaSwag | 82% | 200 |
| HellaSwag ML | — | — |
| GSM8K | 90.9% | 197 |
| Tool Calls | 74.2% | 33 |

