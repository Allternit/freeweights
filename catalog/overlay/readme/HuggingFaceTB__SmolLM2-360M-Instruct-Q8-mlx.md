# reach-vb/SmolLM2-360M-Instruct-Q8-mlx

The Model [reach-vb/SmolLM2-360M-Instruct-Q8-mlx](https://huggingface.co/reach-vb/SmolLM2-360M-Instruct-Q8-mlx) was converted to MLX format from [HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct) using mlx-lm version **0.19.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("reach-vb/SmolLM2-360M-Instruct-Q8-mlx")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
