# Model card for qwen3_vit_88m.qwen3_5_0_8b

A Qwen ViT image feature model extracted from [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B). This is the classifier-ready wrapper with average pooling and affine-free LayerNorm over the encoder features.

> **NOTE:** This checkpoint is a native timm remap of the original vision weights, with no additional training. It contains no language-model weights or trained image-classification head.

## Model Notes
* Image inputs repeat one frame across the original temporal patch kernel. The temporal Conv3d weights are summed into a Conv2d for this image-only implementation.
* The backbone uses GELU-tanh MLPs, learned absolute positions and axial 2D RoPE. Absolute positions are interpolated for the input grid; RoPE is regenerated at each size.
* The timm transforms normalize RGB pixels using `mean=(0.5, 0.5, 0.5)` and `std=(0.5, 0.5, 0.5)`. Rectangular inputs are supported. Each image dimension must be divisible by 16; any variant using the 2×2 merger requires divisibility by 32.
* `forward_features()` returns raw, unnormalized NHWC backbone features. The `_enc` variant returns spatially merged tokens from `forward()`; the classifier variant returns pooled image embeddings until a classification head is added.


## Model Details
- **Model Type:** Image Feature Encoder
- **Model Stats:**
  - Params (M): 87.4
  - GMACs: 295.1
  - Activations (M): 978.5
  - Image size: 768 x 768
- **Source revision:** [2fc06364715b967f1860aea9cf38778875588b17](https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17)
- **License source:** https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/2fc06364715b967f1860aea9cf38778875588b17/LICENSE
- **Original:** https://huggingface.co/Qwen/Qwen3.5-0.8B
- **License:** [Apache 2.0](LICENSE)
- **Backbone width:** 768
- **Papers:**
  - Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models

## Model Usage
### Image Features

```python
import torch
import timm
from PIL import Image

model = timm.create_model('hf-hub:timm/qwen3_vit_88m.qwen3_5_0_8b', pretrained=True).eval()
data_config = timm.data.resolve_model_data_config(model)
transform = timm.data.create_transform(**data_config, is_training=False)
image = Image.open('image.jpg').convert('RGB')
x = transform(image).unsqueeze(0)

with torch.inference_mode():
    output = model(x)  # (1, 768): image embeddings
    features = model.forward_features(x)  # (1, 48, 48, 768): raw backbone features (NHWC)
```

### Intermediate Feature Maps

```python
with torch.inference_mode():
    maps = model.forward_intermediates(
        x, indices=3, output_fmt='NCHW', intermediates_only=True,
    )
for feature_map in maps:
    print(feature_map.shape)  # (1, 768, 48, 48)
```

### Classification Fine-tuning

```python
model = timm.create_model(
    'hf-hub:timm/qwen3_vit_88m.qwen3_5_0_8b', pretrained=True, num_classes=45,
)
logits = model(x)  # (1, 45)
```

The new linear head is randomly initialized and must be trained on your target dataset.

## Citation
```bibtex
@misc{qwen3.5,
  title={{Qwen3.5}: Towards Native Multimodal Agents},
  author={{Qwen Team}},
  month={February},
  year={2026},
  url={https://qwen.ai/blog?id=qwen3.5}
}
```
```bibtex
@misc{rw2019timm,
  author = {Ross Wightman},
  title = {PyTorch Image Models},
  year = {2019},
  publisher = {GitHub},
  journal = {GitHub repository},
  doi = {10.5281/zenodo.4414861},
  howpublished = {\url{https://github.com/huggingface/pytorch-image-models}}
}
```
