# Model card for gemma4_vit_167m.gemma4_e4b_it

A Gemma 4 ViT image feature encoder extracted from Google's [Gemma 4 E4B-it](https://huggingface.co/google/gemma-4-E4B-it) multimodal language model. This is the classifier-friendly wrapper exposing an avg-pool + `RmsNorm` on top of the encoder patch tokens, ready for fine-tuning a linear head. The architecture is a custom ViT with 2D RoPE, gated MLP (GELU-tanh), RMS normalization on Q/K/V, and a 4-norm sandwich block layout.

## Model Notes
* Weights were imported directly from the source VLM's vision tower ([Gemma 4 E4B-it](https://huggingface.co/google/gemma-4-E4B-it)); outputs match the `transformers` `Gemma4VisionModel` implementation bit-for-bit on matching inputs.
* Gemma 4 expects raw `[0, 1]`-range pixel tensors — the model maps them internally to `[-1, 1]` via `2 * (x - 0.5)`. The `pretrained_cfg` therefore declares `mean=(0, 0, 0)` / `std=(1, 1, 1)` to disable normalization in timm's standard transform pipeline and avoid double-normalization.
* The encoder supports NaFlex-style variable-resolution inputs and integrates with timm's NaFlex data pipeline (see `timm.data.naflex_loader` / `--naflex-loader` in `train.py`). Both raw `(B, C, H, W)` images and pre-patchified `(B, N, ...)` tensors (plus `patch_coord` / `patch_valid`) are accepted — so the same model can be trained or fine-tuned with dynamic batch sizing that preserves native aspect ratios at flexible resolutions, or run at a fixed square input size.


## Model Details
- **Model Type:** Image Feature Encoder
- **Model Stats:**
  - Params (M): 167.4
  - GMACs: 515.9
  - Activations (M): 1421.0
  - Image size: 768 x 768
- **Original:** https://huggingface.co/google/gemma-4-E4B-it
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **Papers:**
  - Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('gemma4_vit_167m.gemma4_e4b_it', pretrained=True)
model = model.eval()

# get model specific transforms (normalization, resize)
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=False)

output = model(transforms(img).unsqueeze(0))  # unsqueeze single image into batch of 1

top5_probabilities, top5_class_indices = torch.topk(output.softmax(dim=1) * 100, k=5)
```

### Feature Map Extraction
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model(
    'gemma4_vit_167m.gemma4_e4b_it',
    pretrained=True,
    features_only=True,
)
model = model.eval()

# get model specific transforms (normalization, resize)
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=False)

output = model(transforms(img).unsqueeze(0))  # unsqueeze single image into batch of 1

for o in output:
    # print shape of each feature map in output
    # e.g.:
    #  torch.Size([1, 768, 48, 48])
    #  torch.Size([1, 768, 48, 48])
    #  torch.Size([1, 768, 48, 48])

    print(o.shape)
```

### Image Embeddings
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model(
    'gemma4_vit_167m.gemma4_e4b_it',
    pretrained=True,
    num_classes=0,  # remove classifier nn.Linear
)
model = model.eval()

# get model specific transforms (normalization, resize)
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=False)

output = model(transforms(img).unsqueeze(0))  # output is (batch_size, num_features) shaped tensor

# or equivalently (without needing to set num_classes=0)

output = model.forward_features(transforms(img).unsqueeze(0))
# output is unpooled, a (1, 2304, 768) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Citation
```bibtex
@misc{gemma4_2025,
  title={Gemma 4},
  author={{Gemma Team, Google DeepMind}},
  year={2025},
  howpublished={\url{https://ai.google.dev/gemma/docs/core/model_card_4}}
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
