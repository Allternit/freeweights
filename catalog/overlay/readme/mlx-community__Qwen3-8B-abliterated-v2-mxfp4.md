# mlx-community/Qwen3-8B-abliterated-v2-mxfp4

This model [mlx-community/Qwen3-8B-abliterated-v2-mxfp4](https://huggingface.co/mlx-community/Qwen3-8B-abliterated-v2-mxfp4) was
converted to MLX format from [huihui-ai/Huihui-Qwen3-8B-abliterated-v2](https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2)
using mlx-lm version **0.29.0**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3-8B-abliterated-v2-mxfp4")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
