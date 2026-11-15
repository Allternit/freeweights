# Qwen-Image DiffSynth ControlNets

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Canny
- https://huggingface.co/DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Depth

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 loras/
│   │   └── qwen_image_union_diffsynth_lora.safetensors
│   ├── 📂 model_patches/
│   │   ├── qwen_image_canny_diffsynth_controlnet.safetensors
│   │   ├── qwen_image_depth_diffsynth_controlnet.safetensors
│   │   └── qwen_image_inpaint_diffsynth_controlnet.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json">Qwen-Image ControlNet Model Patch</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_qwen_image_controlnet_patch-2.webp" width="200" height="200" alt="Qwen-Image ControlNet Model Patch"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_qwen_image_controlnet_patch-1.webp" width="200" height="200" alt="Qwen-Image ControlNet Model Patch"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_union_control_lora.json">Qwen-Image Union Control</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_union_control_lora.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_qwen_image_union_control_lora-2.webp" width="200" height="200" alt="Qwen-Image Union Control"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_union_control_lora.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/image_qwen_image_union_control_lora-1.webp" width="200" height="200" alt="Qwen-Image Union Control"></a><div align="center">After</div></td></tr>
</tbody>
</table>
