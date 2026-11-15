# K2-Horizon-3.7B (MLX, 4-bit)

Mixed-precision **4-bit** MLX quantization of [IFM/K2-Horizon-3.7B](https://huggingface.co/IFM/K2-Horizon-3.7B), converted from revision `943ce4e`. **6.5 bits/weight effective**, 4.1 GB on disk. For Apple silicon.

K2-Horizon-3.7B is IFM's small dense K2-Horizon model: a 3.7B decoder-only model with a 512K (524,288-token) context window.

## Requirements

mlx-lm doesn't support the `k2_horizon` architecture yet. There's an open request: [mlx-lm#1876](https://github.com/ml-explore/mlx-lm/issues/1876). Until support lands, **this repo ships the MLX model code** ([`k2_horizon.py`](./k2_horizon.py)), which mlx-lm loads through the `model_file` entry in `config.json`. So the released mlx-lm works as-is:

```bash
pip install -U mlx-lm
```

Pass `--trust-remote-code` (or `trust_remote_code=True`). mlx-lm 0.31.3 loads the file without it, but newer versions require it. The file runs on your machine, so read it first if you like; its comments describe how it differs from IFM's PyTorch code.

Once K2-Horizon support lands in a released mlx-lm, this repo will be updated to use it. If something breaks after that, open a discussion here asking for a re-upload.

## How it was quantized

Mixed precision, chosen from measurements rather than a fixed rule (integer affine quantization, bf16 scales and biases):

- **4-bit, group size 32**: the MLP weights (`gate_proj`, `up_proj`, `down_proj`). These hold most of the parameters.
- **8-bit, group size 64**: everything else: attention, the embeddings and `lm_head`.

Plain 4-bit (everything 4-bit, group size 64) loses too much on this model: **+21.5%** WikiText-2 perplexity versus bf16. This recipe loses **+4.4%**. On all three dense K2-Horizon models, plain 4-bit lost 18-22%, far more than on the 36B MoE model, so the dense 4-bit repos use this mixed recipe.

## Memory

Peak **4.3 GB** for a short prompt; fits a **16 GB** Mac. The KV cache adds about 144 KB per token in bf16 (18.0 GB at 128K tokens), so long contexts need more memory; `--max-kv-size` and KV-cache quantization (`--kv-bits 8`, where available) reduce it.

## Conversion check

The MLX implementation was checked against IFM's PyTorch code (`modeling_k2_horizon.py`) in **fp32 on the real weights of this model**:

- Layer by layer, all 36 layers match to a relative error of 4e-6 or better, and the next-token predictions agree at every position.
- Token by token: the full model in fp32 greedily generated with the KV cache, and the PyTorch model picked the same token at every step (256/256 tokens across English, code, math and Chinese prompts). Cached and uncached outputs also agree at every step.

Smoke-tested after conversion with released mlx-lm 0.31.3: `17 * 23` → `391` and "capital of Australia" → `Canberra`, both ending normally. On a **Mac Studio M4 Max 128GB**: 109.6 tok/s generation, peak 4.3 GB (short prompt).

## Benchmarks (all K2-Horizon-3.7B MLX variants)

WikiText-2 test perplexity (128 × 512 tokens, lower is better) and generation speed on an M4 Max 128GB, all measured the same way:

| | [bf16](https://huggingface.co/mlx-community/K2-Horizon-3.7B-bf16) | [8-bit](https://huggingface.co/mlx-community/K2-Horizon-3.7B-8bit) | [4-bit](https://huggingface.co/mlx-community/K2-Horizon-3.7B-4bit) |
|---|---|---|---|
| Bits/weight | 16 | 8.5 | 6.5 |
| Disk | 10.1 GB | 5.4 GB | 4.1 GB |
| Peak memory | 10.2 GB | 5.5 GB | 4.3 GB |
| WikiText-2 perplexity | 17.552 | 17.544 (-0.05%) | 18.324 (+4.4%) |
| Generation | 50.3 tok/s | 84.2 tok/s | 109.6 tok/s |

Perplexity is a coarse signal. Test the versions on your own workload before picking one. Other K2-Horizon sizes: the [K2-Horizon collection](https://huggingface.co/collections/mlx-community/k2-horizon).

## Usage

```bash
mlx_lm.generate --model mlx-community/K2-Horizon-3.7B-4bit --trust-remote-code --prompt "Explain mixture-of-experts in two sentences." --max-tokens 2048
```

```python
from mlx_lm import load, generate

# Newer mlx-lm versions need trust_remote_code=True; on mlx-lm 0.31.3 use load("mlx-community/K2-Horizon-3.7B-4bit").
model, tokenizer = load("mlx-community/K2-Horizon-3.7B-4bit", trust_remote_code=True)
messages = [{"role": "user", "content": "Explain mixture-of-experts in two sentences."}]
prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
print(generate(model, tokenizer, prompt, max_tokens=2048))
```

`mlx_lm.chat` and `mlx_lm.server` take the same `--trust-remote-code` flag.

The model thinks before it answers, inside `<ifm|think> … </ifm|think>`. Leave room for that in `max_tokens`. The effort level is set with `reasoning_effort` in the chat template: `"high"` (default), `"medium"` or `"low"`, e.g. `apply_chat_template(messages, add_generation_prompt=True, reasoning_effort="low")`.

**Notes:**

- **Server output:** mlx-lm doesn't recognize the `<ifm|think>` tags yet, so `mlx_lm.server` returns the thinking text inside `content`, before `</ifm|think>`, rather than in a separate `reasoning` field. K2-Horizon's tool-call format isn't parsed yet either.
- **Chat template change:** the original template raises an error when an earlier assistant message has no thinking field, which is what OpenAI-style clients send. The template here renders empty thinking for those messages instead. Nothing else was changed.

## License

[Apache-2.0](https://huggingface.co/IFM/K2-Horizon-3.7B), inherited from the base model. Refer to the [original model card](https://huggingface.co/IFM/K2-Horizon-3.7B) for architecture, benchmarks and intended use. All credit for the model belongs to IFM.
