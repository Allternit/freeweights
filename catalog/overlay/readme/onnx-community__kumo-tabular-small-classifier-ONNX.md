# Kumo Tabular Small, classifier (ONNX)

ONNX conversion of the Small classifier of NVIDIA's [Kumo Tabular](https://huggingface.co/nvidia/Kumo-Tabular) (`small/classifier.pt`, revision `v1.0.0`), a tabular foundation model that predicts new rows from labeled context rows in one forward pass, with no training. For the model, its training and its limits see the [original card](https://huggingface.co/nvidia/Kumo-Tabular), the [blog post](https://huggingface.co/blog/nvidia/kumo-tabular) and [structured-data-models](https://github.com/NVIDIA/structured-data-models).

**Try it in your browser:** [Kumo Tabular in the Browser](https://huggingface.co/spaces/shreyask/kumo-tabular-web) (drop a CSV or Parquet file; DuckDB-WASM + WebGPU; your data stays on the page). Code: [shreyaskarnik/kumo-tabular-web](https://github.com/shreyaskarnik/kumo-tabular-web).

## Graph

`onnx/model.onnx` + `onnx/model.onnx_data`, fp32, 116 MB. It is the inner model (`_KumoTabular.forward`) with dynamic rows, context rows and columns:

- `x` [R, C] float32: context rows first, then query rows, already preprocessed
- `y_context` [R_context] int32 class codes (0..K-1, K ≤ 10)
- `categorical_mask` [C] bool: which columns came from categorical features
- `logits` [R_query, 10]: slice to the number of classes, softmax

The graph expects sdm's preprocessing (standardize, clip, sigma-clip, category codes and counts; see `sdm/models/kumo/tabular/recipe.py`). The browser demo ports it to TypeScript and checks it value by value against sdm. It loads with Transformers.js `AutoModel` (`device: "webgpu"`) and runs on ONNX Runtime WebGPU, WASM or CPU.

## Conversion and checks

`torch.onnx.export` (dynamo, opset 20). One op needed a custom lowering: `aten.remainder.Scalar` with a symbolic divisor (`index % num_columns` in the column grouping) becomes ONNX `Mod`. Scripts are in `conversion/`.

- ONNX Runtime (CPU) against PyTorch on inputs captured from real sdm runs: max |diff| 1.25e-4 (breast cancer (569×30), iris, wine; end to end in the browser within 6e-6 of sdm's probabilities, no top class changed).
- WebGPU (Chrome, M3 Pro), same inputs: max |diff| ≤ 2e-4.

## License

The weights are NVIDIA's, under the [OpenMDW-1.1](LICENSE) license (included); this is a format conversion with no change to them. Converted by [@shreyask](https://huggingface.co/shreyask).
