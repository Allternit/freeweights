# Introduction

The [**Aquila-VL-2B**](https://huggingface.co/BAAI/Aquila-VL-2B-llava-qwen) model is a vision-language model (VLM) trained with open-sourced dataset [**Infinity-MM**](https://huggingface.co/datasets/BAAI/Infinity-MM).

This repository is used to release intermediate checkpoints obtained during different stages of training. Please feel free to use these models for analysis and experimentation.

# Evaluation

We evaluated the model using the [VLMEvalKit](https://github.com/open-compass/VLMEvalKit) tool. Whenever possible, we prioritized using the OpenAI API for test sets that support API-based evaluation.


|          benchmark           | 2-a | 2-b | 2-c | 3  |   [4 (final_model)](https://huggingface.co/BAAI/Aquila-VL-2B-llava-qwen)   |
| :--------------------------: | :---: | ----- | :---: | :---: | :---: |
|      MMMU<sub>val</sub>      | 42.89 | 42.44 | 44.78 | 46.22 | 47.4  |
|            MMStar            | 45.80 | 49.33 | 51.73 | 53.73 | 54.9  |
| MMBench_V1.1<sub>test</sub>  | 65.41 | 67.53 | 68.03 | 73.40 | 75.2  |
| MathVista<sub>testmini</sub> | 48.60 | 52.40 | 54.30 | 60.10 | 59.0  |
|        HallusionBench        | 37.53 | 39.65 | 38.23 | 40.21 | 43.0  |
|           OCRBench           | 57.50 | 58.90 | 62.50 | 76.70 | 77.2  |
|     AI2D<sub>test</sub>      | 64.31 | 66.74 | 68.13 | 75.55 | 75.0  |
|            MMVet             | 36.24 | 36.97 | 39.68 | 38.35 | 44.3  |
|           Average            | 49.78 | 51.75 | 53.42 | 58.03 | 59.51 |


# How to use

```python
# pip install git+https://github.com/LLaVA-VL/LLaVA-NeXT.git
from llava.model.builder import load_pretrained_model
from llava.mm_utils import process_images, tokenizer_image_token
from llava.constants import IMAGE_TOKEN_INDEX, DEFAULT_IMAGE_TOKEN
from llava.conversation import conv_templates
from PIL import Image
import requests
import copy
import torch
import warnings

warnings.filterwarnings("ignore")

pretrained = "BAAI/Aquila-VL-2B-llava-qwen"

model_name = "llava_qwen"
device = "cuda"
device_map = "auto"
tokenizer, model, image_processor, max_length = load_pretrained_model(pretrained, None, model_name, device_map=device_map)  # Add any other thing you want to pass in llava_model_args

model.eval()

# load image from url
url = "https://github.com/haotian-liu/LLaVA/blob/1a91fc274d7c35a9b50b3cb29c4247ae5837ce39/images/llava_v1_5_radar.jpg?raw=true"
image = Image.open(requests.get(url, stream=True).raw)

# load image from local environment
# url = "./local_image.jpg"
# image = Image.open(url)

image_tensor = process_images([image], image_processor, model.config)
image_tensor = [_image.to(dtype=torch.float16, device=device) for _image in image_tensor]

conv_template = "qwen_1_5"  # Make sure you use correct chat template for different models
question = DEFAULT_IMAGE_TOKEN + "\nWhat is shown in this image?"
conv = copy.deepcopy(conv_templates[conv_template])
conv.append_message(conv.roles[0], question)
conv.append_message(conv.roles[1], None)
prompt_question = conv.get_prompt()

input_ids = tokenizer_image_token(prompt_question, tokenizer, IMAGE_TOKEN_INDEX, return_tensors="pt").unsqueeze(0).to(device)
image_sizes = [image.size]

cont = model.generate(
    input_ids,
    images=image_tensor,
    image_sizes=image_sizes,
    do_sample=False,
    temperature=0,
    max_new_tokens=4096,
)

text_outputs = tokenizer.batch_decode(cont, skip_special_tokens=True)

print(text_outputs)
```


## **Citation**
If you find this useful, please cite the following work
```
@misc{gu2024infinitymmscalingmultimodalperformance,
      title={Infinity-MM: Scaling Multimodal Performance with Large-Scale and High-Quality Instruction Data}, 
      author={Shuhao Gu and Jialing Zhang and Siyuan Zhou and Kevin Yu and Zhaohu Xing and Liangdong Wang and Zhou Cao and Jintao Jia and Zhuoyi Zhang and Yixuan Wang and Zhenchong Hu and Bo-Wen Zhang and Jijie Li and Dong Liang and Yingli Zhao and Yulong Ao and Yaoqi Liu and Fangxiang Feng and Guang Liu},
      year={2024},
      eprint={2410.18558},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2410.18558}, 
}
```

# Acknowledgements

This work is supported by the National Science and Technology Major Project (No. 2022ZD0116300).
本项目受新一代人工智能国家科技重大专项（No. 2022ZD0116300）支持。

