<img src="molmoact_logo.svg" alt="MolmoAct Logo" style="width: auto; height: 50px;">

# MolmoAct 7B-D Pretrain RT-1

MolmoAct is a fully open-source action reasoning model for robotic manipulation developed by the Allen Institute for AI, as described in their paper [MolmoAct: Action Reasoning Models that can Reason in Space](https://huggingface.co/papers/2508.07917).

MolmoAct is trained on a subset of OXE and MolmoAct Dataset, a dataset with 10k high-quality trajectories of a single-arm Franka robot performing 93 unique manipulation tasks in both home and tabletop environments. It has state-of-the-art performance among vision-language-action models on multiple benchmarks while being fully open-source. You can find all models in the MolmoAct family [here](https://huggingface.co/collections/allenai/molmoact-689697591a3936fba38174d7).
**Learn more about MolmoAct** in our announcement [blog post](https://allenai.org/blog/molmoact) or the [paper](https://arxiv.org/abs/2508.07917).

**MolmoAct 7B-D Pretrain RT-1** is based on [Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B) and uses [SigLip2](https://huggingface.co/google/siglip2-so400m-patch14-384) as the vision backbone, which is initialized using Molmo's pre-training approach. It is first pre-trained on MolmoAct's [Pre-training Mixture](https://huggingface.co/datasets/allenai/MolmoAct-Pretraining-Mixture), and then fine-tuned on RT-1 data using the same configuration of mid-training. This model is intended to be used for replicating our fine-tuned results on SimplerEnv (Google Robot). 

This checkpoint is a **preview** of the MolmoAct release. All artifacts used in creating MolmoAct (data, training code, evaluations, intermediate checkpoints) will be made available at a later date, furthering our commitment to open-source AI development and reproducibility.

**Update:** Checkpoints are now stored in FP32 (previously BF16). The model was trained in FP32, so publishing FP32 weights aligns with training and enables fine-tuning or continued training directly from this repo. For inference, you can still run BF16 by casting at load, which is what we did for evaluations. See more in the [instructions](#quick-start) below.

Quick links:
- 📂 [All Models](https://huggingface.co/collections/allenai/molmoact-689697591a3936fba38174d7)
- 📂 [All Data](https://huggingface.co/collections/allenai/molmoact-data-mixture-6897e583e13b6c2cf3ea2b80)
- 📃 [Paper](https://arxiv.org/abs/2508.07917)
- 💻 [Code](https://github.com/allenai/MolmoAct)
- 🎥 [Blog Post](https://allenai.org/blog/molmoact)
- 🎥 [Video](https://youtu.be/-_wag1X25OE?si=Xi_kUaJTmcQBx1f6)


## Quick Start

To run MolmoAct, first install dependencies:

```bash
pip install einops torchvision accelerate
pip install transformers==4.52
```

Then, follow these steps:

```python
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
from PIL import Image
import requests
from io import BytesIO

ckpt = "allenai/MolmoAct-7B-D-Pretrain-RT-1-0812"

# load the processor
processor = AutoProcessor.from_pretrained(
    ckpt,
    trust_remote_code=True,
    torch_dtype="bfloat16",
    device_map="auto",
    padding_side="left",
)

# load the model
model = AutoModelForImageTextToText.from_pretrained(
    ckpt,
    trust_remote_code=True,
    torch_dtype="bfloat16",
    device_map="auto",
)

# task instruction
instruction = "pick orange can"

# strictly follow this reasoning prompt
prompt = (
    f"The task is {instruction}. "
    "What is the action that the robot should take. "
    f"To figure out the action that the robot should take to {instruction}, "
    "let's think through it step by step. "
    "First, what is the depth map for this image? "
    "Second, what is the trajectory of the end effector? "
    "Based on the depth map of the image and the trajectory of the end effector, "
    "what is the action that the robot should take?"
)

# apply chat template
text = processor.apply_chat_template(
    [
        {
            "role": "user",
            "content": [dict(type="text", text=prompt)]
        }
    ], 
    tokenize=False, 
    add_generation_prompt=True,
)

# image observation
url = "https://huggingface.co/allenai/MolmoAct-7B-D-Pretrain-0812/resolve/main/example.png"
r = requests.get(url, headers={"User-Agent": "python-requests"}, timeout=30)
r.raise_for_status()
img = Image.open(BytesIO(r.content)).convert("RGB")
imgs = [img]

# process the image and text
inputs = processor(
    images=[imgs],
    text=text,
    padding=True,
    return_tensors="pt",
)

# move inputs to the correct device
inputs = {k: v.to(model.device) for k, v in inputs.items()}

# generate output
with torch.inference_mode():
    with torch.autocast("cuda", enabled=True, dtype=torch.bfloat16):
        generated_ids = model.generate(**inputs, max_new_tokens=256)

# only get generated tokens; decode them to text
generated_tokens = generated_ids[:, inputs['input_ids'].size(1):]
generated_text = processor.batch_decode(generated_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]

# print the generated text
print(f"generated text: {generated_text}")

# >>>  The depth map of the image is ... The trajectory of the end effector is ...
#      Based on these information, the action that the robot should take is ...

# parse out all depth perception tokens
depth = model.parse_depth(generated_text)
print(f"generated depth perception tokens: {depth}")

# >>>  [ "<DEPTH_START><DEPTH_1><DEPTH_2>...<DEPTH_END>" ]

# parse out all visual reasoning traces
trace = model.parse_trace(generated_text)
print(f"generated visual reasoning trace: {trace}")

# >>>  [ [[242, 115], [140, 77], [94, 58], [140, 44], [153, 26]]] ]

# parse out all actions, unnormalizing with key of fractal20220817_data
action = model.parse_action(generated_text, unnorm_key="fractal20220817_data")
print(f"generated action: {action}")

# >>>  [ [0.0732076061122558, 0.08228153779226191, -0.027760173818644346, 
#         0.15932856272248652, -0.09686601126895233, 0.043916773912953344, 
#         0.996078431372549] ]
```

## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use.
For more information, please see our [Responsible Use Guidelines](https://allenai.org/responsible-use).


## Model and Hardware Safety

MolmoAct offers the ability to inspect a visual trace of its intended actions in space before they occur, allowing users to ensure safe behavior by proactively auditing and adjusting the actions of any hardware acting under the model’s instructions. MolmoAct’s action space is bounded within the data provided, and compliance is built into the model to prevent excessive force when resistance is detected. Please follow the hardware manufacturer’s guidelines when using this model with a robot and perform all operations in a safely configured environment.

## Citation

```bibtex
@misc{molmoact2025,
      title={MolmoAct: Action Reasoning Models that can Reason in Space}, 
      author={Jason Lee and Jiafei Duan and Haoquan Fang and Yuquan Deng and Shuo Liu and Boyang Li and Bohan Fang and Jieyu Zhang and Yi Ru Wang and Sangho Lee and Winson Han and Wilbert Pumacay and Angelica Wu and Rose Hendrix and Karen Farley and Eli VanderBilt and Ali Farhadi and Dieter Fox and Ranjay Krishna},
      year={2025},
      eprint={2508.07917},
      archivePrefix={arXiv},
      primaryClass={cs.RO},
      url={https://arxiv.org/abs/2508.07917}
}
```