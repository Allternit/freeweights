# mlx-community/Qwen3-30B-A3B-4bit-DWQ

This model is a custom DWQ quant made by distilling from the 6-bit to the 4-bit quantization of [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B)

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3-30B-A3B-4bit-DWQ")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```