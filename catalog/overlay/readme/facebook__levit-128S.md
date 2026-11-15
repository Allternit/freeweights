# LeViT

LeViT-128S model pre-trained on ImageNet-1k at resolution 224x224. It was introduced in the paper [LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference
](https://arxiv.org/abs/2104.01136) by Graham et al. and first released in [this repository](https://github.com/facebookresearch/LeViT). 

Disclaimer: The team releasing LeViT did not write a model card for this model so this model card has been written by the Hugging Face team.

## Usage

Here is how to use this model to classify an image of the COCO 2017 dataset into one of the 1,000 ImageNet classes:

```python
from transformers import LevitFeatureExtractor, LevitForImageClassificationWithTeacher
from PIL import Image
import requests

url = 'http://images.cocodataset.org/val2017/000000039769.jpg'
image = Image.open(requests.get(url, stream=True).raw)

feature_extractor = LevitFeatureExtractor.from_pretrained('facebook/levit-128S')
model = LevitForImageClassificationWithTeacher.from_pretrained('facebook/levit-128S')

inputs = feature_extractor(images=image, return_tensors="pt")
outputs = model(**inputs)
logits = outputs.logits
# model predicts one of the 1000 ImageNet classes
predicted_class_idx = logits.argmax(-1).item()
print("Predicted class:", model.config.id2label[predicted_class_idx])
```