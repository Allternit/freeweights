# MolmoPoint-GUI-8B
MolmoPoint-GUI-8B is a fully-open VLM developed by the Allen Institute for AI (Ai2) that is specialized for GUI pointing.
As specialized model, it only supports single image input with instruction-like queries, and will output a single point.
See MolmoPoint-8B for a generalist model.
MolmoPoint-GUI-8B points using grounding-tokens instead of text coordinates and reaches 61.1 on ScreenSpotPro, see our paper for details.

Note the huggingface MolmoPoint model does not support training, see our github repo for the training code.

Quick links:
- 🖥️ [Demo](https://huggingface.co/spaces/allenai/MolmoPoint-GUI-8B-Demo)
- 💬 [Code](https://github.com/allenai/molmo2)
- 📂 [All Models](https://huggingface.co/collections/allenai/molmopoint)
- 📃 [Paper](https://allenai.org/papers/molmopoint)
- 📝 [Blog](https://allenai.org/blog/molmopoint)


## Quick Start

### Setup Conda Environment
```
conda create --name transformers4571 python=3.11
conda activate transformers4571
pip install transformers==4.57.1
pip install torch pillow einops torchvision accelerate decord2
```

## Inference 
We recommend running MolmoPoint with `logits_processor=model.build_logit_processor_from_inputs(model_inputs)`
to enforce points tokens are generated in a valid way.

In MolmoPoint, instead of coordinates points will be generated as a series of special
tokens, decoding the tokens back into points requires some additional
metadata from the preprocessor.
The metadata is returned by the preprocessor using the `return_pointing_metadata` flag.
Then `model.extract_image_points` to do the decoding, it returns a list of (image_id, object_id, pixel_x, pixel_y) output points.

Note this model is only trained for single-image GUI screenshot input.


### Image Pointing Example:

```python
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch

checkpoint_dir = "allenai/MolmoPoint-Img-8B"  # or path to a converted HF checkpoint

model = AutoModelForImageTextToText.from_pretrained(
    checkpoint_dir,
    trust_remote_code=True,
    dtype="auto",
    device_map="auto",
)

processor = AutoProcessor.from_pretrained(
    checkpoint_dir,
    trust_remote_code=True,
    padding_side="left",
)

image_messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "open microsoft edge"},
            {"type": "image", "image": "https://assets.techrepublic.com/uploads/2020/08/windows-10-start-menu.jpg"},
        ]
    }
]

inputs = processor.apply_chat_template(
    image_messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt",
    return_dict=True,
    padding=True,
    return_pointing_metadata=True
)
metadata = inputs.pop("metadata")
inputs = {k: v.to("cuda") for k, v in inputs.items()}

with torch.inference_mode(), torch.autocast("cuda", dtype=torch.bfloat16):
    output = model.generate(
        **inputs,
        logits_processor=model.build_logit_processor_from_inputs(inputs),
        max_new_tokens=200
    )

generated_tokens = output[:, inputs["input_ids"].size(1):]
generated_text = processor.post_process_image_text_to_text(generated_tokens, skip_special_tokens=False, clean_up_tokenization_spaces=False)[0]
points = model.extract_image_points(
    generated_text,
    metadata["token_pooling"],
    metadata["subpatch_mapping"],
    metadata["image_sizes"]
)

print(points)
# points as a list of [object_id, image_num, x, y]
# expected: [[1, 0, np.float64(250.42718446601944), np.float64(274.73276923076924)]]
```


## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2’s Responsible Use Guidelines. This model is trained on third party datasets that are subject to academic and non-commercial research use only. Please review the sources to determine if this model is appropriate for your use case.