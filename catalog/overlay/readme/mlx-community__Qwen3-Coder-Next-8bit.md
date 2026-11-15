# mlx-community/Qwen3-Coder-Next-8bit

This model [mlx-community/Qwen3-Coder-Next-8bit](https://huggingface.co/mlx-community/Qwen3-Coder-Next-8bit) was
converted to MLX format from [Qwen/Qwen3-Coder-Next](https://huggingface.co/Qwen/Qwen3-Coder-Next)
using mlx-lm version **0.30.5**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3-Coder-Next-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
