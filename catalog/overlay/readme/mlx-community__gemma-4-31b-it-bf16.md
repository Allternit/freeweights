# mlx-community/gemma-4-31b-it-bf16

This model was converted to MLX format from [google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it) at revision `3548789868c5356dbf307c98e6f609007b82b3eb`.

It was generated from the current `mlx-vlm` source checkout.

## Use with mlx-vlm

```bash
pip install -U mlx-vlm
mlx_vlm.generate --model mlx-community/gemma-4-31b-it-bf16 --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
