# mlx-community/Qwen2.5-Coder-7B-8bit

The Model [mlx-community/Qwen2.5-Coder-7B-8bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-8bit) was converted to MLX format from [Qwen/Qwen2.5-Coder-7B](https://huggingface.co/Qwen/Qwen2.5-Coder-7B) using mlx-lm version **0.18.1**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-Coder-7B-8bit")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
