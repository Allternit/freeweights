# Ming-3.0 TTS Tiny for MLX

Converted from [inclusionAI/Ming-3.0-tts-tiny](https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny).

44.1 kHz speech with built-in voices, voice cloning and style controls. Only the language backbone is quantized; acoustic modules and MoE routers retain floating-point precision. CAMPPlus speaker extraction runs natively in MLX using the bundled `speaker_encoder/campplus.safetensors`. No ONNX packages are required. A 192-value `spk_emb` may also be supplied.

```python
from mlx_audio.tts import load
model = load('dev/ming3/converted/Ming-3.0-tts-tiny-4bit', strict=True)
result = next(model.generate("Hello from MLX Audio!", voice="US_James"))
from mlx_audio.audio_io import write
write("output.wav", result.audio, result.sample_rate)
```

Offline inference on Apple Silicon using native MLX code. The tokenizer is loaded without executing remote code.
