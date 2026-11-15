# Prompt-Depth-Anything-Vits

## Introduction

Prompt Depth Anything is a high-resolution and accurate metric depth estimation method, with the following highlights:
- using prompting to unleash the power of depth foundation models, inspired by success of prompting in VLM and LLM foundation models.
- The widely available iPhone LiDAR is taken as the prompt, guiding the model to produce up to 4K resolution accurate metric depth.
- A scalable data pipeline is introduced to train the method.
- Prompt Depth Anything benefits downstream applications, including 3D reconstruction and generalized robotic grasping.


## Usage

```python
import requests
from PIL import Image
from transformers import PromptDepthAnythingForDepthEstimation, PromptDepthAnythingImageProcessor

url = "https://github.com/DepthAnything/PromptDA/blob/main/assets/example_images/image.jpg?raw=true"
image = Image.open(requests.get(url, stream=True).raw)


image_processor = PromptDepthAnythingImageProcessor.from_pretrained("depth-anything/prompt-depth-anything-vits-hf")
model = PromptDepthAnythingForDepthEstimation.from_pretrained("depth-anything/prompt-depth-anything-vits-hf")

prompt_depth_url = "https://github.com/DepthAnything/PromptDA/blob/main/assets/example_images/arkit_depth.png?raw=true"
prompt_depth = Image.open(requests.get(prompt_depth_url, stream=True).raw)

inputs = image_processor(images=image, return_tensors="pt", prompt_depth=prompt_depth)
with torch.no_grad():
    outputs = model(**inputs)
post_processed_output = image_processor.post_process_depth_estimation(
    outputs,
    target_sizes=[(image.height, image.width)],
)

predicted_depth = post_processed_output[0]["predicted_depth"] 
```

## Citation

If you find this project useful, please consider citing:

```bibtex
@inproceedings{lin2024promptda,
  title={Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation},
  author={Lin, Haotong and Peng, Sida and Chen, Jingxiao and Peng, Songyou and Sun, Jiaming and Liu, Minghuan and Bao, Hujun and Feng, Jiashi and Zhou, Xiaowei and Kang, Bingyi},
  journal={arXiv},
  year={2024}
}