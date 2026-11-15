# mlx-community/diffusiongemma-26B-A4B-it-4bit

This model was converted to MLX format from [`google/diffusiongemma-26B-A4B-it`](https://huggingface.co/google/diffusiongemma-26B-A4B-it)
using mlx-vlm version **0.6.3**.
Refer to the [original model card](https://huggingface.co/google/diffusiongemma-26B-A4B-it) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/diffusiongemma-26B-A4B-it-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
