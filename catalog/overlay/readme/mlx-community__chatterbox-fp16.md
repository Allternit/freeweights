# mlx-community/chatterbox-fp16
This model was converted to MLX format from [`ResembleAI/chatterbox`](https://huggingface.co/ResembleAI/chatterbox) using mlx-audio version **0.2.7**.
Refer to the [original model card](https://huggingface.co/ResembleAI/chatterbox) for more details on the model.

## Use with mlx

```bash
pip install -U mlx-audio
```

### CLI Example:
```bash
python -m mlx_audio.tts.generate --model mlx-community/chatterbox-fp16 --text "Hello, this is a test."
```
### Python Example:
```python
from mlx_audio.tts.utils import load_model
from mlx_audio.tts.generate import generate_audio
model = load_model("mlx-community/chatterbox-fp16")
generate_audio(
    model=model, text="Hello, this is a test.",
    file_prefix="test_audio",
)
```

### Voice Cloning: 
```python
from mlx_audio.tts.generate import generate_audio

generate_audio(
    text="Hello, this is a test of Chatterbox TTS.",
    model="mlx-community/chatterbox-fp16",
    ref_audio="path_to_file.wav",
    ref_text="Text transcript", # Optional
    file_prefix="vc_output",
)
```

## Multilingual Quickstart

Generate speech in 23 languages by specifying the `lang_code` parameter. The model automatically handles pronunciation, intonation, and language-specific phonemes.

```python
from mlx_audio.tts.generate import generate_audio

generate_audio(
    text="Olá, tudo bem?",
    model="mlx-community/chatterbox-fp16",
    lang_code="pt",
    file_prefix="multilingual_output",
)
```

### Supported Languages

| Code | Language   | Code | Language   | Code | Language   |
|------|------------|------|------------|------|------------|
| `ar` | Arabic     | `he` | Hebrew     | `no` | Norwegian  |
| `da` | Danish     | `hi` | Hindi      | `pl` | Polish     |
| `de` | German     | `it` | Italian    | `pt` | Portuguese |
| `el` | Greek      | `ja` | Japanese   | `ru` | Russian    |
| `en` | English    | `ko` | Korean     | `sv` | Swedish    |
| `es` | Spanish    | `ms` | Malay      | `sw` | Swahili    |
| `fi` | Finnish    | `nl` | Dutch      | `tr` | Turkish    |
| `fr` | French     | `zh` | Chinese    |      |            |
