# mlx-community/flux-3-image-klein-pup-4bit

This is an MLX copy, 4-bit (affine, group 64), of **[black-forest-labs/flux-3-image-klein-pup](https://huggingface.co/black-forest-labs/flux-3-image-klein-pup)**
(Apache-2.0), for Apple Silicon.
- **Files:** converted with mlx-vlm 0.7.8 (`mlx_vlm convert -q --q-bits 4 --q-group-size 64`); tokenizer, chat template, processor configs and `system_prompts.json` are upstream's, byte-identical.
- **Other tiers:** [bf16](https://huggingface.co/mlx-community/flux-3-image-klein-pup-bf16), [8bit](https://huggingface.co/mlx-community/flux-3-image-klein-pup-8bit).
- **Size:** 5.6 GB.

The model is the prompt upsampler for [FLUX 3 Image Klein](https://huggingface.co/black-forest-labs/flux-3-image-klein). It's a
Qwen3.5-9B vision-language fine-tune that expands a short request (plus up to 10 reference images, plus optional
bounding boxes) into the full scene caption FLUX 3 Klein needs. A short prompt sent to the image model as typed gives
generic output. This repo is **Apache-2.0** like its upstream. The FLUX 3 Klein image model itself is under the FLUX
Kommunity License ([mlx-community/flux-3-image-klein-bf16](https://huggingface.co/mlx-community/flux-3-image-klein-bf16)).

## Use

It loads with MLXVLM (mlx-swift-lm, `qwen3_5`) and with Python `mlx-vlm`. The upstream card is the reference for:
- the system prompts (`system_prompts.json`: `t2i`, `i2i`, `t2i_bbox`, `i2i_bbox`);
- the edit scaffold;
- the decoding: greedy, presence penalty 1.5 for text-to-image and 0 for edits, `enable_thinking=False`, at most
  3,584 new tokens.

Two details matter:
- The presence penalty counts **generated tokens only**, as vLLM does. mlx-lm's presence penalty also counts the prompt.
- References are prepared first: alpha over white, LANCZOS to 1 MP for one reference, 724² for two, 512² for 3–10,
  sides multiples of 32, then a JPEG q92 round trip.

[flux3-klein-swift](https://github.com/xocialize/flux3-klein-swift)'s `Flux3PromptUpsampler` implements all of it:

```swift
import Flux3KleinUpsampler

let up = try await Flux3PromptUpsampler.load(directory: snapshotURL)
let caption = try await up.upsample("A man walking with his dog, afternoon sun")
```

## Parity (the Swift/MLX port vs BFL's reference, `flux3/pup.py`)

| Check | Result |
|---|---|
| Prompt tokens vs the HF processor (t2i, t2i+boxes, 1-ref and 2-ref edits, edit+boxes) | exact, 737–1,914 tokens |
| Box planning / reconcile vs `bbox.py` | 13/13 cases exact |
| 1-ref edit caption on BFL's own reference pixels (bf16) | **identical** to BFL's caption, word for word |
| Text-to-image caption, man_dog (bf16) | 0.991 word similarity to BFL's |

Greedy decoding is chaotic near ties. BFL's own captions for the same request differ between their runs (0.25–1.0
similarity), so exact match is not the bar.

## Tiers (19 requests from BFL's examples)

The bar: every quoted string kept verbatim and every box table complete. Similarity to the bf16 caption is reported for
information.

| Tier | Quoted text kept | Box tables | Similarity to bf16 | Memory (M5 Max) |
|---|---|---|---|---|
| bf16 | 20/20 | 2/2 | 1.00 | 18.8 GB resident, 20.2 GB peak |
| 8bit | 20/20 | 2/2 | 0.68 | 10.4 GB resident, 11.1 GB peak |
| 4bit | 20/20 | 2/2 | 0.45 | 6.0 GB resident, 6.8 GB peak |

Lower tiers paraphrase more, but the captions keep the same structure, subjects and quoted text. Each caption takes
about 9–15 s on an M5 Max.

## License

Apache-2.0, as upstream. It is derived from [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) (Apache-2.0).
This copy is not an official Black Forest Labs release.
