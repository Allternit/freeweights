# mlx-community/granite-4.0-h-1b-6bit

This model [mlx-community/granite-4.0-h-1b-6bit](https://huggingface.co/mlx-community/granite-4.0-h-1b-6bit) was
converted to MLX format from [ibm-granite/granite-4.0-h-1b](https://huggingface.co/ibm-granite/granite-4.0-h-1b)
using mlx-lm version **0.28.4**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/granite-4.0-h-1b-6bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
