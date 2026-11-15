# Qwen-Image-ControlNet-Inpainting
This repository provides a ControlNet that supports mask-based image inpainting and outpainting for [Qwen-Image](https://github.com/QwenLM/Qwen-Image).


# Model Cards
- This ControlNet consists of 6 double blocks copied from the pretrained transformer layers.
- We train the model from scratch for 65K steps using a dataset of 10M high-quality general and human images.
- We train at 1328x1328 resolution in BFloat16, batch size=128, learning rate=4e-5. We set the text drop ratio to 0.10.
- This model supports Object replacement, Text modification, Background replacement, Outpainting.


# Showcases
You can find more use cases in this [blog](https://mp.weixin.qq.com/s/p7F1GQ6fSpMeHu7qYeaFgw).

<table style="width:100%; table-layout:fixed;">
  <tr>
    <td><img src="./assets/images/image1.png"   alt="example1"></td>
    <td><img src="./assets/masks/mask1.png"   alt="example1"></td>
    <td><img src="./assets/results/output1.png" alt="example1"></td>
  </tr>
  <tr>
    <td><img src="./assets/images/image2.png"   alt="example2"></td>
    <td><img src="./assets/masks/mask2.png"   alt="example2"></td>
    <td><img src="./assets/results/output2.png" alt="example2"></td>
  </tr>
  <tr>
    <td><img src="./assets/images/image3.png"   alt="example3"></td>
    <td><img src="./assets/masks/mask3.png"   alt="example3"></td>
    <td><img src="./assets/results/output3.png" alt="example3"></td>
  </tr>
</table>

# Inference
```python
import torch
from diffusers.utils import load_image

# pip install git+https://github.com/huggingface/diffusers
from diffusers import QwenImageControlNetModel, QwenImageControlNetInpaintPipeline

base_model = "Qwen/Qwen-Image"
controlnet_model = "InstantX/Qwen-Image-ControlNet-Inpainting"

controlnet = QwenImageControlNetModel.from_pretrained(controlnet_model, torch_dtype=torch.bfloat16)

pipe = QwenImageControlNetInpaintPipeline.from_pretrained(
    base_model, controlnet=controlnet, torch_dtype=torch.bfloat16
)
pipe.to("cuda")

image = load_image("https://huggingface.co/InstantX/Qwen-Image-ControlNet-Inpainting/resolve/main/assets/images/image1.png")
mask_image = load_image("https://huggingface.co/InstantX/Qwen-Image-ControlNet-Inpainting/resolve/main/assets/masks/mask1.png")
prompt = "一辆绿色的出租车行驶在路上"

image = pipe(
    prompt=prompt,
    negative_prompt=" ",
    control_image=image,
    control_mask=mask_image,
    controlnet_conditioning_scale=controlnet_conditioning_scale,
    width=control_image.size[0],
    height=control_image.size[1],
    num_inference_steps=30,
    true_cfg_scale=4.0,
    generator=torch.Generator(device="cuda").manual_seed(42),
).images[0]
image.save(f"qwenimage_cn_inpaint_result.png")
```

# ComfyUI Support
[ComfyUI](https://www.comfy.org/) offers native support for Qwen-Image-ControlNet-Inpainting. The official workflow can be found [here](https://raw.githubusercontent.com/Comfy-Org/workflow_templates/refs/heads/main/templates/image_qwen_image_instantx_inpainting_controlnet.json). Make sure your ComfyUI version is >=0.3.59.

# Community Support
[Liblib AI](https://www.liblib.art/) offers native support for Qwen-Image-ControlNet-Inpainting. [Visit](https://www.liblib.art) for online WebUI or ComfyUI inference.

# Limitations
This model is slightly sensitive to user prompts. Using detailed prompts that describe the entire image (both the inpainted area and the background) is highly recommended. Please use descriptive prompt instead of instructive prompt.

# Acknowledgements
This model is developed by InstantX Team. All copyright reserved.