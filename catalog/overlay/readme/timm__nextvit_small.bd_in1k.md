# Model card for nextvit_small.bd_in1k

A Next-ViT image classification model. Trained on ImageNet-1k by paper authors.



## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 31.8
  - GMACs: 5.8
  - Activations (M): 17.6
  - Image size: 224 x 224
- **Dataset:** ImageNet-1k
- **Papers:**
  - Next-ViT: Next Generation Vision Transformer for Efficient Deployment in Realistic Industrial Scenarios: https://arxiv.org/abs/2207.05501
- **Original:** https://github.com/bytedance/Next-ViT

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('nextvit_small.bd_in1k', pretrained=True)
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
    'nextvit_small.bd_in1k',
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
    #  torch.Size([1, 96, 56, 56])
    #  torch.Size([1, 256, 28, 28])
    #  torch.Size([1, 512, 14, 14])
    #  torch.Size([1, 1024, 7, 7])

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
    'nextvit_small.bd_in1k',
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
# output is unpooled, a (1, 1024, 7, 7) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
### By Top-1

|model                            |top1  |top1_err|top5  |top5_err|param_count|
|---------------------------------|------|--------|------|--------|-----------|
|nextvit_large.bd_ssld_6m_in1k_384|86.542|13.458  |98.142|1.858   |57.87      |
|nextvit_base.bd_ssld_6m_in1k_384 |86.352|13.648  |98.04 |1.96    |44.82      |
|nextvit_small.bd_ssld_6m_in1k_384|85.964|14.036  |97.908|2.092   |31.76      |
|nextvit_large.bd_ssld_6m_in1k    |85.48 |14.52   |97.696|2.304   |57.87      |
|nextvit_base.bd_ssld_6m_in1k     |85.186|14.814  |97.59 |2.41    |44.82      |
|nextvit_large.bd_in1k_384        |84.924|15.076  |97.294|2.706   |57.87      |
|nextvit_small.bd_ssld_6m_in1k    |84.862|15.138  |97.382|2.618   |31.76      |
|nextvit_base.bd_in1k_384         |84.706|15.294  |97.224|2.776   |44.82      |
|nextvit_small.bd_in1k_384        |84.022|15.978  |96.99 |3.01    |31.76      |
|nextvit_large.bd_in1k            |83.626|16.374  |96.694|3.306   |57.87      |
|nextvit_base.bd_in1k             |83.472|16.528  |96.656|3.344   |44.82      |
|nextvit_small.bd_in1k            |82.61 |17.39   |96.226|3.774   |31.76      |

## Citation
```bibtex
@article{li2022next,
  title={Next-ViT: Next Generation Vision Transformer for Efficient Deployment in Realistic Industrial Scenarios},
  author={Li, Jiashi and Xia, Xin and Li, Wei and Li, Huixia and Wang, Xing and Xiao, Xuefeng and Wang, Rui and Zheng, Min and Pan, Xin},
  journal={arXiv preprint arXiv:2207.05501},
  year={2022}
}
```
