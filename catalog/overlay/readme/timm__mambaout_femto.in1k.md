# Model card for mambaout_femto.in1k

A MambaOut image classification model. Pretrained on ImageNet-1k by paper authors.


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 7.3
  - GMACs: 1.2
  - Activations (M): 8.3
  - Image size: train = 224 x 224, test = 288 x 288
- **Dataset:** ImageNet-1k
- **Papers:**
  - MambaOut: Do We Really Need Mamba for Vision?: https://arxiv.org/abs/2405.07992
- **Original:** https://github.com/yuweihao/MambaOut

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('mambaout_femto.in1k', pretrained=True)
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
    'mambaout_femto.in1k',
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
    #  torch.Size([1, 56, 56, 48])
    #  torch.Size([1, 28, 28, 96])
    #  torch.Size([1, 14, 14, 192])
    #  torch.Size([1, 7, 7, 288])

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
    'mambaout_femto.in1k',
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
# output is unpooled, a (1, 7, 7, 288) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
### By Top-1

|model                                                                                                                |img_size|top1  |top5  |param_count|
|---------------------------------------------------------------------------------------------------------------------|--------|------|------|-----------|
|[mambaout_base_plus_rw.sw_e150_r384_in12k_ft_in1k](http://huggingface.co/timm/mambaout_base_plus_rw.sw_e150_r384_in12k_ft_in1k)|384     |87.506|98.428|101.66     |
|[mambaout_base_plus_rw.sw_e150_in12k_ft_in1k](http://huggingface.co/timm/mambaout_base_plus_rw.sw_e150_in12k_ft_in1k)|288     |86.912|98.236|101.66     |
|[mambaout_base_plus_rw.sw_e150_in12k_ft_in1k](http://huggingface.co/timm/mambaout_base_plus_rw.sw_e150_in12k_ft_in1k)|224     |86.632|98.156|101.66     |
|[mambaout_base_tall_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_tall_rw.sw_e500_in1k)                  |288     |84.974|97.332|86.48      |
|[mambaout_base_wide_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_wide_rw.sw_e500_in1k)                  |288     |84.962|97.208|94.45      |
|[mambaout_base_short_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_short_rw.sw_e500_in1k)                |288     |84.832|97.27 |88.83      |
|[mambaout_base.in1k](http://huggingface.co/timm/mambaout_base.in1k)                                                  |288     |84.72 |96.93 |84.81      |
|[mambaout_small_rw.sw_e450_in1k](http://huggingface.co/timm/mambaout_small_rw.sw_e450_in1k)                          |288     |84.598|97.098|48.5       |
|[mambaout_small.in1k](http://huggingface.co/timm/mambaout_small.in1k)                                                |288     |84.5  |96.974|48.49      |
|[mambaout_base_wide_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_wide_rw.sw_e500_in1k)                  |224     |84.454|96.864|94.45      |
|[mambaout_base_tall_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_tall_rw.sw_e500_in1k)                  |224     |84.434|96.958|86.48      |
|[mambaout_base_short_rw.sw_e500_in1k](http://huggingface.co/timm/mambaout_base_short_rw.sw_e500_in1k)                |224     |84.362|96.952|88.83      |
|[mambaout_base.in1k](http://huggingface.co/timm/mambaout_base.in1k)                                                  |224     |84.168|96.68 |84.81      |
|[mambaout_small.in1k](http://huggingface.co/timm/mambaout_small.in1k)                                                |224     |84.086|96.63 |48.49      |
|[mambaout_small_rw.sw_e450_in1k](http://huggingface.co/timm/mambaout_small_rw.sw_e450_in1k)                          |224     |84.024|96.752|48.5       |
|[mambaout_tiny.in1k](http://huggingface.co/timm/mambaout_tiny.in1k)                                                  |288     |83.448|96.538|26.55      |
|[mambaout_tiny.in1k](http://huggingface.co/timm/mambaout_tiny.in1k)                                                  |224     |82.736|96.1  |26.55      |
|[mambaout_kobe.in1k](http://huggingface.co/timm/mambaout_kobe.in1k)                                                  |288     |81.054|95.718|9.14       |
|[mambaout_kobe.in1k](http://huggingface.co/timm/mambaout_kobe.in1k)                                                  |224     |79.986|94.986|9.14       |
|[mambaout_femto.in1k](http://huggingface.co/timm/mambaout_femto.in1k)                                                |288     |79.848|95.14 |7.3        |
|[mambaout_femto.in1k](http://huggingface.co/timm/mambaout_femto.in1k)                                                |224     |78.87 |94.408|7.3        |

## Citation
```bibtex
@article{yu2024mambaout,
  title={MambaOut: Do We Really Need Mamba for Vision?},
  author={Yu, Weihao and Wang, Xinchao},
  journal={arXiv preprint arXiv:2405.07992},
  year={2024}
}
```
