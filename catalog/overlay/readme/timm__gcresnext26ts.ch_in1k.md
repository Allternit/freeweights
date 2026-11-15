# Model card for gcresnext26ts.ch_in1k

A GC-ResNeXt image classification model (ResNeXt with 'Global Context' attention). This model features a tiered 3-layer stem and SiLU activations. Trained on ImageNet-1k by Ross Wightman in `timm`.

This model architecture is implemented using `timm`'s flexible [BYOBNet (Bring-Your-Own-Blocks Network)](https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/byobnet.py).

BYOBNet allows configuration of:
 * block / stage layout
 * stem layout
 * output stride (dilation)
 * activation and norm layers
 * channel and spatial / self-attention layers

...and also includes `timm` features common to many other architectures, including:
 * stochastic depth
 * gradient checkpointing
 * layer-wise LR decay
 * per-stage feature extraction


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 10.5
  - GMACs: 2.4
  - Activations (M): 10.5
  - Image size: train = 256 x 256, test = 288 x 288
- **Papers:**
  - GCNet: Non-local Networks Meet Squeeze-Excitation Networks and Beyond: https://arxiv.org/abs/1904.11492
  - Aggregated Residual Transformations for Deep Neural Networks: https://arxiv.org/abs/1611.05431
- **Dataset:** ImageNet-1k
- **Original:** https://github.com/huggingface/pytorch-image-models

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('gcresnext26ts.ch_in1k', pretrained=True)
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
    'gcresnext26ts.ch_in1k',
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
    #  torch.Size([1, 64, 128, 128])
    #  torch.Size([1, 256, 64, 64])
    #  torch.Size([1, 512, 32, 32])
    #  torch.Size([1, 1024, 16, 16])
    #  torch.Size([1, 2048, 8, 8])

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
    'gcresnext26ts.ch_in1k',
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
# output is unpooled, a (1, 2048, 8, 8) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
Explore the dataset and runtime metrics of this model in timm [model results](https://github.com/huggingface/pytorch-image-models/tree/main/results).

## Citation
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
```bibtex
@article{cao2019GCNet,
  title={GCNet: Non-local Networks Meet Squeeze-Excitation Networks and Beyond},
  author={Cao, Yue and Xu, Jiarui and Lin, Stephen and Wei, Fangyun and Hu, Han},
  journal={arXiv preprint arXiv:1904.11492},
  year={2019}
}
```
```bibtex
@article{Xie2016,
  title={Aggregated Residual Transformations for Deep Neural Networks},
  author={Saining Xie and Ross Girshick and Piotr Dollár and Zhuowen Tu and Kaiming He},
  journal={arXiv preprint arXiv:1611.05431},
  year={2016}
}
```
