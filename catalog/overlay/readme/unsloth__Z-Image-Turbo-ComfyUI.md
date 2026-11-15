# Z-Image Turbo VAE + Qwen3-4B conditioner, single file (mirror)

The two single-file Z-Image assets that
[stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) needs, mirrored from
[Comfy-Org/z_image_turbo](https://huggingface.co/Comfy-Org/z_image_turbo).

Unsloth Studio fetches these on the no-GPU (native sd.cpp) path: both for Z-Image, and the
Qwen3-4B conditioner again for FLUX.2 klein 4B, which shares it. They used to come straight from
the community repack; a rename or a takedown there turns every CPU Z-Image and klein-4B load into
a 404, so they are mirrored here. **The weights are unmodified:** byte for byte the files of the
same name in the source repo.

| File | Size | Upstream model | Licence |
|---|---|---|---|
| `split_files/vae/ae.safetensors` | 0.31 GiB | the FLUX.1 autoencoder, which [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) reuses | Apache-2.0 |
| `split_files/text_encoders/qwen_3_4b.safetensors` | 7.49 GiB | Z-Image's Qwen3-4B conditioner | Apache-2.0 |

Only these two files are mirrored. The source repo also ships the Z-Image diffusion models, a
distill LoRA and quantised conditioners; Studio does not use them from there, so they are not here.

## Licence

Apache-2.0 for both files. The source repack carries no licence metadata at all, so the terms
here come from upstream rather than from the repacker.

Worth naming precisely, because the filename hides it: `ae.safetensors` is **the FLUX.1
autoencoder**, not a Tongyi-trained VAE. The file's own safetensors metadata says
`modelspec.author = "Black Forest Labs"` and `modelspec.license = "Apache License 2.0"`, and this
mirror is byte-identical, so that metadata is still in there. Z-Image reuses it, and Black Forest
Labs ships the same autoencoder in the Apache-2.0 `black-forest-labs/FLUX.1-schnell`. The
conditioner derives from Apache-2.0 Qwen3-4B.

Full text in [`LICENSE`](https://huggingface.co/unsloth/Z-Image-Turbo-ComfyUI/blob/main/LICENSE),
attribution and the statement of what the repack changed in
[`NOTICE`](https://huggingface.co/unsloth/Z-Image-Turbo-ComfyUI/blob/main/NOTICE). Not an official
Alibaba Group, Black Forest Labs or ComfyUI product, and not endorsed by any of them.
