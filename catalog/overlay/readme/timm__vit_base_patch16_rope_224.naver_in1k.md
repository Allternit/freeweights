# Model card for vit_base_patch16_rope_224.naver_in1k

A ROPE-ViT model with ROPE for image classification. Trained on ImageNet-1k by paper authors.


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 86.4
  - GMACs: 17.6
  - Activations (M): 23.9
  - Image size: 224 x 224
- **Dataset:** ImageNet-1k
- **Papers:**
  - Rotary Position Embedding for Vision Transformer: https://arxiv.org/abs/2403.13298
- **Original:** https://github.com/naver-ai/rope-vit

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('vit_base_patch16_rope_224.naver_in1k', pretrained=True)
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
    'vit_base_patch16_rope_224.naver_in1k',
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
    #  torch.Size([1, 768, 14, 14])
    #  torch.Size([1, 768, 14, 14])
    #  torch.Size([1, 768, 14, 14])

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
    'vit_base_patch16_rope_224.naver_in1k',
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
# output is unpooled, a (1, 197, 768) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
### By Top-1 (224x224 resolution)

|model                                             |img_size|top1  |top5  |param_count|
|--------------------------------------------------|--------|------|------|-----------|
|vit_large_patch16_rope_mixed_ape_224.naver_in1k  |224     |84.84 |97.122|304.4      |
|vit_large_patch16_rope_mixed_224.naver_in1k      |224     |84.828|97.116|304.2      |
|vit_large_patch16_rope_ape_224.naver_in1k        |224     |84.65 |97.154|304.37     |
|vit_large_patch16_rope_224.naver_in1k            |224     |84.648|97.122|304.17     |
|vit_base_patch16_rope_mixed_ape_224.naver_in1k   |224     |83.894|96.754|86.59      |
|vit_base_patch16_rope_mixed_224.naver_in1k       |224     |83.804|96.712|86.44      |
|vit_base_patch16_rope_ape_224.naver_in1k         |224     |83.782|96.61 |86.59      |
|vit_base_patch16_rope_224.naver_in1k             |224     |83.718|96.672|86.43      |
|vit_small_patch16_rope_224.naver_in1k            |224     |81.23 |95.022|21.98      |
|vit_small_patch16_rope_mixed_224.naver_in1k      |224     |81.216|95.022|21.99      |
|vit_small_patch16_rope_ape_224.naver_in1k        |224     |81.004|95.016|22.06      |
|vit_small_patch16_rope_mixed_ape_224.naver_in1k  |224     |80.986|94.976|22.06      |

### Extrapolation Performance (320x320 resolution)

|model                                             |img_size|top1  |top5  |param_count|
|--------------------------------------------------|--------|------|------|-----------|
|vit_large_patch16_rope_mixed_224.naver_in1k      |320     |85.656|97.474|304.2      |
|vit_large_patch16_rope_mixed_ape_224.naver_in1k  |320     |85.594|97.508|304.4      |
|vit_large_patch16_rope_ape_224.naver_in1k        |320     |85.344|97.438|304.37     |
|vit_large_patch16_rope_224.naver_in1k            |320     |85.258|97.42 |304.17     |
|vit_base_patch16_rope_mixed_224.naver_in1k       |320     |84.65 |97.106|86.44      |
|vit_base_patch16_rope_mixed_ape_224.naver_in1k   |320     |84.58 |97.144|86.59      |
|vit_base_patch16_rope_ape_224.naver_in1k         |320     |84.368|96.968|86.59      |
|vit_base_patch16_rope_224.naver_in1k             |320     |84.296|96.898|86.43      |
|vit_small_patch16_rope_mixed_224.naver_in1k      |320     |82.238|95.592|21.99      |
|vit_small_patch16_rope_mixed_ape_224.naver_in1k  |320     |82.056|95.586|22.06      |
|vit_small_patch16_rope_ape_224.naver_in1k        |320     |81.944|95.506|22.06      |
|vit_small_patch16_rope_224.naver_in1k            |320     |81.46 |95.142|21.98      |

ROPE-ViT demonstrates strong extrapolation performance when tested at higher resolutions than training resolution (224x224), maintaining or improving accuracy at 320x320.

## Citation
```bibtex
@inproceedings{heo2024rotary,
  title={Rotary position embedding for vision transformer},
  author={Heo, Byeongho and Park, Song and Han, Dongyoon and Yun, Sangdoo},
  booktitle={European Conference on Computer Vision},
  pages={289--305},
  year={2024},
  organization={Springer}
}
```
