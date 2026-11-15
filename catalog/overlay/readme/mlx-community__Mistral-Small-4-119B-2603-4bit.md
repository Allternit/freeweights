# mlx-community/Mistral-Small-4-119B-2603-4bit
This model was converted to MLX format from [`mistralai/Mistral-Small-4-119B-2603`]() using mlx-vlm version **0.4.0**.
Refer to the [original model card](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/Mistral-Small-4-119B-2603-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
