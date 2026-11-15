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

This is an FP8 / INT8 quantized version of [MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT) by OpenMOSS, the 5.1B text-to-image transformer (Qwen3.5-9B text encoder, FLUX.2 small-decoder VAE). <br>
- The transformer is 5.42 GB instead of 10.16 GB in bf16.
- Loads pre-quantized in [Unsloth Studio](https://github.com/unslothai/unsloth/), which skips the bf16 download and the on-the-fly quantization.
- Text encoder (Qwen3.5-9B, 16.8 GB in bf16): `MOSS-Image-SFT-text_encoder-INT8-ConvRot.safetensors` (11.49 GB), LPIPS 0.059 vs the bf16 encoder. MOSS-Image-SFT and MOSS-Image-Base ship byte-identical text encoders, so this one file serves both.
- This repo also carries the upstream diffusers files from [OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT) (commit `f972bd4b`), unchanged (`model_index.json`, `pipeline_moss_image.py`, `scheduler/`, `text_encoder/`, `tokenizer/`, `transformer/`, `vae/`), so Unsloth Studio downloads every component, the bf16 transformer and text encoder included, from here.

**Recommended:** `MOSS-Image-SFT-INT8-ConvRot.safetensors` (LPIPS 0.058, against 0.111 for plain INT8 and 0.163 for FP8) together with the INT8-ConvRot text encoder. FP8 changes the image noticeably more on this model, so Unsloth Studio only uses it when you pick it explicitly.

| bf16 | INT8-ConvRot |
|---|---|
| <img src="samples/bf16_storefront_sign.png" width="300"> | <img src="samples/int8_convrot_storefront_sign.png" width="300"> |
| <img src="samples/bf16_ramen_shop.png" width="300"> | <img src="samples/int8_convrot_ramen_shop.png" width="300"> |

## Usage in Unsloth Studio

Pick **MOSS-Image-SFT** in the Images tab. Unsloth Studio keeps the transformer in bf16 while it fits on your GPU and otherwise loads `MOSS-Image-SFT-INT8-ConvRot.safetensors` from this repo; the text encoder loads the INT8-ConvRot file by default. INT8 and FP8 can be chosen explicitly in the precision setting. Defaults follow the reference workflow: 1024x1024, 50 steps, CFG 3, shift 5, Euler. MOSS-Image needs transformers 5.3 or newer, and float16 is not supported (bf16 or fp32 only).

## Files

| File | Size | Scheme | LPIPS (alex) vs bf16, mean / max | SSIM vs bf16 |
|---|---|---|---|---|
| `MOSS-Image-SFT-INT8-ConvRot.safetensors` | 5.42 GB | INT8 per-row weight with ConvRot rotation (group 256) on the 252 block Linears, dynamic per-token activation; text embedder, timestep MLP and AdaLN bf16. Unsloth Studio's default | 0.058 / 0.128 | 0.929 |
| `MOSS-Image-SFT-INT8.safetensors` | 5.42 GB | INT8 per-row weight, dynamic per-token activation, same bf16 layers | 0.111 / 0.314 | 0.877 |
| `MOSS-Image-SFT-FP8.safetensors` | 5.41 GB | FP8 e4m3, per-row weight scale, dynamic per-token activation, same bf16 layers | 0.163 / 0.413 | 0.826 |
| `MOSS-Image-SFT-text_encoder-INT8-ConvRot.safetensors` | 11.49 GB | Text encoder (Qwen3.5-9B): INT8 weight-only with ConvRot rotation on the MLP and full-attention Linears; gated-delta layers, embeddings and vision tower bf16. Unsloth Studio's default | 0.059 / 0.321 | 0.931 |

LPIPS (alex, lower is better) and SSIM against the bf16 transformer: same prompt, seed, initial noise and bf16 text embeddings, 1024x1024, 50 steps, CFG 3, over 12 prompts (8 general prompts plus 4 held-out ones: a close-up portrait, a storefront sign with text, hands folding origami, a long scene description). A repeated bf16 render scores 0. MOSS-Image is sensitive to tiny numeric changes: changing a single bf16 rounding step in one layer already moves the renders by 0.041 LPIPS on average, so differences near that level are composition shifts rather than quality loss.

The text encoder row is scored against the bf16 text encoder with the bf16 transformer, so it measures only the encoder.

GGUF builds for CPU, Mac and smaller GPUs: [unsloth/MOSS-Image-SFT-GGUF](https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF).

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
