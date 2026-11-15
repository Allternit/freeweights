# mlx-community/whisper-large-v3-turbo-8bit

This model was converted to MLX format from [openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo) using [mlx-audio-plus](https://github.com/DePasqualeOrg/mlx-audio-plus) version **0.1.4**.

## Use with mlx-audio-plus

```bash
pip install -U mlx-audio-plus
```

### Command line

```bash
mlx_audio.stt --model mlx-community/whisper-large-v3-turbo-8bit --audio audio.mp3
```

### Python

```python
from mlx_audio.stt import transcribe

result = transcribe(
    audio="audio.mp3",
    model="mlx-community/whisper-large-v3-turbo-8bit",
)
print(result["text"])
```
