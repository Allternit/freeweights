# mlx-community/LFM2-VL-450M-4bit
This model was converted to MLX format from [`LiquidAI/LFM2-VL-450M`]() using mlx-vlm version **0.3.2**.
Refer to the [original model card](https://huggingface.co/LiquidAI/LFM2-VL-450M) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/LFM2-VL-450M-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
