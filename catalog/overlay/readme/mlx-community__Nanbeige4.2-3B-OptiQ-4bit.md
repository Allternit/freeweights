# Nanbeige4.2-3B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

An [OptiQ](https://mlx-optiq.com) mixed-precision **4-bit** quant of [Nanbeige/Nanbeige4.2-3B](https://huggingface.co/Nanbeige/Nanbeige4.2-3B) for Apple Silicon.

Nanbeige4.2 is a **looped transformer**. It has a 22-layer decoder stack, but the stack is run twice with the same shared weights (`num_loops: 2`), so a 3B-parameter model does the compute of a much deeper one. Each loop keeps its own KV cache. Stock `mlx-lm` has no `nanbeige` class, so OptiQ (0.4.6+) ships a vendored, mlx-native port of the architecture that registers itself with `mlx-lm` on `import optiq`. It is a reasoning model and opens its answers with a short chain of thought before the final response.

## Install

```bash
pip install "mlx-optiq>=0.4.6"
```

The vendored `nanbeige` architecture ships in the wheel, so this repo loads under stock `mlx-lm` once `optiq` is imported. Older OptiQ releases cannot load it.

## Usage

```python
import optiq  # registers the nanbeige architecture with mlx-lm
from mlx_lm import load, generate

model, tok = load("mlx-community/Nanbeige4.2-3B-OptiQ-4bit")
prompt = tok.apply_chat_template(
    [{"role": "user", "content": "What is the capital of France?"}],
    tokenize=False, add_generation_prompt=True)
print(generate(model, tok, prompt, max_tokens=512))
```

`optiq serve --model mlx-community/Nanbeige4.2-3B-OptiQ-4bit` serves an OpenAI/Anthropic-compatible API. LoRA fine-tuning uses `optiq lora train`.

## The quant

OptiQ measures each layer's sensitivity to quantization and assigns per-layer bit-widths, rather than putting every layer at the same width. Here that gives a mix of 4-bit and 8-bit layers:

| | |
|---|---|
| Base model | Nanbeige/Nanbeige4.2-3B (bf16) |
| Quantized layers | 155 (93 at 4-bit, 62 at 8-bit) |
| Average precision | 5.5 bits/weight |
| Size on disk | 3.15 GB |
| Group size | 64 |

The full per-layer bit assignment is in `optiq_metadata.json`.

## Links

- [mlx-optiq on PyPI](https://pypi.org/project/mlx-optiq/) · [Docs](https://mlx-optiq.com/docs/) · [All OptiQ quants](https://mlx-optiq.com/models)
- Base model: [Nanbeige/Nanbeige4.2-3B](https://huggingface.co/Nanbeige/Nanbeige4.2-3B)
