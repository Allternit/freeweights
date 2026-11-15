# Timbre-Whisper

**Timbre-Whisper** is a Whisper-based model fine-tuned for **vocal timbre tagging and natural-language voice description**. It builds directly on **[BUD-E Whisper V1.1](https://huggingface.co/laion/BUD-E-Whisper_V1.1)**, extending its emotional speech captioning capabilities toward detailed perceptual descriptions of voice quality.

The model generates:
1. **Structured timbre tags** describing vocal characteristics (e.g. pitch range, brightness, breathiness, roughness, resonance, vocal weight, wear, stability).
2. **Short natural-language summaries** that contextualize these tags in fluent English.

Architecturally, Timbre-Whisper remains a fine-tuned variant of **OpenAI Whisper (Small)**, retaining robust speech-to-text performance while shifting the output space toward expressive timbre-focused captioning.

## Intended Use
- Voice and timbre analysis  
- Voice acting and casting datasets  
- Expressive speech research  
- Timbre-aware annotation and retrieval pipelines  

## Examples

**Example 1**
```

female_soprano, slightly_harsh, bright_shiny, mild_breathy, slight_nasal_touch, slightly_tense, slight_roughness, head_mixed, slightly_thin, mild_wear, mostly_natural, slight_wobble,
Remarkable female voice, likely a young adult, with a high-pitched, bright, and shiny timbre. The voice exhibits slight harshness, mild breathiness, and a touch of nasality, with a slightly tense production. There is slight roughness and a head-mixed resonance, contributing to a slightly thin vocal weight. The vocal health shows mild wear, and while mostly natural, there is a slight wobble in stability.

```

**Example 2**
```

male_baritone, slightly_harsh, moderately_bright_clear, slightly_breathy, slight_nasal_touch, tense_pressed, slight_roughness, chest_mixed, moderately_heavy, noticeable_wear, perfectly_natural, slight_wobble,
Harsh middle-aged adult male voice with medium-pitched delivery, exhibiting slight breathiness and a touch of nasality. The voice is slightly harsh and tense, with a hint of roughness. The resonance is chest-mixed, and the vocal weight is moderately heavy. There is noticeable wear, but the voice sounds perfectly natural with a slight wobble.

```

## License
CC-BY-4.0  
Please give attribution to **Christopher Schumann** & **Maurice Kraus**.

## Base Model
https://huggingface.co/laion/BUD-E-Whisper_V1.1  

## Fine-tuned Model
https://huggingface.co/laion/timbre-whisper