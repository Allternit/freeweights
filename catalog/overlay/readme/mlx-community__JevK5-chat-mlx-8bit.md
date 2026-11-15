# JevK5-mlx-8bit

> 8-bit MLX conversion of [alibiserikbay/JevK5](https://huggingface.co/alibiserikbay/JevK5) optimized for Apple Silicon native GPU inference.

**Converted by**: [SirSahOl](https://huggingface.co/SirSahOl)  
**Source Model**: [alibiserikbay/JevK5](https://huggingface.co/alibiserikbay/JevK5)  
**Framework**: [MLX](https://github.com/ml-explore/mlx) by Apple  
**Quantization**: 8-bit (Average 8.25 bits per weight)  
**Format**: safetensors  
**License**: apache-2.0  

---

## Model Details

*   **Architecture**: Qwen3_5ForCausalLM
*   **Parameters**: ~3.9B
*   **Context Length**: 262,144 tokens
*   **Format**: MLX (Apple Silicon native GPU format)
*   **Quantization**: 8-bit (Average 8.25 bits per weight)
*   **Active VRAM Footprint**: ~4.7 GB (Minimum recommended: 8 GB Unified Memory)

---

## Quick Start

### Installation

```bash
pip install mlx-lm
```

### Usage

#### CLI

```bash
# Chat interactively
mlx_lm.chat --model SirSahOl/JevK5-chat-mlx-8bit

# Generate text
mlx_lm.generate --model SirSahOl/JevK5-chat-mlx-8bit --prompt "Write a short poem about artificial intelligence."
```

#### Python API (with Chat Template)

```python
from mlx_lm import load, generate

model, tokenizer = load("SirSahOl/JevK5-chat-mlx-8bit")

messages = [
    {"role": "user", "content": "Explain quantum superposition in simple terms."}
]
prompt = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)

response = generate(model, tokenizer, prompt=prompt, verbose=True)
print(response)
```

---

## Performance Benchmarks

### Measured Benchmarks (Apple M1)

| Metric | 4-bit | 8-bit |
| :--- | :--- | :--- |
| **Tokens/sec** | **17.97** | **10.35** |
| **TTFT** | 55.74 ms | 96.71 ms |
| **Peak Memory** | 420.9 MB | 59.7 MB |

> Benchmarked on **Apple M1** with **8GB** unified memory.
> Average over 5 runs with 256 max tokens.

---

## Multi-Quantization Comparison

Evaluate your hardware budget and choose the optimal precision:

| Variant | Disk Size | VRAM Footprint | Target Apple Silicon Hardware | Key Advantage |
| :--- | :--- | :--- | :--- | :--- |
| **[4-bit MLX](https://huggingface.co/SirSahOl/JevK5-chat-mlx-4bit)** | ~2.5 GB | ~2.5 GB | M1 / M2 / M3 / M4 (8GB+) | Maximum generation speed and lowest RAM overhead. |
| **8-bit MLX** (This Repository) | ~4.5 GB | ~4.5 GB | M1 / M2 / M3 / M4 Pro/Max (16GB+) | Balanced accuracy and generation speed; near-lossless reasoning. |
| **[16-bit MLX](https://huggingface.co/SirSahOl/JevK5-chat-mlx-16bit)** | ~8.6 GB | ~8.6 GB | M2 / M3 / M4 Max/Ultra (32GB+) | Full unquantized precision; reference evaluation quality. |

---

## Who Should Use This?

| Your Hardware | Recommended Quantization |
|---------------|--------------------------|
| M1/M2/M3/M4 (8GB – 16GB) | **4-bit** — Best balance of speed, low memory, and multitasking capability |
| M1/M2/M3/M4 Pro/Max (18GB – 36GB) | **8-bit** — Higher quality reasoning with comfortable memory headroom |
| M1/M2/M3/M4 Max/Ultra (36GB – 192GB) | **16-bit** — Unquantized full precision, zero quality degradation |

**General guidance:**
- Use **4-bit** if you want to run this model alongside IDEs, browsers, and background development tools.
- Use **8-bit** if you have 16GB+ unified memory and require superior reasoning and code accuracy.
- Use **16-bit** for research, benchmarking, evaluation, or high-end workstation deployments.

---

## Other Quantization Variants

| Variant | Link |
|---------|------|
| 4-bit | [SirSahOl/JevK5-chat-mlx-4bit](https://huggingface.co/SirSahOl/JevK5-chat-mlx-4bit) |
| 8-bit | [SirSahOl/JevK5-chat-mlx-8bit](https://huggingface.co/SirSahOl/JevK5-chat-mlx-8bit) |
| 16-bit | [SirSahOl/JevK5-chat-mlx-16bit](https://huggingface.co/SirSahOl/JevK5-chat-mlx-16bit) |

---

## LM Studio & Local Inference Setup Guide

To prevent runaway loops and ensure correct conversational turn-taking, configure custom stop tokens in your local inference runtime:

1. `<|im_start|>`
2. `<|im_end|>`
3. `<|endoftext|>`

### Prompt Template Formatting

*   **System Prefix**: `<|im_start|>system\n`
*   **System Suffix**: `<|im_end|>\n`
*   **User Prefix**: `<|im_start|>user\n`
*   **Assistant Suffix**: `<|im_end|>\n<|im_start|>assistant\n`

### Ollama Quickstart

```dockerfile
FROM SirSahOl/JevK5-chat-mlx-8bit
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
PARAMETER temperature 0.7
```

```bash
ollama create jevk5-chat-mlx-8bit -f Modelfile
ollama run jevk5-chat-mlx-8bit
```

---

## Conversion Details

| Property | Value |
|----------|-------|
| **Source Model** | [alibiserikbay/JevK5](https://huggingface.co/alibiserikbay/JevK5) |
| **Quantization** | 8-bit |
| **mlx-lm Version** | 0.31.3 |
| **Conversion Time** | 29.98s |
| **Output Size** | 4.2 GB |
| **Date** | 2026-10-01T01:18:23.611682+00:00 |

### Reproduction

To reproduce this conversion:

```bash
pip install mlx-lm==0.31.3
python3 -m mlx_lm.convert --hf-path alibiserikbay/JevK5 --mlx-path output/JevK5-mlx-8bit -q --q-bits 8
```

---

## Limitations & Known Issues

- 4-bit group-wise quantization introduces minor precision loss compared to unquantized weights; for deep mathematical derivations or precision-critical reasoning, test the 8-bit or 16-bit variants.
- High context sequences (>32K tokens) require sufficient unified memory headroom; ensure unified memory is not overcommitted.
- This is a weight-only MLX conversion designed specifically for Apple Silicon GPUs (M1/M2/M3/M4 series).

---

## License

This model conversion inherits the license of the source model: **apache-2.0**.

See the [original model card](https://huggingface.co/alibiserikbay/JevK5) for full license details.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-10-01 | Initial conversion |

---

*Converted with [MLX Foundry](https://github.com/SirSahOl/mlx-foundry) — a professional pipeline for converting models to Apple MLX format.*
