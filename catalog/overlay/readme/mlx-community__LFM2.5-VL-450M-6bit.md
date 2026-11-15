# mlx-community/LFM2.5-VL-450M-6bit
This model was converted to MLX format from [`LiquidAI/LFM2.5-VL-450M`]() using mlx-vlm version **0.4.4**.
Refer to the [original model card](https://huggingface.co/LiquidAI/LFM2.5-VL-450M) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/LFM2.5-VL-1.6B-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
