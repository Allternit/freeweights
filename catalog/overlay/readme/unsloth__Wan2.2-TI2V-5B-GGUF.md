# Wan2.2 TI2V 5B, GGUF (mirror)

Every GGUF quantisation of Wan2.2-TI2V-5B that
[QuantStack/Wan2.2-TI2V-5B-GGUF](https://huggingface.co/QuantStack/Wan2.2-TI2V-5B-GGUF) publishes,
plus the companion VAE, mirrored here.

Unsloth Studio offers this repo as the curated one-click GGUF pick for Wan2.2 TI2V 5B, so its
availability is Studio's problem rather than the repacker's: a rename or a takedown turns the pick
into a 404 no client can work around. All 13 quants are mirrored, not a chosen few, because the
picker lets you choose the precision. **The weights are unmodified:** byte for byte the files of
the same name in the source repo.

| File | Size |
|---|---|
| `Wan2.2-TI2V-5B-Q2_K.gguf` | 1.73 GiB |
| `Wan2.2-TI2V-5B-Q3_K_S.gguf` | 2.14 GiB |
| `Wan2.2-TI2V-5B-Q3_K_M.gguf` | 2.37 GiB |
| `Wan2.2-TI2V-5B-Q4_0.gguf` | 2.82 GiB |
| `Wan2.2-TI2V-5B-Q4_K_S.gguf` | 2.90 GiB |
| `Wan2.2-TI2V-5B-Q4_1.gguf` | 3.03 GiB |
| `Wan2.2-TI2V-5B-Q4_K_M.gguf` | 3.20 GiB |
| `Wan2.2-TI2V-5B-Q5_K_S.gguf` | 3.32 GiB |
| `Wan2.2-TI2V-5B-Q5_0.gguf` | 3.39 GiB |
| `Wan2.2-TI2V-5B-Q5_K_M.gguf` | 3.55 GiB |
| `Wan2.2-TI2V-5B-Q5_1.gguf` | 3.60 GiB |
| `Wan2.2-TI2V-5B-Q6_K.gguf` | 3.92 GiB |
| `Wan2.2-TI2V-5B-Q8_0.gguf` | 5.03 GiB |
| `VAE/Wan2.2_VAE.safetensors` | 1.31 GiB |

TI2V-5B is a 720P-only checkpoint: the supported sizes are 1280x704 and 704x1280, and its VAE has
temporal compression 4, so valid frame counts are 4k+1.

## Licence

Apache-2.0, from Wan2.2-TI2V-5B. Full text in
[`LICENSE`](https://huggingface.co/unsloth/Wan2.2-TI2V-5B-GGUF/blob/main/LICENSE).

These files are Derivative Works, not a plain copy: the transformer is quantised and the VAE was
converted from the original `.pth` to `.safetensors`. Apache-2.0 section 4(b) wants that stated,
so [`NOTICE`](https://huggingface.co/unsloth/Wan2.2-TI2V-5B-GGUF/blob/main/NOTICE) lists every
change along with the attribution. Both sets of changes are QuantStack's work. Not an official
Alibaba Wan Team or QuantStack product, and not endorsed by either.
