# Model card for hiera_small_abswin_256.sbb2_e200_in12k

A Hiera image classification model w/ resizeable abs-win position embeddings and layer-scale. Trained on ImageNet-12k by Ross Wightman using "Searching for better ViT baselines" recipe.


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 42.7
  - GMACs: 7.7
  - Activations (M): 21.2
  - Image size: 256 x 256
- **Dataset:** ImageNet-12k
- **Papers:**
  - Hiera: A Hierarchical Vision Transformer without the Bells-and-Whistles: https://arxiv.org/abs/2306.00989
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
  - Window Attention is Bugged: How not to Interpolate Position Embeddings: https://arxiv.org/abs/2311.05613
- **Original:** https://github.com/facebookresearch/hiera

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('hiera_small_abswin_256.sbb2_e200_in12k', pretrained=True)
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
    'hiera_small_abswin_256.sbb2_e200_in12k',
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
    #  torch.Size([1, 96, 64, 64])
    #  torch.Size([1, 192, 32, 32])
    #  torch.Size([1, 384, 16, 16])
    #  torch.Size([1, 768, 8, 8])

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
    'hiera_small_abswin_256.sbb2_e200_in12k',
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
# output is unpooled, a (1, 64, 768) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
### By Top-1

|model                            |top1  |top5  |param_count|
|---------------------------------|------|------|-----------|
|hiera_huge_224.mae_in1k_ft_in1k     |86.834|98.01 |672.78     |
|hiera_large_224.mae_in1k_ft_in1k    |86.042|97.648|213.74     |
|hiera_base_plus_224.mae_in1k_ft_in1k|85.134|97.158|69.9       |
|hiera_small_abswin_256.sbb2_e200_in12k_ft_in1k    |84.912|97.260|35.01      |
|hiera_small_abswin_256.sbb2_pd_e200_in12k_ft_in1k |84.560|97.106|35.01      |
|hiera_base_224.mae_in1k_ft_in1k     |84.49 |97.032|51.52      |
|hiera_small_224.mae_in1k_ft_in1k    |83.884|96.684|35.01      |
|hiera_tiny_224.mae_in1k_ft_in1k     |82.786|96.204|27.91      |

## Citation
```bibtex
@article{ryali2023hiera,
  title={Hiera: A Hierarchical Vision Transformer without the Bells-and-Whistles},
  author={Ryali, Chaitanya and Hu, Yuan-Ting and Bolya, Daniel and Wei, Chen and Fan, Haoqi and Huang, Po-Yao and Aggarwal, Vaibhav and Chowdhury, Arkabandhu and Poursaeed, Omid and Hoffman, Judy and Malik, Jitendra and Li, Yanghao and Feichtenhofer, Christoph},
  journal={ICML},
  year={2023}
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
```bibtex
@article{bolya2023window,
  title={Window Attention is Bugged: How not to Interpolate Position Embeddings},
  author={Bolya, Daniel and Ryali, Chaitanya and Hoffman, Judy and Feichtenhofer, Christoph},
  journal={arXiv preprint arXiv:2311.05613},
  year={2023}
}
```
