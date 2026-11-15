# mlx-community/Qwen2.5-Coder-7B-Instruct

The Model [mlx-community/Qwen2.5-Coder-7B-Instruct-MLX](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-MLX) was converted to MLX format from [Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct) using mlx-lm version **0.31.1**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-Coder-7B-Instruct")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```