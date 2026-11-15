<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/SmolVLM2_banner.png" width="800" height="auto" alt="Image description">

# SmolVLM2 2.2B

This is the base model for SmolVLM2-2.2B, a lightweight multimodal model designed to analyze video content. The model processes videos, images, and text inputs to generate text outputs - whether answering questions about media files, comparing visual content, or transcribing text from images. Despite its compact size, requiring only 5.2GB of GPU RAM for video inference, it delivers robust performance on complex multimodal tasks. This efficiency makes it particularly well-suited for on-device applications where computational resources may be limited.
## Model Summary

- **Developed by:** Hugging Face 🤗
- **Model type:** Multi-modal model (image/multi-image/video/text)
- **Language(s) (NLP):** English
- **License:** Apache 2.0
- **Architecture:** Based on [Idefics3](https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3) (see technical summary)

## Resources

- **Demo:** [Video Highlight Generator](https://huggingface.co/spaces/HuggingFaceTB/SmolVLM2-HighlightGenerator)
- **Blog:** [Blog post](https://huggingface.co/blog/smolvlm2)


## Uses


SmolVLM2 can be used for inference on multimodal (video / image / text) tasks where the input consists of text queries along with video or one or more images. Text and media files can be interleaved arbitrarily, enabling tasks like captioning, visual question answering, and storytelling based on visual content. The model does not support image or video generation.

To fine-tune SmolVLM2 on a specific task, you can follow [the fine-tuning tutorial](https://github.com/huggingface/smollm/blob/main/vision/finetuning/Smol_VLM_FT.ipynb).


### How to get started

You can use transformers to load, infer and fine-tune SmolVLM. Make sure you have num2words, flash-attn and latest transformers installed.
You can load the model as follows.

```python
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch

model_path = "HuggingFaceTB/SmolVLM2-2.2B-Base"
processor = AutoProcessor.from_pretrained(model_path)
model = AutoModelForImageTextToText.from_pretrained(
    model_path,
    torch_dtype=torch.bfloat16,
    _attn_implementation="flash_attention_2"
).to("cuda")
```

#### Simple Inference

You preprocess your inputs directly using chat templates and directly passing them 

```python
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg"},
            {"type": "text", "text": "Can you describe this image?"},
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device, dtype=torch.bfloat16)

generated_ids = model.generate(**inputs, do_sample=False, max_new_tokens=64)
generated_texts = processor.batch_decode(
    generated_ids,
    skip_special_tokens=True,
)
print(generated_texts[0])
```

#### Video Inference

To use SmolVLM2 for video inference, make sure you have decord installed. 

```python
messages = [
    {
        "role": "user",
        "content": [
            {"type": "video", "path": "path_to_video.mp4"},
            {"type": "text", "text": "Describe this video in detail"}
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device, dtype=torch.bfloat16)

generated_ids = model.generate(**inputs, do_sample=False, max_new_tokens=64)
generated_texts = processor.batch_decode(
    generated_ids,
    skip_special_tokens=True,
)

print(generated_texts[0])
```
#### Multi-image Interleaved Inference

You can interleave multiple media with text using chat templates.

```python
import torch


messages = [
    {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is the similarity between these two images?"},
          {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg"},
          {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/0052a70beed5bf71b92610a43a52df6d286cd5f3/diffusers/rabbit.jpg"},            
        ]
    },
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device, dtype=torch.bfloat16)

generated_ids = model.generate(**inputs, do_sample=False, max_new_tokens=64)
generated_texts = processor.batch_decode(
    generated_ids,
    skip_special_tokens=True,
)
print(generated_texts[0])
```


### Model optimizations

## Misuse and Out-of-scope Use

SmolVLM is not intended for high-stakes scenarios or critical decision-making processes that affect an individual's well-being or livelihood. The model may produce content that appears factual but may not be accurate. Misuse includes, but is not limited to:

- Prohibited Uses:
  - Evaluating or scoring individuals (e.g., in employment, education, credit)
  - Critical automated decision-making
  - Generating unreliable factual content
- Malicious Activities:
  - Spam generation
  - Disinformation campaigns
  - Harassment or abuse
  - Unauthorized surveillance

### License

SmolVLM2 is built upon [the shape-optimized SigLIP](https://huggingface.co/google/siglip-so400m-patch14-384) as image encoder and [SmolLM2](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct) for text decoder part.

We release the SmolVLM2 checkpoints under the Apache 2.0 license.

## Citation information
You can cite us in the following way:
```bibtex
@article{marafioti2025smolvlm,
  title={SmolVLM: Redefining small and efficient multimodal models}, 
  author={Andrés Marafioti and Orr Zohar and Miquel Farré and Merve Noyan and Elie Bakouch and Pedro Cuenca and Cyril Zakka and Loubna Ben Allal and Anton Lozhkov and Nouamane Tazi and Vaibhav Srivastav and Joshua Lochner and Hugo Larcher and Mathieu Morlon and Lewis Tunstall and Leandro von Werra and Thomas Wolf},
  journal={arXiv preprint arXiv:2504.05299},
  year={2025}
}
```
