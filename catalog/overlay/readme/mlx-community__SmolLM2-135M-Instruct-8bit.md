# mlx-community/SmolLM2-135M-Instruct-8bit

The Model [mlx-community/SmolLM2-135M-Instruct-8bit](https://huggingface.co/mlx-community/SmolLM2-135M-Instruct-8bit) was converted to MLX format from [mlx-community/SmolLM2-135M-Instruct](https://huggingface.co/mlx-community/SmolLM2-135M-Instruct) using mlx-lm version **0.19.3**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/SmolLM2-135M-Instruct-8bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
