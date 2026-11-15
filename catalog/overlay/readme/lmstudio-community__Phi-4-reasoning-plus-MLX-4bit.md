# lmstudio-community/Phi-4-reasoning-plus-MLX-4bit

This model [lmstudio-community/Phi-4-reasoning-plus-MLX-4bit](https://huggingface.co/lmstudio-community/Phi-4-reasoning-plus-MLX-4bit) was
converted to MLX format from [microsoft/Phi-4-reasoning-plus](https://huggingface.co/microsoft/Phi-4-reasoning-plus)
using mlx-lm version **0.24.0**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("lmstudio-community/Phi-4-reasoning-plus-MLX-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
