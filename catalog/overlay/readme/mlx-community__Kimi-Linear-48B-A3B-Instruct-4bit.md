# mlx-community/Kimi-Linear-48B-A3B-Instruct-4bit

This model [mlx-community/Kimi-Linear-48B-A3B-Instruct-4bit](https://huggingface.co/mlx-community/Kimi-Linear-48B-A3B-Instruct-4bit) was
converted to MLX format from [moonshotai/Kimi-Linear-48B-A3B-Instruct](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct)
using mlx-lm version **0.28.4**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Kimi-Linear-48B-A3B-Instruct-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
