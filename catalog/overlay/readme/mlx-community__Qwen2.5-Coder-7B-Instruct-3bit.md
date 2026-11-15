# mlx-community/Qwen2.5-Coder-7B-Instruct-3bit

The Model [mlx-community/Qwen2.5-Coder-7B-Instruct-3bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-3bit) was
converted to MLX format from [Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
using mlx-lm version **0.20.4**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-Coder-7B-Instruct-3bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
