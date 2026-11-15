# Wan Animate 2

Repackaged model files for ComfyUI.

Original model repository: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 clip_vision/
│   │   └── clip_vision_h.safetensors
│   ├── 📂 diffusion_models/
│   │   ├── wan_animate_2_bf16.safetensors
│   │   ├── wan_animate_2_distill_bf16.safetensors
│   │   ├── wan_animate_2_distill_int8_convrot.safetensors
│   │   └── wan_animate_2_int8_convrot.safetensors
│   ├── 📂 loras/
│   │   └── lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors
│   ├── 📂 text_encoders/
│   │   ├── umt5_xxl_fp8_e4m3fn_scaled.safetensors
│   │   └── umt5_xxl_fp16.safetensors
│   ├── 📂 vae/
│   │   └── Wan2_1_VAE_bf16.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2.json">Wan Animate 2: Motion Transfer</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/video_wan_animate2-1.webp" width="200" height="200" alt="Wan Animate 2: Motion Transfer"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2_distilled.json">Wan Animate 2 Distilled: Motion Transfer</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2_distilled.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/video_wan_animate2_distilled-1.webp" width="200" height="200" alt="Wan Animate 2 Distilled: Motion Transfer"></a></td></tr>
</tbody>
</table>
