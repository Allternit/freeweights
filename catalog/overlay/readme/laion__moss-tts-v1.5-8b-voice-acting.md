# MOSS-TTS-v1.5 **8B** — Voice Acting (24 kHz delay model)

A full fine-tune of [OpenMOSS's **MOSS-TTS-v1.5**](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5)
(8B parameters, Qwen3-8B backbone, `moss_tts_delay` architecture, 32-codebook audio @ 24 kHz),
specialised for **expressive voice acting**.

The fine-tune pushes the base model toward:

- **Emotional delivery** — happy, sad, angry, fearful, tender, sarcastic, whispered, shouted, and everything in between.
- **Character voices** — distinct personas driven from a natural-language instruction.
- **Voice cloning** — clone a speaker's timbre and delivery style from a short reference clip.

**Sibling model:** the **4.55-billion-parameter local-transformer** variant at **48 kHz** —
[`laion/moss-tts-local-transformer-4.55b-voice-acting`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting)
(merged, off-the-shelf).

| | **this model — 8B delay** | [4.55B local transformer](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting) |
|---|---|---|
| audio tokenizer | [`MOSS-Audio-Tokenizer`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer) (v1) — **24 kHz mono** | [`MOSS-Audio-Tokenizer-v2`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2) — **48 kHz** |
| output | 24 kHz (optionally bandwidth-extended with Sidon) | native 48 kHz, use raw |
| strengths | larger capacity, broad multilingual coverage | higher audio bandwidth out of the box, smaller/faster, measured higher word accuracy on identical prompts (invWER 0.97 vs 0.83) |

It keeps the multilingual coverage of the base model (English, German, Chinese, and many more — see the language list),
and is fully API-compatible with MOSS-TTS-v1.5: same processor, same `generate` interface, same input schema.

---

## Model at a glance

| | |
|---|---|
| Base model | OpenMOSS-Team/MOSS-TTS-v1.5 |
| Architecture | `moss_tts_delay` (delay-pattern TTS LM) |
| Backbone | Qwen3-8B |
| Parameters | ~8B (full fine-tune, no adapters) |
| Audio codec | 32-codebook RVQ, **24 kHz** — [`OpenMOSS-Team/MOSS-Audio-Tokenizer`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer) (v1, mono) |
| Precision | bfloat16 |
| License | Apache-2.0 |

---

## Prompting

The model is prompted through the processor's native `build_user_message` fields:

- **`instruction`** — *how* to say it: the emotion, character, or performance direction
  (e.g. `"Speak like a weary old sailor telling a ghost story, low and gravelly."`).
- **`text`** — *what* to say: the words to be spoken.
- **`language`** — the language of `text` (e.g. `"English"`, `"German"`, `"Chinese"`). Set it whenever the language is known; it improves multilingual stability.
- **`reference`** — *optional* audio (a file path, URL, or waveform tensor) to **clone** a voice. Omit it to let the model **invent** a voice consistent with the instruction.

---

## Usage

```python
from transformers import AutoModel, AutoProcessor
import torch, torchaudio

# Recommended SDPA backend settings (the cuDNN SDPA path is broken for this model)
torch.backends.cuda.enable_cudnn_sdp(False)
torch.backends.cuda.enable_flash_sdp(True)
torch.backends.cuda.enable_mem_efficient_sdp(True)
torch.backends.cuda.enable_math_sdp(True)

model_id = "laion/moss-tts-v1.5-8b-voice-acting"
device, dtype = "cuda", torch.bfloat16

processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
processor.audio_tokenizer = processor.audio_tokenizer.to(device)

model = AutoModel.from_pretrained(
    model_id,
    trust_remote_code=True,
    dtype=dtype,
    attn_implementation="sdpa",   # or "flash_attention_2" if installed
).to(device).eval()

def synth(message, out_path):
    batch = processor([[message]], mode="generation")
    with torch.no_grad():
        outputs = model.generate(
            input_ids=batch["input_ids"].to(device),
            attention_mask=batch["attention_mask"].to(device),
            max_new_tokens=4096,
        )
    audio = processor.decode(outputs)[0].audio_codes_list[0]
    torchaudio.save(out_path, audio.unsqueeze(0).cpu().float(),
                    processor.model_config.sampling_rate)

# 1) Expressive delivery, model invents a voice (no reference)
synth(processor.build_user_message(
    instruction="Excited and breathless, like sharing amazing news with a best friend!",
    text="You will not believe what just happened. We actually did it!",
    language="English",
), "invented_voice.wav")

# 2) Voice cloning — clone the timbre/style of a reference clip
synth(processor.build_user_message(
    instruction="Calm, warm, reassuring bedtime-story narrator.",
    text="Once upon a time, in a quiet little village, everyone slept soundly.",
    language="English",
    reference=["/path/to/reference.wav"],
), "cloned_voice.wav")
```

`processor.decode(...)` returns a list of messages; each carries the decoded waveform in
`message.audio_codes_list[0]` at `processor.model_config.sampling_rate` (24 kHz).

> **Sampling settings.** A grid search over temperature and audio repetition penalty (scored for
> intelligibility, quality, and genuineness on a held-out English + German set) gives good defaults
> of **temperature 1.0, repetition penalty 1.1 with a reference clip**, and **temperature 0.8,
> repetition penalty 1.1 without a reference**. See [`GENERATION_SETTINGS.md`](GENERATION_SETTINGS.md)
> for the full results table and per-metric best configs.

---

## Training

This model was fine-tuned on a mix of the **Emolia** corpus and **synthetic speech** generated
by several TTS models — primarily **Gemini-3.1 TTS** and **DramaBox TTS**. The goal of the mix
was to concentrate on expressive, emotional, and character-driven delivery while preserving the
base model's multilingual and voice-cloning abilities. It is a conservative full fine-tune: the
base model's general capabilities are largely retained.

---

## Tips

- **Put performance cues in `instruction`.** Emotion, character, pacing, and vocal-burst /
  performance cues (laughter, sighs, gasps, whispering, shouting) belong in `instruction`, not in `text`.
- **German text: write it naturally.** Use lowercase with proper umlauts (`ä ö ü`, not `ae/oe/ue`)
  and **avoid ALL-CAPS**, which the model tends to mispronounce. Reserve capitals for normal
  sentence casing.
- **Use punctuation for emphasis and prosody.** `!`, `?`, `.`, and `...` meaningfully shape
  intonation and pauses — lean on them instead of capitalisation.
- **Set `language`** whenever you know it; it stabilises multilingual synthesis.
- **Data augmentation.** Voice cloning combined with text paraphrase is an effective way to
  generate additional, style-consistent training material.

---

## Limitations

- This is a **conservative full fine-tune**. It broadens expressive and voice-acting behaviour,
  but it may **not beat task-specific baselines on every axis** (e.g. raw intelligibility,
  speaker similarity, or a single narrow language/domain).
- Expressiveness is driven by the `instruction` field; vague or contradictory instructions can
  produce inconsistent delivery. Iterate on wording.
- As with any generative TTS, outputs should not be used to impersonate real individuals without
  consent. Use responsibly.

---

## License

Released under the **Apache-2.0** license.
