# mlx-community/olmOCR-7B-0725-8bit
This model was converted to MLX format from [`allenai/olmOCR-7B-0725`]() using mlx-vlm version **0.3.2**.
Refer to the [original model card](https://huggingface.co/allenai/olmOCR-7B-0725) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/olmOCR-7B-0725-8bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
