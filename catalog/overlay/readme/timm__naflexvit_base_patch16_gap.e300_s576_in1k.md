# Model card for naflexvit_base_patch16_gap.e300_s576_in1k

A NaFlexViT (Native-Aspect Flexible Vision Transformer) image classification model. This is variant with 2D position embedding is pretrained on ImageNet-1k by Ross Wightman. NaFlexViT is based on the NaFlex ViT changes proposed in SigLip-2 with a number of timm tweaks, enabling training with dynamic batch sizing that maintains native aspect ratios and flexible resolutions w/ variable patch sizes. The model is trained using the NaFlex data loader, which supports variable sequence lengths and resolutions during training. Uses RandAugment, MixUp, CutMix, and grayscale augmentation on top of standard random resize + crop (RRC). Optimized with NAdamW and cosine learning rate schedule.

Training command:
```
train.py --data-dir /data/imagenet/ --amp --amp-dtype bfloat16 --model <name> --naflex-loader -b 64 --opt nadamw --lr 3e-4 --warmup-lr 0 --sched-on-updates --aa rand-m8-inc1-mstd1.0 --weight-decay .1 --grayscale-prob .1 --drop-path 0.2 --reprob 0 --mixup 0.8 --cutmix 1.0 --remode pixel -j 8
```


## Model Details
- **Model Type:** Image classification / feature backbone
- **Model Stats:**
  - Params (M): 86.6
  - GMACs: 55.9
  - Activations (M): 102.3
  - Image size: 384 x 384
- **Papers:**
  - PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
  - SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features: https://arxiv.org/abs/2502.14786
  - Patch n' Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution: https://arxiv.org/abs/2307.06304
  - FlexiViT: One Model for All Patch Sizes: https://arxiv.org/abs/2212.08013
- **Dataset:** ImageNet-1k
- **Training:**
  - Sequence Lengths: [128, 256, 576, 784, 1024]
  - Epochs: 300
  - Batch Size: 64 per GPU (4 GPUs) @ seq-len 1024
  - Optimizer: NAdamW
  - Learning Rate: 3e-4
  - Weight Decay: 0.1
  - Augmentation: RandAugment (m=8), MixUp (0.8), CutMix (1.0), Grayscale (0.1)
  - Drop Path: 0.2
  - AMP dtype: bfloat16
- **Architecture:**
  - Variant: base
  - Patch Size: 16x16
  - Positional Embedding: 2D position embedding
  - Pooling: global average pooling (GAP)

## Model Usage
### Image Classification
```python
from urllib.request import urlopen
from PIL import Image
import timm

img = Image.open(urlopen(
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
))

model = timm.create_model('naflexvit_base_patch16_gap.e300_s576_in1k', pretrained=True)
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
    'naflexvit_base_patch16_gap.e300_s576_in1k',
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
    #  torch.Size([1, 768, 24, 24])
    #  torch.Size([1, 768, 24, 24])
    #  torch.Size([1, 768, 24, 24])

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
    'naflexvit_base_patch16_gap.e300_s576_in1k',
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
# output is unpooled, a (1, 580, 768) shaped tensor

output = model.forward_head(output, pre_logits=True)
# output is a (1, num_features) shaped tensor
```

## Model Comparison
| Model | Top-1 Acc | Top-5 Acc | Params (M) | Eval Seq Len |
|:---|:---:|:---:|:---:|:---:|
| naflexvit_base_patch16_par_gap.e300_s576_in1k | 83.67 | 96.45 | 86.63 | 576 |
| naflexvit_base_patch16_parfac_gap.e300_s576_in1k | 83.63 | 96.41 | 86.46 | 576 |
| naflexvit_base_patch16_gap.e300_s576_in1k | 83.50 | 96.46 | 86.63 | 576 |

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
@article{tschannen2025siglip,
  title={Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features},
  author={Tschannen, Michael and Gritsenko, Alexey and Wang, Xiao and Naeem, Muhammad Ferjad and Alabdulmohsin, Ibrahim and Parthasarathy, Nikhil and Evans, Talfan and Beyer, Lucas and Xia, Ye and Mustafa, Basil and others},
  journal={arXiv preprint arXiv:2502.14786},
  year={2025}
}
```
```bibtex
@article{dehghani2023navit,
  title={Patch n' Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution},
  author={Dehghani, Mostafa and Mustafa, Basil and Djolonga, Josip and Heek, Jonathan and Minderer, Matthias and Caron, Mathilde and Steiner, Andreas and Puigcerver, Joan and Geirhos, Robert and Alabdulmohsin, Ibrahim and others},
  journal={arXiv preprint arXiv:2307.06304},
  year={2023}
}
```
```bibtex
@article{beyer2022flexivit,
  title={FlexiViT: One Model for All Patch Sizes},
  author={Beyer, Lucas and Izmailov, Pavel and Kolesnikov, Alexander and Caron, Mathilde and Kornblith, Simon and Zhai, Xiaohua and Minderer, Matthias and Tschannen, Michael and Alabdulmohsin, Ibrahim and Pavetic, Filip},
  journal={arXiv preprint arXiv:2212.08013},
  year={2022}
}
```
