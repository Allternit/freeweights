# mlx-community/SmolLM3-3B-4bit

This model [mlx-community/SmolLM3-3B-4bit](https://huggingface.co/mlx-community/SmolLM3-3B-4bit) was
converted to MLX format from [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
using mlx-lm version **0.25.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/SmolLM3-3B-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
