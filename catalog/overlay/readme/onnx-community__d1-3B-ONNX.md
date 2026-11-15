# d1-3B (ONNX)

[LiquidAI/d1-3B](https://huggingface.co/LiquidAI/d1-3B) converted to ONNX for [Transformers.js](https://github.com/huggingface/transformers.js) and the browser (WebGPU). d1 is a decision model on LFM2.5-VL-3B: give it a state (text and/or images) and typed questions (`choice`, `noul` yes/no, `score`), and it answers in **one forward pass with zero generated tokens**. The answer is a softmax over each option's token at the answer slot.

This is a straight conversion: the same weights in [LiquidAI/LFM2.5-VL-3B-ONNX](https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX)'s graphs (same architecture), with one change: the decoder returns logits for the **last position only**, which is all d1 reads (and all generation needs), so a 300-token prompt doesn't materialise 300 × 128k logits.

## Files

| Graph | `q8` (default) | `q4` | `fp32` |
|---|---|---|---|
| `decoder_model_merged` | 3.15 GB | 1.76 GB | – (rebuild with `conversion/build.py`) |
| `vision_encoder` | 0.50 GB | 0.28 GB | 1.71 GB |
| `embed_tokens` | 0.17 GB (4-bit Gather) | 0.17 GB | 1.05 GB |

Block-32 `MatMulNBits` (8-bit or 4-bit), fp32 activations. External data is split into ≤ 1 GB chunks.

## Parity with d1's own runtime

Option probabilities vs the model repo's `system_one` (PyTorch, fp32), on 8 text decisions (choice, noul, score) and 3 image decisions:

| Variant | Text max \|Δ\| | Image max \|Δ\| | Flipped answers |
|---|---|---|---|
| fp32 | 0.0000 | 0.0000 | 0 |
| **q8** | **0.018** | **0.002** | **0** |
| q4 | 0.028 | 0.063 | 1 (a 0.48 vs 0.45 near-tie) |

Transformers.js' own LFM2-VL image processor tiles slightly differently from the Python one (256 vs 234 image tokens on a 640×480 picture), which moves image answers by up to 0.04 at q8; same picks.

## Use it

With [open-jev](https://github.com/nico-martin/open-jev) (text states), which implements d1's prompt and readout:

```js
import { OpenJev, choice } from "open-jev";

const jev = await OpenJev.load({ model: "d1-3b", device: "webgpu" }); // onnx-community/d1-3B-ONNX, q8
const { route } = await jev.decide("Message: What's the Wi-Fi password?\nMemory 1 (strong match, note): Home Wi-Fi: HomeNet-5G, password sunflower42", {
  route: choice("Can a memory answer this message?", ["memory", "large model"], {
    memory: "One memory directly answers the message.",
    "large model": "No memory answers it.",
  }),
});
// { type: "choice", choice: "memory", confidence: 0.94, ... }
```

With Transformers.js directly (text or images): build the prompt as d1's [`prompt.py`](https://huggingface.co/LiquidAI/d1-3B/blob/main/prompt.py) does, run one forward pass, and softmax the option tokens:

```js
import { AutoProcessor, AutoModelForImageTextToText, RawImage } from "@huggingface/transformers";

const id = "onnx-community/d1-3B-ONNX";
const processor = await AutoProcessor.from_pretrained(id);
const model = await AutoModelForImageTextToText.from_pretrained(id, { dtype: "q8", device: "webgpu" });

const prompt = "<|startoftext|><|im_start|>user\n<image>Is this a parking sign?\n\nReply with yes or no only.<|im_end|>\n<|im_start|>assistant\n";
const inputs = await processor(await RawImage.read("sign.png"), prompt, { add_special_tokens: false });
const { logits } = await model(inputs); // [1, 1, vocab]: the answer slot
// softmax over the token ids of "yes"/"Yes"/"YES" vs "no"/"No"/"NO" (best form of each)
```

## Conversion

`conversion/` has everything: `build.py` maps d1's safetensors onto the LFM2.5-VL-3B-ONNX graphs by name (transposing MatMul weights, the SigLIP2 position table to a 16×16 grid), computes the RoPE caches, slices the decoder to the last position and unties the LM head so it can be quantized; `quantize.py`, `rechunk.py`; and the parity scripts (`reference.py`, `onnx_check.py`, `vision_*.py`).

## License and attribution

d1-3B is © Liquid AI, Inc. and licensed under the **LFM Open License v1.0** (see [`LICENSE`](LICENSE)), including its commercial-use threshold. This repository is a Derivative Work: the original weights were converted to ONNX, re-laid out into the LFM2.5-VL-3B ONNX graphs, the decoder was changed to return last-position logits with an untied LM head, and the weights were quantized. No weights were retrained.
