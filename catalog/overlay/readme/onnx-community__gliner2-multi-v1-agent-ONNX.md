# GLiNER2 multi v1, one-graph ONNX for the browser

ONNX export of [fastino/gliner2-multi-v1](https://huggingface.co/fastino/gliner2-multi-v1) (mDeBERTa-v3-base, multilingual) as **a single graph that serves both entity extraction and label classification**, for [Transformers.js](https://huggingface.co/docs/transformers.js) on WebGPU. It was made for Zipline, a browser agent that runs entirely in Chrome, and covers the two calls such an agent makes: pulling values out of a goal (`extract_entities`) and scoring page controls against it (`classify` with a softmax over labels).

| file | size |
| --- | --- |
| `onnx/model_fp16.onnx` + `_data` | 614 MB (WebGPU) |
| `onnx/model.onnx` + `_data` | 1.23 GB (fp32, reference) |

## Inputs and outputs

| name | shape | meaning |
| --- | --- | --- |
| `input_ids`, `attention_mask` | `[1, seq]` | the GLiNER2 processor's prompt: `( [P] task [DESCRIPTION] label: desc … ( [E]/[L] label … ) ) [SEP_TEXT] words` |
| `word_positions` | `[1, words]` | index of the first sub-token of each text word |
| `schema_positions` | `[1, 1 + labels]` | index of `[P]`, then of each `[E]` (extraction) or `[L]` (classification) marker |
| `cls_logits` | `[1, labels]` | classifier head on the markers; softmax for a single-label task |
| `count_logits` | `[1, 20]` | instance count from `[P]`; extraction returns nothing when the argmax is 0 |
| `span_logits` | `[1, labels, words, 8]` | instance-0 span scores (pre-sigmoid) for spans of 1–8 words |

Entity decoding is the library's default: sigmoid ≥ 0.5, map word spans to characters, then keep spans greedily by confidence without character overlap. Entity extraction only reads instance 0, so the count GRU is unrolled once (`export_onnx.py` asserts that instance 0 does not depend on the unroll length).

## Verification

`conversion/reference.json` holds 14 calls recorded from the Python `gliner2` library (six goals across English and French, eight control-scoring calls on flight-search and maps pages), with their exact token ids. Against it:

| dtype | same entities / top label | worst Δ (classify p / entity confidence) |
| --- | --- | --- |
| fp32 | 14/14 | 1e-5 / 5e-7 |
| fp16 | 14/14 | 3.3e-3 / 1.3e-4 |

The JavaScript runtime reproduces the token ids exactly. On WebGPU (fp16, Apple M3 Pro): **35–37 ms** per extraction with nine entity types, **43–44 ms** per classification with twelve labels.

## Rebuilding

```bash
pip install torch "gliner2[local]" onnx onnxruntime onnxscript transformers
python conversion/reference.py        # Python reference outputs
python conversion/export_onnx.py      # fp32 graph
python conversion/convert_fp16.py     # fp16 graph
python conversion/verify_onnx.py      # parity check
```

(The scripts write to `dist-model/`; external data is renamed to the `.onnx_data` convention afterwards.)

## Credits

Model by [Fastino](https://fastino.ai) ([GLiNER2](https://github.com/fastino-ai/GLiNER2)), Apache-2.0. The agent calls these outputs serve come from [gliner2-ultrafast](https://github.com/sahibzada-allahyar/gliner2-ultrafast) (MIT).
