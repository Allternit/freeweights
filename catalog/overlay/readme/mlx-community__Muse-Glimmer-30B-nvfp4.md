# mlx-community/Muse-Glimmer-30B-nvfp4

This model was converted to MLX format from [`meta-models/Muse-Glimmer-30B`](https://huggingface.co/meta-models/Muse-Glimmer-30B)
using mlx-vlm version **0.6.12**.
Refer to the [original model card](https://huggingface.co/meta-models/Muse-Glimmer-30B) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-vlm
```

```bash
python -m mlx_vlm.generate --model mlx-community/Muse-Glimmer-30B-nvfp4 --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>
```
