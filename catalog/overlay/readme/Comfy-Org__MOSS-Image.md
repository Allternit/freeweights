# MOSS-Image

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- https://huggingface.co/darask0/MOSS-Image-color-depth-control
- https://huggingface.co/chinoll/Moss-Image-Edit

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── moss_image_base_bf16.safetensors
│   │   ├── moss_image_base_int8_convrot.safetensors
│   │   ├── moss_image_sft_bf16.safetensors
│   │   └── moss_image_sft_int8_convrot.safetensors
│   ├── 📂 loras/
│   │   ├── moss_image_color_depth_control.safetensors
│   │   └── moss_image_edit_lora_rank_64_bf16.safetensors
│   ├── 📂 text_encoders/
│   │   ├── qwen3.5_9b_bf16.safetensors
│   │   ├── qwen3.5_9b_int8_convrot.safetensors
│   │   └── qwen3.5_9b_w4a8_gptq.safetensors
│   ├── 📂 vae/
│   │   ├── flux2-vae_small.safetensors
│   │   └── flux2-vae.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i.json">MOSS-Image: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_t2i-1.webp" width="200" height="200" alt="MOSS-Image: Text to Image"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i.json">MOSS-Image Base: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_base_t2i-1.webp" width="200" height="200" alt="MOSS-Image Base: Text to Image"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_edit.json">MOSS-Image: Image Edit LoRA</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_edit-2.webp" width="200" height="200" alt="MOSS-Image: Image Edit LoRA"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_edit-1.webp" width="200" height="200" alt="MOSS-Image: Image Edit LoRA"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i_bboxes.json">MOSS-Image: Layout-Guided Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i_bboxes.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_t2i_bboxes-1.webp" width="200" height="200" alt="MOSS-Image: Layout-Guided Text to Image"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_color_depth_control.json">MOSS-Image: Color & Depth Control</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_color_depth_control.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_color_depth_control-2.webp" width="200" height="200" alt="MOSS-Image: Color & Depth Control"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_color_depth_control.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_color_depth_control-1.webp" width="200" height="200" alt="MOSS-Image: Color & Depth Control"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i_bboxes.json">MOSS-Image Base: Layout-Guided Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i_bboxes.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_moss_image_base_t2i_bboxes-1.webp" width="200" height="200" alt="MOSS-Image Base: Layout-Guided Text to Image"></a></td></tr>
</tbody>
</table>
