# Z-Image

Repackaged model files for ComfyUI.

Original model repository: https://huggingface.co/Tongyi-MAI/Z-Image

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── z_image_bf16.safetensors
│   │   └── z_image_int8_convrot.safetensors
│   ├── 📂 text_encoders/
│   │   ├── qwen_3_4b.safetensors
│   │   ├── qwen_3_4b_fp4_mixed.safetensors
│   │   └── qwen_3_4b_fp8_mixed.safetensors
│   ├── 📂 vae/
│   │   └── ae.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image.json">Z-Image: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_z_image-1.webp" width="200" height="200" alt="Z-Image: Text to Image"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_int8.json">Z-Image Int8: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_int8.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_z_image_int8-1.webp" width="200" height="200" alt="Z-Image Int8: Text to Image"></a></td></tr>
</tbody>
</table>
