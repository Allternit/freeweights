# mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-mxfp8

This model [mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-mxfp8](https://huggingface.co/mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-mxfp8) was
converted to MLX format from
[nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
using mlx-lm version **0.31.3** (MXFP8, group size 32).

NVIDIA-Nemotron-3.5-Lightning-30B-A3B is a hybrid Mamba-2 / attention
Mixture-of-Experts model (~31B total parameters, ~3B active per token).

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-mxfp8")

prompt = "Hello, who are you?"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```
