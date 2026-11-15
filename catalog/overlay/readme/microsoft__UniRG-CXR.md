## Introduction

We introduce UniRG-CXR, a radiology report generation model that obtains SOTA performance on [ReXrank](https://rexrank.ai/). More details can be found in the paper: [Scaling medical imaging report generation with
multimodal reinforcement learning](https://arxiv.org/pdf/2601.17151)

## Requirements
We recommend installing the transformers version with python=3.12 used in our experiments and other dependencies with this command:
```
pip install transformers==4.57.1 accelerate==1.12.0 torchvision==0.24.1 qwen-vl-utils==0.0.14
```

## Quickstart

Below, we provide a some examples to show how to use UniRG-CXR with 🤗 Transformers or vLLM.

<details>
<summary>Inference with HF Transformers 🤗</summary>
Here we show a code snippet to show you how chat with UniRG-CXR using `transformers` and `qwen_vl_utils`:

```python
import torch
from transformers import Qwen3VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

# default: Load the model on the available device(s)
model = Qwen3VLForConditionalGeneration.from_pretrained(
    "microsoft/UniRG-CXR", dtype=torch.bfloat16, device_map="auto"
)

# We recommend enabling flash_attention_2 for better acceleration and memory saving.
# model = Qwen3VLForConditionalGeneration.from_pretrained(
#     "microsoft/UniRG-CXR",
#     dtype=torch.bfloat16,
#     attn_implementation="flash_attention_2",
#     device_map="auto",
# )

# You can set min_pixels and max_pixels according to your needs.
min_pixels = 262144
max_pixels = 262144
processor = AutoProcessor.from_pretrained("microsoft/UniRG-CXR", min_pixels=min_pixels, max_pixels=max_pixels)

messages = [
    {
        "role": "user",
        "content": [
  
            {"type": "text", "text": "This is a radiology report generation task. Here is the context:"},
            {
                "type": "image",
                "image": "<input your image path here>",
            },  
            {"type": "text", "text": "Given the image and the context, directly provide the report in the following format:\nFindings: [write the findings] Impression: [write the impression]\nNow write the report in the format above."},

        ],
    }
]

# Preparation for inference
text = processor.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
image_inputs, video_inputs = process_vision_info(messages)
inputs = processor(
    text=[text],
    images=image_inputs,
    videos=video_inputs,
    padding=True,
    return_tensors="pt",
)

        
inputs = inputs.to(device="cuda")

# Inference: Generation of the output
generated_ids = model.generate(**inputs, max_new_tokens=4000)
generated_ids_trimmed = [
    out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
]
output_text = processor.batch_decode(
    generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
)
print(output_text)

```
</details>

<details>
<summary>Inference with vLLM</summary>

Here we show an example of how to use UniRG-CXR with vLLM (tested with vllm==0.11.2 and transformers==4.57.1):

```python
from vllm import LLM, SamplingParams
from transformers import AutoProcessor

min_pixels = 262144
max_pixels = 262144
processor = AutoProcessor.from_pretrained("microsoft/UniRG-CXR", min_pixels=min_pixels, max_pixels=max_pixels)

llm = LLM(
    model="microsoft/UniRG-CXR",
    trust_remote_code=True,
    dtype="bfloat16",
    max_model_len=8192,
    tensor_parallel_size=4,
    gpu_memory_utilization=0.8,
    limit_mm_per_prompt={"image": 1}
)

# Set up sampling parameters
sampling_params = SamplingParams(
    temperature=0.0,
    max_tokens=4000,
)

image_data = []



image_data = ['Your image path']
messages = [
    {
        "role": "user",
        "content": [
  
            {"type": "text", "text": "This is a radiology report generation task. Here is the context:"},
            {
                "type": "image",
                "image": image_data[0],
            },  
            {"type": "text", "text": "Given the image and the context, directly provide the report in the following format:\nFindings: [write the findings] Impression: [write the impression]\nNow write the report in the format above."},

        ],
    }
]

prompt = processor.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True)

if image_data:
    mm_prompt = {
        "prompt": prompt,
        "multi_modal_data": {"image": image_data}
    }
else:
    mm_prompt = {"prompt": prompt}

# Generate response
outputs = llm.generate([mm_prompt], sampling_params)

# Print the generated response
for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt}")
    print(f"Generated text: {generated_text}")
    print("-" * 50)
```
</details>


## Citation

If you find our work helpful, feel free to give us a cite.

```
@article{liu2026scaling,
  title={Scaling medical imaging report generation with multimodal reinforcement learning},
  author={Liu, Qianchu and Zhang, Sheng and Qin, Guanghui and Gu, Yu and Jin, Ying and Preston, Sam and Xu, Yanbo and Kiblawi, Sid and Yim, Wen-wai and Ossowski, Tim and others},
  journal={arXiv preprint arXiv:2601.17151},
  year={2026}
}
```

## Notices
Microsoft's Privacy Statement: https://go.microsoft.com/fwlink/?LinkId=521839.
