# adrgrondin/MiniCPM5-2B-mlx-4Bit

The Model [adrgrondin/MiniCPM5-2B-mlx-4Bit](https://huggingface.co/adrgrondin/MiniCPM5-2B-mlx-4Bit) was converted to MLX format from [openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B) using mlx-lm version **0.31.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("adrgrondin/MiniCPM5-2B-mlx-4Bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
