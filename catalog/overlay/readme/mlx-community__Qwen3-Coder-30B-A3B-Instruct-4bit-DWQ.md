# mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit-DWQ

This model [mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit-DWQ](https://huggingface.co/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit-DWQ) was
converted to MLX format from [Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
using mlx-lm version **0.26.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit-DWQ")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
