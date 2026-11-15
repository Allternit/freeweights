# mlx-community/LFM2.5-8B-A1B-MLX-4bit

This model [mlx-community/LFM2.5-8B-A1B-MLX-4bit](https://huggingface.co/mlx-community/LFM2.5-8B-A1B-MLX-4bit)
was converted to MLX format from [LiquidAI/LFM2.5-8B-A1B](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B)
using mlx-lm version **0.31.1**.

`lfm2_moe` (Lfm2MoeForCausalLM): hybrid 18× double-gated short-conv + 6× GQA
attention, 32-expert top-4 MoE — 8.3B total / 1.5B active, 128k context.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/LFM2.5-8B-A1B-MLX-4bit")

prompt = "hello"
if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```

## License

Derivative of `LiquidAI/LFM2.5-8B-A1B` under the **LFM Open License v1.0 (lfm1.0)**;
original model © Liquid AI. lfm1.0 commercial-use terms apply.
