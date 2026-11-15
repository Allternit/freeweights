# mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

OptiQ mixed-precision quant of [OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED), a Qwen3.8-family vision-language model with a bundled MTP speculation head. 21 GB on disk.

## What it is

| Property | Value |
|---|---|
| Base | OBLITERATUS/Qwen3.8-27B-OBLITERATED (Qwen3.8, 27B) |
| Method | OptiQ mixed-precision, per-layer 4/8-bit |
| Bit allocation | Reused from the [Qwen3.8-27B OptiQ recipe](https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit): the architecture is identical, so the per-layer sensitivity ranking transfers directly and no per-model sweep is needed |
| Layer split | 237 components at 4-bit, 261 at 8-bit |
| Group size | 64 |
| On disk | 21 GB |
| MTP | Speculation head preserved in `optiq/mtp.safetensors` |
| Vision | bf16 vision tower kept in `optiq/optiq_vision.safetensors` for image input |

Following the naming `llama.cpp` uses for its mixed quants, the "4bit" label denotes the family, not the weighted average.

## Run it

Qwen3.8 and the MTP/vision sidecars register through OptiQ, so `import optiq` once before loading:

```bash
pip install "mlx-optiq>=0.4.27"
```

```python
import optiq  # registers the arch + MTP/vision sidecars
from mlx_lm import load, generate

model, tok = load("mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit")
prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Explain mixed-precision quantization in two sentences."}],
    tokenize=False, add_generation_prompt=True,
)
print(generate(model, tok, prompt=prompt, max_tokens=400))
```

For image input plus an OpenAI- and Anthropic-compatible endpoint with mixed-precision KV cache:

```bash
optiq serve --model mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit
```

This is a reasoning model, so give it a generous token budget.

The chat template is the full Qwen3.8 one, with image input and tool calls. The base model ships a text-only template, which this repo used until 18 Oct 2026.

**LM Studio:** its downloader flattens the `optiq/` folder. Move `mtp.safetensors` and `optiq_vision.safetensors` back into `optiq/` or the vision tower is not found.

Using the head outside `optiq serve`: `optiq/mtp.safetensors` holds Qwen's original MTP tensors, so its seven RMSNorm weights (`mtp.*norm*`) are zero-centred, applied as 1 + w. The main weights have the +1 folded in, as MLX expects. Add 1.0 to all seven norms when loading the head into another runtime.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **Base model:** [OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
