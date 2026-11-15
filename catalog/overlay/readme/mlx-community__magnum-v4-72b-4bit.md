# mlx-community/magnum-v4-72b-4bit

The Model [mlx-community/magnum-v4-72b-4bit](https://huggingface.co/mlx-community/magnum-v4-72b-4bit) was
converted to MLX format from [anthracite-org/magnum-v4-72b](https://huggingface.co/anthracite-org/magnum-v4-72b)
using mlx-lm version **0.20.4**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/magnum-v4-72b-4bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
