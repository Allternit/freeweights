# mlx-community/Qwen2.5-Coder-7B-Instruct-bf16

The Model [mlx-community/Qwen2.5-Coder-7B-Instruct-bf16](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-bf16) was converted to MLX format from [Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct) using mlx-lm version **0.18.1**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-Coder-7B-Instruct-bf16")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
