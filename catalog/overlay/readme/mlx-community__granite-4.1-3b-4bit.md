# mlx-community/granite-4.1-3b-4bit

This model [mlx-community/granite-4.1-3b-4bit](https://huggingface.co/mlx-community/granite-4.1-3b-4bit) was
converted to MLX format from [ibm-granite/granite-4.1-3b](https://huggingface.co/ibm-granite/granite-4.1-3b)
using mlx-lm version **0.31.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/granite-4.1-3b-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
