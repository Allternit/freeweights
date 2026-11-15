# mlx-community/Olmo-3-7B-Instruct-8bit

This model [mlx-community/Olmo-3-7B-Instruct-8bit](https://huggingface.co/mlx-community/Olmo-3-7B-Instruct-8bit) was
converted to MLX format from [allenai/Olmo-3-7B-Instruct](https://huggingface.co/allenai/Olmo-3-7B-Instruct)
using mlx-lm version **0.28.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Olmo-3-7B-Instruct-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
