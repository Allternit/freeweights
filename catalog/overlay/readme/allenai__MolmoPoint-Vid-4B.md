# MolmoPoint-Vid-4B
MolmoPoint-Vid-4B is a fully-open VLM developed by the Allen Institute for AI (Ai2) that is specialized for video pointing.
It points using grounding tokens instead of text coodinates, see our paper for details.
This model is only trained for video pointing, see MolmoPoint-8B for a generalist model.

Note the huggingface MolmoPoint model does not support training, see our github repo for the training code.

Quick links:
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
Then `model.extract_video_points` does the decoding, it
returns a list of (timestamps, object_id, pixel_x, pixel_y) output points.


### Video Pointing Example:
```python
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
import numpy as np

checkpoint_dir = "allenai/MolmoPoint-Vid-4B"

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

video_path = "https://storage.googleapis.com/oe-training-public/demo_videos/many_penguins.mp4"
video_messages = [
    {
        "role": "user",
        "content": [
            dict(type="text", text="Point to the penguins"),
            dict(type="video", video=video_path),
        ]
    }
]

inputs = processor.apply_chat_template(
    video_messages,
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

    generated_tokens = output[:, inputs['input_ids'].size(1):]
    generated_text = processor.post_process_image_text_to_text(generated_tokens, skip_special_tokens=False, clean_up_tokenization_spaces=False)[0]
    video_points = model.extract_video_points(
        generated_text,
        metadata["token_pooling"],
        metadata["subpatch_mapping"],
        metadata["timestamps"],
        metadata["video_size"]
    )

    # points as a list of [object_id, image_num, x, y]
    # For tracking, object_id uniquely identifies objects that might appear multiple frames.
    print(np.array(video_points))
# expected:
[[  1.           9.         188.86666667 177.65925926]
 [  2.          15.5        197.66666667 288.35555556]
 [  3.          17.         153.26666667 327.7037037 ]
 [  4.          23.5         46.6        406.87407407]
 [  5.          23.5         91.         406.87407407]
 [  6.          23.5        135.53333333 438.4       ]
 [  7.          23.5        233.26666667 477.98518519]
 [  8.          25.         184.33333333 280.2962963 ]
 [  9.          25.         268.86666667 232.88888889]
 [ 10.          27.         171.         335.76296296]
 [ 11.          30.         193.26666667 304.        ]
 [ 12.          32.          64.33333333 201.36296296]
 [ 13.          32.         202.2        414.6962963 ]
 [ 14.          38.5        184.33333333 383.17037037]
 [ 15.          40.5        335.53333333  82.84444444]
 [ 16.          40.5        117.66666667 201.36296296]
 [ 17.          40.5         95.53333333 501.68888889]
 [ 18.          47.         259.93333333 304.        ]
 [ 19.          47.         153.26666667 501.68888889]]
```

## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2’s Responsible Use Guidelines. This model is trained on third party datasets that are subject to academic and non-commercial research use only. Please review the sources to determine if this model is appropriate for your use case.