# SeedVR2

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- https://huggingface.co/ByteDance-Seed/SeedVR2-7B

Converted with `seedvr2_convert.py` from [Comfy-Org/comfy-model-tools](https://github.com/Comfy-Org/comfy-model-tools).

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── seedvr2_3b_fp16.safetensors
│   │   ├── seedvr2_3b_fp8_e4m3fn.safetensors
│   │   ├── seedvr2_3b_int8_convrot.safetensors
│   │   ├── seedvr2_3b_mxfp8.safetensors
│   │   ├── seedvr2_3b_nvfp4.safetensors
│   │   ├── seedvr2_7b_fp16.safetensors
│   │   ├── seedvr2_7b_fp8_e4m3fn.safetensors
│   │   ├── seedvr2_7b_int8_convrot.safetensors
│   │   ├── seedvr2_7b_mxfp8.safetensors
│   │   ├── seedvr2_7b_nvfp4.safetensors
│   │   ├── seedvr2_7b_sharp_fp16.safetensors
│   │   ├── seedvr2_7b_sharp_fp8_e4m3fn.safetensors
│   │   ├── seedvr2_7b_sharp_int8_convrot.safetensors
│   │   ├── seedvr2_7b_sharp_mxfp8.safetensors
│   │   └── seedvr2_7b_sharp_nvfp4.safetensors
│   └── 📂 vae/
│       ├── ema_vae_fp16.safetensors
│       └── seedvr2_ema_vae_fp16.safetensors
```

Both VAE filenames point to the same model; choose either one.

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_video.json">Video Upscale: SeedVR2 3B Int8</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_video.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_3b_int8_upscale_video-2.webp" width="200" height="200" alt="Video Upscale: SeedVR2 3B Int8"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_video.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_3b_int8_upscale_video-1.webp" width="200" height="200" alt="Video Upscale: SeedVR2 3B Int8"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_7b_int8_upscale_image.json">Image Upscale: SeedVR2 7B Int8</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_7b_int8_upscale_image.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_7b_int8_upscale_image-2.webp" width="200" height="200" alt="Image Upscale: SeedVR2 7B Int8"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_7b_int8_upscale_image.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_7b_int8_upscale_image-1.webp" width="200" height="200" alt="Image Upscale: SeedVR2 7B Int8"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_image.json">Image Upscale: SeedVR2 3B Int8</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_image.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_3b_int8_upscale_image-2.webp" width="200" height="200" alt="Image Upscale: SeedVR2 3B Int8"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_image.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_seedvr2_3b_int8_upscale_image-1.webp" width="200" height="200" alt="Image Upscale: SeedVR2 3B Int8"></a><div align="center">After</div></td></tr>
</tbody>
</table>
