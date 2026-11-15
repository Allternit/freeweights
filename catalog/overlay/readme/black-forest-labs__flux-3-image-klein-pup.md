# FLUX 3 Image Klein Prompt Upsampler

FLUX 3 Image Klein Prompt Upsampler is a 9B vision-language model that expands an image editing, text-to-image or layout request into the detailed prompt [FLUX 3 Image Klein](https://huggingface.co/black-forest-labs/flux-3-image-klein-base) works best with. It takes the request, up to 10 reference images and an optional list of bounding boxes, and returns one prompt. It is a fine-tune of [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B).

Always run a prompt upsampler with FLUX 3 Image Klein, for editing, text-to-image and layout alike. This one is tuned for it, see [Training](#training). Any other LLM can do the job with the system prompts in `system_prompts.json`. The inference code in [black-forest-labs/flux-3-image-klein](https://github.com/black-forest-labs/flux-3-image-klein) loads it by default. The Diffusers modular pipeline runs it automatically; the [Transformers block](#with-transformers) below shows how to run it on its own. In ComfyUI, the text-to-image templates on [flux-3-image-klein-comfy](https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy) have an `enable_prompt_upsampler` switch.

**Request**

> A man walking with his dog, afternoon sun

**Prompt**

> Full-color outdoor photograph, eye-level medium-wide shot in late afternoon sunlight, showing a man walking his dog along a neighborhood sidewalk. The low sun shines from the upper right, casting long shadows across the pavement and lighting the man's face and clothing with warm side light. Slightly left of center, a white man in his thirties with fair skin, short brown hair, and light stubble walks toward frame-left at an easy pace. He wears a faded olive overshirt over a plain grey T-shirt, dark blue jeans, and worn brown leather shoes. [...]

220 words in full, with the image it made, in [examples/base/man_dog.json](https://github.com/black-forest-labs/flux-3-image-klein/blob/main/examples/base/man_dog.json).

# Key Features

1. One model for editing with reference images, text-to-image and layout with bounding boxes. The system prompt selects the mode.
2. Prompts with everything the image model needs decided: medium and style, scene, lighting and camera, each subject with its colors, materials and position in the frame. Text to render stays verbatim, in quotes.
3. For an edit it looks at the references and writes the instruction around what is in them: what changes, what stays, by appearance.
4. Bounding boxes you pass are kept exactly, as a box table after the prompt; the prompt cites each box by id, so the image model places that element where the box says.
5. Released under the Apache License 2.0.

# Training

A full fine-tune of Qwen3.5-9B with the vision tower frozen, in two stages: supervised training on pairs of short requests and their expanded prompts, then preference tuning on pairs of the model's own prompts, rendered with FLUX 3 Image Klein at the same seed and ranked on the resulting image.

# Files

| File | Content |
|---|---|
| `model.safetensors` | the model, bfloat16, 18.8 GB |
| `system_prompts.json` | the four system prompts: `t2i`, `i2i`, `t2i_bbox`, `i2i_bbox` |
| `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json`, `preprocessor_config.json` | Transformers configuration, tokenizer, chat template, image processor |

# Usage

## With the FLUX 3 inference code

```sh
hf download black-forest-labs/flux-3-image-klein-pup --local-dir weights/pup
python scripts/cli.py "A man walking with his dog, afternoon sun" --out out.png
```

The upsampler is on by default; `--no-pup` sends the prompt as typed. To upsample without generating: `python -m flux3.pup --prompt "..." --out caption.txt`. Install, references and the box format: [black-forest-labs/flux-3-image-klein](https://github.com/black-forest-labs/flux-3-image-klein).

## With Transformers

```python
import json

import torch
from huggingface_hub import hf_hub_download
from transformers import AutoProcessor, Qwen3_5ForConditionalGeneration

model_id = "black-forest-labs/flux-3-image-klein-pup"
processor = AutoProcessor.from_pretrained(model_id)
model = Qwen3_5ForConditionalGeneration.from_pretrained(model_id, dtype=torch.bfloat16, device_map="auto").eval()
prompts = json.load(open(hf_hub_download(model_id, "system_prompts.json")))

messages = [{"role": "system", "content": prompts["t2i"]},
            {"role": "user", "content": "A man walking with his dog, afternoon sun"}]
inputs = processor.apply_chat_template(messages, add_generation_prompt=True, tokenize=True, return_dict=True,
                                       return_tensors="pt", enable_thinking=False).to(model.device)
with torch.no_grad():
    out = model.generate(**inputs, max_new_tokens=3584, do_sample=False)
caption = processor.decode(out[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()
print(caption)
```

For an edit, use `prompts["i2i"]` and a user message with the reference images first (`{"type": "image", "image": pil_image}` per reference) and then this text, three lines:

```text
Reference images follow in order (the first image, the second image, ...).
User request: put a red bandana around the dog's neck
Output the caption.
```

Decoding: greedy, `top_p` 0.95, `top_k` 20, presence penalty 1.5 for text-to-image and 0 for edits. The `*_bbox` prompts take the boxes as JSON after the request and return the prompt with a box table; the exact scaffolds are `flux3/pup.py` and `flux3/bbox.py` in the inference code.

# Limitations

- Output is English. The request can be in any language.
- The prompts are written for FLUX 3 Image Klein; no other image model was part of training.
- Reference images are resized before the model sees them (at most 1 MP for one reference, less for several), so small details in a reference can be described wrongly.
- The model does not refuse requests. The inference code wraps it with optional prompt and image checks (`--safety`).

# License

This model is released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). It is derived from [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) by the Qwen team at Alibaba Cloud, released under the Apache License 2.0.

# Trademarks & IP

This project may contain trademarks or logos for projects, products, or services. Use of Black Forest Labs and FLUX trademarks or logos in modified versions of this project must not cause confusion or imply sponsorship or endorsement. Any use of third-party trademarks, intellectual property or logos are subject to those third-party's policies.

## Citation

If you use FLUX 3 Image in your work, please cite:

```bibtex
@misc{bfl2026flux3image,
  author       = {{Black Forest Labs}},
  title        = {{FLUX} 3 Image Klein},
  year         = {2026},
  url          = {https://bfl.ai/blog/flux-3-image-klein},
}
```
