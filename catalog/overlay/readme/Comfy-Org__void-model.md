# VOID: Video Object and Interaction Deletion

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/netflix/void-model (apache-2.0)
- https://github.com/princeton-vl/raft (bsd-3-clause)
- https://huggingface.co/zai-org/CogVideoX-2b (apache-2.0)

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 diffusion_models/
│   │   ├── void_pass1.safetensors
│   │   └── void_pass2.safetensors
│   ├── 📂 optical_flow/
│   │   └── raft_large_C_T_SKHT_V2-ff5fadd5.safetensors
│   ├── 📂 text_encoders/
│   │   └── t5xxl_fp16.safetensors
│   └── 📂 vae/
│       └── cogvideox_vae.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_void_video_inpainting.json">Video Inpainting: VOID</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_void_video_inpainting.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_void_video_inpainting-2.webp" width="200" height="200" alt="Video Inpainting: VOID"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_void_video_inpainting.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_void_video_inpainting-1.webp" width="200" height="200" alt="Video Inpainting: VOID"></a><div align="center">After</div></td></tr>
</tbody>
</table>
