# Model card for deepseek_vit_412m.deepseek_v4_1_flash

> **NOTE:** This checkpoint is a native timm remap of the original vision weights, with no additional training. It contains no language-model weights or trained image-classification head.

A DeepSeek ViT image feature model extracted from [DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash). This is the classifier-ready wrapper with average pooling and affine-free RMSNorm over the encoder patch features.

## Model Notes

* The backbone uses 14×14 patches, SwiGLU MLPs, RMSNorm and axial 2D RoPE, with no learned absolute position embeddings. The original linear patch projection is reshaped into a Conv2d without changing its computation.
* The native aligner groups 3×3 patch tokens in channel-major order and uses a two-layer GELU MLP to project to the source LLM width. Incomplete groups are zero-padded on the bottom/right. It is retained in `_enc` and `_align` variants and omitted from the plain classifier.
* RGB inputs use `mean=(0.5, 0.5, 0.5)` and `std=(0.5, 0.5, 0.5)`, matching the original. The default timm evaluation transform uses `crop_mode="border"`, `crop_pct=1.0` and bicubic resizing to preserve aspect ratio on a fixed, gray-padded canvas. The original processor selects variable canvas dimensions and uses gray 127 padding; timm uses gray 128.
* Rectangular inputs are supported. Dimensions must be divisible by 14 by default. Pass `dynamic_img_pad=True` at model creation to zero-pad normalized inputs on the bottom/right to a patch-size multiple. This does not reproduce the original adaptive resize policy.
* `forward_features()` returns final-RMSNorm NHWC backbone features. `forward()` returns projected NLC tokens for the `_enc` variant, or pooled image embeddings for the classifier variant until a classification head is added.
* Intermediate backbone maps are available through `forward_intermediates()` and `features_only=True`; these do not include the aligner. Use `norm=True` to apply the encoder's final RMSNorm to intermediate maps.


## Model Details
- **Model Type:** Image Feature Encoder
- **Model Stats:**
  - Params (M): 411.8
  - GMACs: 777.7
  - Activations (M): 1759.2
  - Image size: 546 x 546
- **Source revision:** [dba1be0a40aa45a94ad051997016db3960a90277](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/dba1be0a40aa45a94ad051997016db3960a90277)
- **License source:** https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/LICENSE
- **Original code:** https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/inference/vision.py
- **Original preprocessing:** https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/inference/image_processor.py
- **Original:** https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- **License:** [MIT](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/LICENSE)
- **Backbone width:** 1024
- **Papers:**
  - DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models

## Model Usage
### Image Features

```python
import torch
import timm
from PIL import Image

model = timm.create_model('hf-hub:timm/deepseek_vit_412m.deepseek_v4_1_flash', pretrained=True).eval()
data_config = timm.data.resolve_model_data_config(model)
transform = timm.data.create_transform(**data_config, is_training=False)
image = Image.open('image.jpg').convert('RGB')
x = transform(image).unsqueeze(0)

with torch.inference_mode():
    output = model(x)  # (1, 1024): image embeddings
    features = model.forward_features(x)  # (1, 39, 39, 1024): final-RMSNorm backbone features (NHWC)
```

### Intermediate Feature Maps

```python
with torch.inference_mode():
    maps = model.forward_intermediates(
        x, indices=3, norm=True, output_fmt='NCHW', intermediates_only=True,
    )
for feature_map in maps:
    print(feature_map.shape)  # (1, 1024, 39, 39)
```

### Classification Fine-tuning

```python
model = timm.create_model(
    'hf-hub:timm/deepseek_vit_412m.deepseek_v4_1_flash', pretrained=True, num_classes=45,
)
logits = model(x)  # (1, 45)
```

The new linear head is randomly initialized and must be trained on your target dataset.

## Citation
```bibtex
@misc{deepseekai2026deepseekv41flash,
  title={DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression},
  author={DeepSeek-AI},
  year={2026},
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
