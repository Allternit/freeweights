# mlx-community/OLMo-2-1124-7B-Instruct-4bit

The Model [mlx-community/OLMo-2-1124-7B-Instruct-4bit](https://huggingface.co/mlx-community/OLMo-2-1124-7B-Instruct-4bit) was
converted to MLX format from [allenai/OLMo-2-1124-7B-Instruct](https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct)
using mlx-lm version **0.20.1**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/OLMo-2-1124-7B-Instruct-4bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
