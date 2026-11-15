# Ming-3.0-tts-0.5B MLX (bf16)

This is [inclusionAI/Ming-3.0-tts-0.5B](https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B) converted for [mlx-audio](https://github.com/Blaizzy/mlx-audio) with `mlx_audio.convert`. The weights are bfloat16, unchanged from the source checkpoint.

Ming-3.0-tts-0.5B is a dense, Qwen2.5-0.5B-based speech model from inclusionAI. It supports:
- zero-shot voice cloning;
- built-in voices;
- freeform and voice-design instructions;
- emotion, speed, pitch and volume control;
- 14 inline paralinguistic tags;
- Chinese, English, German, Spanish, French, Korean and Japanese, plus Sichuanese and Cantonese.

It outputs 44.1 kHz audio. See the [original model card](https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B) and the [Ming-3.0-tts repository](https://github.com/inclusionAI/Ming-3.0-tts) for details.

| | |
| --- | --- |
| Size on disk | 3.0 GB |
| Real-time factor (M4 Pro) | about 1.0 |
| Peak memory | 4.4 GB |

## Install

Ming-3.0 needs mlx-audio 0.6.1 or later, which includes the prompt-contract fix from [mlx-audio #1047](https://github.com/Blaizzy/mlx-audio/pull/1047). mlx-audio 0.6.0 and earlier load the model but say the wrong words.

```bash
pip install -U "mlx-audio>=0.6.1"
```

## Use

```bash
# Text to speech
mlx_audio.tts.generate --model mlx-community/Ming-3.0-tts-0.5B-bf16 \
  --text "The evening wind blew in from the mountain pass, and the distant clouds slowly turned gold."

# Voice cloning: pass the reference clip and its exact transcript
mlx_audio.tts.generate --model mlx-community/Ming-3.0-tts-0.5B-bf16 \
  --text "I never thought a little machine could sound this much like me." \
  --ref_audio reference.wav --ref_text "Exact transcript of reference.wav."

# Built-in voice
mlx_audio.tts.generate --model mlx-community/Ming-3.0-tts-0.5B-bf16 \
  --text "Good evening, and welcome to the late news." --voice UK_Charlotte

# Freeform instruction
mlx_audio.tts.generate --model mlx-community/Ming-3.0-tts-0.5B-bf16 \
  --text "The old radio crackled softly as the storm moved across the valley." \
  --instruct "Speak in a warm, intimate storytelling voice, with a gentle pace and a hint of nostalgia." \
  --use_zero_spk_emb

# German, Spanish, French, Korean or Japanese
mlx_audio.tts.generate --model mlx-community/Ming-3.0-tts-0.5B-bf16 \
  --text "Am Wochenende haben wir im kleinen Café am Bahnhof einen Kuchen gegessen." --lang_code de
```

```python
from mlx_audio.tts.models.bailingmm.bailingmm import ming3_instruction
from mlx_audio.tts.utils import load_model

model = load_model("mlx-community/Ming-3.0-tts-0.5B-bf16")
result = next(model.generate(
    text="[Sigh] The rain still hasn't stopped. [Cough] I guess we'll have to move the party indoors.",
))
happy = next(model.generate(
    text="所有测试都顺利通过了，我们终于可以把这个好消息告诉大家！",
    instruct=ming3_instruction(emotion="高兴"),
    ref_audio="reference.wav",
    ref_text="Exact transcript of reference.wav.",
))
```

More examples, including the full list of tags and control values, are in the [mlx-audio Ming dense README](https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/dense/README.md).

## Checks

Each clip was transcribed with whisper-large-v3-turbo. Across English, Chinese, paralinguistic tags, Chinese and English cloning, freeform, German and a 30-second three-fragment paragraph, with three seeds each, 24 of 24 clips were correct.

## Limitations

- **Speaker embeddings.** The CAM++ speaker embedding the reference uses for cloning and for the emotion, attribute and dialect tasks is not extracted yet. Cloning works from the reference audio and transcript alone.
- **Text normalization.** The reference's text normalization is not ported, so write numbers out as words.
- **Stopping.** The stop head occasionally fails to fire, leaving trailing low noise. Re-run with another seed if that happens.

## License

MIT, as published by inclusionAI. See `LICENSE`.
