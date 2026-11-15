# TIPS — B/14 (v1)

TIPS (Text-Image Pre-training with Spatial awareness, ICLR 2025) is a family of contrastive vision-language models that produce spatially rich image features aligned with text embeddings. This is the original (v1) B/14 release with 86M vision params and 110M text params, converted from the [official checkpoints](https://github.com/google-deepmind/tips).

| Variant | Vision params | Text params | Embed dim | Resolution |
|---------|---------------|-------------|-----------|------------|
| [S/14](https://huggingface.co/google/tipsv1-s14) | 22M | 34M | 384 | 448 |
| [B/14](https://huggingface.co/google/tipsv1-b14) | 86M | 110M | 768 | 448 |
| [L/14](https://huggingface.co/google/tipsv1-l14) | 304M | 184M | 1024 | 448 |
| [So400m/14](https://huggingface.co/google/tipsv1-so400m14) | 413M | 448M | 1152 | 448 |
| [g/14](https://huggingface.co/google/tipsv1-g14) | 1.1B | 389M | 1536 | 448 |
| [g/14 low-res](https://huggingface.co/google/tipsv1-g14-lowres) | 1.1B | 389M | 1536 | 224 |

## Usage

```bash
pip install transformers torch torchvision sentencepiece scikit-learn requests
```

### Load the model

```python
from transformers import AutoModel

model = AutoModel.from_pretrained("google/tipsv1-b14", trust_remote_code=True)
model.eval()
```

### Encode images

Images should be tensors in `[0, 1]` range (just `ToTensor()`, no ImageNet normalization).

```python
import requests
from PIL import Image
from torchvision import transforms

url = "https://huggingface.co/spaces/google/TIPSv2/resolve/main/examples/zeroseg/pascal_context_00049_image.png"
image = Image.open(requests.get(url, stream=True).raw).convert("RGB")
transform = transforms.Compose([transforms.Resize((448, 448)), transforms.ToTensor()])
pixel_values = transform(image).unsqueeze(0)

out = model.encode_image(pixel_values)
print(out.cls_token.shape)     # (1, 1, 768) — global image embedding
print(out.patch_tokens.shape)  # (1, 1024, 768) — per-patch spatial features
```

The second CLS token (`out.register_tokens`) was trained on synthetic captions; the first (`out.cls_token`) on web alt-text, and is the one aligned with the text tower.

### Encode text

```python
text_emb = model.encode_text(["a photo of a bus", "a photo of a dog"])
print(text_emb.shape)  # (2, 768) — one embedding per query
```

### Zero-shot classification

```python
import torch.nn.functional as F

classes = ["bus", "car", "dog", "cat"]
cls = F.normalize(out.cls_token[:, 0, :], dim=-1)
text_emb = F.normalize(model.encode_text(classes), dim=-1)
similarity = cls @ text_emb.T
print(classes[similarity.argmax()])  # predicted class
```

### Visualize spatial features

```python
import numpy as np
from sklearn.decomposition import PCA

feat = out.patch_tokens[0].detach().cpu().numpy()
rgb = PCA(n_components=3, whiten=True).fit_transform(feat).reshape(32, 32, 3)
rgb = 1 / (1 + np.exp(-2.0 * rgb))  # sigmoid for [0, 1] range with good contrast
```

## Model details

- ViT-B/14 vision encoder (12 layers, patch size 14, two CLS tokens) + 12-layer transformer text encoder
- Native resolution 448; other patch-multiple resolutions work via positional-embedding interpolation
- Preprocessing: images to `[0, 1]`, no normalization; SentencePiece tokenizer, lowercased, max 64 tokens

## License

Apache 2.0

## Citation

```bibtex
@inproceedings{maninis2025tips,
  title     = {{TIPS: Text-Image Pretraining with Spatial Awareness}},
  author    = {Maninis, Kevis-Kokitsi and Chen, Kaifeng and Ghosh, Soham and Karpur, Arjun and Chen, Koert and Xia, Ye and Cao, Bingyi and Salz, Daniel and Han, Guangxing and Dlabal, Jan and Gnanapragasam, Dan and Seyedhosseini, Mojtaba and Zhou, Howard and Araujo, Andre},
  booktitle = {International Conference on Learning Representations (ICLR)},
  year      = {2025},
  url       = {https://arxiv.org/abs/2410.16512}
}
```
