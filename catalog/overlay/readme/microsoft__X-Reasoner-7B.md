## Introduction

We introduce X-Reasoner, a vision-language model posttrained solely on general-domain text for generalizable reasoning, using a twostage approach: an initial supervised fine-tuning phase with distilled long chainof-thoughts, followed by reinforcement learning with verifiable rewards. Experiments show that X-Reasoner successfully transfers reasoning capabilities to both multimodal and out-of-domain settings, outperforming existing state-of-theart models trained with in-domain and multimodal data across various general and medical benchmarks. More details can be found in the paper: [X-Reasoner: Towards Generalizable Reasoning Across Modalities and Domains](https://arxiv.org/abs/2505.03981)

## Requirements
We recommend installing the transformers version used in our experiments and other dependencies with this command:
```
pip install transformers==4.57.1 accelerate==1.12.0 torchvision==0.24.1 qwen-vl-utils==0.0.14
```

## Quickstart

Below, we provide a some examples to show how to use X-Reasoner with 🤗 Transformers or vLLM.

<details>
<summary>Inference with HF Transformers 🤗</summary>
Here we show a code snippet to show you how chat with X-Reasoner using `transformers` and `qwen_vl_utils`:

```python
import torch
from transformers import Qwen2_5_VLForConditionalGeneration, AutoTokenizer, AutoProcessor
from qwen_vl_utils import process_vision_info

# default: Load the model on the available device(s)
model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    "microsoft/X-Reasoner-7B", dtype=torch.bfloat16, device_map="auto"
)

# We recommend enabling flash_attention_2 for better acceleration and memory saving, especially in multi-image and video scenarios.
# model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
#     "microsoft/X-Reasoner",
#     dtype=torch.bfloat16,
#     attn_implementation="flash_attention_2",
#     device_map="auto",
# )

# You can set min_pixels and max_pixels according to your needs.
min_pixels = 262144
max_pixels = 262144
processor = AutoProcessor.from_pretrained("microsoft/X-Reasoner-7B", min_pixels=min_pixels, max_pixels=max_pixels)

# Multiple Choice Query
messages = [
    {
        "role": "user",
        "content": [
           
            {"type": "text", "text": "You should provide your thoughts within <think> </think> tags, then answer with just one of the options below within <answer> </answer> tags (For example, if the question is \n'Is the earth flat?\n A: Yes \nB: No', you should answer with <think>...</think> <answer>B: No</answer>). \nHere is the question:"},
             {
                "type": "image",
                "image": "https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-VL/assets/demo.jpeg",
            },
            {"type": "text", "text": "Is there a dog in the image? A. Yes B. No"},
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

Here we show an example of how to use X-Reasoner-7B with vLLM (tested with vLLM==0.11.2 and transformers==4.57.1):

```python
from vllm import LLM, SamplingParams
from transformers import AutoProcessor

min_pixels = 262144
max_pixels = 262144
processor = AutoProcessor.from_pretrained("microsoft/X-Reasoner-7B", min_pixels=min_pixels, max_pixels=max_pixels)

llm = LLM(
    model="microsoft/X-Reasoner-7B",
    trust_remote_code=True,
    dtype="bfloat16",
    max_model_len=8192,
    tensor_parallel_size=4,
    gpu_memory_utilization=0.8,
    limit_mm_per_prompt={"image": 1}
)

# Set up sampling parameters
sampling_params = SamplingParams(
    temperature=0.6,
    max_tokens=4000,
)

image_data = []



# Multiple Choice Query
image_data = ['https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-VL/assets/demo.jpeg']
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "image": image_data[0],
            },
            {"type": "text", "text": "You should provide your thoughts within <think> </think> tags, then answer with just one of the options below within <answer> </answer> tags (For example, if the question is \n'Is the earth flat?\n A: Yes \nB: No', you should answer with <think>...</think> <answer>B: No</answer>). \nHere is the question: Is there a dog in the picture? A: Yes B: No"},
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


### Known Issues
* In case the model generates non-stopping reasoning trace, we add `</think>` as a stop token to the assistant output and re-run to generate the final answer. 

## Citation

If you find our work helpful, feel free to give us a cite.

```
@misc{liu2025xreasonergeneralizablereasoningmodalities,
      title={X-Reasoner: Towards Generalizable Reasoning Across Modalities and Domains}, 
      author={Qianchu Liu and Sheng Zhang and Guanghui Qin and Timothy Ossowski and Yu Gu and Ying Jin and Sid Kiblawi and Sam Preston and Mu Wei and Paul Vozila and Tristan Naumann and Hoifung Poon},
      year={2025},
      eprint={2505.03981},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2505.03981}, 
}
```