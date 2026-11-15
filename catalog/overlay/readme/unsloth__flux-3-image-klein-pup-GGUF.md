# FLUX 3 Image Klein Prompt Upsampler GGUF

GGUF conversions of [black-forest-labs/flux-3-image-klein-pup](https://huggingface.co/black-forest-labs/flux-3-image-klein-pup), the prompt upsampler for [FLUX 3 Image Klein](https://huggingface.co/black-forest-labs/flux-3-image-klein). It is a fine-tune of Qwen3.5-9B by Black Forest Labs that expands a short image request (and, for edits, the reference images) into the detailed caption FLUX 3 Image Klein is trained on.

FLUX 3 Image Klein is meant to run with a prompt upsampler in front of it. Short prompts sent to the image model as typed often give generic images and broken poses (backflips, handstands, tangled arms); the upsampled caption describes the pose and every limb explicitly and fixes most of those.

Unsloth Desktop and Unsloth Studio download and run this upsampler automatically for FLUX 3 Image Klein through the "Enhance prompt" option.

## Files

| File | Size | Notes |
|---|---|---|
| `flux-3-image-klein-pup-UD-Q4_K_XL.gguf` | 6.0 GB | Unsloth Dynamic 4-bit, closest to BF16 among the 4-bit files. Default in Unsloth Desktop, about 7.5 GB of VRAM with the mmproj |
| `flux-3-image-klein-pup-Q4_K_M.gguf` | 5.6 GB | 4-bit |
| `flux-3-image-klein-pup-Q6_K.gguf` | 7.4 GB | 6-bit |
| `flux-3-image-klein-pup-Q8_0.gguf` | 9.5 GB | Closest to BF16 |
| `flux-3-image-klein-pup-BF16.gguf` | 17.9 GB | Unquantized |
| `mmproj-F16.gguf` | 0.9 GB | Vision projector, needed for edits with reference images |
| `mmproj-BF16.gguf` | 0.9 GB | Vision projector, BF16 |
| `system_prompts.json` | | Black Forest Labs' system prompts (`t2i`, `i2i`, `t2i_bbox`, `i2i_bbox`), unchanged |

We rendered the hard poses (backflip, handstand, stretch, violin, a group of five on a couch, a hugging couple) on FLUX 3 Image Klein from the Q4_K_M, Q8_0 and original BF16 captions with the same seeds, and saw no anatomy difference between them.

## Quantization

Accuracy against BF16, measured as KL divergence on the upsampler's own captions (96 requests, assistant tokens only):

| File | Mean KLD vs BF16 |
|---|---|
| Q4_K_M | 0.0194 |
| UD-Q4_K_XL | 0.0119 |
| Q6_K | 0.0025 |

The files hold up across request types: the bbox system prompt, Chinese, Japanese, Spanish and German requests, very long and very short requests, and unusual ones (typos, lists, negations, text in the image), and the files loop no more often than BF16. Q4_K_M and Q6_K keep the tensor types, size and speed of the earlier files. UD-Q4_K_XL uses the Unsloth Dynamic layout of Qwen3.5-9B UD-Q4_K_XL, at 6% more bytes than Q4_K_M.

## Usage with llama.cpp

```bash
llama-server -m flux-3-image-klein-pup-UD-Q4_K_XL.gguf --mmproj mmproj-F16.gguf \
    -ngl 99 -c 16384 --jinja
```

Then send the `t2i` system prompt from `system_prompts.json` and the request as the user message, with thinking off and greedy decoding. These are the settings of the official ComfyUI FLUX 3 Image Klein templates:

```json
{
  "messages": [
    {"role": "system", "content": "<t2i system prompt>"},
    {"role": "user", "content": "a gymnast doing a backflip"}
  ],
  "max_tokens": 3584,
  "temperature": 1.0,
  "top_k": 1,
  "top_p": 0.95,
  "min_p": 0.0,
  "presence_penalty": 1.5,
  "repeat_penalty": 1.0,
  "chat_template_kwargs": {"enable_thinking": false}
}
```

For edits, use the `i2i` system prompt and `presence_penalty` 0, and put the reference images before this text in the user message:

```
Reference images follow in order (the first image, the second image, ...).
User request: <instruction>
Output the caption.
```

Pass the returned caption to FLUX 3 Image Klein as the prompt.

## License

Apache 2.0, the same as the original model. All credit for the model goes to Black Forest Labs; see the [original model card](https://huggingface.co/black-forest-labs/flux-3-image-klein-pup) for training details and intended use.
