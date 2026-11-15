# mlx-community/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2-4-bit

The Model [mlx-community/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2-4-bit](https://huggingface.co/mlx-community/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2-4-bit) was converted to MLX format from [Goekdeniz-Guelmez/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2](https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2) using mlx-lm version **0.18.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Josiefied-Qwen2.5-7B-Instruct-abliterated-v2-4-bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
