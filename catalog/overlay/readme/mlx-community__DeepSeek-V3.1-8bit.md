# mlx-community/DeepSeek-V3.1-8bit

This model [mlx-community/DeepSeek-V3.1-8bit](https://huggingface.co/mlx-community/DeepSeek-V3.1-8bit) was
converted to MLX format from [deepseek-ai/DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)
using mlx-lm version **0.26.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/DeepSeek-V3.1-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
