# mlx-community/SmolLM-135M-Instruct-4bit

The Model [mlx-community/SmolLM-135M-Instruct-4bit](https://huggingface.co/mlx-community/SmolLM-135M-Instruct-4bit) was converted to MLX format from [HuggingFaceTB/SmolLM-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct) using mlx-lm version **0.15.2**.

## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/SmolLM-135M-Instruct-4bit")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
