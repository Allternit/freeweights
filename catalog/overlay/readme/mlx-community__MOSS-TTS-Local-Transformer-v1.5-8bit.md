# mlx-community/MOSS-TTS-Local-Transformer-v1.5-8bit

MLX conversion of [OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
(OpenMOSS / MOSI.AI) — the 4B `MossTTSLocal` speech model (Qwen3 backbone + a local transformer
emitting 12 RVQ codebooks per frame), zero-shot voice cloning, streaming synthesis, 48 kHz stereo
output through [MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2).

Precision: **int8, group size 64, affine** — 4.6 GB. Converted with `mlx_audio.convert`
(model type `moss_tts_local`) from the upstream safetensors, tokenizer files copied verbatim;
the upstream remote-code `.py` files are not needed by MLX and were dropped.

Sibling tiers: `MOSS-TTS-Local-Transformer-v1.5-bf16` · `-8bit` · `-4bit`. The codec is
[mlx-community/MOSS-Audio-Tokenizer-v2-bf16](https://huggingface.co/mlx-community/MOSS-Audio-Tokenizer-v2-bf16)
(this config's `audio_tokenizer_name_or_path` still points at the upstream fp32 repo, which
mlx-audio also loads directly).

## Use with mlx-audio

```python
from mlx_audio.tts import load
from mlx_audio.audio_io import write as audio_write

model = load("mlx-community/MOSS-TTS-Local-Transformer-v1.5-8bit", lazy=True)
result = next(model.generate(
    text="Hello, this is MOSS-TTS running on MLX.",
    ref_audio="speaker.wav",          # optional zero-shot cloning prompt
    language="English",
    max_tokens=400,
))
audio_write("out.wav", result.audio, result.sample_rate)   # 48 kHz stereo
```

Streaming (`stream=True, streaming_interval=2.0`) is supported on this checkpoint; see the
mlx-audio `moss_tts` README. Fixed 12-codebook RVQ depth — do not pass a different
`n_vq_for_inference`.

## License

Apache-2.0 (upstream weights and this conversion). Please credit OpenMOSS for the model.
