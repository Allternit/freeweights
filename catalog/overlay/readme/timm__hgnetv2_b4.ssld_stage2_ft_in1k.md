# Model card for hgnetv2_b4.ssld_stage2_ft_in1k

A HGNet-V2 (High Performance GPU Net) image classification model. Trained by model authors on mined ImageNet-22k and ImageNet-1k using SSLD distillation and further fine-tuned on ImageNet-1k.

Please see details at https://github.com/PaddlePaddle/PaddleClas/blob/develop/docs/zh_CN/models/ImageNet1k/PP-HGNetV2.md


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 19.8
  - GMACs: 2.7
  - Activations (M): 6.7
  - Image size: train = 224 x 224, test = 288 x 288
- **Pretrain Dataset:** ImageNet-22k
- **Dataset:** ImageNet-1k
- **Papers:**
  - Model paper unknown: TBD
  - Beyond Self-Supervision: A Simple Yet Effective Network Distillation Alternative to Improve Backbones: https://arxiv.org/abs/2103.05959
- **Original:** https://github.com/PaddlePaddle/PaddleClas

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('hgnetv2_b4.ssld_stage2_ft_in1k', pretrained=True)
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
    'hgnetv2_b4.ssld_stage2_ft_in1k',
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
    #  torch.Size([1, 128, 56, 56])
    #  torch.Size([1, 512, 28, 28])
    #  torch.Size([1, 1024, 14, 14])
    #  torch.Size([1, 2048, 7, 7])

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
    'hgnetv2_b4.ssld_stage2_ft_in1k',
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
# output is unpooled, a (1, 2048, 7, 7) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
### By Top-1

|model                            |top1  |top1_err|top5  |top5_err|param_count|img_size|
|---------------------------------|------|--------|------|--------|-----------|--------|
|hgnetv2_b6.ssld_stage2_ft_in1k   |86.36 |13.64   |97.934|2.066   |75.26      |288     |
|hgnetv2_b6.ssld_stage1_in22k_in1k|86.294|13.706  |97.948|2.052   |75.26      |288     |
|hgnetv2_b6.ssld_stage2_ft_in1k   |86.204|13.796  |97.81 |2.19    |75.26      |224     |
|hgnetv2_b6.ssld_stage1_in22k_in1k|86.028|13.972  |97.804|2.196   |75.26      |224     |
|hgnet_base.ssld_in1k             |85.474|14.526  |97.632|2.368   |71.58      |288     |
|hgnetv2_b5.ssld_stage2_ft_in1k   |85.146|14.854  |97.612|2.388   |39.57      |288     |
|hgnetv2_b5.ssld_stage1_in22k_in1k|84.928|15.072  |97.514|2.486   |39.57      |288     |
|hgnet_base.ssld_in1k             |84.912|15.088  |97.342|2.658   |71.58      |224     |
|hgnetv2_b5.ssld_stage2_ft_in1k   |84.808|15.192  |97.3  |2.7     |39.57      |224     |
|hgnetv2_b5.ssld_stage1_in22k_in1k|84.458|15.542  |97.22 |2.78    |39.57      |224     |
|hgnet_small.ssld_in1k            |84.376|15.624  |97.128|2.872   |24.36      |288     |
|hgnetv2_b4.ssld_stage2_ft_in1k   |83.912|16.088  |97.06 |2.94    |19.8       |288     |
|hgnet_small.ssld_in1k            |83.808|16.192  |96.848|3.152   |24.36      |224     |
|hgnetv2_b4.ssld_stage2_ft_in1k   |83.694|16.306  |96.786|3.214   |19.8       |224     |
|hgnetv2_b3.ssld_stage2_ft_in1k   |83.58 |16.42   |96.81 |3.19    |16.29      |288     |
|hgnetv2_b4.ssld_stage1_in22k_in1k|83.45 |16.55   |96.92 |3.08    |19.8       |288     |
|hgnetv2_b3.ssld_stage1_in22k_in1k|83.116|16.884  |96.712|3.288   |16.29      |288     |
|hgnetv2_b3.ssld_stage2_ft_in1k   |82.916|17.084  |96.364|3.636   |16.29      |224     |
|hgnetv2_b4.ssld_stage1_in22k_in1k|82.892|17.108  |96.632|3.368   |19.8       |224     |
|hgnetv2_b3.ssld_stage1_in22k_in1k|82.588|17.412  |96.38 |3.62    |16.29      |224     |
|hgnet_tiny.ssld_in1k             |82.524|17.476  |96.514|3.486   |14.74      |288     |
|hgnetv2_b2.ssld_stage2_ft_in1k   |82.346|17.654  |96.394|3.606   |11.22      |288     |
|hgnet_small.paddle_in1k          |82.222|17.778  |96.22 |3.78    |24.36      |288     |
|hgnet_tiny.ssld_in1k             |81.938|18.062  |96.114|3.886   |14.74      |224     |
|hgnetv2_b2.ssld_stage2_ft_in1k   |81.578|18.422  |95.896|4.104   |11.22      |224     |
|hgnetv2_b2.ssld_stage1_in22k_in1k|81.46 |18.54   |96.01 |3.99    |11.22      |288     |
|hgnet_small.paddle_in1k          |81.358|18.642  |95.832|4.168   |24.36      |224     |
|hgnetv2_b2.ssld_stage1_in22k_in1k|80.75 |19.25   |95.498|4.502   |11.22      |224     |
|hgnet_tiny.paddle_in1k           |80.64 |19.36   |95.54 |4.46    |14.74      |288     |
|hgnetv2_b1.ssld_stage2_ft_in1k   |79.904|20.096  |95.148|4.852   |6.34       |288     |
|hgnet_tiny.paddle_in1k           |79.894|20.106  |95.052|4.948   |14.74      |224     |
|hgnetv2_b1.ssld_stage1_in22k_in1k|79.048|20.952  |94.882|5.118   |6.34       |288     |
|hgnetv2_b1.ssld_stage2_ft_in1k   |78.872|21.128  |94.492|5.508   |6.34       |224     |
|hgnetv2_b0.ssld_stage2_ft_in1k   |78.586|21.414  |94.388|5.612   |6.0        |288     |
|hgnetv2_b1.ssld_stage1_in22k_in1k|78.05 |21.95   |94.182|5.818   |6.34       |224     |
|hgnetv2_b0.ssld_stage1_in22k_in1k|78.026|21.974  |94.242|5.758   |6.0        |288     |
|hgnetv2_b0.ssld_stage2_ft_in1k   |77.342|22.658  |93.786|6.214   |6.0        |224     |
|hgnetv2_b0.ssld_stage1_in22k_in1k|76.844|23.156  |93.612|6.388   |6.0        |224     |

## Citation
```bibtex
@article{cui2021beyond,
  title={Beyond Self-Supervision: A Simple Yet Effective Network Distillation Alternative to Improve Backbones},
  author={Cui, Cheng and Guo, Ruoyu and Du, Yuning and He, Dongliang and Li, Fu and Wu, Zewu and Liu, Qiwen and Wen, Shilei and Huang, Jizhou and Hu, Xiaoguang and others},
  journal={arXiv preprint arXiv:2103.05959},
  year={2021}
}
```
