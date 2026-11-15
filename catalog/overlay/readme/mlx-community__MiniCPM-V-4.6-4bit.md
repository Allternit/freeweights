# mlx-community/MiniCPM-V-4.6-4bit

This model was converted to MLX format from [`openbmb/MiniCPM-V-4.6`](https://huggingface.co/openbmb/MiniCPM-V-4.6)
using mlx-vlm version **0.5.0**.
Refer to the [original model card](https://huggingface.co/openbmb/MiniCPM-V-4.6) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/MiniCPM-V-4.6-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
