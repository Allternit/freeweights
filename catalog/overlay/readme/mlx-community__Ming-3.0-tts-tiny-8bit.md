# Ming-3.0 TTS Tiny for MLX

Converted from [inclusionAI/Ming-3.0-tts-tiny](https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny).

44.1 kHz speech with built-in voices, voice cloning and style controls. Only the language backbone is quantized; acoustic modules and MoE routers retain floating-point precision. CAMPPlus speaker extraction runs natively in MLX using the bundled `speaker_encoder/campplus.safetensors`. Its weights retain FP32 precision. No ONNX packages are required. A 192-value `spk_emb` may also be supplied.

```python
from mlx_audio.tts import load
model = load('mlx-community/Ming-3.0-tts-tiny-8bit', strict=True)
result = next(model.generate("Hello from MLX Audio!", voice="US_James"))
from mlx_audio.audio_io import write
write("output.wav", result.audio, result.sample_rate)
```

Offline inference on Apple Silicon using native MLX code. The tokenizer is loaded without executing remote code.

Source checkpoint revision: `154395db3ec31ab6f055035b2f41da2cd6f95f80`.

Quantized from the BF16 MLX export using **8-bit affine quantization, group size 64**. The model-specific quantization policy preserves acoustic modules and MoE routers in floating-point precision. The native CAMPPlus speaker encoder and its Apache-2.0 license are bundled; speaker weights retain FP32 precision. All necessary weights and tokenizers are included. No separate model downloads or ONNX packages are required. Use an MLX Audio version with Ming Tiny support.

The example repository name above may be replaced with the local export directory or your uploaded repository ID.

Validation: strictly reloaded from a relocated directory with an empty Hugging Face cache, network access blocked and ONNX packages absent. See `validation.json` for the tested tasks and weight inventory. `SHA256SUMS` covers all package files.
