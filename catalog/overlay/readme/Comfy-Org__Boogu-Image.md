# Boogu-Image

Repackaged model files for ComfyUI.

Original model repository: https://huggingface.co/Boogu

Place the files in the following folders:
```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── boogu_image_base_bf16.safetensors
│   │   ├── boogu_image_base_fp8_scaled.safetensors
│   │   ├── boogu_image_base_nvfp4.safetensors
│   │   ├── boogu_image_edit_bf16.safetensors
│   │   ├── boogu_image_edit_turbo_bf16.safetensors
│   │   ├── boogu_image_edit_turbo_hotfix_1k_20260708_bf16.safetensors
│   │   ├── boogu_image_edit_fp8_scaled.safetensors
│   │   ├── boogu_image_edit_int8_convrot.safetensors
│   │   ├── boogu_image_edit_turbo_int8_convrot.safetensors
│   │   ├── boogu_image_edit_turbo_hotfix_1k_20260708_int8_convrot.safetensors
│   │   ├── boogu_image_edit_nvfp4.safetensors
│   │   ├── boogu_image_turbo_bf16.safetensors
│   │   ├── boogu_image_turbo_fp8_scaled.safetensors
│   │   ├── boogu_image_turbo_hotfix_bf16.safetensors
│   │   ├── boogu_image_turbo_hotfix_int8_convrot.safetensors
│   │   ├── boogu_image_turbo_hotfix_nvfp4.safetensors
│   │   └── boogu_image_turbo_nvfp4.safetensors
│   ├── 📂 loras/
│   │   ├── boogu_image_turbo_hotfix_lora_rank_128_bf16.safetensors
│   │   └── boogu_image_turbo_lora_rank_128_bf16.safetensors
│   ├── 📂 text_encoders/
│   │   └── qwen3vl_8b_fp8_scaled.safetensors
│   ├── 📂 vae/
│   │   └── flux1_vae_bf16.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit_int8.json">Boogu image 0.1 Edit Int8</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit_int8.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_boogu_image_0_1_edit_int8-2.webp" width="200" height="200" alt="Boogu image 0.1 Edit Int8"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit_int8.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_boogu_image_0_1_edit_int8-1.webp" width="200" height="200" alt="Boogu image 0.1 Edit Int8"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit.json">Boogu image 0.1 Edit</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_boogu_image_0_1_edit-2.webp" width="200" height="200" alt="Boogu image 0.1 Edit"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_boogu_image_0_1_edit-1.webp" width="200" height="200" alt="Boogu image 0.1 Edit"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_turbo_t2i.json">Boogu Turbo: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_turbo_t2i.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_boogu_image_0_1_turbo_t2i-1.webp" width="200" height="200" alt="Boogu Turbo: Text to Image"></a></td></tr>
</tbody>
</table>