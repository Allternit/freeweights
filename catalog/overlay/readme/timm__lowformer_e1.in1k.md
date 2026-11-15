# Model card for lowformer_e1.in1k

A LowFormer image classification model. LowFormer targets real measured latency rather than MAC count, combining fused and grouped MBConv stages with an efficient attention block that projects to a lower spatial resolution with a strided depthwise convolution and upsamples the result with a transposed convolution. The `E` variants are the edge-GPU designs introduced in the journal extension, which trade attention for additional convolutional capacity. This checkpoint was trained on ImageNet-1k by the paper authors and converted to the `timm` state-dict layout.

## Model Notes
* `e1` and `e2` drop both the attention and MLP branches of the LowFormer block, leaving purely convolutional stages tuned for edge GPUs.
* The default preprocessing is encoded in the pretrained configuration: bicubic resize, ImageNet mean and standard deviation, and a center crop with `crop_pct=0.95`.
* The model can be used for ImageNet-1k classification, image embeddings, or multi-scale feature-map extraction with `features_only=True`.
* The accuracies above are measured in FP32. `lowformer_b0` and `lowformer_b1` are the variants most affected by `bfloat16` autocast, losing roughly 3.0 and 1.5 Top-1 respectively; the other variants stay within 0.25 of their FP32 result. FP16 autocast matches FP32 for all variants.
* Latency depends on the target hardware, inference runtime, export path, and batch size. See the papers for device-specific measurements and methodology.


## Model Details
- **Model Type:** Image Classification / Feature Encoder
- **Model Stats:**
  - Params (M): 18.9
  - GMACs: 1.4
  - Activations (M): 2.5
  - Image size: 224 x 224
- **Original:** https://github.com/altair199797/LowFormer
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **Dataset:** ImageNet-1k
- **Papers:**
  - LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones: https://arxiv.org/abs/2409.03460
  - Beyond MACs: Hardware Efficient Architecture Design for Vision Backbones: https://arxiv.org/abs/2603.26551
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

model = timm.create_model('lowformer_e1.in1k', pretrained=True)
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
    'lowformer_e1.in1k',
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
    #  torch.Size([1, 40, 56, 56])
    #  torch.Size([1, 80, 28, 28])
    #  torch.Size([1, 160, 14, 14])
    #  torch.Size([1, 320, 7, 7])

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
    'lowformer_e1.in1k',
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
# output is unpooled, a (1, 320, 7, 7) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
ImageNet-1k validation accuracy in FP32 with bicubic interpolation and a centered crop
(`crop_pct=0.95`). Values are Top-1 / Top-5 percentages; only input resolution changes
between columns.

| Model | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| [lowformer_b0.in1k](https://huggingface.co/timm/lowformer_b0.in1k) | 14.10 | 78.388 / 94.026 | 79.194 / 94.462 | 79.306 / 94.444 |
| [lowformer_b1.in1k](https://huggingface.co/timm/lowformer_b1.in1k) | 17.94 | 79.806 / 94.592 | 80.260 / 94.914 | 80.406 / 95.072 |
| [lowformer_b15.in1k](https://huggingface.co/timm/lowformer_b15.in1k) | 33.98 | 81.102 / 95.258 | 81.558 / 95.470 | 81.708 / 95.588 |
| [lowformer_b3.in1k](https://huggingface.co/timm/lowformer_b3.in1k) | 57.09 | 83.656 / 96.656 | 83.988 / 96.738 | 84.066 / 96.834 |
| [lowformer_e1.in1k](https://huggingface.co/timm/lowformer_e1.in1k) | 18.90 | 78.772 / 94.120 | 79.366 / 94.450 | 79.624 / 94.562 |
| [lowformer_e2.in1k](https://huggingface.co/timm/lowformer_e2.in1k) | 22.75 | 81.612 / 95.714 | 81.982 / 95.948 | 82.156 / 96.098 |
| [lowformer_e3.in1k](https://huggingface.co/timm/lowformer_e3.in1k) | 41.32 | 83.044 / 96.344 | 83.166 / 96.536 | 83.402 / 96.552 |

## Citation
```bibtex
@inproceedings{nottebaum2025lowformer,
  title={LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones},
  author={Nottebaum, Moritz and Dunnhofer, Matteo and Micheloni, Christian},
  booktitle={Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)},
  pages={7008--7018},
  year={2025}
}
```
```bibtex
@article{nottebaum2026beyondmacs,
  title={Beyond MACs: Hardware Efficient Architecture Design for Vision Backbones},
  author={Nottebaum, Moritz and Dunnhofer, Matteo and Micheloni, Christian},
  journal={International Journal of Computer Vision},
  volume={134},
  number={6},
  pages={295},
  year={2026},
  doi={10.1007/s11263-026-02873-5}
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
