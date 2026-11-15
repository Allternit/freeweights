# mlx-community/granite-4.0-h-350m-8bit

This model [mlx-community/granite-4.0-h-350m-8bit](https://huggingface.co/mlx-community/granite-4.0-h-350m-8bit) was
converted to MLX format from [ibm-granite/granite-4.0-h-350m](https://huggingface.co/ibm-granite/granite-4.0-h-350m)
using mlx-lm version **0.28.4**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/granite-4.0-h-350m-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
