# mlx-community/Olmo-3.1-32B-Instruct-4bit

This model [mlx-community/Olmo-3.1-32B-Instruct-4bit](https://huggingface.co/mlx-community/Olmo-3.1-32B-Instruct-4bit) was
converted to MLX format from [allenai/Olmo-3.1-32B-Instruct](https://huggingface.co/allenai/Olmo-3.1-32B-Instruct)
using mlx-lm version **0.29.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Olmo-3.1-32B-Instruct-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
