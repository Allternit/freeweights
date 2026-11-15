# mlx-community/Mistral-Small-3.2-24B-Instruct-2506-q8

This model [mlx-community/Mistral-Small-3.2-24B-Instruct-2506-q8](https://huggingface.co/mlx-community/Mistral-Small-3.2-24B-Instruct-2506-q8) was
converted to MLX format from [mistralai/Mistral-Small-3.2-24B-Instruct-2506](https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506)
using mlx-lm version **0.25.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Mistral-Small-3.2-24B-Instruct-2506-q8")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
