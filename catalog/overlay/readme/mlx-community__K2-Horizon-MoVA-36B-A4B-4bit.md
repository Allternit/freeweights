# K2-Horizon-MoVA-36B-A4B (MLX, 4-bit)

Mixed-precision **4-bit** MLX quantization of [IFM/K2-Horizon-MoVA-36B-A4B](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B), converted from revision `e5c131d`. **5.6 bits/weight effective**, 25 GB on disk. For Apple silicon.

K2-Horizon-MoVA-36B-A4B is IFM's sparse K2-Horizon model: a 36B-parameter Mixture-of-Experts model with 4B active per token and 512K context. Its attention is Mixture-of-Values (MoVA), where the values come from 4 of 64 routed value experts.

## Requirements

mlx-lm doesn't support the `k2_horizon` architecture yet. There's an open request: [mlx-lm#1876](https://github.com/ml-explore/mlx-lm/issues/1876). Until support lands, **this repo ships the MLX model code** ([`k2_horizon.py`](./k2_horizon.py)), which mlx-lm loads through the `model_file` entry in `config.json`. So the released mlx-lm works as-is:

```bash
pip install -U mlx-lm
```

Pass `--trust-remote-code` (or `trust_remote_code=True`). mlx-lm 0.31.3 loads the file without it, but newer versions require it. The file runs on your machine, so read it first if you like.

Once K2-Horizon support lands in a released mlx-lm, this repo will be updated to use it. If something breaks after that, open a discussion here asking for a re-upload.

## How it was quantized

Mixed precision, chosen from measurements rather than a fixed rule:

- **4-bit** (affine, group size 64): the routed MoE experts and the shared expert. These hold most of the parameters.
- **8-bit** (affine, group size 64): everything else: attention (including the MoVA value experts), the dense MLPs of layers 0–2, the embeddings and `lm_head`.
- **bf16**: the MoE and MoVA routers.

I compared three 4-bit recipes against bf16 on WikiText-2. Plain 4-bit everywhere: +4.5% perplexity. 4-bit with only the MoVA value experts at 8-bit: +4.4%. This recipe: **+1.2%**, for about 5 GB more memory than plain 4-bit. Keeping the value experts alone at 8-bit barely helps; what matters is keeping all the non-expert weights at 8-bit.

## Memory

Peak **26.5 GB** for a short prompt: fits a **48 GB** Mac under the default Metal working-set cap. A 36 GB Mac needs a raised cap (`sudo sysctl iogpu.wired_limit_mb=...`). The KV cache adds about 192 KB per token (about 24 GB at 128K tokens).

## Conversion check

The MLX implementation was checked against IFM's PyTorch code (`modeling_k2_horizon.py`) in **fp32 on the real weights**, one layer at a time. All 48 layers match to a relative error of 1e-6 or better, and the next-token predictions agree at every position.

Smoke-tested after conversion with released mlx-lm 0.31.3 (`mlx_lm.generate` and `mlx_lm.server`):

- `17 * 23` → `391` with correct reasoning
- "capital of Australia" → `Canberra`
- A multi-turn server conversation that carries context correctly

On a **Mac Studio M4 Max 128GB**: 59.6 tok/s generation, peak 26.5 GB (short prompt).

## Benchmarks (all K2-Horizon MLX variants)

WikiText-2 test perplexity (128 × 512 tokens, lower is better) and generation speed on an M4 Max 128GB, all measured the same way:

| | [bf16](https://huggingface.co/mlx-community/K2-Horizon-MoVA-36B-A4B-bf16) | [8-bit](https://huggingface.co/mlx-community/K2-Horizon-MoVA-36B-A4B-8bit) | [4-bit](https://huggingface.co/mlx-community/K2-Horizon-MoVA-36B-A4B-4bit) |
|---|---|---|---|
| Bits/weight | 16 | 8.5 | 5.6 |
| Disk | 70 GB | 37 GB | 25 GB |
| Peak memory | 75.0 GB | 39.9 GB | 26.5 GB |
| WikiText-2 perplexity | 11.368 | 11.372 (+0.04%) | 11.508 (+1.2%) |
| Generation | 35.3 tok/s | 51.2 tok/s | 59.6 tok/s |

Perplexity is a coarse signal. Test the versions on your own workload before picking one.

## Usage

```bash
mlx_lm.generate --model mlx-community/K2-Horizon-MoVA-36B-A4B-4bit --trust-remote-code --prompt "Explain mixture-of-experts in two sentences." --max-tokens 2048
```

```python
from mlx_lm import load, generate

# Newer mlx-lm versions need trust_remote_code=True; on mlx-lm 0.31.3 use load("mlx-community/K2-Horizon-MoVA-36B-A4B-4bit").
model, tokenizer = load("mlx-community/K2-Horizon-MoVA-36B-A4B-4bit", trust_remote_code=True)
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

[Apache-2.0](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B), inherited from the base model. Refer to the [original model card](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B) for architecture, benchmarks and intended use. All credit for the model belongs to IFM.
