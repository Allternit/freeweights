# Kosmos-2.5-chat

[Microsoft Document AI](https://www.microsoft.com/en-us/research/project/document-ai/) | [GitHub](https://github.com/microsoft/unilm/tree/master/kosmos-2.5)

## Model description
Kosmos-2.5 is a multimodal literate model for machine reading of text-intensive images. Pre-trained on large-scale text-intensive images, Kosmos-2.5 excels in two distinct yet cooperative transcription tasks: (1) generating spatially-aware text blocks, where each block of text is assigned its spatial coordinates within the image, and (2) producing structured text output that captures styles and structures into the markdown format. This unified multimodal literate capability is achieved through a shared decoder-only auto-regressive Transformer architecture, task-specific prompts, and flexible text representations. We evaluate Kosmos-2.5 on end-to-end document-level text recognition and image-to-markdown text generation. Furthermore, the model can be readily adapted for any text-intensive image understanding task with different prompts through supervised fine-tuning, making it a general-purpose tool for real-world applications involving text-rich images. This work also paves the way for the future scaling of multimodal large language models.

Kosmos-2.5-chat is a model specifically trained for Visual Question Answering (VQA) tasks, based on further training of Kosmos-2.5. For more details about Kosmos-2.5-chat, please refer to the paper.

[Kosmos-2.5: A Multimodal Literate Model](https://arxiv.org/abs/2309.11419)

## Usage

KOSMOS-2.5 is supported from Transformers >= 4.56. Find the docs [here](https://huggingface.co/docs/transformers/main/en/model_doc/kosmos2_5).

```python
import re
import torch
import requests
from PIL import Image, ImageDraw
from transformers import AutoProcessor, Kosmos2_5ForConditionalGeneration

repo = "microsoft/kosmos-2.5-chat"
device = "cuda:0"
dtype = torch.bfloat16

model = Kosmos2_5ForConditionalGeneration.from_pretrained(repo,
                                                          device_map=device,
                                                          torch_dtype=dtype,
                                                          attn_implementation="flash_attention_2")
processor = AutoProcessor.from_pretrained(repo)

# sample image
url = "https://huggingface.co/microsoft/kosmos-2.5/resolve/main/receipt_00008.png"

image = Image.open(requests.get(url, stream=True).raw)

question = "What is the sub total of the receipt?"
template = "<md>A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions. USER: {} ASSISTANT:"
prompt = template.format(question)
inputs = processor(text=prompt, images=image, return_tensors="pt")

height, width = inputs.pop("height"), inputs.pop("width")
raw_width, raw_height = image.size
scale_height = raw_height / height
scale_width = raw_width / width

inputs = {k: v.to(device) if v is not None else None for k, v in inputs.items()}
inputs["flattened_patches"] = inputs["flattened_patches"].to(dtype)
generated_ids = model.generate(
    **inputs,
    max_new_tokens=1024,
)

generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)
print(generated_text[0])
```

## NOTE:
Since this is a generative model, there is a risk of **hallucination** during the generation process, and it **CAN NOT** guarantee the accuracy of all results in the images.

## Inference
**Document Understanding Task:** For usage instructions, please refer to [chat.py](chat.py).

## Citation

If you find Kosmos-2.5-chat useful in your research, please cite the following paper:

```
@article{lv2023kosmos,
  title={Kosmos-2.5: A multimodal literate model},
  author={Lv, Tengchao and Huang, Yupan and Chen, Jingye and Cui, Lei and Ma, Shuming and Chang, Yaoyao and Huang, Shaohan and Wang, Wenhui and Dong, Li and Luo, Weiyao and others},
  journal={arXiv preprint arXiv:2309.11419},
  year={2023}
}
```

## License
The content of this project itself is licensed under the [MIT](https://github.com/microsoft/unilm/blob/master/kosmos-2.5/LICENSE)

[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct)
