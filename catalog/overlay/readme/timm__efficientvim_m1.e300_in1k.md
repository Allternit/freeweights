# Model card for efficientvim_m1.e300_in1k

An EfficientViM image classification model. Trained on ImageNet-1k by paper authors.

## Model Details
- **Model Type:** Image Classification / Feature Encoder
- **Model Stats:**
  - Params (M): 6.7
  - GMACs: 0.2
  - Activations (M): 1.6
  - Image size: 224 x 224
- **Dataset:** ImageNet-1k
- **Papers:**
  - EfficientViM: Efficient Vision Mamba with Hidden State Mixer based State Space Duality: https://arxiv.org/abs/2411.15241
- **Original:** https://github.com/mlvlab/EfficientViM

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import torch
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('efficientvim_m1.e300_in1k', pretrained=True)
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
    'efficientvim_m1.e300_in1k',
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
    #  torch.Size([1, 128, 14, 14])
    #  torch.Size([1, 192, 7, 7])
    #  torch.Size([1, 320, 4, 4])

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
    'efficientvim_m1.e300_in1k',
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
# output is a list of unpooled tensors with shapes [(1, 128, 49), (1, 192, 25), (1, 320, 9), (1, 320, 16)]

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
Explore the dataset and runtime metrics of this model in timm [model results](https://github.com/huggingface/pytorch-image-models/tree/main/results).

## Citation
```bibtex
@inproceedings{lee2025efficientvim,
  title={EfficientViM: Efficient Vision Mamba with Hidden State Mixer based State Space Duality},
  author={Lee, Sanghyeok and Choi, Joonmyung and Kim, Hyunwoo J.},
  booktitle={Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition},
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
