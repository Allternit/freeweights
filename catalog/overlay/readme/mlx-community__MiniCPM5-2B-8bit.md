# mlx-community/MiniCPM5-2B-8bit

This model [mlx-community/MiniCPM5-2B-8bit](https://huggingface.co/mlx-community/MiniCPM5-2B-8bit) was
converted to MLX format from
[openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B)
using mlx-lm version **0.31.3** (8-bit, group size 64).

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/MiniCPM5-2B-8bit")

prompt = "Hello, who are you?"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
