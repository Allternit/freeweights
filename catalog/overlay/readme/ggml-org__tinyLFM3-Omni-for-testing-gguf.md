# tinyLFM3-Omni-for-testing

> [!WARNING]
> This is a **modified, damaged copy** of [LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B), made only to test software. Its output is gibberish. Do not use it for anything else.

It keeps the architecture of LFM3-Omni, so it runs the same code paths as the real model in llama.cpp (TTS, ASR, realtime audio and image input), but it is small enough for CI.

Use the real model instead: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF

## Changes from the original model

Sliced from the safetensors with [slice_lfm3omni.py](slice_lfm3omni.py), which follows the `slice-model` skill of llama.cpp, then converted with `convert_hf_to_gguf.py`:

- Text model: 4 of 24 layers (0, 2, 3, 4), hidden size 2048 -> 256, heads 16 -> 2, KV heads 4 -> 1, FFN 7680 -> 256
- Audio encoder: 3 of 17 layers (0, 2, 3), FFN 1792 -> 256
- Depthformer: 1 of 3 layers, hidden size 1024 -> 128, heads 32 -> 4, KV heads 8 -> 1, FFN 2816 -> 256
- Audio codec: all 8 layers (the loader requires it), FFN 2304 -> 256
- Vision encoder: 2 of 14 layers (0, 2), hidden size 1024 -> 256, heads 16 -> 4, KV heads 8 -> 2, FFN 2560 -> 256, projector 4096 -> 256

Then [finish_gguf.py](finish_gguf.py) made these changes:

- Weights quantized to Q2_K, Q4_K and Q4_0
- Added the `asr` chat template of LFM3-Audio, which the original model does not have. This enables the live transcription path (`/v1/realtime?intent=transcription`) for testing

## License

Derived from LFM3-Omni-2B by Liquid AI, under the [LFM Open License v1.0](LICENSE).
