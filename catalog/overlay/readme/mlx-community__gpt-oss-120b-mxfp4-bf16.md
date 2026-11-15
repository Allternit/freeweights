# mlx-community/gpt-oss-120b-mxfp4-bf16

This model [mlx-community/gpt-oss-120b-mxfp4-bf16](https://huggingface.co/mlx-community/gpt-oss-120b-mxfp4-bf16) was
converted to MLX format from [openai/gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)
using mlx-lm version **0.31.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/gpt-oss-120b-mxfp4-bf16")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
