# Lucida — general-purpose background removal with soft-alpha mastery

Lucida is a BiRefNet-based background-removal / image-matting model fine-tuned to
excel where most open models fail: **camouflaged objects, transparent materials
(glass), text & logos, VFX glows, and illustrations** — while staying competitive
everywhere else.

On our 203-image, 9-category benchmark (MAE, lower is better) Lucida leads every
model we tested — including a commercial reference — in **camouflage (0.0270)** and
**illustration (0.0092)**, beats the commercial reference in **text/logo
preservation (0.0091 vs 0.0123)** and in **print-design/sticker art (0.0235 — 2x better
than every model measured)**, and sets our best-ever **transparency-in-mixed-objects** handling and
**overall (0.0257)** score — ahead of every model we measured, specialist or commercial, on the 203-image average. Full benchmark, gallery and training recipe:
**https://github.com/egeorcun/lucida** — or try the [live demo](https://huggingface.co/spaces/egeorcun/lucida-demo).

> **Changelog note (2026-07-24):** an experimental v13 build was published for a day and then
> reverted — community testing showed it regressed on real-world layered artwork
> (poster/collage-style illustrations) that our synthetic design test set does not cover.
> The current weights are the proven v7. The v13 improvements (reduced background haze on
> real photos, a transparency milestone) will return in v14 together with the fix.

## Files

| File | What it is | Load with |
|---|---|---|
| `model.safetensors` | **lucida-v7** — the published general-purpose release; the snippet above and the benchmark table refer to this. | `transformers` (with `Normalize`) |
| `lucida-m35-comfy.safetensors` | **lucida-m35 (experimental)** — the `design-expert` branch working model: a checkpoint blend of the v8–v13 background-purity soup with the v18 limb/atmosphere campaign (0.65/0.35), exported **folded** for ComfyUI: the `Normalize` preprocessing is baked into the first conv. | ComfyUI `RemoveBackground` node — **not** the `transformers` snippet (no `Normalize` at inference) |

### lucida-m35 + the design pipeline (ComfyUI)

Try it in the browser: **[lucida-design space](https://huggingface.co/spaces/egeorcun/lucida-design)** — the full pipeline (m35 + SAM3 referee + poster policy) on ZeroGPU.

m35 is tuned for **print/POD design artwork** (posters, tee graphics, stickers) and is
meant to run inside a pipeline, not bare: poster policy (training-free decision layer)
+ SAM3 semantic referee (protective subject evidence) + finish package (color
decontamination, edge defringe). The whole chain ships as ComfyUI custom nodes with a
ready workflow — install steps:
[github.com/egeorcun/lucida/tree/design-expert/comfyui](https://github.com/egeorcun/lucida/tree/design-expert/comfyui).

Place the file in `ComfyUI/models/background_removal/`. The referee additionally uses
[facebook/sam3](https://huggingface.co/facebook/sam3) (gated — accept the license with
your own HF account) and CLIP ViT-B/32, both auto-downloaded on first run.

Verified against the 203-image benchmark for zero category regression vs the published
v7 before adoption; the pipeline itself is judged by eye against a commercial
reference on real design artwork (duel catalog in the branch docs). Outside the design
domain the poster policy is not recommended — use `model.safetensors` bare instead.

## Usage

```python
import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

model = AutoModelForImageSegmentation.from_pretrained(
    "egeorcun/lucida", trust_remote_code=True, dtype=torch.float32)
model.eval()

t = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
img = Image.open("input.jpg").convert("RGB")
with torch.no_grad():
    preds = model(t(img).unsqueeze(0))[-1].sigmoid()
alpha = transforms.functional.resize(preds[0], img.size[::-1]).squeeze(0)
rgba = img.copy()
rgba.putalpha(Image.fromarray((alpha.numpy() * 255).astype("uint8")))
rgba.save("output.png")
```

For color decontamination (removing background color fringing) and the full
pipeline (CLI, FastAPI service, Docker web UI), see the GitHub repository.

## Base model & attribution

- Architecture and initial weights: [ZhengPeng7/BiRefNet_HR](https://huggingface.co/ZhengPeng7/BiRefNet_HR) (MIT). Lucida is a fine-tune; the original copyright notice is preserved.
- Illustration data includes [ToonOut](https://huggingface.co/datasets/joelseytre/toonout) (CC-BY 4.0).
- Some training datasets (e.g. P3M-10k, COD10K, DIS5K) are distributed for research
  purposes; see the GitHub README for the full dataset/license table and evaluate
  suitability for your use case.

## License

MIT (weights and code).
