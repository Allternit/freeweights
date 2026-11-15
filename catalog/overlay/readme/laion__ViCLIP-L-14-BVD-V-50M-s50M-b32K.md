# ViCLIP-L-14-BVD-V-50M-s50M-b32K

## Table of Contents

1. [Model Details](#model-details)
2. [Uses](#uses)
3. [Training Details](#training-details)
4. [Evaluation](#evaluation)
5. [How to Get Started with the Model](#how-to-get-started-with-the-model)
6. [Citation](#citation)

---

## Model Details

ViCLIP ViT-L/14 trained on the BVD-V-50M dataset with 50M video-text pairs.

**Model Architecture:** ViCLIP with ViT-L/14 vision tower. The vision and text encoders are both initialized
from <https://huggingface.co/laion/CLIP-ViT-L-14-DataComp.XL-s13B-b90K>.

**HF Transformers:** The model is directly usable via `AutoModel`, `AutoTokenizer` and `AutoVideoProcessor` from HF Transformers.

---

## Uses

This model is intended for research purposes. We hope it enables researchers to better understand and explore zero-shot video classification, video-text retrieval, and generalisation capabilities of video-language models.

### Direct Use

- Zero-shot video classification
- Video-text retrieval
- Video representation learning

### Downstream Use

- Linear probing and full fine-tuning for various video classification tasks
- Video retrieval systems
- Component for multimodal models (e.g., VLMs)

### Out-of-Scope Use

- Surveillance and facial recognition applications
- Undeployed or unconstrained deployment without thorough in-domain testing
- Any language other than English

---

## Training Details

### Training Data

Trained on the BVD-V-50M dataset.

### Training Procedure

- **Model:** ViCLIP L/14
- **Frames per video** 8 
- **Resolution:** 224×224
- **Samples:** 50M samples seen
- **Optimizer:** AdamW (lr=4e-5, betas=[0.9, 0.98], weight_decay=0.2)
- **Global batch size:** 32000
- **Warmup:** 100 steps
- **Learning Rate Scheduler:** Cosine annealing

---

## Evaluation

Evaluated using the [CLIP Benchmark video](https://github.com/LAION-AI/CLIP_benchmark_video).

### Results


| Kinetics-400 top-1 accuracy | UCF-101 top-1 accuracy | HMDB51 top-1 accuracy | MSR-VTT video/text retrieval recall@1 | MSVD video/text retrieval recall@1 |
|---:|---:|---:|---:|---:|
| 63.3 | 79.7 | 61.4 | 42.8 / 43.2 | 53.7 / 83.9 |
---

## How to Get Started with the Model

### Quickstart with HF Transformers

```python
import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoTokenizer, AutoVideoProcessor

model = AutoModel.from_pretrained("laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K", trust_remote_code=True)
video_processor = AutoVideoProcessor.from_pretrained("laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K", trust_remote_code=True)

video = video_processor("path/to/video.mp4")

labels = ["a person playing basketball", "a person swimming", "a person running"]
text_tokens = tokenizer(labels, padding="max_length", truncation=True, max_length=77, return_tensors="pt")

with torch.no_grad():
    v_feat = model.get_video_features(video["pixel_values_videos"])
    t_feat = model.get_text_features(text_tokens["input_ids"])

logits = 100.0 * v_feat @ t_feat.t()
probs = logits.softmax(dim=-1)
print("Label probs:", probs)
```
---

## Citation

```bibtex
@misc{laionbvd2026,
      title={LAION-BVD: A 10-Million-Hour Open Video Dataset for Multimodal Pre-training}, 
      author={Andreas Hochlehnert and Marianna Nezhurina and Mehdi Cherti and Andrej Radonjic and Thaddäus Wiedemer and Christoph Schuhmann and Romain Beaumont and Wieland Brendel and Bernhard Schölkopf and A. Sophia Koepke and Jenia Jitsev and Matthias Bethge},
      year={2026},
      eprint={2608.24845},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2608.24845}, 
}
```
