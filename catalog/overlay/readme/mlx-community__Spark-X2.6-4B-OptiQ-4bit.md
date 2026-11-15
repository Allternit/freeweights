# mlx-community/Spark-X2.6-4B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A mixed-precision MLX quant of [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B), the on-device agent model that follows Spark-X2.5 with improved post-training for coding, tool use, long context and reasoning. 2.8 GB on disk, down from 7.7 GB bf16. See the [original card](https://huggingface.co/XHToken/Spark-X2.6-4B) for what the model is trained to do and how XHToken evaluates it.

Spark is a new architecture for MLX, and mlx-optiq adds support for it, so **`import optiq` before `mlx_lm.load`**: stock mlx-lm does not know the `spark2_5` model type.

## What it is

| Property | Value |
|---|---|
| Base | XHToken/Spark-X2.6-4B (same `spark2_5` architecture as Spark-X2.5-4B) |
| Layers | 108 at 8-bit, 109 at 4-bit (217 total) |
| Group size | 64 |
| KV cache | `kv_config.json` included (mixed-precision KV for `optiq serve --kv-config`) |
| On disk | 2.8 GB |

Following `llama.cpp`'s naming for mixed quants, the "4bit" label denotes the predominant precision, not the weighted average.

## How the bit-widths were chosen

The per-layer allocation was not measured on this model. It was transferred from [mlx-community/Spark-X2.5-4B-OptiQ-4bit](https://huggingface.co/mlx-community/Spark-X2.5-4B-OptiQ-4bit), whose allocation came from a KL-divergence sensitivity sweep over a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix). Spark-X2.6 keeps exactly the same architecture and modeling code as X2.5, and all **217 tensors matched with none unmatched**.

## Checked after conversion

Run through this quant and its bf16 parent on Apple Silicon with greedy decoding:

| Prompt | This quant | bf16 parent |
|---|---|---|
| 240 km in 3 h, average speed with steps | 80 km/h, same three steps | 80 km/h |
| Capital of Australia, and why not Sydney | Canberra, a planned federal capital | Canberra, a planned federal capital |
| `is_palindrome(s)` ignoring case and non-alphanumerics | correct function | correct function |
| Author and year of *Pride and Prejudice* | Jane Austen, 1813 | Jane Austen, 1813 |
| Call `get_weather` for Paris, JSON only | `{"tool_name": "get_weather", "params": {"location": "Paris"}}` | same call, `city` as the key |
| 240 km in 3 h, thinking on | short think, then 80 km/h | same think and answer |
| 17 × 23, number only | thinking off: **491** (wrong); thinking on: 391 | 391 both ways |

The one miss is bare mental arithmetic with thinking off, where the quant answers in a single token with no working; the Spark-X2.5 quant makes the same slip. With thinking on, the default, it gets it right.

## Usage

```bash
pip install mlx-optiq   # brings mlx-lm and the spark2_5 architecture
```

```python
import optiq  # registers spark2_5 with mlx-lm
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Spark-X2.6-4B-OptiQ-4bit")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Explain quantum computing in simple terms."}],
    tokenize=False, add_generation_prompt=True, enable_thinking=False)
print(generate(model, tokenizer, prompt=prompt, max_tokens=300))
```

Serving, with the mixed-precision KV cache, tool calling and the OpenAI, Responses and Anthropic Messages APIs:

```bash
optiq serve --model mlx-community/Spark-X2.6-4B-OptiQ-4bit --kv-config kv_config.json
```

### Thinking and sampling

Thinking is on by default. The chat template takes `reasoning_effort` of `high` (the default) or `low` to set how much it thinks, or `enable_thinking: false` to turn it off; pass them as `chat_template_kwargs` at the endpoint or as keywords to `apply_chat_template`. Through `optiq serve`, the standard `reasoning_effort: "none"` also turns it off. XHToken's sampling defaults, `temperature 1.0` and `top_p 0.95`, are bundled in `generation_config.json`.

See the [Spark family guide](https://mlx-optiq.com/docs/spark) for serving flags and family caveats.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **Spark family guide:** [mlx-optiq.com/docs/spark](https://mlx-optiq.com/docs/spark)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)
