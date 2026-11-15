# lmstudio-community/Qwen3-1.7B-MLX-bf16

This model [lmstudio-community/Qwen3-1.7B-MLX-bf16](https://huggingface.co/lmstudio-community/Qwen3-1.7B-MLX-bf16) was
converted to MLX format from [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
using mlx-lm version **0.24.0**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("lmstudio-community/Qwen3-1.7B-MLX-bf16")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
