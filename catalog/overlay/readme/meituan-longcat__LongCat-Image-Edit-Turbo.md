<div align="center">
  <img src="assets/longcat-image_logo.svg" width="45%" alt="LongCat-Image" />
</div>
<hr>

<div align="center" style="line-height: 1;">
    <a href='https://arxiv.org/pdf/2512.07584'><img src='https://img.shields.io/badge/Technical-Report-red'></a>
    <a href='https://github.com/meituan-longcat/LongCat-Image'><img src='https://img.shields.io/badge/GitHub-Code-black'></a>
    <a href='https://github.com/meituan-longcat/LongCat-Flash-Chat/blob/main/figures/wechat_official_accounts.png'><img src='https://img.shields.io/badge/WeChat-LongCat-brightgreen?logo=wechat&logoColor=white'></a>
    <a href='https://x.com/Meituan_LongCat'><img src='https://img.shields.io/badge/Twitter-LongCat-white?logo=x&logoColor=white'></a>
</div>
<div align="center" style="line-height: 1;">

[//]: # (  <a href='https://meituan-longcat.github.io/LongCat-Image/'><img src='https://img.shields.io/badge/Project-Page-green'></a>)
  <a href='https://huggingface.co/meituan-longcat/LongCat-Image'><img src='https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-LongCat--Image-blue'></a>
  <a href='https://huggingface.co/meituan-longcat/LongCat-Image-Dev'><img src='https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-LongCat--Image--Dev-blue'></a>
  <a href='https://huggingface.co/meituan-longcat/LongCat-Image-Edit'><img src='https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-LongCat--Image--Edit-blue'></a>
  <a href='https://huggingface.co/meituan-longcat/LongCat-Image-Edit-Turbo'><img src='https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-LongCat--Image--Edit--Turbo-blue'></a>
</div>


## Introduction
We introduce **LongCat-Image-Edit-Turbo**, the distilled version of LongCat-Image-Edit. It achieves high-quality image editing with only 8 NFEs (Number of Function Evaluations) , offering extremely low inference latency.

<div align="center">
  <img src="assets/model_struct_edit.png" width="90%" alt="LongCat-Image-Edit model" />
</div>


### Installation

```shell
pip install git+https://github.com/huggingface/diffusers
```

### Run Image Editing

> [!CAUTION]
> **📝 Special Handling for Text Rendering**
>
> For both Text-to-Image and Image Editing tasks involving text generation, **you must enclose the target text within single or double quotation marks** (both English '...' / "..." and Chinese ‘...’ / “...” styles are supported).
>
> **Reasoning:** The model utilizes a specialized **character-level encoding** strategy specifically for quoted content. Failure to use explicit quotation marks prevents this mechanism from triggering, which will severely compromise the text rendering capability.
> 
```python
import torch
from PIL import Image
from diffusers import LongCatImageEditPipeline

if __name__ == '__main__':
    device = torch.device('cuda')
    pipe = LongCatImageEditPipeline.from_pretrained("meituan-longcat/LongCat-Image-Edit-Turbo", torch_dtype= torch.bfloat16 )
    # pipe.to(device, torch.bfloat16)  # Uncomment for high VRAM devices (Faster inference)
    pipe.enable_model_cpu_offload()  # Offload to CPU to save VRAM (Required ~18 GB); slower but prevents OOM
    img = Image.open('assets/test.png').convert('RGB')
    prompt = '将猫变成狗'
    image = pipe(
        img,
        prompt,
        negative_prompt='',
        guidance_scale=1,
        num_inference_steps=8,
        num_images_per_prompt=1,
        generator=torch.Generator("cpu").manual_seed(43)
    ).images[0]
    image.save('./edit_example.png')
```