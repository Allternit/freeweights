# Qwen2-Audio-7B-Instruct (4-bit MLX)

4-bit quantized version of [Qwen/Qwen2-Audio-7B-Instruct](https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct) for Apple Silicon via [mlx-audio](https://github.com/Blaizzy/mlx-audio).

## Usage

```python
from mlx_audio.stt.utils import load_model

model = load_model("mlx-community/Qwen2-Audio-7B-Instruct-4bit")

# Transcription
result = model.generate("audio.wav", prompt="Transcribe the audio.")
print(result.text)

# Audio understanding
result = model.generate("audio.wav", prompt="What emotion is the speaker expressing?")
print(result.text)

# Translation
result = model.generate("audio.wav", prompt="Translate the speech to French.")
print(result.text)
```

## Model Details

- **Base model**: Qwen/Qwen2-Audio-7B-Instruct
- **Quantization**: 4-bit (group_size=64), LLM only (encoder and projector kept in bf16)
- **Size**: ~4.2GB (vs ~15GB bf16)
- **Architecture**: Whisper-style encoder (32 layers) + Linear projector + Qwen2-7B LLM

## Capabilities

- Speech transcription (ASR)
- Speech translation
- Audio captioning
- Emotion / sentiment detection
- Environmental sound classification
- Music understanding
- Voice chat (audio-only input)

## Performance

Tested on Apple Silicon (M-series):
- ~4.7 tokens/sec generation (4-bit)
- Accurate transcription matching HuggingFace reference

## Conversion

Converted using mlx-audio with:
- Audio encoder: bf16 (not quantized)
- Multi-modal projector: bf16 (not quantized)
- Language model: 4-bit quantized (group_size=64)
