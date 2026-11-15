# Bonsai-1.7B — Unpacked FP16 Safetensors

FP16 safetensors (HuggingFace format) of the 1-bit Bonsai-1.7B model. This repo exists for users who want to run Bonsai with stock HuggingFace tooling or frameworks that don't yet support 1-bit weights natively. The 1-bit kernels are currently in our forks of [MLX](https://github.com/PrismML-Eng/mlx) and [llama.cpp](https://github.com/PrismML-Eng/llama.cpp) — once they land upstream, this unpacked version will no longer be needed.

> **We strongly recommend using the native 1-bit models instead.** The 1-bit format is where all the benefits of Bonsai come from — up to 14x memory reduction, 3x faster inference, and lower energy per token. This unpacked FP16 version is full-size and does not provide any of those advantages.

For the optimized 1-bit release models (recommended):

- **[Bonsai-1.7B GGUF Q1_0](https://huggingface.co/prism-ml/Bonsai-1.7B-gguf)** — 1-bit GGUF for llama.cpp (CUDA, Metal, CPU)
- **[Bonsai-1.7B MLX 1-bit](https://huggingface.co/prism-ml/Bonsai-1.7B-mlx-1bit)** — 1-bit MLX for Apple Silicon
