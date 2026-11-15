# mlx-community/DeepSeek-V4-Pro

This 8-bit model [mlx-community/DeepSeek-V4-Pro](https://huggingface.co/mlx-community/DeepSeek-V4-Pro) was converted to MLX format from [deepseek-ai/DeepSeek-V4-Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro).

DeepSeek-V4-Pro is a Mixture-of-Experts model with 1.6T total parameters, 49B activated parameters, and a context length of 1M tokens. Refer to the [original model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) for more details on the model.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/DeepSeek-V4-Pro")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
