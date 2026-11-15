# mlx-community/Qwen2.5-Coder-1.5B-4bit

The Model [mlx-community/Qwen2.5-Coder-1.5B-4bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-1.5B-4bit) was converted to MLX format from [Qwen/Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B) using mlx-lm version **0.18.1**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-Coder-1.5B-4bit")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
