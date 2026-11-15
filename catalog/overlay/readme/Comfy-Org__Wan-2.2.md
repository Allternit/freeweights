# Wan 2.2

Repackaged model files for ComfyUI.

Original model repository:

- https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- https://huggingface.co/lightx2v/Wan2.2-Distill-Loras

Place the files in the following folders:

```
📂 ComfyUI/
├── 📂 models/
│   ├── 📂 audio_encoders/
│   │   └── wav2vec2_large_english_fp16.safetensors
│   ├── 📂 diffusion_models/
│   │   ├── chrono_edit_14B_fp16.safetensors
│   │   ├── wan2.2_animate_14B_bf16.safetensors
│   │   ├── wan2.2_animate_14B_int8_convrot.safetensors
│   │   ├── wan2.2_fun_camera_high_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_camera_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_camera_low_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_camera_low_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_control_5B_bf16.safetensors
│   │   ├── wan2.2_fun_control_high_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_control_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_control_low_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_control_low_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_inpaint_5B_bf16.safetensors
│   │   ├── wan2.2_fun_inpaint_high_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_inpaint_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_inpaint_low_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_inpaint_low_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_vace_high_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_vace_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_fun_vace_low_noise_14B_bf16.safetensors
│   │   ├── wan2.2_fun_vace_low_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_i2v_high_noise_14B_fp16.safetensors
│   │   ├── wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_i2v_low_noise_14B_fp16.safetensors
│   │   ├── wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_s2v_14B_bf16.safetensors
│   │   ├── wan2.2_s2v_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_t2v_high_noise_14B_fp16.safetensors
│   │   ├── wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors
│   │   ├── wan2.2_t2v_low_noise_14B_fp16.safetensors
│   │   ├── wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors
│   │   └── wan2.2_ti2v_5B_fp16.safetensors
│   ├── 📂 loras/
│   │   ├── chronoedit_distill_lora.safetensors
│   │   ├── wan2.2_animate_14B_relight_lora_bf16.safetensors
│   │   ├── wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors
│   │   ├── wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors
│   │   ├── wan2.2_t2v_lightx2v_4steps_lora_v1.1_high_noise.safetensors
│   │   └── wan2.2_t2v_lightx2v_4steps_lora_v1.1_low_noise.safetensors
│   ├── 📂 text_encoders/
│   │   ├── umt5_xxl_fp16.safetensors
│   │   └── umt5_xxl_fp8_e4m3fn_scaled.safetensors
│   ├── 📂 vae/
│   │   ├── wan2.2_vae.safetensors
│   │   └── wan_2.1_vae.safetensors
```

Examples: https://comfyanonymous.github.io/ComfyUI_examples/wan22/

## Workflows

- Wan 2.2 14B Image to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
- Wan 2.2 14B First-Last Frame to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
- Wan 2.2 14B Text to Video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
- Wan 2.2 5B Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
- Wan 2.2 14B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
- Wan2.2-S2V Audio-Driven Video Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
- ChronoEdit 14B: Image Edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
- Wan 2.2 14B Fun Camera Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
- Wan 2.2 5B Fun Control: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
- Wan 2.2 14B Fun Inp: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
- Wan 2.2 5B Fun Inpaint: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
