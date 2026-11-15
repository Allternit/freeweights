📢 [[GitHub Repo](https://github.com/microsoft/OmniParser/tree/master)] [[OmniParser V2 Blog Post](https://www.microsoft.com/en-us/research/articles/omniparser-v2-turning-any-llm-into-a-computer-use-agent/)] [Huggingface demo](https://huggingface.co/spaces/microsoft/OmniParser-v2)

# Model Summary
OmniParser is a general screen parsing tool, which interprets/converts UI screenshot to structured format, to improve existing LLM based UI agent. 
Training Datasets include: 1) an interactable icon detection dataset, which was curated from popular web pages and automatically annotated to highlight clickable and actionable regions, and 2) an icon description dataset, designed to associate each UI element with its corresponding function. 

This model hub includes a finetuned version of YOLOv8 and a finetuned Florence-2 base model on the above dataset respectively. It additionally includes `icon_detect_v3`, an MIT licensed interactable region detector finetuned from YOLOv9-E using the MIT licensed [MultimediaTechLab/YOLO](https://github.com/MultimediaTechLab/YOLO) implementation (see [New: MIT licensed detector weights](#new-mit-licensed-detector-weights-icon_detect_v3)). For more details of the models used and finetuning, please refer to the [paper](https://arxiv.org/abs/2408.00203).

# What's new in V2?
- Larger and cleaner set of icon caption + grounding dataset
- 60% improvement in latency compared to V1. Avg latency: 0.6s/frame on A100, 0.8s on single 4090. 
- Strong performance: 39.6 average accuracy on [ScreenSpot Pro](https://github.com/likaixin2000/ScreenSpot-Pro-GUI-Grounding)
- Your agent only need one tool: OmniTool. Control a Windows 11 VM with OmniParser + your vision model of choice. OmniTool supports out of the box the following large language models - OpenAI (4o/o1/o3-mini), DeepSeek (R1), Qwen (2.5VL) or Anthropic Computer Use. Check out our github repo for details. 


# New: MIT licensed detector weights (`icon_detect_v3`)
The original `icon_detect` weights are finetuned from YOLOv8 and are therefore distributed under the AGPL-3.0 license, which is a blocker for many downstream users. We now additionally release `icon_detect_v3/model.pt`, an interactable region detector finetuned from YOLOv9-E on the same detection data and released under the **MIT license** (see `icon_detect_v3/LICENSE`).

The model is finetuned from YOLOv9-E using the [MultimediaTechLab/YOLO](https://github.com/MultimediaTechLab/YOLO) implementation, which is MIT licensed. This is what makes the permissive relicensing possible: unlike the Ultralytics YOLOv8 codebase behind `icon_detect`, neither the training code nor the resulting weights carry AGPL-3.0 obligations.

Pairing `icon_detect_v3` with `icon_caption` gives a fully MIT licensed OmniParser pipeline. `icon_detect` is still available and unchanged for users who are fine with AGPL-3.0.

The weights are shipped as a self-contained TorchScript module, so inference only requires `torch` (no `ultralytics` and no AGPL licensed code at runtime):

```python
import numpy as np
import torch
from PIL import Image
from torchvision.ops import nms

IMGSZ = 1280
STRIDES = (8, 16, 32)
CONF_THRESHOLD = 0.05
IOU_THRESHOLD = 0.45

model = torch.jit.load("icon_detect_v3/model.pt", map_location="cpu").eval()

# Letterbox the screenshot into a square IMGSZ canvas, keeping the aspect ratio.
image = Image.open("screenshot.png").convert("RGB")
width, height = image.size
scale = min(IMGSZ / width, IMGSZ / height)
resized = image.resize((round(width * scale), round(height * scale)), Image.BILINEAR)
canvas = Image.new("RGB", (IMGSZ, IMGSZ), (114, 114, 114))
canvas.paste(resized, (0, 0))
x = torch.from_numpy(np.array(canvas)).permute(2, 0, 1).float()[None] / 255.0

with torch.no_grad():
    outputs = model(x)  # (cls_logits, box_ltrb) per stride, in that order

# Decode the raw heads: class logits need a sigmoid, and the 4 box channels are
# left/top/right/bottom distances from each grid cell center, in grid units.
boxes, scores = [], []
for i, stride in enumerate(STRIDES):
    cls = outputs[2 * i].sigmoid()[0, 0]
    ltrb = outputs[2 * i + 1][0]
    grid = cls.shape[-1]
    gy, gx = torch.meshgrid(
        torch.arange(grid, dtype=torch.float32),
        torch.arange(grid, dtype=torch.float32),
        indexing="ij",
    )
    cx, cy = gx + 0.5, gy + 0.5
    left, top, right, bottom = ltrb
    boxes.append(
        torch.stack(
            [(cx - left) * stride, (cy - top) * stride,
             (cx + right) * stride, (cy + bottom) * stride], dim=-1
        ).reshape(-1, 4)
    )
    scores.append(cls.reshape(-1))

boxes, scores = torch.cat(boxes), torch.cat(scores)
keep = scores > CONF_THRESHOLD
boxes, scores = boxes[keep], scores[keep]
keep = nms(boxes, scores, IOU_THRESHOLD)
boxes, scores = boxes[keep], scores[keep]

# Map the boxes from the letterboxed canvas back to original image coordinates.
boxes = boxes / scale
boxes[:, 0::2] = boxes[:, 0::2].clamp(0, width)
boxes[:, 1::2] = boxes[:, 1::2].clamp(0, height)
# boxes: (N, 4) xyxy in original pixels, scores: (N,) confidence
```

Notes:
- The model is single class (interactable region), so `cls` has one channel per scale.
- `CONF_THRESHOLD` defaults to `0.05` to match the `box_threshold` that OmniParser uses with `icon_detect`. The detector is deliberately low confidence on small UI elements, so raising this much above `0.1` starts dropping real elements (icons, toolbar buttons, footer links) rather than just filtering noise. Tune `CONF_THRESHOLD` / `IOU_THRESHOLD` for your screenshots the same way you would tune `box_threshold` / `iou_threshold` for `icon_detect`.
- The letterbox padding above is top-left anchored, which keeps the coordinate mapping to a single `scale` division. If you center the padding instead, subtract the pad offsets before dividing.

# Responsible AI Considerations
## Intended Use
- OmniParser is designed to be able to convert unstructured screenshot image into structured list of elements including interactable regions location and captions of icons on its potential functionality. 
- OmniParser is intended to be used in settings where users are already trained on responsible analytic approaches and critical reasoning is expected. OmniParser is capable of providing extracted information from the screenshot, however human judgement is needed for the output of OmniParser. 
- OmniParser is intended to be used on various screenshots, which includes both PC and Phone, and also on various applications.  
## limitations
- OmniParser is designed to faithfully convert screenshot image into structured elements of interactable regions and semantics of the screen, while it does not detect harmful content in its input (like users have freedom to decide the input of any LLMs), users are expected to provide input to the OmniParser that is not harmful. 
- While OmniParser only converts screenshot image into texts, it can be used to construct an GUI agent based on LLMs that is actionable. When developing and operating the agent using OmniParser, the developers need to be responsible and follow common safety standard. 

# License
Licenses differ per model folder, please refer to the LICENSE file in the folder of each model:

| Folder | Model | License |
| --- | --- | --- |
| `icon_detect` | YOLOv8 based interactable region detector ([Ultralytics](https://github.com/ultralytics/ultralytics)) | AGPL-3.0 |
| `icon_detect_v3` | YOLOv9-E based interactable region detector ([MultimediaTechLab/YOLO](https://github.com/MultimediaTechLab/YOLO), MIT) | MIT |
| `icon_caption` | Florence-2 based icon captioner | MIT |

Using `icon_detect_v3` together with `icon_caption` yields an OmniParser pipeline that is entirely MIT licensed.