<div>
  <div style="display: flex; gap: 5px; align-items: center; ">
    <a href="https://github.com/unslothai/unsloth/">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/unsloth%20new%20logo.png" width="133">
    </a>
    <a href="https://discord.gg/unsloth">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/Discord%20button.png" width="173">
    </a>
    <a href="https://docs.unsloth.ai/">
      <img src="https://raw.githubusercontent.com/unslothai/unsloth/refs/heads/main/images/documentation%20green%20button.png" width="143">
    </a>
  </div>
</div>

This is a GGUF quantized version of [MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT) by OpenMOSS, the 5.1B text-to-image transformer. <br>
unsloth/MOSS-Image-SFT-GGUF uses [Unsloth Dynamic 2.0](https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs) methodology: the `UD-` files are mixed precision, with each layer's type chosen from a measured sensitivity scan.
- Runs in [Unsloth Studio](https://github.com/unslothai/unsloth/) and in [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) builds that include MOSS-Image (master-975 or newer), on CPU, Mac and GPU.
- Only the transformer is in these files. The VAE and tokenizer are unchanged; take them from [unsloth/MOSS-Image-SFT-FP8](https://huggingface.co/unsloth/MOSS-Image-SFT-FP8), which carries the upstream diffusers folders byte for byte. The text encoder runs from the stock [unsloth/Qwen3.5-9B-GGUF](https://huggingface.co/unsloth/Qwen3.5-9B-GGUF) `Qwen3.5-9B-Q8_0.gguf`.

**Recommended:** `MOSS-Image-SFT-UD-Q4_K_XL.gguf` (3.42 GB) for most machines: LPIPS 0.213 against 0.294 for `Q4_K_M`. For output closer to bf16 use `UD-Q5_K_XL` (0.121) or `UD-Q6_K_XL` (0.106); `Q8_0` (0.054) is the closest. On a CUDA GPU, Unsloth Studio defaults to the INT8-ConvRot file in [unsloth/MOSS-Image-SFT-FP8](https://huggingface.co/unsloth/MOSS-Image-SFT-FP8) (LPIPS 0.058) instead.

| UD-Q4_K_XL | Q8_0 |
|---|---|
| <img src="samples/UD-Q4_K_XL_knight.png" width="300"> | <img src="samples/Q8_0_knight.png" width="300"> |
| <img src="samples/UD-Q4_K_XL_honeybee.png" width="300"> | <img src="samples/Q8_0_honeybee.png" width="300"> |

## Usage in Unsloth Studio

Pick **MOSS-Image-SFT** in the Images tab and choose a GGUF file from this repo. Unsloth Studio runs MOSS-Image GGUFs with its bundled stable-diffusion.cpp engine and downloads the VAE, tokenizer and Qwen3.5-9B text encoder for you. Defaults: 1024x1024, 50 steps, CFG 3, shift 5.

## Usage with stable-diffusion.cpp

```bash
hf download unsloth/MOSS-Image-SFT-GGUF MOSS-Image-SFT-UD-Q4_K_XL.gguf --local-dir moss
hf download unsloth/Qwen3.5-9B-GGUF Qwen3.5-9B-Q8_0.gguf --local-dir moss
hf download unsloth/MOSS-Image-SFT-FP8 vae/diffusion_pytorch_model.safetensors tokenizer/tokenizer.json --local-dir moss

./sd-cli --diffusion-model moss/MOSS-Image-SFT-UD-Q4_K_XL.gguf \
  --llm moss/Qwen3.5-9B-Q8_0.gguf \
  --vae moss/vae/diffusion_pytorch_model.safetensors \
  --tokenizer moss/tokenizer/tokenizer.json \
  --cfg-scale 3.0 --steps 50 -H 1024 -W 1024 -s 42 \
  -p "a storefront sign that says \"UNSLOTH\" in bold clean letters, daytime, sharp focus" -o moss.png
```

## Files and accuracy

LPIPS (alex, lower is better) and SSIM against the bf16 transformer: same prompt, seed, initial noise and bf16 text embeddings, 1024x1024, 50 steps, CFG 3, over 12 prompts (8 general prompts plus 4 held-out ones: a close-up portrait, a storefront sign with text, hands folding origami, a long scene description). A repeated bf16 render scores 0. MOSS-Image is sensitive to tiny numeric changes: changing a single bf16 rounding step in one layer already moves the renders by 0.041 LPIPS on average, so differences near that level are composition shifts rather than quality loss. The GGUF weights were dequantized into the reference pipeline for this table, so it measures only the weights.

Through stable-diffusion.cpp, scored against its own bf16 render on the 4 held-out prompts: Q8_0 0.109, UD-Q4_K_XL 0.188, Q4_K_M 0.347, UD-Q3_K_XL 0.336.

| File | Size | Bits per weight | LPIPS vs bf16 (mean) | LPIPS vs bf16 (max) | SSIM vs bf16 |
|---|---|---|---|---|---|
| `MOSS-Image-SFT-UD-Q3_K_XL.gguf` | 2.84 GB | 4.47 | 0.281 | 0.493 | 0.713 |
| `MOSS-Image-SFT-Q4_K_M.gguf` | 3.20 GB | 5.04 | 0.294 | 0.466 | 0.714 |
| `MOSS-Image-SFT-UD-Q4_K_XL.gguf` | 3.42 GB | 5.38 | 0.213 | 0.412 | 0.780 |
| `MOSS-Image-SFT-UD-Q5_K_XL.gguf` | 3.95 GB | 6.22 | 0.121 | 0.358 | 0.862 |
| `MOSS-Image-SFT-UD-Q6_K_XL.gguf` | 4.53 GB | 7.13 | 0.106 | 0.354 | 0.883 |
| `MOSS-Image-SFT-Q8_0.gguf` | 5.48 GB | 8.63 | 0.054 | 0.202 | 0.939 |
| `MOSS-Image-SFT-BF16.gguf` | 10.17 GB | 16.00 | 0.000 | 0.000 | 1.000 |

---

# MOSS-Image-SFT

![MOSS-Image-Base and MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/teaser.webp)

MOSS-Image-SFT is a supervised fine-tuned text-to-image model in the
**MOSS-Image** family from OpenMOSS, derived from
[MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base).
It uses the same architecture and inference pipeline, supporting natural-language
prompts, tag sequences, and JSON layouts for controlling text placement and
object arrangement.

## Base vs. SFT

In this example, SFT produces clearer text grouping and a more organized whiteboard layout.

| MOSS-Image-Base | MOSS-Image-SFT |
| --- | --- |
| ![MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/comparison/base.webp) | ![MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/comparison/sft.webp) |

## Quick start

Use Python 3.10 or later and an NVIDIA GPU with CUDA support. Install a PyTorch
2.9 or later build compatible with your CUDA environment, then install:

```bash
pip install "diffusers>=0.38" "transformers>=5.3" "accelerate>=1.10" "safetensors>=0.6" "Pillow>=10"
```

```python
import torch
from diffusers import DiffusionPipeline

pipe = DiffusionPipeline.from_pretrained(
    "OpenMOSS-Team/MOSS-Image-SFT",
    custom_pipeline="pipeline_moss_image",
    trust_remote_code=True,
    torch_dtype={"default": torch.bfloat16, "vae": torch.float32},
)
pipe.scheduler = type(pipe.scheduler).from_config(pipe.scheduler.config)
pipe.to("cuda")

prompt = '''A wide view of a refrigerator beside a kitchen counter with a fruit bowl. A small sticky note on the refrigerator door is handwritten in Chinese:
"记得买牛奶和鸡蛋！
牛奶两盒，鸡蛋一打。
顺便带一袋面包。"'''

image = pipe(
    prompt,
    height=1024,
    width=1024,
    num_inference_steps=50,
    guidance_scale=3.0,
    uncond_skip_layers=[22],
    generator=torch.Generator("cpu").manual_seed(42),
).images[0]
image.save("refrigerator_note.png")
```

The model and custom pipeline code are downloaded and cached automatically. You
can also pass a complete local model directory to `from_pretrained`.
The transformer and text encoder use bfloat16; the VAE and initial noise use
float32. The bundled VAE uses the FLUX.2 small decoder.

For the Gradio interface, CPU offload, and compilation options, follow the
[project quick start](https://github.com/OpenMOSS/MOSS-Image#quick-start).
For ComfyUI, search for **MOSS-Image** in **ComfyUI Manager** to install the
native plugin. Integration into the official ComfyUI repository is in progress.
See the [installation and usage guide](https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md)
and [example workflow](https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json).

## Sampling settings

| Setting | Default |
| --- | --- |
| Sampler | Flow-matching Euler |
| Steps | 50 |
| CFG | 3 |
| Shift | 5 |
| Layer skipping | Negative branch, layer index 22 (zero-based) |
| Negative prompt | Empty |

The default guidance uses two transformer forwards per step. Pass
`uncond_skip_layers=[]` to disable negative-branch skipping, or set
`negative_prompt` to provide a negative prompt. Python API image dimensions must
be positive multiples of 16.

See the [user guide](https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md)
for resolution, sampling, prompt, and LoRA training recommendations.

## Layout-to-image generation

Pass a JSON layout as the prompt to describe the scene, rendered text, objects,
and their positions. Layouts use `summary.caption` and `items`, with
`bbox_format: "yxyx"` and `bbox_coord_space: "abs_centralized"`.

With the Python API, serialize the layout using
`json.dumps(layout, ensure_ascii=False)` and pass it to `pipe`. In Gradio, paste
the JSON into the Prompt field and set the matching image dimensions.
See the [layout format and example](https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md#layout-prompts-experimental).

Layouts can also support controlled editing and user-friendly layout tools.
Edit text, element descriptions, and bounding boxes to adjust image content and
composition in a structured way.

![Layout control](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/showcase/layout-bboxes.webp)

## Showcase

![Examples overview](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/showcase/overview.webp)

![Examples overview 2](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/resolve/main/assets/showcase/overview2.webp)

## Citation

```bibtex
@misc{ai2026mossimagetechnicalreport,
      title={MOSS-Image Technical Report},
      author={MOSI. AI},
      year={2026},
      eprint={2610.23374},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2610.23374},
}
```

## License and acknowledgements

The model weights and bundled inference code are released under the
[Apache License, Version 2.0](LICENSE.md).

We thank the Diffusers, Qwen, and FLUX teams.
