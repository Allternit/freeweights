# mlx-community/North-Mini-Code-1.0-4bit

This model was converted to MLX format from [`CohereLabs/North-Mini-Code-1.0`](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)
using mlx-vlm version **0.6.2**.
Refer to the [original model card](https://huggingface.co/CohereLabs/North-Mini-Code-1.0) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/North-Mini-Code-1.0-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
