# Ming-Image

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── ming_image_0.1_design_bf16.safetensors
│   │   ├── ming_image_0.1_design_int8_convrot.safetensors
│   │   ├── ming_image_0.1_design_layer_bf16.safetensors
│   │   └── ming_image_0.1_design_layer_int8_convrot.safetensors
│   ├── 📂 text_encoders/
│   │   ├── ming_image_0.1_ling_mini_2.0_bf16.safetensors
│   │   ├── ming_image_0.1_ling_mini_2.0_int8_convrot.safetensors
│   │   ├── ming_image_0.1_ling_mini_2.0_w4a8.safetensors
│   │   ├── ming_image_0.1_ling_mini_2.0_layer_bf16.safetensors
│   │   └── ming_image_0.1_ling_mini_2.0_layer_int8_convrot.safetensors
│   ├── 📂 vae/
│   │   └── ming_image_vae_bf16.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ming_image_01_design_t2i.json">Ming Image 0.1 Design: Text to Image</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ming_image_01_design_t2i.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_ming_image_01_design_t2i-1.webp" width="200" height="200" alt="Ming Image 0.1 Design: Text to Image"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ming_image_01_design_image_edit.json">Ming Image 0.1 Design: Image Edit</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ming_image_01_design_image_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_ming_image_01_design_image_edit-2.webp" width="200" height="200" alt="Ming Image 0.1 Design: Image Edit"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ming_image_01_design_image_edit.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_ming_image_01_design_image_edit-1.webp" width="200" height="200" alt="Ming Image 0.1 Design: Image Edit"></a><div align="center">After</div></td></tr>
</tbody>
</table>
