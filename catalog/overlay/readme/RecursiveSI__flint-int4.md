<p align="center">
  <img src="assets/flint-logo.png" width="160" alt="Flint logo">
</p>

<h1 align="center">Flint INT4</h1>

MLX-format INT4 weights for [Recursive Flint](https://huggingface.co/RecursiveSI/flint), primarily intended for local inference on Apple Silicon. Projections and experts use **group-64 affine INT4**; embeddings use INT8. The weights occupy approximately **22.6 GB**.

See [Flint’s model card](https://huggingface.co/RecursiveSI/flint) for model details, benchmarks, chat conventions, and limitations.

## Use with Rec

Follow [Rec’s requirements and installation guide](https://github.com/recursive-oss/rec), then launch pi or OpenCode:

```bash
rec launch pi
# Or use OpenCode:
rec launch opencode
```

## Download the weights separately

With the [Hugging Face CLI](https://huggingface.co/docs/huggingface_hub/guides/cli) installed:

```bash
hf download RecursiveSI/flint-int4 --local-dir flint-int4
```

For llama.cpp on Metal, use [Flint INT4 GGUF](https://huggingface.co/RecursiveSI/flint-int4-gguf).

## Training data

Flint’s training data included publicly available and crawled web documents, text and code, commercially licensed data, and AI-generated synthetic data. Post-training included instruction tuning, reinforcement learning and human-preference data. See the [base Flint model card](https://huggingface.co/RecursiveSI/flint#training) for shared model and training information.

## License

[Apache License 2.0](https://huggingface.co/RecursiveSI/flint-int4/blob/main/LICENSE).
