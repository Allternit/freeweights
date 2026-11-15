# mlx-community/DeepSeek-V4-Flash

This 8-bit model [mlx-community/DeepSeek-V4-Flash](https://huggingface.co/mlx-community/DeepSeek-V4-Flash) was converted to MLX format from [deepseek-ai/DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash).

DeepSeek-V4-Flash is a Mixture-of-Experts model with 284B total parameters, 13B activated parameters, and a context length of 1M tokens. Refer to the [original model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash) for more details on the model.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/DeepSeek-V4-Flash")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
