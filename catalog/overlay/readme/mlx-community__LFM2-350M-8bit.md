# mlx-community/LFM2-350M-8bit

This model [mlx-community/LFM2-350M-8bit](https://huggingface.co/mlx-community/LFM2-350M-8bit) was
converted to MLX format from [LiquidAI/LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M)
using mlx-lm version **0.26.0**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/LFM2-350M-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
