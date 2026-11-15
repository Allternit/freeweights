# mlx-community/Mistral-Small-3.1-24B-Instruct-2503-4bit
This model was converted to MLX format from [`prince-canuma/Mistral-Small-3.1-24B-Instruct-2503`]() using mlx-vlm version **0.1.19**.
Refer to the [original model card](https://huggingface.co/prince-canuma/Mistral-Small-3.1-24B-Instruct-2503) for more details on the model.
## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/Mistral-Small-3.1-24B-Instruct-2503-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
