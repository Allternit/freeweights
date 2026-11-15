# mlx-community/whisper-tiny-asr-fp16
This model was converted to MLX format from [`openai/whisper-tiny`](https://huggingface.co/openai/whisper-tiny) using mlx-audio version **0.2.10**.
Refer to the [original model card](https://huggingface.co/openai/whisper-tiny) for more details on the model.

## Use with mlx-audio

```bash
pip install -U mlx-audio
```

### CLI Example:
```bash
python -m mlx_audio.stt.generate --model mlx-community/whisper-tiny-asr-fp16 --audio "audio.wav"
```
### Python Example:
```python
from mlx_audio.stt.utils import load_model
from mlx_audio.stt.generate import generate_transcription
model = load_model("mlx-community/whisper-tiny-asr-fp16")
transcription = generate_transcription(
    model=model,
    audio_path="path_to_audio.wav",
    output_path="path_to_output.txt",
    format="txt",
    verbose=True,
)
print(transcription.text)
```
