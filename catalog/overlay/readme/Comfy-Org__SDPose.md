# SDPose

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/teemosliang/SDPose-Wholebody
- https://github.com/RT-DETRs/RT-DETRv4

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 checkpoints/
│   │   └── sdpose_wholebody_fp16.safetensors
│   ├── 📂 diffusion_models/
│   │   ├── rt_detr_v4-x-hgnet_fp16.safetensors
│   │   └── rt_detr_v4-x-hgnet_fp32.safetensors
```

## Workflows

<table>
<thead>
<tr><th align="center" valign="middle" style="text-align:center;vertical-align:middle">Workflow</th><th colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle">Thumb</th></tr>
</thead>
<tbody>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_image_to_pose.json">Pose Map: SDPose-OOD</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_image_to_pose.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_ood_image_to_pose-2.webp" width="200" height="200" alt="Pose Map: SDPose-OOD"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_image_to_pose.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_ood_image_to_pose-1.webp" width="200" height="200" alt="Pose Map: SDPose-OOD"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_video_to_pose_map.json">Pose Map: SDPose-OOD</a></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_video_to_pose_map.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_ood_video_to_pose_map-2.webp" width="200" height="200" alt="Pose Map: SDPose-OOD"></a><div align="center">Before</div></td><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_video_to_pose_map.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_ood_video_to_pose_map-1.webp" width="200" height="200" alt="Pose Map: SDPose-OOD"></a><div align="center">After</div></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person_video.json">Pose Detection: SDPose Multi-Person</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person_video.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_multi_person_video-1.webp" width="200" height="200" alt="Pose Detection: SDPose Multi-Person"></a></td></tr>
<tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person.json">Pose Detection: SDPose Multi-Person</a></td><td colspan="2" align="center" valign="middle" style="text-align:center;vertical-align:middle"><a href="https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person.json"><img src="https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/templates/utility_sdpose_multi_person-1.webp" width="200" height="200" alt="Pose Detection: SDPose Multi-Person"></a></td></tr>
</tbody>
</table>
