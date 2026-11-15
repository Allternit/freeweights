# mlx-community/Jan-v3-4B-base-instruct-4bit

This model [mlx-community/Jan-v3-4B-base-instruct-4bit](https://huggingface.co/mlx-community/Jan-v3-4B-base-instruct-4bit) was
converted to MLX format from [janhq/Jan-v3-4B-base-instruct](https://huggingface.co/janhq/Jan-v3-4B-base-instruct)
using mlx-lm version **0.30.5**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Jan-v3-4B-base-instruct-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
