# mlx-community/gpt-oss-120b-4bit

This model [mlx-community/gpt-oss-120b-4bit](https://huggingface.co/mlx-community/gpt-oss-120b-4bit) was
converted to MLX format from [None](https://huggingface.co/None)
using mlx-lm version **0.26.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/gpt-oss-120b-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
