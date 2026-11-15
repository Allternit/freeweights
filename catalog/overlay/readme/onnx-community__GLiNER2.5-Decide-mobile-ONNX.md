# GLiNER2.5-Decide, mobile (ONNX)

A phone-sized build of [onnx-community/GLiNER2.5-Decide-ONNX](https://huggingface.co/onnx-community/GLiNER2.5-Decide-ONNX) (the classification path of [fastino/GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide)). For the model itself, see those cards.

The `q4f16` file there keeps the word embeddings in fp16: one 262 MB tensor, half the file. On iPhones that buffer plus the copies made while loading can exceed a tab's memory limit, and the tab is closed. Here the embedding lookup is quantized too (`GatherBlockQuantized`, 4-bit, block 32), so the file is **345 MB instead of 523 MB** and no tensor is larger than about 70 MB. Everything else is unchanged.

| | Size | Max probability difference vs. the original `q4f16` |
|---|---|---|
| `onnx/model_q4f16.onnx` | 345 MB | 0.028 (42 decision prompts, ONNX Runtime CPU) |

Use it like the original, with `dtype: "q4f16"`; with [open-jev](https://github.com/nico-martin/open-jev), pass this repo id as `model`. It plays [Jevosaurus](https://huggingface.co/spaces/shreyask/jevosaurus) on phones. Script in `conversion/`.

Apache-2.0, as the original model.
