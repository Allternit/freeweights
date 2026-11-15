# AI Anime Image Detector ViT

This is a proof of concept model for detecting anime style AI images. Using Vision Transformer, it was trained on 1M human-made real and 217K AI generated anime images. During training either type appeared in equal amount to avoid biases. The model was trained on a single RTX 3090 GPU for about 40 hours, ~35 epochs.

The training logs are available on my [wandb](https://wandb.ai/legekka/AI-Image-Detector).

## Evaluation

Each checkpoint was evaluated on 500-500 real and AI images.

Final result:
- Training Loss: 0.1009
- Eval Loss: 0.1386

It seems like using random crops helped the model to generalize better, however, the training dataset only contained 512x512 images, which meant that every cropped image had bilinear interpolation. Training the model on 1024x1024 images could probably further improve its performance. *(Maybe I'll do it later)*

## Performance comparison

We did a small eval test with ~5000 images on the current available AI image detectors. **Note that these models were not specificly trained on anime images.**

| Model                                          | Accuracy   |
|------------------------------------------------|------------|
| dima806/ai_vs_real_image_detection             | 35,97%     |
| Organika/sdxl-detector                         | 43,29%     |
| Nahrawy/AIorNot                                | 64,74%     |
| jacoballessio/ai-image-detect-distilled        | 68,94%     |
| umm-maybe/AI-image-detector                    | 75,45%     |
| mmanikanta/VIT_AI_image_detector               | 79,65%     |
| *legekka/AI-Anime-Image-Detector-HD-ViT WIP*   | *94,26%*   |
| **legekka/AI-Anime-Image-Detector-ViT (Ours)** | **94,68%** |

## Usage

Example inference code:

```python
from transformers import AutoModelForImageClassification, AutoFeatureExtractor
import torch
from PIL import Image

model = AutoModelForImageClassification.from_pretrained("legekka/AI-Anime-Image-Detector-ViT")
feature_extractor = AutoFeatureExtractor.from_pretrained("legekka/AI-Anime-Image-Detector-ViT")

model.eval()

image = Image.open("example.jpg")
inputs = feature_extractor(images=image, return_tensors="pt")

outputs = model(**inputs)
logits = outputs.logits

label = model.config.id2label[torch.argmax(logits).item()]
confidence = torch.nn.functional.softmax(logits, dim=1)[0][torch.argmax(logits)].item()

print(f"Prediction: {label} ({round(confidence * 100)}%)")
```