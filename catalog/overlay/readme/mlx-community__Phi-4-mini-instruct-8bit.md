# mlx-community/Phi-4-mini-instruct-8bit

The Model [mlx-community/Phi-4-mini-instruct-8bit](https://huggingface.co/mlx-community/Phi-4-mini-instruct-8bit) was converted to MLX format from [microsoft/Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct) using mlx-lm version **0.21.5**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Phi-4-mini-instruct-8bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
