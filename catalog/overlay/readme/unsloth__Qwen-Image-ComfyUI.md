# Qwen-Image VAE, single file (mirror)

The single-file Qwen-Image VAE that
[stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) needs, mirrored from
[Comfy-Org/Qwen-Image_ComfyUI](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI).

Unsloth Studio fetches this on the no-GPU (native sd.cpp) path for Qwen-Image. It used to fetch
it straight from the community repack; a rename or a takedown there turns every CPU Qwen-Image
load into a 404, so it is mirrored here. **The weights are unmodified:** byte for byte the file
of the same name in the source repo.

| File | Size | Upstream model | Licence |
|---|---|---|---|
| `split_files/vae/qwen_image_vae.safetensors` | 0.24 GiB | [Qwen/Qwen-Image](https://huggingface.co/Qwen/Qwen-Image) (VAE) | Apache-2.0 |

Only this file is mirrored. The source repo also ships full diffusion models and text encoders;
Studio does not use them from there, so they are not here.

## Licence

Apache-2.0, from Qwen-Image. The full text Alibaba ships is in
[`LICENSE`](https://huggingface.co/unsloth/Qwen-Image-ComfyUI/blob/main/LICENSE) and the
attribution plus the statement of what the repack changed is in
[`NOTICE`](https://huggingface.co/unsloth/Qwen-Image-ComfyUI/blob/main/NOTICE). Not an official
Alibaba Cloud or ComfyUI product, and not endorsed by either.
