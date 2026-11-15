# mlx-community/GLM-OCR-4bit
This model was converted to MLX format from [`zai-org/GLM-OCR`]() using mlx-vlm version **0.3.10**.
Refer to the [original model card](https://huggingface.co/zai-org/GLM-OCR) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/GLM-OCR-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
