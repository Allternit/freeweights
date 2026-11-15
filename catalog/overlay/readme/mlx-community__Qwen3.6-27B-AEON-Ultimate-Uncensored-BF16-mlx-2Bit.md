# usermma/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-mlx-2Bit

The Model [mlx-community/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-mlx-2Bit](https://huggingface.co/usermma/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-mlx-2Bit) was converted to MLX format from [AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16](https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16) using mlx-lm version **0.31.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("usermma/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16-mlx-2Bit")

prompt="hello"

if hasattr(tokenizer, "apply_chat_template") and tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
