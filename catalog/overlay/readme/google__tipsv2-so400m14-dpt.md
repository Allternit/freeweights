# TIPSv2 — SO400m/14 DPT Heads

DPT (Dense Prediction Transformer) heads for depth estimation, surface normal prediction, and semantic segmentation on top of the frozen [TIPSv2 SO400m/14](https://huggingface.co/google/tipsv2-so400m14) backbone. The backbone is loaded automatically. The depth and normals heads are trained on the NYU Depth V2 dataset and segmentation is trained on the ADE20K dataset (150 classes).

| Variant | Vision params | Text params | Embed dim | DPT Heads |
|---------|--------------|-------------|-----------|-----------|
| [B/14](https://huggingface.co/google/tipsv2-b14) | 86M | 110M | 768 | [B/14-dpt](https://huggingface.co/google/tipsv2-b14-dpt) |
| [L/14](https://huggingface.co/google/tipsv2-l14) | 303M | 184M | 1024 | [L/14-dpt](https://huggingface.co/google/tipsv2-l14-dpt) |
| [SO400m/14](https://huggingface.co/google/tipsv2-so400m14) | 412M | 448M | 1152 | [SO400m/14-dpt](https://huggingface.co/google/tipsv2-so400m14-dpt) |
| [g/14](https://huggingface.co/google/tipsv2-g14) | 1.1B | 389M | 1536 | [g/14-dpt](https://huggingface.co/google/tipsv2-g14-dpt) |

## Usage

```bash
pip install transformers torch torchvision sentencepiece
```

```python
from transformers import AutoModel
from torchvision import transforms
from PIL import Image
import requests

model = AutoModel.from_pretrained("google/tipsv2-so400m14-dpt", trust_remote_code=True)
model.eval().cuda()

url = "https://huggingface.co/spaces/google/tipsv2/resolve/main/examples/depth/ade20k_00014.png"
image = Image.open(requests.get(url, stream=True).raw)
transform = transforms.Compose([transforms.Resize((448, 448)), transforms.ToTensor()])
pixel_values = transform(image).unsqueeze(0).cuda()

# All tasks at once
outputs = model(pixel_values)
print(outputs.depth.shape)         # (1, 1, 448, 448) — depth map
print(outputs.normals.shape)       # (1, 3, 448, 448) — surface normals
print(outputs.segmentation.shape)  # (1, 150, 448, 448) — segmentation logits

# Or individual tasks (only runs the requested head)
depth = model.predict_depth(pixel_values)
normals = model.predict_normals(pixel_values)
seg = model.predict_segmentation(pixel_values)
print(seg.argmax(dim=1).shape)     # (1, 448, 448) — per-pixel class prediction
```

## Model details

- **Backbone**: [TIPSv2 SO400m/14](https://huggingface.co/google/tipsv2-so400m14) (loaded automatically)
- **Heads**: ~120M total params (depth + normals + segmentation)
- **Depth & normals**: NYU Depth V2
- **Segmentation**: ADE20K, 150 classes
- **Input**: images in `[0, 1]` range, any resolution (multiples of 14 recommended)

## License

Apache 2.0

## Citation

```bibtex
@inproceedings{cao2026tipsv2,
  title     = {{TIPSv2: Advancing Vision-Language Pretraining with Enhanced Patch-Text Alignment}},
  author    = {Cao, Bingyi and Chen, Koert and Maninis, Kevis-Kokitsi and Chen, Kaifeng and Karpur, Arjun and Xia, Ye and Dua, Sahil and Dabral, Tanmaya and Han, Guangxing and Han, Bohyung and Ainslie, Joshua and Bewley, Alex and Jacob, Mithun and Wagner, Rene and Ramos, Washington and Choromanski, Krzysztof and Seyedhosseini, Mojtaba and Zhou, Howard and Araujo, Andre},
  booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2604.12012}
}
```
