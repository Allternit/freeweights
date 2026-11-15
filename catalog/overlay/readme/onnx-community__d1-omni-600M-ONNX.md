# d1-omni-600M (ONNX)

[LiquidAI/d1-omni-600M](https://huggingface.co/LiquidAI/d1-omni-600M) converted to ONNX for the browser. d1-omni is a 587M decision model: a bidirectional LFM2.5-Encoder-350M trunk with a decision head that scores a `<mask>` marker per option, plus a SigLIP2 vision encoder and a FastConformer audio encoder. Typed questions (`choice`, `noul`, `score`) over a text state, an image or a voice clip, in **one forward pass and zero generated tokens**.

## Files

| File | What | Size |
|---|---|---|
| `onnx/model_quantized.onnx` | Text decisions: token ids → option logits (embedding + trunk + head), 8-bit | 0.41 GB |
| `onnx/model_q4.onnx` | The same, 4-bit | 0.24 GB |
| `onnx/embed_tokens_quantized.onnx` | Token embedding (4-bit Gather), for image requests | 0.04 GB |
| `onnx/decision_quantized.onnx` / `decision_q4.onnx` | Trunk + head over embeddings, with a media prefix | 0.36 / 0.20 GB |
| `onnx/vision_encoder_fp16.onnx` / `vision_encoder.onnx` | SigLIP2 + projector → prefix embeddings (fp16 / fp32) | 0.19 / 0.38 GB |
| `onnx/audio_encoder_quantized.onnx` / `audio_encoder.onnx` | 16 kHz samples → log-mel → FastConformer + adapter → one prefix embedding per 80 ms (8-bit / fp32) | 0.17 / 0.45 GB |
| `onnx/embed_tokens_fp16.onnx` | Token embedding in fp16, for audio requests | 0.13 GB |

The vision encoder is not quantized: 8-bit weights move its embeddings far enough to change answers (up to 0.08); fp16 keeps them within 0.05. Audio is the other way round: the 8-bit audio encoder is fine, but questions after audio carry no temperature and are sensitive to the token embedding, so use `embed_tokens_fp16` with audio (the 4-bit `embed_tokens_quantized` moves voice answers up to 0.10, and `decision_q4` up to 0.52).

## Parity with d1-omni's own runtime

Option probabilities against `system_one` (PyTorch, fp32):

| | Text (8 decisions) | Images (4 decisions) | Voice (39 decisions) |
|---|---|---|---|
| fp32 graphs | 0.0000 | 0.0000 | 0.0000 |
| **q8 decision + fp16 vision / q8 audio + fp16 embedding** | **0.036** | **0.047** | **0.031** |
| q4 decision | 0.091 | – | 0.52 |

In Chrome on WebGPU (onnxruntime-web), the voice stack (0.67 GB) reproduces PyTorch within 0.033 over 91 voice decisions with no change of top answer: about 50 ms for the audio encoder and 60 ms per question on an M3 Pro.

[open-jev](https://github.com/nico-martin/open-jev) (`d1-omni-600m`) reproduces the q8 numbers (0.035) at 130–230 ms per question on a laptop CPU.

## Use it

Text decisions with open-jev:

```js
import { OpenJev, choice } from "open-jev";

const jev = await OpenJev.load({ model: "d1-omni-600m", device: "webgpu" }); // q8, 0.41 GB
const { team } = await jev.decide("I was charged twice this month, please refund one of them.", {
  team: choice("Which team should handle this?", ["billing", "technical", "fraud"], {
    billing: "Charges, refunds, invoices",
    technical: "App or site faults",
    fraud: "Suspected unauthorised use",
  }),
});
```

Images: preprocess with Transformers.js' LFM2-VL image processor (`preprocessor_config.json`), run `vision_encoder` to get the prefix embeddings, put them in front of `embed_tokens(ids)` and run `decision` with `prefix_len` set to the prefix length. Voice: feed mono 16 kHz float samples (int16 / 32768, at most 30 s, zero-padded to 0.5 s) to `audio_encoder` as `input_values` [1, samples]; its `audio_embeds` [1, P, 1024] is the prefix, followed by `embed_tokens_fp16(ids)`, with `prefix_len` = P. After audio, choice options are written `option_000: description`, a `noul` as `false: no` / `true: yes`, an empty state as `{}`, the text gets 15360 positions, and no temperature is applied.

In both cases build `ids` and the marker positions as the model repo's [`prompt.py`](https://huggingface.co/LiquidAI/d1-omni-600M/blob/main/prompt.py) does (with images, `noul` reads `false: no` / `true: yes`, the text gets 896 positions, and no temperature is applied).

## Conversion

`conversion/`: `export_decision.py` (torch.onnx export of the trunk + head; the head's encoder layers are written out so no sequence length is baked in, checked against the original to 5e-7), `export_audio.py` (the log-mel front end as a convolution with DFT kernels, then the FastConformer and adapter, checked against the original to 1e-5), `build_vision.py` (d1-omni's SigLIP2 + projector swapped into [onnx-community/LFM2.5-VL-450M-ONNX](https://huggingface.co/onnx-community/LFM2.5-VL-450M-ONNX)'s vision graph, the same architecture), `compose_text.py`, `quantize.py`, and the parity scripts.

## License and attribution

d1-omni-600M is © Liquid AI, Inc. and licensed under the **LFM Open License v1.0** (see [`LICENSE`](LICENSE)), including its commercial-use threshold. This repository is a Derivative Work: the original weights were exported to ONNX (the vision weights re-laid out into the LFM2.5-VL-450M ONNX graph), quantized or cast to fp16, and the embedding and decision graphs merged for text use. No weights were retrained.
