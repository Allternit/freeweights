# Voice-Tagging Whisper

A fine-tuned [OpenAI Whisper Small](https://huggingface.co/openai/whisper-small) model that generates structured voice attribute tags from speech audio. Instead of transcribing words, this model describes **how** the voice sounds — its quality, style, loudness, articulation, intonation, and emotional delivery.

Built on top of [BUD-E-Whisper (V1.0)](https://huggingface.co/laion/BUD-E-Whisper) and trained for 20 epochs on voice-annotated speech data.

## Quick Start

```python
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import torch

# Load model and processor
model = WhisperForConditionalGeneration.from_pretrained(
    "laion/voice-tagging-whisper", torch_dtype=torch.float16
).to("cuda").eval()
processor = WhisperProcessor.from_pretrained("openai/whisper-small")

# Load and process audio (16kHz mono, padded to 30s)
import librosa
waveform, sr = librosa.load("speech.wav", sr=16000, mono=True)

inputs = processor(waveform, sampling_rate=16000, return_tensors="pt")
mel = inputs.input_features.to("cuda", dtype=torch.float16)

with torch.no_grad():
    generated = model.generate(mel, max_new_tokens=256)

tags = processor.batch_decode(generated, skip_special_tokens=True)[0]
print(tags)
```

> **Note:** This model does not ship its own processor/tokenizer config. Use `openai/whisper-small` as the processor, which is architecture-compatible.

## Output Format

The model outputs a **comma-separated sequence of ~8–10 voice attribute tags** describing multiple dimensions of the voice simultaneously. There is no free-form caption — the entire output consists of structured tags.

### Tag Structure

Based on analysis of 570 diverse audio samples spanning 57 voice taxonomy dimensions, the tags follow a consistent positional order covering these voice dimensions:

| Position | Dimension | Example Values | Positional Reliability |
|----------|-----------|----------------|----------------------|
| 1 | **Content safety** | `Suitable for Work`, `Not Suitable for Work` | 95% consistent |
| 2 | **Naturalness** | `natural speaking`, `naturalness`, `natural-genuine`, `slightly unnatural` | 80% consistent |
| 3 | **Fluency** | `fluent`, `halting speech`, `disfluent` | 77% consistent |
| 4 | **Speaking style** | `casual speaking style`, `dramatic style`, `narrator style`, `ranting style`, `ASMR style` | 48% consistent |
| 5 | **Phonation type** | `modal voice`, `strained voice`, `slack voice`, `rough voice`, `breathy voice` | 62% consistent |
| 6 | **Airflow / breathiness** | `neutral airflow`, `pressed voice`, `breathy`, `slightly breathy` | 65% consistent |
| 7 | **Loudness** | `normal loudness`, `quiet`, `loud`, `very loud`, `very quiet`, `whispered` | 47% consistent |
| 8 | **Intonation / prosody** | `slightly dynamic`, `dynamic`, `monotone`, `falling intonation`, `irregular intonation` | 34% consistent |
| 9 | **Articulation precision** | `precise articulation`, `neutral articulation`, `slightly imprecise articulation` | 48% consistent |
| 10 | **Delivery / emotion** | `natural speaking`, `crying`, `screaming`, `whispering`, `narration style delivery` | Final position |

Typical output length: **9.0 tags on average** (range 1–16, most samples produce 8–11).

## Tag Vocabulary

Analysis of 570 samples revealed **194 unique tags** across the model's vocabulary. Here are the most frequent:

### Core Tags (appearing in >10% of samples)

| Tag | Frequency | Category |
|-----|-----------|----------|
| `Suitable for Work` | 83% | Safety |
| `fluent` | 78% | Fluency |
| `neutral airflow` | 68% | Airflow |
| `modal voice` | 65% | Phonation |
| `normal loudness` | 49% | Loudness |
| `casual speaking style` | 47% | Style |
| `precise articulation` | 47% | Articulation |
| `slightly dynamic` | 35% | Intonation |
| `natural speaking` | 30% | Naturalness / Delivery |
| `neutral articulation` | 20% | Articulation |
| `dynamic` | 15% | Intonation |
| `very loud` | 12% | Loudness |
| `irregular intonation` | 12% | Intonation |
| `dramatic style` | 11% | Style |
| `pressed voice` | 11% | Airflow |

### Delivery / Emotion Tags (final position)

The last tag typically describes the overall delivery or emotional quality:

| Tag | Count | Description |
|-----|-------|-------------|
| `normal speaking` | 101 | Neutral, unremarkable delivery |
| `natural speaking` | 71 | Natural-sounding speech |
| `crying` | 48 | Emotional, tearful delivery |
| `narration style delivery` | 46 | Professional narrator tone |
| `screaming` | 31 | High-energy screaming |
| `high-energy delivery` | 20 | Energetic, animated speech |
| `strained delivery` | 19 | Vocally strained |
| `soft speaking` | 14 | Gentle, quiet delivery |
| `shouting` | 12 | Loud projected speech |
| `slow deliberate delivery` | 12 | Measured, intentional pacing |
| `ranting style delivery` | 9 | Agitated, rant-like speech |
| `out-of-breath delivery` | 9 | Breathless speech |
| `whispering` | 6 | Whispered delivery |
| `pleading tone` | 6 | Pleading, imploring |
| `sad speaking` | 6 | Sad emotional delivery |
| `laughing while speaking` | 5 | Speech mixed with laughter |
| `gasping delivery` | 5 | Gasping or breathless |
| `angry shouting` | 5 | Angry, aggressive shouting |
| `giggling delivery` | 4 | Giggly speech |
| `sing-speaking` | 3 | Semi-melodic delivery |

### Rare & Specialized Tags

The model also produces less common but descriptive tags:
- **Whisper/ASMR**: `whisper-talk style`, `ASMR style`, `whispery voice`, `ASMR whisper-delivery`
- **Performance**: `storytelling style`, `monologue style`, `formal style`, `newsreader style`, `authoritative style`
- **Vocal effort**: `projected voice`, `tense voice`, `slightly tense voice`
- **Extreme states**: `out-of-breath delivery`, `fatigued delivery`, `gasping delivery`, `sighing delivery`

## Examples

### Example 1: Calm Narration
```
Suitable for Work, natural speaking, fluent, narrator style delivery, modal voice,
neutral airflow, normal loudness, monotone, precise articulation, slow deliberate delivery
```
*A clean, professional narrator voice — fluent delivery with precise articulation, balanced loudness, and monotone intonation typical of audiobook or documentary narration.*

### Example 2: Emotional Crying
```
Suitable for Work, natural-genuine, halting speech, casual speaking style, rough voice,
breathy, quiet, falling intonation, slightly imprecise articulation, crying
```
*An emotionally charged voice with halting, hesitant speech — quiet and breathy with falling pitch and rough voice quality, characteristic of genuine crying or deep distress.*

### Example 3: High-Energy Screaming
```
Suitable for Work, natural pop, fluent, dramatic style, strained voice,
pressed voice, very loud, dynamic, precise articulation, screaming
```
*A loud, high-energy voice with pressed phonation and dramatic style — the kind of intense screaming you might hear in animated entertainment or dramatic performance.*

### Example 4: ASMR / Whisper
```
Suitable for Work, natural-Sounding, fluent, ASMR style, breathy voice,
breathy, whispered, monotone, neutral articulation, whispering
```
*A soft, intimate ASMR-style whisper with breathy voice quality, monotone intonation, and very quiet delivery — characteristic of ASMR content or intimate speech.*

### Example 5: Ranting / Agitated Speech
```
Suitable for Work, natural-Suitable for Work, fluent, ranting style, strained voice,
pressed voice, very loud, dynamic, precise articulation, screaming
```
*Agitated, high-intensity speech with ranting style, strained phonation, and very loud delivery — characteristic of passionate arguing or emotional outbursts.*

### Example 6: Casual Conversation
```
Suitable for Work, natural speaking, fluent, casual speaking style, modal voice,
neutral airflow, normal loudness, slightly dynamic, precise articulation, normal speaking
```
*A typical conversational voice — relaxed, fluent, with balanced loudness and natural modal phonation. This is the most common pattern in everyday speech.*

## Coverage Analysis (570 Samples)

Detection rates for specific voice characteristics across 570 diverse samples:

| Voice Characteristic | Samples Detected | Detection Rate |
|---------------------|-----------------|----------------|
| Screaming / shouting | 48 | 8.4% |
| Crying | 48 | 8.4% |
| Ranting | 53 | 9.3% |
| Disfluent / halting speech | 58 | 10.2% |
| Narration style | 67 | 11.8% |
| Whisper | 7 | 1.2% |
| ASMR | 3 | 0.5% |
| Pleading | 6 | 1.1% |
| Not Suitable for Work | 16 | 2.8% |

> These rates reflect the distribution of input samples, not the model's intrinsic sensitivity. The model reliably distinguishes these categories when presented with appropriate audio.

## Model Details

| Property | Value |
|----------|-------|
| **Architecture** | Whisper Small (encoder-decoder) |
| **Parameters** | ~242M |
| **Base model** | [laion/BUD-E-Whisper](https://huggingface.co/laion/BUD-E-Whisper) |
| **Training** | 20 epochs, 760 steps |
| **Final loss** | 0.018 |
| **Input** | 30s mel spectrogram (80 bins, 16kHz audio) |
| **Output** | Comma-separated voice attribute tags |
| **Max output tokens** | 448 |
| **Encoder** | 12 layers, 768 dim, 12 heads |
| **Decoder** | 12 layers, 768 dim, 12 heads |
| **Vocabulary size** | ~194 unique tags observed |
| **Avg output tags** | 9.0 per sample |

### Architecture Notes

This is a full encoder-decoder Whisper model. The **encoder** maps audio to rich voice representations (also usable standalone for embedding extraction — see [Voice-Taxonomy-57](https://huggingface.co/laion/Voice-Taxonomy-57)), while the **decoder** generates the tag sequence auto-regressively.

The model uses the standard Whisper tokenizer and generation config. Audio is processed as 30-second chunks of 80-bin log-mel spectrograms at 16kHz.

## Encoder-Only Usage

The encoder of this model also produces high-quality voice embeddings for downstream tasks. It is used as one of the whisper encoders in the [Voice-Taxonomy-57](https://huggingface.co/laion/Voice-Taxonomy-57) pipeline for 57-dimension voice classification:

```python
from transformers import WhisperModel, WhisperFeatureExtractor

model = WhisperModel.from_pretrained("laion/voice-tagging-whisper", torch_dtype=torch.float16)
encoder = model.encoder.to("cuda").eval()
fe = WhisperFeatureExtractor.from_pretrained("openai/whisper-small")

inputs = fe(waveform, sampling_rate=16000, return_tensors="pt")
with torch.no_grad():
    hidden_states = encoder(inputs.input_features.cuda().half()).last_hidden_state
    # hidden_states shape: (batch, 1500, 768)
```

## Related Models

- [laion/BUD-E-Whisper](https://huggingface.co/laion/BUD-E-Whisper) — Base model (V1.0)
- [laion/BUD-E-Whisper_V1.1](https://huggingface.co/laion/BUD-E-Whisper_V1.1) — V1.1 variant
- [laion/BUD-E-Whisper_V1.2](https://huggingface.co/laion/BUD-E-Whisper_V1.2) — V1.2 variant
- [laion/timbre-whisper](https://huggingface.co/laion/timbre-whisper) — Timbre-focused variant
- [laion/Voice-Taxonomy-57](https://huggingface.co/laion/Voice-Taxonomy-57) — 57-dimension voice taxonomy classifier using these encoders

## License

Apache 2.0
