# mlx-community/deepseek-ai-DeepSeek-V4-Flash-8bit

This model [mlx-community/deepseek-ai-DeepSeek-V4-Flash-8bit](https://huggingface.co/mlx-community/deepseek-ai-DeepSeek-V4-Flash-8bit) was
converted to MLX format from [deepseek-ai/DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
using mlx-lm version **0.31.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/deepseek-ai-DeepSeek-V4-Flash-8bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
