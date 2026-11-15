<div align="center">

<h2><a href="">LLM2CLIP: Extending the Capability Boundaries of CLIP through Large Language Models</a></h2>
Weiquan Huang<sup>1*</sup>, Aoqi Wu<sup>1*</sup>, Yifan Yang<sup>2†</sup>, Xufang Luo<sup>2</sup>, Yuqing Yang<sup>2</sup>, Liang Hu<sup>1</sup>, Qi Dai<sup>2</sup>, Xiyang Dai<sup>2</sup>, Dongdong Chen<sup>2</sup>, Chong Luo<sup>2</sup>, Lili Qiu<sup>2</sup>

<sup>1</sup>Tongji Universiy, <sup>2</sup>Microsoft Corporation <br><sup>*</sup>Equal contribution <br><sup>†</sup> Corresponding to: yifanyang@microsoft.com

<p><a rel="nofollow" href="https://github.com/microsoft/LLM2CLIP">[📂 GitHub]</a>  <a rel="nofollow" href="https://microsoft.github.io/LLM2CLIP/">[🆕 Blog]</a>  <a rel="nofollow" href="">[📜 LLM2CLIP]</a> 
</div>


In this paper, we propose LLM2CLIP, a novel approach that embraces the power of LLMs to unlock CLIP’s potential. By fine-tuning the LLM in the caption space with contrastive learning, we extract its textual capabilities into the output embeddings, significantly improving the output layer’s textual discriminability. We then design an efficient training process where the fine-tuned LLM acts as a powerful teacher for CLIP’s visual encoder. Thanks to the LLM’s presence, we can now incorporate longer and more complex captions without being restricted by vanilla CLIP text encoder’s context window and ability limitations. Our experiments demonstrate that this approach brings substantial improvements in cross-modal tasks. Our method directly boosted the performance of the previously SOTA EVA02 model by 16.5% on both long-text and short-text retrieval tasks, transforming a CLIP model trained solely on English data into a state-of-the-art cross-lingual model. Moreover, when integrated into mul- timodal training with models like Llava 1.5, it consistently outperformed CLIP across nearly all benchmarks, demonstrating comprehensive performance improvements.

## LLM2CLIP performance

<div align="center">
  <img src="teaser.png" alt="summary_tab" width="85%">
</div>
**It's important to note that all results presented in the paper are evaluated using PyTorch weights. There may be differences in performance when using Hugging Face (hf) models.**

## Model Details
- **Model Type:** vision foundation model, feature backbone
- **Pretrain Dataset:** CC3M, CC12M, YFCC15M and Recap-DataComp-1B(30M subset)


## Usage

### Huggingface Version
Image Embeddings
```python
from PIL import Image
from transformers import AutoModel
from transformers import CLIPImageProcessor
import torch

image_path = "CLIP.png"
model_name_or_path = "LLM2CLIP-Openai-B-16" # or /path/to/local/LLM2CLIP-Openai-B-16

processor = CLIPImageProcessor.from_pretrained("openai/clip-vit-base-patch16")
model = AutoModel.from_pretrained(
    model_name_or_path, 
    torch_dtype=torch.float16,
    trust_remote_code=True).to('cuda').eval()

image = Image.open(image_path)
input_pixels = processor(images=image, return_tensors="pt").pixel_values.to('cuda')

with torch.no_grad(), torch.cuda.amp.autocast():
    outputs = model.get_image_features(input_pixels)
```
Retrieval
```python
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

from PIL import Image
import torch
from llm2vec import LLM2Vec
from transformers import AutoModel, AutoConfig, AutoTokenizer
from transformers import CLIPImageProcessor

processor = CLIPImageProcessor.from_pretrained("openai/clip-vit-base-patch16")
model_name_or_path = "microsoft/LLM2CLIP-Openai-B-16" # or /path/to/local/LLM2CLIP-Openai-B-16
model = AutoModel.from_pretrained(
    model_name_or_path, 
    torch_dtype=torch.bfloat16,
    trust_remote_code=True).to('cuda').eval()

llm_model_name = 'microsoft/LLM2CLIP-Llama-3-8B-Instruct-CC-Finetuned'
config = AutoConfig.from_pretrained(
    llm_model_name, trust_remote_code=True
)
llm_model = AutoModel.from_pretrained(llm_model_name, torch_dtype=torch.bfloat16, config=config, trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained(llm_model_name)
llm_model.config._name_or_path = 'meta-llama/Meta-Llama-3-8B-Instruct' #  Workaround for LLM2VEC
l2v = LLM2Vec(llm_model, tokenizer, pooling_mode="mean", max_length=512, doc_max_length=512)

captions = ["a diagram", "a dog", "a cat"]
image_path = "CLIP.png"

image = Image.open(image_path)
input_pixels = processor(images=image, return_tensors="pt").pixel_values.to('cuda')
text_features = l2v.encode(captions, convert_to_tensor=True).to('cuda')

with torch.no_grad(), torch.cuda.amp.autocast():
    image_features = model.get_image_features(input_pixels)
    text_features = model.get_text_features(text_features)

    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)

print("Label probs:", text_probs)

```

## BibTeX & Citation

```
@misc{huang2024llm2clippowerfullanguagemodel,
      title={LLM2CLIP: Powerful Language Model Unlock Richer Visual Representation}, 
      author={Weiquan Huang and Aoqi Wu and Yifan Yang and Xufang Luo and Yuqing Yang and Liang Hu and Qi Dai and Xiyang Dai and Dongdong Chen and Chong Luo and Lili Qiu},
      year={2024},
      eprint={2411.04997},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2411.04997}, 
}
```
