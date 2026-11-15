# mlx-community/olmOCR-2-7B-1025-6bit
This model was converted to MLX format from [`allenai/olmOCR-2-7B-1025`]() using mlx-vlm version **0.3.4**.
Refer to the [original model card](https://huggingface.co/allenai/olmOCR-2-7B-1025) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/olmOCR-2-7B-1025-6bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
