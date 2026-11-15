# mlx-community/OpenCodeInterpreter-SC2-3B-4bit
This model was converted to MLX format from [`m-a-p/OpenCodeInterpreter-SC2-3B`]().
Refer to the [original model card](https://huggingface.co/m-a-p/OpenCodeInterpreter-SC2-3B) for more details on the model.
## Use with mlx

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/OpenCodeInterpreter-SC2-3B-4bit")
response = generate(model, tokenizer, prompt="hello", verbose=True)
```
