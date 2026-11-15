# STELLAR: Learning Sparse Visual Representations via Spatial–Semantic Factorization

**How many tokens are needed for one image?**

We show that with a **spatial–semantic factorized representation**, **16 semantic
tokens** paired with explicit spatial maps are enough for strong **image recognition
and reconstruction**. STELLAR separates **what** an image contains from **where** it
appears, representing the image as the low-rank product of a localization matrix
and a semantics matrix.

STELLAR-H achieves **2.60 reconstruction FID** and **79.10% ImageNet linear-probing
accuracy**, using approximately **90% fewer latent values** than a dense grid when
counting both factors.

<p align="center">
  <img src="factorization.svg" alt="Spatial–semantic factorization" width="720">
</p>

- **ICML 2026:** [Paper](https://openreview.net/pdf?id=ysOOfySED6) / [arXiv](https://arxiv.org/abs/2602.01905)
- **Code and configs:** [microsoft/STELLAR](https://github.com/microsoft/STELLAR)
- **Training and evaluation:** [Usage guide](https://github.com/microsoft/STELLAR/blob/main/docs/usage.md)

These checkpoints contain the **full set of trained STELLAR modules** (encoder, sparse
tokens, projections, reconstruction decoder, and clustering heads), so a single file
supports feature extraction, image reconstruction, and continued pretraining. All
models are self-supervised on **ImageNet-1K** at 224×224.

The headline results use the evaluation protocols in our ICML work. Reconstruction
FID is **not generation FID**; loading a checkpoint or running a new probe does not
automatically reproduce those numbers. The released files contain pretraining
weights, not the separately finetuned B/L reconstruction probes.

## Available models

| Model | Backbone | Semantic tokens | Feature width | Type | Weights |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `stellar-b16` | ViT-B/16 | 16 | 768 | main | [safetensors](stellar-b16.safetensors) |
| `stellar-l16` | ViT-L/16 | 16 | 1024 | main | [safetensors](stellar-l16.safetensors) |
| `stellar-h16` | ViT-H/14 | 16 | 1280 | main | [safetensors](stellar-h16.safetensors) |
| `stellar-b8` | ViT-B/16 | 8 | 768 | ablation | [safetensors](stellar-b8.safetensors) |
| `stellar-b24` | ViT-B/16 | 24 | 768 | ablation | [safetensors](stellar-b24.safetensors) |

Start with **B16** for a smaller backbone; use L16 or H16 when memory permits.
The B8 and B24 variants study the number of sparse tokens. The token count in the
model name is independent of the backbone patch size: H16 uses a ViT-H/14 encoder.

## Usage

Use Python 3.10 and run from the GitHub code directory:

```bash
git clone https://github.com/microsoft/STELLAR.git
cd STELLAR
python -m pip install -r requirements-inference.txt
```

Feature extraction needs no Azure account, Olympus trainer, VQGAN weights, or
separate MAE download. This is a custom PyTorch model; use the repository loader,
not `transformers.AutoModel` or `pipeline()`.

### Quick start

The [GitHub loader](https://github.com/microsoft/STELLAR/blob/main/load_stellar.py)
downloads and validates the required weights. Replace `your_image.jpg` with a local image:

```python
import torch
from load_stellar import load_stellar
from examples.common import read_image

revision = "6794be9a20fb9d3944c5bcc6003512a347fa518f"
device = "cuda" if torch.cuda.is_available() else "cpu"
model = load_stellar("stellar-b16", revision=revision, device=device)
image = read_image("your_image.jpg").unsqueeze(0).to(device)
with torch.no_grad():
    out = model.encode(image)

print(out["sparse"].shape)
print(out["spatial"].shape)
```

For B16, these shapes are `(1, 16, 768)` and `(1, 196, 16)`. The helper converts
to RGB, resizes the short side to 256 and center-crops to 224. Inputs must be
floating-point RGB tensors in `[0, 1]`; **do not apply ImageNet normalization**,
which is already performed inside the model.

Pin the Hub revision for repeatable downloads. After caching the weights,
`local_files_only=True` enables offline loading. Set `HF_HUB_CACHE` before starting
Python to choose a cache directory. Allow roughly 0.5 GB per B checkpoint, 1.4 GB
for L16, and 2.7 GB for H16, plus the tokenizer if reconstructing.

### Reconstruction

Continuing from the quick start, download the external
[MaskGIT-VQGAN tokenizer](https://huggingface.co/fun-research/TiTok) and load the decoder:

```python
from huggingface_hub import hf_hub_download
from torchvision.transforms.functional import to_pil_image

vq_path = hf_hub_download(
  "fun-research/TiTok",
  "maskgit-vqgan-imagenet-f16-256.bin",
  revision="ab646ed225080a3acb7c78440a574d7f67f16fa7",
)
model = load_stellar(
  "stellar-b16", purpose="reconstruct", vq_model=vq_path,
  revision=revision, device=device,
)
with torch.no_grad():
  features = model.encode(image)
  reconstruction = model.reconstruct(features)
pixels = reconstruction["reconstruction"]
to_pil_image(pixels[0].cpu()).save("reconstruction.png")
```

`reconstruct` takes **features, not an image**. You can also pass
`model.reconstruct(features["sparse"], features["spatial"])`. Both factors are
needed: semantic tokens alone do not specify spatial layout. B/L return RGB
224x224 pixels; H returns 256x256 pixels. Outputs are in `[0, 1]`, with VQ token
IDs in `reconstruction["tokens"]` and logits in `reconstruction["logits"]`.
VQ decoding uses argmax and a frozen tokenizer, so this is not a differentiable
RGB decoder for end-to-end pixel losses.

### What the model returns

| Key | Shape | Description | Typical use |
| :--- | :--- | :--- | :--- |
| `sparse` | `(B, K, D)` | sparse concept tokens | classification, retrieval |
| `spatial` | `(B, P, K)` | spatial map of each token | segmentation, visualization |
| `dense` | `(B, P, D)` | dense per-patch features | segmentation |
| `lowrank` | `(B, P, D)` | reassembled dense map | reconstruction |
| `cls` | `(B, 1, D)` | global representation | classification |

`B` = batch, `K` = number of sparse tokens, `P` = number of patches (196 for /16 at
224², 256 for /14), `D` = embedding dim (768 / 1024 / 1280 for B / L / H).

## Training and evaluation

The GitHub repository provides image-folder training, checkpoint resume, and
classification, segmentation and reconstruction probes. Install the training
dependencies and prepare your data using the
[usage guide](https://github.com/microsoft/STELLAR/blob/main/docs/usage.md).

| Goal | Configuration or command |
| :--- | :--- |
| Pretrain on ImageNet or custom images | [configs/stellar.yaml](https://github.com/microsoft/STELLAR/blob/main/configs/stellar.yaml) |
| Train a classification probe | [configs/eval_cls.yaml](https://github.com/microsoft/STELLAR/blob/main/configs/eval_cls.yaml) |
| Train a segmentation probe | [configs/eval_seg.yaml](https://github.com/microsoft/STELLAR/blob/main/configs/eval_seg.yaml) |
| Train a reconstruction probe | [configs/eval_recon.yaml](https://github.com/microsoft/STELLAR/blob/main/configs/eval_recon.yaml) |
| Measure released-decoder rFID/LPIPS | [Reconstruction metrics](https://github.com/microsoft/STELLAR/blob/main/docs/usage.md#reconstruction-metrics) |

See the [configuration guide](https://github.com/microsoft/STELLAR#configuration-guide)
for data paths, batch size, devices, learning rate and model settings. Evaluation
recipes **train new heads on frozen features**; testing requires a trained head
checkpoint. The default pretraining recipe starts from MAE, not these Hub weights.

For a custom continued-pretraining loop, `load_stellar(..., purpose="pretrain",
vq_model=...)` loads all trained modules in train mode. Supply the multi-crop batch
contract described in the usage guide. This is **weights-only initialization**,
not an optimizer resume; use a full Lightning checkpoint with `scratch.resume`
to resume an interrupted training run.

## Model details

- **Architecture:** ViT encoder (MAE-initialized) + learned sparse latent queries with
  spatial–semantic factorization.
- **Pretraining data:** ImageNet-1K (self-supervised; labels not used).
- **Input:** RGB images in `[0, 1]` at 224x224. ImageNet mean/std
  normalization is applied **inside** the model — pass raw `[0, 1]` images.
- **Weights:** the complete set of trained STELLAR modules (encoder, sparse tokens,
  projections, reconstruction decoder, and clustering heads), stored in `safetensors`.
  Only the third-party MaskGIT-VQGAN tokenizer is excluded — it is downloaded separately
  (from [TiTok](https://huggingface.co/fun-research/TiTok)) and passed via `vq_model`.
- **Framework:** PyTorch.

## Intended uses & limitations

- **Supported research uses:** compact visual features for recognition,
  segmentation, reconstruction, retrieval experiments and representation analysis.
- **Compression is not encoder acceleration:** the ViT still processes dense
  patches. Fewer output latent values do not imply a 90% encoder or VLM speedup.
- **Tokens are learned concepts:** they are not guaranteed objects, class IDs,
  temporal identities or pretrained language-aligned embeddings.
- **Domain shift:** ImageNet-pretrained features may require adaptation and
  held-out evaluation on medical, satellite or other substantially different data.
- **Deployment:** these are research artifacts, not safety-tested models for
  production decision-making.

### Connections to VLMs and latent generation

Sparse semantic tokens provide a compact input to a learned language-model
adapter. Appendix B.3 evaluates alignment to a CLIP text tower using a trained
probe; **no pretrained VLM adapter or captioning system is released**.

The paired semantic and spatial factors may also be studied as latents for
representation autoencoders (RAEs) or latent diffusion. **We have not evaluated
RAE-style generation and make no generation-quality claims.** Reconstruction
results do not establish unconditional or text-to-image generation performance.

## Citation

```bibtex
@inproceedings{zhao2026stellar,
  title     = {Learning Sparse Visual Representations via Spatial-Semantic Factorization},
  author    = {Zhao, Theodore Zhengde and Kiblawi, Sid and Yang, Jianwei and Usuyama, Naoto and Tan, Reuben and Codella, Noel C and Naumann, Tristan and Poon, Hoifung and Wei, Mu},
  booktitle = {International Conference on Machine Learning (ICML)},
  year      = {2026},
  url       = {https://openreview.net/pdf?id=ysOOfySED6},
}
```

## License

Released under the [MIT License](LICENSE).