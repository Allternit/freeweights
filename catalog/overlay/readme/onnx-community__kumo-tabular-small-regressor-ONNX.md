# Kumo Tabular Small, regressor (ONNX)

ONNX conversion of the Small regressor of NVIDIA's [Kumo Tabular](https://huggingface.co/nvidia/Kumo-Tabular) (`small/regressor.pt`, revision `v1.0.0`), a tabular foundation model that predicts new rows from labeled context rows in one forward pass, with no training. For the model, its training and its limits see the [original card](https://huggingface.co/nvidia/Kumo-Tabular), the [blog post](https://huggingface.co/blog/nvidia/kumo-tabular) and [structured-data-models](https://github.com/NVIDIA/structured-data-models).

**Try it in your browser:** [Kumo Tabular in the Browser](https://huggingface.co/spaces/shreyask/kumo-tabular-web) (drop a CSV or Parquet file; DuckDB-WASM + WebGPU; your data stays on the page). Code: [shreyaskarnik/kumo-tabular-web](https://github.com/shreyaskarnik/kumo-tabular-web).

## Graph

`onnx/model.onnx` + `onnx/model.onnx_data`, fp32, 120 MB. It is the inner model (`_KumoTabular.forward`) with dynamic rows, context rows and columns:

- `x` [R, C] float32: context rows first, then query rows, already preprocessed
- `y_context` [R_context] float32, standardized with the context mean and population std
- `categorical_mask` [C] bool: which columns came from categorical features
- `logits` [R_query, 999]: quantiles q001…q999 of the standardized target; sort, multiply by the context std and add the mean; the point estimate is their mean

The graph expects sdm's preprocessing (standardize, clip, sigma-clip, category codes and counts; see `sdm/models/kumo/tabular/recipe.py`). The browser demo ports it to TypeScript and checks it value by value against sdm. It loads with Transformers.js `AutoModel` (`device: "webgpu"`) and runs on ONNX Runtime WebGPU, WASM or CPU.

## Conversion and checks

`torch.onnx.export` (dynamo, opset 20). One op needed a custom lowering: `aten.remainder.Scalar` with a symbolic divisor (`index % num_columns` in the column grouping) becomes ONNX `Mod`. Scripts are in `conversion/`.

- ONNX Runtime (CPU) against PyTorch on inputs captured from real sdm runs: max |diff| 4.4e-5 (diabetes (442×10), California housing (1500×8); end to end in the browser within 6e-6 (relative) of sdm's point estimates).
- WebGPU (Chrome, M3 Pro), same inputs: max |diff| ≤ 2e-4.

## License

The weights are NVIDIA's, under the [OpenMDW-1.1](LICENSE) license (included); this is a format conversion with no change to them. Converted by [@shreyask](https://huggingface.co/shreyask).
