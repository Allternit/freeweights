# Marigold v2

Repackaged model files for ComfyUI.

Original model repository: https://huggingface.co/huawei-bayerlab/marigold-v2-0

Place the files in the following folders:

```text
📂 ComfyUI/
└── 📂 models/
    ├── 📂 diffusion_models/
    │   └── qwen_image_edit_2509_int8_convrot.safetensors
    ├── 📂 embeddings/
    │   ├── marigold_v2_albedo_conditioning.safetensors
    │   ├── marigold_v2_depth_conditioning.safetensors
    │   └── marigold_v2_normals_conditioning.safetensors
    ├── 📂 loras/
    │   ├── marigold_v2_albedo.safetensors
    │   ├── marigold_v2_depth_log_stage2.safetensors
    │   └── marigold_v2_normals.safetensors
    └── 📂 vae/
        ├── marigold_v2_albedo_vae.safetensors
        ├── marigold_v2_depth_log_stage2_vae.safetensors
        └── marigold_v2_normals_vae.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_depth_estimation.json">Depth Estimation: Marigold V2</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_depth_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_depth_estimation-2.webp" width="200" height="200" alt="Depth Estimation: Marigold V2"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_depth_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_depth_estimation-1.webp" width="200" height="200" alt="Depth Estimation: Marigold V2"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_surface_normal_estimation.json">Surface Normal Estimation: Marigold V2</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_surface_normal_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_surface_normal_estimation-2.webp" width="200" height="200" alt="Surface Normal Estimation: Marigold V2"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_surface_normal_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_surface_normal_estimation-1.webp" width="200" height="200" alt="Surface Normal Estimation: Marigold V2"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_albedo_estimation.json">Albedo Estimation: Marigold V2</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_albedo_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_albedo_estimation-2.webp" width="200" height="200" alt="Albedo Estimation: Marigold V2"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_albedo_estimation.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_marigold_v2_albedo_estimation-1.webp" width="200" height="200" alt="Albedo Estimation: Marigold V2"></a><div align="center">After</div></td></tr>
</tbody>
</table>
