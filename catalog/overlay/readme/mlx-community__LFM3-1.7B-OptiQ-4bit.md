# mlx-community/LFM3-1.7B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

An OptiQ mixed-precision quant of [LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B), the first model in Liquid's LFM3 family. It is 1.3 GB on disk, down from 3.5 GB at bf16, with a 256k context.

LFM3 keeps Liquid's hybrid backbone of short convolutions and attention, and adds sliding-window attention, so only 6 of its 24 layers keep a full-length KV cache. OptiQ measures each layer's sensitivity and assigns its bit-width from that.

## What it is

| Property | Value |
|---|---|
| Base | [LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B) |
| Architecture | `lfm3`: 24 layers, 13 convolution, 5 sliding-window attention (256 tokens), 6 full attention |
| Method | OptiQ mixed-precision, sensitivity-driven (bf16 reference) |
| On disk | 1.3 GB (bf16: 3.5 GB) |
| Context | 256k |

About half of the weight matrices stay at 8-bit (75 of 153), the ones whose quantization moved the output most. The rest are at 4-bit.

## Capability Score

Six-metric mean, the standard OptiQ eval, run in reasoning mode because the model thinks before it answers by default. The baseline is a uniform 4-bit quant of the same model, scored the same way.

| Metric | OptiQ | Uniform 4-bit |
|---|---:|---:|
| MMLU (generative) | 77.6% | 76.3% |
| GSM8K | 92.4% | 92.4% |
| IFEval (strict) | 72.6% | 66.5% |
| BFCL-V3 simple (200 calls) | 91.5% | 93.0% |
| HumanEval (164 problems, pass@1) | 72.6% | 64.0% |
| HashHop (long-context retrieval) | 21.0% | 14.0% |
| **Capability Score** (mean of 6) | **71.29** | **67.70** |

The OptiQ quant is ahead by 3.6 points overall. The gains are on instruction following (+6.1) and code (+8.6). BFCL is 1.5 points behind, inside its ±3.5 point margin on 200 calls.

## Run it

```bash
pip install -U mlx-optiq
optiq serve --model mlx-community/LFM3-1.7B-OptiQ-4bit
```

That gives you an OpenAI and Anthropic compatible endpoint with mixed-precision KV cache (`kv_config.json` in this repo), tool calling, and prompt caching.

The model reasons before it answers, so give it a generous `max_tokens`. Liquid's recommended sampling (`temperature 0.1`, `top_k 50`, `repetition_penalty 1.1`) ships in `generation_config.json`, and `optiq serve` applies it automatically.

Or from Python. `mlx-lm` does not know the LFM3 architecture yet, so register OptiQ's implementation first:

```python
from optiq.models import install_vendored
from mlx_lm import load, generate

install_vendored()
model, tokenizer = load("mlx-community/LFM3-1.7B-OptiQ-4bit")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Summarise this contract clause in two sentences."}],
    add_generation_prompt=True, tokenize=False,
)
print(generate(model, tokenizer, prompt=prompt, max_tokens=4096))
```

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
