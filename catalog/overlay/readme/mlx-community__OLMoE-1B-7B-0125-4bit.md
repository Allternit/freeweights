# mlx-community/OLMoE-1B-7B-0125-4bit

The Model [mlx-community/OLMoE-1B-7B-0125-4bit](https://huggingface.co/mlx-community/OLMoE-1B-7B-0125-4bit) was
converted to MLX format from [allenai/OLMoE-1B-7B-0125](https://huggingface.co/allenai/OLMoE-1B-7B-0125)
using mlx-lm version **0.21.6**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/OLMoE-1B-7B-0125-4bit")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
