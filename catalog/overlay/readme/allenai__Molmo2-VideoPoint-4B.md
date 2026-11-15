<img src="molmo_2_logo_RGB.png" alt="Logo for the Molmo2 Project" style="width: auto; height: 50px;">

# Molmo2-VideoPoint-4B

Molmo2 is a family of open vision-language models developed by the Allen Institute for AI (Ai2) that support image, video and multi-image understanding and grounding.
Molmo2 models are trained on publicly available third party datasets as referenced in [our technical report](https://allenai.org/papers/molmo2) and [Molmo2 data](https://huggingface.co/collections/allenai/molmo2-data), 
a collection of datasets with highly-curated image-text and video-text pairs.
It has state-of-the-art performance among multimodal models with a similar size.
You can find all models in the Molmo2 family [here](https://huggingface.co/collections/allenai/molmo2).

**Learn more** about the Molmo2 family [in our announcement blog post](https://allenai.org/blog/molmo2).

Molmo2-VideoPoint-4B is based on [Qwen3-4B-Instruct](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507) and uses [SigLIP 2](https://huggingface.co/google/siglip-so400m-patch14-384) as vision backbone.
**Different from the general checkpoints, Molmo2-VideoPoint-4B is finetuned on the Molmo2-VideoPoint data only, after pre-training on pixmo-cap, pixmo-points and tulu's data. It is meant to be used for video pointing and counting only**. 

Ai2 is commited to open science. The Molmo2 datasets are available [here](https://huggingface.co/collections/allenai/molmo2-data). 
All other artifacts used in creating Molmo2 (training code, evaluations, intermediate checkpoints) will be made available at a later date, furthering our commitment to open-source AI development and reproducibility.

Quick links:
- 📂 [All Models](https://huggingface.co/collections/allenai/molmo2)
- 📃 [Paper](https://allenai.org/papers/molmo2)
- 🎥 [Blog with Videos](https://allenai.org/blog/molmo2)

## Quick Start

### Setup Conda Environment
```
conda create --name transformers4571 python=3.11
conda activate transformers4571
pip install transformers==4.57.1
pip install torch pillow einops torchvision accelerate decord2 molmo_utils
```

### Pointing Video QA

```
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
from molmo_utils import process_vision_info
import re

model_id="allenai/Molmo2-VideoPoint-4B"

# load the processor
processor = AutoProcessor.from_pretrained(
    model_id,
    trust_remote_code=True,
    dtype="auto",
    device_map="auto"
)

# load the model
model = AutoModelForImageTextToText.from_pretrained(
    model_id,
    trust_remote_code=True,
    dtype="auto",
    device_map="auto"
)

COORD_REGEX = re.compile(rf"<(?:points|tracks).*? coords=\"([0-9\t:;, .]+)\"/?>")
FRAME_REGEX = re.compile(rf"(?:^|\t|:|,|;)([0-9\.]+) ([0-9\. ]+)")
POINTS_REGEX = re.compile(r"([0-9]+) ([0-9]{3,4}) ([0-9]{3,4})")

def _points_from_num_str(text, image_w, image_h, extract_ids=False):
    all_points = []
    for points in POINTS_REGEX.finditer(text):
        ix, x, y = points.group(1), points.group(2), points.group(3)
        # our points format assume coordinates are scaled by 1000
        x, y = float(x)/1000*image_w, float(y)/1000*image_h
        if 0 <= x <= image_w and 0 <= y <= image_h:
            yield ix, x, y


def extract_video_points(text, image_w, image_h, extract_ids=False):
    """Extract video pointing coordinates as a flattened list of (t, x, y) triplets from model output text."""
    all_points = []
    for coord in COORD_REGEX.finditer(text):
        for point_grp in FRAME_REGEX.finditer(coord.group(1)):
            frame_id = float(point_grp.group(1))
            w, h = (image_w, image_h)
            for idx, x, y in _points_from_num_str(point_grp.group(2), w, h):
                if extract_ids:
                    all_points.append((frame_id, idx, x, y))
                else:
                    all_points.append((frame_id, x, y))
    return all_points

messages = [
    {
        "role": "user",
        "content": [
            dict(type="text", text="Point to the penguins."),
            dict(type="video", video="https://storage.googleapis.com/oe-training-public/demo_videos/many_penguins.mp4"),
        ],
    }
]

# process the video using `molmo_utils.process_vision_info`
_, videos, video_kwargs = process_vision_info(messages)
videos, video_metadatas = zip(*videos)
videos, video_metadatas = list(videos), list(video_metadatas)

# apply the chat template to the input messages
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

# process the video and text
inputs = processor(
    videos=videos,
    video_metadata=video_metadatas,
    text=text,
    padding=True,
    return_tensors="pt",
    **video_kwargs,
)

inputs = {k: v.to(model.device) for k, v in inputs.items()}

# generate output
with torch.inference_mode():
    generated_ids = model.generate(**inputs, max_new_tokens=2048)

# only get generated tokens; decode them to text
generated_tokens = generated_ids[0, inputs['input_ids'].size(1):]
generated_text = processor.tokenizer.decode(generated_tokens, skip_special_tokens=True)

# decode video pointing outputs
points = extract_video_points(generated_text, image_w=video_metadatas[0]["width"], image_h=video_metadatas[0]["height"])
print(points)
```

## Evaluations

We report the accuracy and close accuracy on Molmo2-VideoCountEval here.
For details on the evals, refer to our [technical report](https://allenai.org/papers/molmo2).

| Model | Accuracy | Close Acc. |
|-----------------------------|-----------------------------------------|-----------------------------------------|
| GPT-5 | 35.8 | 50.3 |
| GPT-5 mini | 29.8 | 49.3 |
| Gemini 3 Pro | **37.1** | 53.1 |
| Gemini 2.5 Pro | 35.8 | **56.5** |
| Gemini 2.5 Flash | 31.9 | 48.2 |
| Claude Sonnet 4.5 | 27.2  | 45.1 |
| Qwen3-VL-4B | 25.3 | 44.3 |
| Qwen3-VL-8B | 29.6 | 47.7 |
| Molmo2-4B | 34.3 | <u>56.1</u> |
| Molmo2-8B | 35.5 | 53.3 |
| Molmo2-7B | 33.2 | 50.5 |
| **Molmo2-VideoPoint-4B (this model)** | <u>36.8</u> | **56.5** |


## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2’s [Responsible Use Guidelines](https://allenai.org/responsible-use).
This model is trained on third party datasets that are subject to academic and non-commercial research use only. Please review the sources to determine if this model is appropriate for your use case.