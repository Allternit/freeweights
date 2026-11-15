# mlx-community/Qwen3.6-35B-A3B-nvfp4

This model was converted to MLX format from [`Qwen/Qwen3.6-35B-A3B`](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
using mlx-vlm version **0.4.4**.
Refer to the [original model card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/Qwen3.6-35B-A3B-nvfp4 --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
