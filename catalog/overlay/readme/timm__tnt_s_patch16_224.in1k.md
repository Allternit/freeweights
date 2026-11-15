# Model card for tnt_s_patch16_224.in1k

A TnT (Transformer in Transformer) image classification model. Pretrained on ImageNet-1k.

## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 23.8
  - GMACs: 5.2
  - Activations (M): 24.4
  - Image size: 224 x 224
- **Papers:**
  - Transformer in Transformer: https://arxiv.org/abs/2103.00112
- **Dataset:** ImageNet-1k
- **Original:**
  - https://gitee.com/mindspore/mindspore/tree/master/model_zoo/research/cv/TNT
  - https://github.com/huawei-noah/Efficient-AI-Backbones/tree/master/tnt_pytorch

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('tnt_s_patch16_224.in1k', pretrained=True)
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
    'tnt_s_patch16_224.in1k',
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
    #  torch.Size([1, 384, 14, 14])
    #  torch.Size([1, 384, 14, 14])
    #  torch.Size([1, 384, 14, 14])

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
    'tnt_s_patch16_224.in1k',
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
# output is unpooled, a (1, 197, 384) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Citation
```bibtex
@article{han2021transformer,
  title={Transformer in transformer},
  author={Han, Kai and Xiao, An and Wu, Enhua and Guo, Jianyuan and Xu, Chunjing and Wang, Yunhe},
  journal={Advances in neural information processing systems},
  volume={34},
  pages={15908--15919},
  year={2021}
}
```
