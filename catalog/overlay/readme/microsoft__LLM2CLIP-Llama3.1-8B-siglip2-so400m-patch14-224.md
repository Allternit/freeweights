<div align="center">

<h2><a href="">LLM2CLIP: Extending the Capability Boundaries of CLIP through Large Language Models</a></h2>
Weiquan Huang<sup>1*</sup>, Aoqi Wu<sup>1*</sup>, Yifan Yang<sup>2†</sup>, Xufang Luo<sup>2</sup>, Yuqing Yang<sup>2</sup>, Liang Hu<sup>1</sup>, Qi Dai<sup>2</sup>, Xiyang Dai<sup>2</sup>, Dongdong Chen<sup>2</sup>, Chong Luo<sup>2</sup>, Lili Qiu<sup>2</sup>

<sup>1</sup>Tongji Universiy, <sup>2</sup>Microsoft Corporation <br><sup>*</sup>Equal contribution <br><sup>†</sup> Corresponding to: yifanyang@microsoft.com

<p><a rel="nofollow" href="https://github.com/microsoft/LLM2CLIP">[📂 GitHub]</a>  <a rel="nofollow" href="https://microsoft.github.io/LLM2CLIP/">[🆕 Blog]</a>  <a rel="nofollow" href="">[📜 LLM2CLIP]</a> 
</div>


In this paper, we propose LLM2CLIP, a novel approach that embraces the power of LLMs to unlock CLIP’s potential. By fine-tuning the LLM in the caption space with contrastive learning, we extract its textual capabilities into the output embeddings, significantly improving the output layer’s textual discriminability. We then design an efficient training process where the fine-tuned LLM acts as a powerful teacher for CLIP’s visual encoder. Thanks to the LLM’s presence, we can now incorporate longer and more complex captions without being restricted by vanilla CLIP text encoder’s context window and ability limitations. Our experiments demonstrate that this approach brings substantial improvements in cross-modal tasks. Our method directly boosted the performance of the previously SOTA EVA02 model by 16.5% on both long-text and short-text retrieval tasks, transforming a CLIP model trained solely on English data into a state-of-the-art cross-lingual model. Moreover, when integrated into mul- timodal training with models like Llava 1.5, it consistently outperformed CLIP across nearly all benchmarks, demonstrating comprehensive performance improvements.


## Model Details
- **Model Type:** vision foundation model, feature backbone
- **Pretrain Dataset:** CC3M, CC12M, YFCC15M and LAION-2B(30M subset)


## Usage
Go to [GitHub](https://github.com/microsoft/LLM2CLIP/tree/main/llm2clip)


```bash
# put LLM2CLIP-Llama-3.1-8B into the checkpoints folder.
ln -s LLM2CLIP-Llama-3.1-8B  llm2clip/checkpoints/

pip install flash_attn
pip install timm==1.0.15
pip uninstall -y  llm2vec
pip install  transformers==4.46
```

```python
import torch
from PIL import Image
from eva_clip import create_model_and_transforms

model, _, preprocess_val = create_model_and_transforms(
    "Llama3.1-8B-Siglip2-So-L-14-224",force_custom_clip=True)
ckpt = torch.load("LLM2CLIP-SigLIP2-So-14-224.pt")
model.load_state_dict(ckpt, strict=False)
model = model.cuda().eval()

captions = ["a diagram", "a dog", "a cat"]
image = Image.open("CLIP.png")
image = preprocess_val(image).unsqueeze(0).cuda()

with torch.no_grad(), torch.cuda.amp.autocast():
    image_features = model.encode_image(image)
    text_features = model.encode_text(captions)

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
