# mlx-community/DeepSeek-OCR-8bit
This model was converted to MLX format from [`prince-canuma/DeepSeek-OCR`]() using mlx-vlm version **0.3.10**.
Refer to the [original model card](https://huggingface.co/prince-canuma/DeepSeek-OCR) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/DeepSeek-OCR-8bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
