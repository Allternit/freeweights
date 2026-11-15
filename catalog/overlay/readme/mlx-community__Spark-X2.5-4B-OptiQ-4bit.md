# mlx-community/Spark-X2.5-4B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant of [XHToken/Spark-X2.5-4B](https://huggingface.co/XHToken/Spark-X2.5-4B), a dense 4B trained for conversation, coding, tool use and agent work, with a native 1M-token context and 200+ languages. Sensitive layers are kept at 8-bit and robust ones at 4-bit, so the on-disk size stays within a few percent of a stock uniform 4-bit quant while the parts that matter keep their precision.

Spark-X2.5 is a new architecture for MLX, and mlx-optiq adds support for it, so **`import optiq` before `mlx_lm.load`**: stock mlx-lm does not know the `spark2_5` model type.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit (sensitive) | 107 |
| Layers at 4-bit (robust) | 109 |
| Total quantized layers | 216 |
| Group size | 64 |
| Reference | bf16, KL-divergence sensitivity sweep over a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) |
| KV cache | `kv_config.json`, per-layer mixed precision for `optiq serve --kv-config` (5 layers at 8-bit, 31 at 4-bit) |
| Weights on disk | 2.8 GB |

We follow the same naming convention `llama.cpp` uses for Q4_K_M and similar mixed-precision quants: the "4-bit" label is for the predominant precision, not the weighted average.

## Capability Score

Measured on this quant against a uniform 4-bit quant of the same model, same harness, same prompts (MMLU 5-shot 1000, GSM8K, IFEval strict, BFCL V3 simple, HumanEval pass@1, HashHop; the Capability Score is their mean).

| Benchmark | uniform-4 | OptiQ-4 (mixed) | Δ |
|---|---|---|---|
| MMLU | 63.1% | 66.8% | +3.7 |
| GSM8K | 84.9% | 87.0% | +2.1 |
| IFEval (strict) | 75.8% | 75.2% | -0.6 |
| BFCL V3 | 70.0% | 75.5% | +5.5 |
| HumanEval | 74.4% | 75.6% | +1.2 |
| HashHop | 1.0% | 8.0% | +7.0 |
| **Capability Score** | 61.52 | **64.69** | +3.17 |

## Usage

```bash
pip install mlx-optiq   # brings mlx-lm and the spark2_5 architecture
```

```python
import optiq  # registers spark2_5 with mlx-lm
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Spark-X2.5-4B-OptiQ-4bit")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Explain quantum computing in simple terms."}],
    tokenize=False, add_generation_prompt=True, enable_thinking=False)
print(generate(model, tokenizer, prompt=prompt, max_tokens=300))
```

Serving, with the mixed-precision KV cache, tool calling and the OpenAI, Responses and Anthropic Messages APIs:

```bash
optiq serve --model mlx-community/Spark-X2.5-4B-OptiQ-4bit --kv-config kv_config.json
```

Only the nine full-attention layers' cache grows with the prompt; the sliding-window layers hold a fixed 512-token window. At 4-bit that is about 9 KB per token, so a 36 GB Mac serves roughly 200k tokens of prompt under the memory-safe default cap. `optiq code` uses the same server as a local coding agent.

### Thinking and sampling

Thinking is **on by default** in the chat template: the model reasons in a `<think>` block first, and a small `max_tokens` can be spent entirely on it. Give it a few hundred tokens for a direct question, or pass `enable_thinking: false` (as a `chat_template_kwargs` entry at the endpoint, or a keyword to `apply_chat_template`). Upstream evaluates in thinking mode with `temperature 1.0`, `top_p 0.95`; those are bundled in `generation_config.json` and `optiq serve` applies them unless you pass your own.

See the [Spark-X2.5 family guide](https://mlx-optiq.com/docs/spark) for serving flags and family caveats.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Spark-X2.5 family guide:** [mlx-optiq.com/docs/spark](https://mlx-optiq.com/docs/spark)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Calibration mix:** [mlx-optiq.com/blog/calibration-mix](https://mlx-optiq.com/blog/calibration-mix)
- **Base model:** [XHToken/Spark-X2.5-4B](https://huggingface.co/XHToken/Spark-X2.5-4B)

## Quantize your own

This quant was produced by [mlx-optiq](https://mlx-optiq.com). Point it at any Hugging Face model to get the same sensitivity-aware mixed precision:

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # full local workbench: chat, compare, quantize, fine-tune
```

## License

Apache 2.0, inherited from the base model.
