# mlx-community/Ministral-3-8B-Instruct-2512-4bit
This model was converted to MLX format from [`mistralai/Ministral-3-8B-Instruct-2512`]() using mlx-vlm version **0.3.9**.
Refer to the [original model card](https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/Ministral-3-8B-Instruct-2512-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
