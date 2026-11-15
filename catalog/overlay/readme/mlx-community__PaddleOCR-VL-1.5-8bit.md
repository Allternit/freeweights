# mlx-community/PaddleOCR-VL-1.5-8bit
This model was converted to MLX format from [`PaddlePaddle/PaddleOCR-VL-1.5`]() using mlx-vlm version **0.3.10**.
Refer to the [original model card](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/PaddleOCR-VL-1.5-8bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
