# Model card for qwen3_vit_306m.qwen3_vl_4b

A Qwen ViT image feature model extracted from [Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct). This is the classifier-ready wrapper with average pooling and affine-free LayerNorm over the encoder features.

> **NOTE:** This checkpoint is a native timm remap of the original vision weights, with no additional training. It contains no language-model weights or trained image-classification head.

## Model Notes
* Image inputs repeat one frame across the original temporal patch kernel. The temporal Conv3d weights are summed into a Conv2d for this image-only implementation.
* The backbone uses GELU-tanh MLPs, learned absolute positions and axial 2D RoPE. Absolute positions are interpolated for the input grid; RoPE is regenerated at each size.
* The timm transforms normalize RGB pixels using `mean=(0.5, 0.5, 0.5)` and `std=(0.5, 0.5, 0.5)`. Rectangular inputs are supported. Each image dimension must be divisible by 16; any variant using the 2×2 merger requires divisibility by 32.
* `forward_features()` returns raw, unnormalized NHWC backbone features. The `_enc` variant returns spatially merged tokens from `forward()`; the classifier variant returns pooled image embeddings until a classification head is added.
* Qwen3-VL DeepStack projectors are omitted. Intermediate backbone features are available through `forward_intermediates()` or `features_only=True`.


## Model Details
- **Model Type:** Image Feature Encoder
- **Model Stats:**
  - Params (M): 305.5
  - GMACs: 959.1
  - Activations (M): 2607.0
  - Image size: 768 x 768
- **Source revision:** [ebb281ec70b05090aa6165b016eac8ec08e71b17](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17)
- **License source:** https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
- **Original:** https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- **License:** [Apache 2.0](LICENSE)
- **Backbone width:** 1024
- **Papers:**
  - Qwen3-VL Technical Report: https://arxiv.org/abs/2511.21631
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models

## Model Usage
### Image Features

```python
import torch
import timm
from PIL import Image

model = timm.create_model('hf-hub:timm/qwen3_vit_306m.qwen3_vl_4b', pretrained=True).eval()
data_config = timm.data.resolve_model_data_config(model)
transform = timm.data.create_transform(**data_config, is_training=False)
image = Image.open('image.jpg').convert('RGB')
x = transform(image).unsqueeze(0)

with torch.inference_mode():
    output = model(x)  # (1, 1024): image embeddings
    features = model.forward_features(x)  # (1, 48, 48, 1024): raw backbone features (NHWC)
```

### Intermediate Feature Maps

```python
with torch.inference_mode():
    maps = model.forward_intermediates(
        x, indices=3, output_fmt='NCHW', intermediates_only=True,
    )
for feature_map in maps:
    print(feature_map.shape)  # (1, 1024, 48, 48)
```

### Classification Fine-tuning

```python
model = timm.create_model(
    'hf-hub:timm/qwen3_vit_306m.qwen3_vl_4b', pretrained=True, num_classes=45,
)
logits = model(x)  # (1, 45)
```

The new linear head is randomly initialized and must be trained on your target dataset.

## Citation
```bibtex
@article{Qwen3-VL,
  title={Qwen3-VL Technical Report},
  author={Bai, Shuai and others},
  journal={arXiv preprint arXiv:2511.21631},
  year={2025}
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
