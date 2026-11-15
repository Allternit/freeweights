# mlx-community/gemma-4-12B-4bit

This model was converted to MLX format from [`google/gemma-4-12B`](https://huggingface.co/google/gemma-4-12B)
using mlx-vlm version **0.6.0**.
Refer to the [original model card](https://huggingface.co/google/gemma-4-12B) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/gemma-4-12B-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
