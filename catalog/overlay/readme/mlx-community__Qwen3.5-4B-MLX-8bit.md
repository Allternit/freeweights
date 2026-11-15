# Qwen3.5-4B-MLX-8bit

This is a quantized MLX version of [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) for Apple Silicon.

## Model Details

- **Original Model:** [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- **Quantization:** 8-bit (~9.053 bits per weight)
- **Group Size:** 64
- **Format:** MLX SafeTensors
- **Framework:** [mlx-vlm](https://github.com/Blaizzy/mlx-vlm)

## Conversion Details

This model was converted using `mlx-vlm` from the [`pc/fix-qwen35-predicate`](https://github.com/Blaizzy/mlx-vlm/tree/pc/fix-qwen35-predicate) branch, which includes fixes for Qwen3.5 quantization predicates (proper handling of MoE gate layers, `shared_expert_gate`, and `A_log` casting).

**Conversion command:**
```bash
python3 -m mlx_vlm convert \
  --hf-path "Qwen/Qwen3.5-4B" \
  --mlx-path "./mlx_models/Qwen3.5-4B-MLX-8bit" \
  -q --q-bits 8 --q-group-size 64
```

## Important Note

A better, more optimized conversion may be available from **@Prince** ([@Blaizzy](https://huggingface.co/Blaizzy)) in the MLX VLM community. Check the [mlx-community](https://huggingface.co/mlx-community) organization for updated versions as official Qwen3.5 support is merged into the main `mlx-vlm` branch.

## Usage

```python
from mlx_vlm import load, generate

model, processor = load("mlx-community/Qwen3.5-4B-MLX-8bit")

output = generate(
    model,
    processor,
    prompt="Describe this image in detail",
    image="path/to/image.jpg",
    max_tokens=200
)
print(output)
```

Or from the command line:
```bash
mlx_vlm generate \
  --model mlx-community/Qwen3.5-4B-MLX-8bit \
  --prompt "Describe this image" \
  --image path/to/image.jpg \
  --max-tokens 200
```

## Performance

- **Disk Size:** ~4.8 GB
- **Prompt Processing:** ~173 tokens/sec (tested on Apple Silicon)
- **Generation:** ~88 tokens/sec (tested on Apple Silicon)
- **Peak Memory:** ~5.8 GB
- Runs efficiently on Apple Silicon Macs (M1/M2/M3/M4)

## License

This model inherits the [Apache 2.0 license](https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE) from the original Qwen3.5-4B model.
