# Perception Encoder Audio Frame (PE-A-Frame)

PE-A-Frame is a state-of-the-art audio-text embedding model.  For text, the model produces a single embedding.  For audio, it produces a sequence of embeddings (onen for every 40ms of audio).  These embeddings can then be used for audio event localization.  For convienience, model outputs temporal spans (start and end timestamps) indicating when that event (freeform audio description) occurs in the audio.

## Model Description

PE-A-Frame uses contrastive learning to align frame-level audio representations with text descriptions. The model can identify precise time ranges when described audio events occur

## Model Variants

We release multiple model checkpoints with varying sizes:

| Model | Parameters |
|-------|------------|
| [`pe-a-frame-small`](https://huggingface.co/facebook/pe-a-frame-small) | 450M |
| [`pe-a-frame-base`](https://huggingface.co/facebook/pe-a-frame-base) | 560M |
| [`pe-a-frame-large`](https://huggingface.co/facebook/pe-a-frame-large) | 1.4B |

## Quick Start

### Basic Usage: Audio Event Localization

```python
import torch
from core.audio_visual_encoder import PEAudioFrame, PEAudioFrameTransform

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model and transform
model = PEAudioFrame.from_config("pe-a-frame-large", pretrained=True).to(device)
transform = PEAudioFrameTransform.from_config("pe-a-frame-large")

# Define audio file and event descriptions
audio_file = "office_conversation.wav"
descriptions = ["a person talking", "keyboard typing", "phone ringing"]

# Process inputs
inputs = transform(audio=[audio_file], text=descriptions).to(device)

# Run inference
with torch.inference_mode():
    outputs = model(**inputs, return_spans=True)

# Print detected time spans for each event
for description, spans in zip(descriptions, outputs.spans):
    if spans:
        span_str = ", ".join([f"({start:.2f}s, {end:.2f}s)" for start, end in spans])
        print(f'"{description}": [{span_str}]')
    else:
        print(f'"{description}": No events detected')
```

**Example Output:**
```
"a person talking": [(2.34s, 5.67s), (8.90s, 12.45s)]
"keyboard typing": [(1.20s, 3.40s), (6.78s, 9.12s)]
"phone ringing": No events detected
```

### Batch Processing Multiple Audio Files

```python
import torch
from core.audio_visual_encoder import PEAudioFrame, PEAudioFrameTransform

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = PEAudioFrame.from_config("pe-a-frame-large", pretrained=True).to(device)
transform = PEAudioFrameTransform.from_config("pe-a-frame-large")

# Process multiple audio files with different descriptions
audio_files = ["meeting.wav", "street.wav", "kitchen.wav"]
descriptions = [
    "people discussing in a meeting",
    "cars passing by",
    "water running from a faucet"
]

inputs = transform(audio=audio_files, text=descriptions).to(device)

with torch.inference_mode():
    outputs = model(**inputs, return_spans=True)

# Each audio-text pair gets its own span predictions
for audio, description, spans in zip(audio_files, descriptions, outputs.spans):
    if spans:
        span_str = ", ".join([f"({start:.2f}s, {end:.2f}s)" for start, end in spans])
        print(f'"{description}": [{span_str}] in {audio}')
    else:
        print(f'"{description}": No events detected in {audio}')
```

### Adjusting Detection Threshold

The `threshold` parameter controls sensitivity for event detection. Lower values detect more events (higher recall), while higher values are more selective (higher precision):

```python
# High sensitivity - detect more events (may include false positives)
outputs_sensitive = model(**inputs, threshold=0.2)
```

### Extracting Embeddings Without Spans

If you only need embeddings without temporal localization:

```python
inputs = transform(audio=[audio_file], text=descriptions).to(device)

with torch.inference_mode():
    outputs = model(**inputs, return_spans=False)

# Access embeddings
audio_embeds = outputs.audio_embeds  # Shape: [batch_size, num_frames, embed_dim]
text_embeds = outputs.text_embeds    # Shape: [batch_size, embed_dim]

# Compute similarity between audio frames and text
# audio_embeds is frame-level, so you can see which frames match the description
similarities = torch.einsum("btd,bd->bt", audio_embeds, text_embeds)
# similarities shape: [batch_size, num_frames]
```


### Usage with 🤗 Transformers

```python
model = PeAudioFrameLevelModel.from_pretrained("facebook/pe-a-frame-large")
processor = PeAudioProcessor.from_pretrained("facebook/pe-a-frame-large")

inputs = transform(audio=[audio_file], text=descriptions, return_tensors="pt").to(device)

with torch.inference_mode():
    outputs = model(**inputs)

# Access embeddings
audio_embeds = outputs.audio_embeds  # Shape: [batch_size, num_frames, embed_dim]
text_embeds = outputs.text_audio_embeds    # Shape: [batch_size, embed_dim]

# Compute similarity between audio frames and text
# audio_embeds is frame-level, so you can see which frames match the description
similarities = torch.einsum("btd,bd->bt", audio_embeds, text_embeds)
# similarities shape: [batch_size, num_frames]
```

## Citation

```bibtex
@misc{vyas2025pushingfrontieraudiovisualperception,
      title={Pushing the Frontier of Audiovisual Perception with Large-Scale Multimodal Correspondence Learning},
      author={Apoorv Vyas and Heng-Jui Chang and Cheng-Fu Yang and Po-Yao Huang and Luya Gao and Julius Richter and Sanyuan Chen and Matt Le and Piotr Dollár and Christoph Feichtenhofer and Ann Lee and Wei-Ning Hsu},
      year={2025},
      eprint={2512.19687},
      archivePrefix={arXiv},
      primaryClass={cs.SD},
      url={https://arxiv.org/abs/2512.19687},
}
```

## License

This model is released under the Apache 2.0 license.
