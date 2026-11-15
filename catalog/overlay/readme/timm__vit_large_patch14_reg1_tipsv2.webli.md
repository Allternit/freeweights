# Model card for vit_large_patch14_reg1_tipsv2.webli

A Vision Transformer (ViT) image feature model with a register token. Distilled from the ViT-g/14 TIPSv2 teacher via patch-level distillation on a 116M-image filtered subset of WebLI.


## Model Details
- **Model Type:** Image Feature Encoder
- **Model Stats:**
  - Params (M): 304.0
  - GMACs: 362.5
  - Activations (M): 657.4
  - Image size: 448 x 448
- **Papers:**
  - TIPSv2: Advancing Vision-Language Pretraining with Enhanced Patch-Text Alignment: https://arxiv.org/abs/2604.12012
  - Vision Transformers Need Registers: https://arxiv.org/abs/2309.16588
  - An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale: https://arxiv.org/abs/2010.11929v2
- **Original:** https://github.com/google-deepmind/tips
- **Project:** https://gdm-tipsv2.github.io/
- **Pretrain Dataset:** WebLI

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('vit_large_patch14_reg1_tipsv2.webli', pretrained=True)
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
    'vit_large_patch14_reg1_tipsv2.webli',
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
    #  torch.Size([1, 1024, 32, 32])
    #  torch.Size([1, 1024, 32, 32])
    #  torch.Size([1, 1024, 32, 32])

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
    'vit_large_patch14_reg1_tipsv2.webli',
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
# output is unpooled, a (1, 1026, 1024) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
Explore the dataset and runtime metrics of this model in timm [model results](https://github.com/huggingface/pytorch-image-models/tree/main/results).

## Citation
```bibtex
@inproceedings{cao2026tipsv2,
  title={TIPSv2: Advancing Vision-Language Pretraining with Enhanced Patch-Text Alignment},
  author={Cao, Bingyi and Chen, Koert and Maninis, Kevis-Kokitsi and Chen, Kaifeng and Karpur, Arjun and Xia, Ye and Dua, Sahil and Dabral, Tanmaya and Han, Guangxing and Han, Bohyung and Ainslie, Joshua and Bewley, Alex and Jacob, Mithun and Wagner, Ren{'e} and Ramos, Washington and Choromanski, Krzysztof and Seyedhosseini, Mojtaba and Zhou, Howard and Araujo, Andr{'e}},
  booktitle={Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
  year={2026}
}
```
```bibtex
@article{darcet2023vision,
  title={Vision Transformers Need Registers},
  author={Darcet, Timoth{'e}e and Oquab, Maxime and Mairal, Julien and Bojanowski, Piotr},
  journal={arXiv preprint arXiv:2309.16588},
  year={2023}
}
```
```bibtex
@article{dosovitskiy2020vit,
  title={An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale},
  author={Dosovitskiy, Alexey and Beyer, Lucas and Kolesnikov, Alexander and Weissenborn, Dirk and Zhai, Xiaohua and Unterthiner, Thomas and  Dehghani, Mostafa and Minderer, Matthias and Heigold, Georg and Gelly, Sylvain and Uszkoreit, Jakob and Houlsby, Neil},
  journal={ICLR},
  year={2021}
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
