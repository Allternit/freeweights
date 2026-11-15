# GUI-Actor-Verifier-2B


This model was introduced in the paper [**GUI-Actor: Coordinate-Free Visual Grounding for GUI Agents**](https://huggingface.co/papers/2506.03143).
It is developed based on [UI-TARS-2B-SFT](https://huggingface.co/ByteDance-Seed/UI-TARS-2B-SFT) and is designed to predict the correctness of an action position given a language instruction. This model is well-suited for **GUI-Actor**, as its attention map effectively provides diverse candidates for verification with only a single inference.


For more details on model design and evaluation, please check: [🏠 Project Page](https://microsoft.github.io/GUI-Actor/) | [💻 Github Repo](https://github.com/microsoft/GUI-Actor) | [📑 Paper](https://huggingface.co/papers/2506.03143).


| Model List                                  | Hugging Face Link                         |
|--------------------------------------------|--------------------------------------------|
| **GUI-Actor-7B-Qwen2-VL**                   | [🤗 Hugging Face](https://huggingface.co/microsoft/GUI-Actor-7B-Qwen2-VL)         |
| **GUI-Actor-2B-Qwen2-VL**                   | [🤗 Hugging Face](https://huggingface.co/microsoft/GUI-Actor-2B-Qwen2-VL)         |
| **GUI-Actor-7B-Qwen2.5-VL**   | [🤗 Hugging Face](https://huggingface.co/microsoft/GUI-Actor-7B-Qwen2.5-VL)       |
| **GUI-Actor-3B-Qwen2.5-VL**   | [🤗 Hugging Face](https://huggingface.co/microsoft/GUI-Actor-3B-Qwen2.5-VL)       |
| **GUI-Actor-Verifier-2B**                   | [🤗 Hugging Face](https://huggingface.co/microsoft/GUI-Actor-Verifier-2B)        |



## 📊 Performance Comparison on GUI Grounding Benchmarks
Table 1. Main results on ScreenSpot-Pro, ScreenSpot, and ScreenSpot-v2 with **Qwen2-VL** as the backbone. † indicates scores obtained from our own evaluation of the official models on Huggingface.
| Method           | Backbone VLM | ScreenSpot-Pro | ScreenSpot | ScreenSpot-v2 |
|------------------|--------------|----------------|------------|----------------|
| **_72B models:_**
| AGUVIS-72B       | Qwen2-VL     | -              | 89.2       | -              |
| UGround-V1-72B   | Qwen2-VL     | 34.5           | **89.4**   | -              |
| UI-TARS-72B      | Qwen2-VL     | **38.1**       | 88.4       | **90.3**       |
| **_7B models:_**
| OS-Atlas-7B      | Qwen2-VL     | 18.9           | 82.5       | 84.1           |
| AGUVIS-7B        | Qwen2-VL     | 22.9           | 84.4       | 86.0†          |
| UGround-V1-7B    | Qwen2-VL     | 31.1           | 86.3       | 87.6†          |
| UI-TARS-7B       | Qwen2-VL     | 35.7           | 89.5   | **91.6**       |
| GUI-Actor-7B     | Qwen2-VL     | 40.7       | 88.3       | 89.5           |
| GUI-Actor-7B + Verifier     | Qwen2-VL    | **44.2**       | **89.7**       | 90.9           |
| **_2B models:_**
| UGround-V1-2B    | Qwen2-VL     | 26.6           | 77.1       | -              |
| UI-TARS-2B       | Qwen2-VL     | 27.7           | 82.3       | 84.7           |
| GUI-Actor-2B     | Qwen2-VL     | 36.7       | 86.5   | 88.6       |
| GUI-Actor-2B + Verifier     | Qwen2-VL    | **41.8**       | **86.9**       | **89.3**           |

Table 2. Main results on the ScreenSpot-Pro and ScreenSpot-v2 with **Qwen2.5-VL** as the backbone.
| Method         | Backbone VLM | ScreenSpot-Pro | ScreenSpot-v2 |
|----------------|---------------|----------------|----------------|
| **_7B models:_**
| Qwen2.5-VL-7B  | Qwen2.5-VL    | 27.6           | 88.8           |
| Jedi-7B        | Qwen2.5-VL    | 39.5           | 91.7           |
| GUI-Actor-7B   | Qwen2.5-VL    | 44.6      | 92.1       |
| GUI-Actor-7B + Verifier   | Qwen2.5-VL    | **47.7**       | **92.5**       |
| **_3B models:_**
| Qwen2.5-VL-3B  | Qwen2.5-VL    | 25.9           | 80.9           |
| Jedi-3B        | Qwen2.5-VL    | 36.1           | 88.6           |
| GUI-Actor-3B   | Qwen2.5-VL    | 42.2       | 91.0       |
| GUI-Actor-3B + Verifier   | Qwen2.5-VL    | **45.9**       | **92.4**       |

## 🚀 Usage
The verifier takes a language instruction and an image with a red circle marking the target position as input. One example is shown below. It outputs either ‘True’ or ‘False’, and you can also use the probability of each label to score the sample.

For more detailed usage, please refer to our github repo.

<img src="https://cdn-uploads.huggingface.co/production/uploads/64d45451c34a346181b130dd/1LTBORYJsO9Ru6B4q_SKl.png" alt="image" width="500"/>


```python
import torch
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor
from transformers.generation import GenerationConfig
import json
import re
import os
import numpy as np
from PIL import Image, ImageDraw
from qwen_vl_utils import process_vision_info



# load model
model_name_or_path = "microsoft/GUI-Actor-Verifier-2B"
model = Qwen2VLForConditionalGeneration.from_pretrained(
            model_name_or_path, 
            device_map="cuda:0", 
            trust_remote_code=True, 
            torch_dtype=torch.bfloat16,
            attn_implementation="flash_attention_2"
        ).eval()
output_len = 1

tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, trust_remote_code=True)
processor = AutoProcessor.from_pretrained(model_name_or_path)

def draw_annotations(img, point_in_pixel, bbox, output_path='test.png', color='red', size=1):
    draw = ImageDraw.Draw(img)
    
    # Draw the ground truth bounding box in green
    if bbox:
        # Assuming bbox format is [x1, y1, x2, y2]
        draw.rectangle(bbox, outline="yellow", width=4)
    
    # Draw a small circle around the predicted point in red
    if point_in_pixel:
        # Create a small rectangle around the point (5 pixels in each direction)
        radius = np.ceil(8 * size).astype(int)
        circle_bbox = [
            point_in_pixel[0] - radius,  # x1
            point_in_pixel[1] - radius,  # y1
            point_in_pixel[0] + radius,  # x2
            point_in_pixel[1] + radius   # y2
        ]
        draw.ellipse(circle_bbox, outline=color, width=np.ceil(4 * size).astype(int))
    
    return img

def ground_only_positive(model, tokenizer, processor, instruction, image, point):
  if isinstance(image, str):
      image_path = image
      image = Image.open(image_path)
  else:
      image_path = image_to_temp_filename(image)
  assert os.path.exists(image_path) and os.path.isfile(image_path), "Invalid input image path."

  width, height = image.size
  image = draw_annotations(image, point, None, output_path=None, size=height/1000 * 1.2)

  prompt_origin = "Please observe the screenshot and exame whether the hollow red circle accurately placed on the intended position in the image: '{}'. Answer True or False."
  full_prompt = prompt_origin.format(instruction)

  messages = [
      {
          "role": "user",
          "content": [
              {
                  "type": "image",
                  "image": image,
              },
              {"type": "text", "text": full_prompt},
          ],
      }
  ]
  # Preparation for inference
  text_input = processor.apply_chat_template(
      messages, tokenize=False, add_generation_prompt=True
  )
  image_inputs, video_inputs = process_vision_info(messages)
  inputs = processor(
      text=[text_input],
      images=image_inputs,
      videos=video_inputs,
      padding=True,
      return_tensors="pt",
  )
  inputs = inputs.to("cuda:0")

  generated_ids = model.generate(
      **inputs,  
      max_new_tokens=output_len,
      do_sample=False,
      temperature=0.0
  )

  generated_ids_trimmed = [
      out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
  ]
  response = processor.batch_decode(
      generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
  )[0]

  print(response)
  matches = re.findall(r'\b(?:True|False)\b', response)
  if not len(matches):
      answer = 'Error Format'
  else:
      answer = matches[-1]
  return answer

# given the image path and instruction and coorindate
instruction = 'close this window'
image = Image.open('test.png')
width, height = image.size
point = [int(0.9709 * width), int(0.1548, * height)] # The point should be in pixels
answer = ground_only_positive(model, tokenizer, processor, instruction, image, point) # output True or False
```

## 📝 Citation
```
@article{wu2025gui,
  title={GUI-Actor: Coordinate-Free Visual Grounding for GUI Agents},
  author={Wu, Qianhui and Cheng, Kanzhi and Yang, Rui and Zhang, Chaoyun and Yang, Jianwei and Jiang, Huiqiang and Mu, Jian and Peng, Baolin and Qiao, Bo and Tan, Reuben and others},
  journal={arXiv preprint arXiv:2506.03143},
  year={2025}
}
```