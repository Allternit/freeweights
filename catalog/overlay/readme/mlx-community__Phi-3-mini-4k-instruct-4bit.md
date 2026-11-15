# mlx-community/Phi-3-mini-4k-instruct-4bit
This model was converted to MLX format from [`microsoft/Phi-3-mini-4k-instruct`]() using mlx-lm version **0.10.0**.

Model added by [Prince Canuma](https://twitter.com/Prince_Canuma).

Refer to the [original model card](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct) for more details on the model.
## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Phi-3-mini-4k-instruct-4bit")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
