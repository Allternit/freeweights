# Perception Encoder Audio-Visual (PE-AV)

PE-AV is a state-of-the-art multimodal model that embeds audio, video, audio-video, and text into a joint embedding space. The model enables powerful cross-modal retrieval and understanding across audio, video, and text modalities.

## Model Description

PE-AV is trained using contrastive learning to align audio, video, and text representations in a shared embedding space. The model can encode:
- **Audio only**: Extract audio embeddings from audio waveforms
- **Video only**: Extract visual embeddings from video frames
- **Audio-Video**: Extract joint audio-visual embeddings
- **Text**: Extract text embeddings optimized for different modality pairs

## Model Variants

We release 6 model checkpoints with varying sizes and capabilities:

| Model | Avg Retrieval | Video Frames used |
|-------|---------------|-------------------|
| [`pe-av-small-16-frame`](https://huggingface.co/facebook/pe-av-small-16-frame) | 45.2 | 16 frames |
| [`pe-av-base-16-frame`](https://huggingface.co/facebook/pe-av-base-16-frame) | 47.0 | 16 frames |
| [`pe-av-large-16-frame`](https://huggingface.co/facebook/pe-av-large-16-frame) | 48.2 | 16 frames |
| [`pe-av-small`](https://huggingface.co/facebook/pe-av-small) | 48.1 | all frames |
| [`pe-av-base`](https://huggingface.co/facebook/pe-av-base) | 50.2 | all frames |
| [`pe-av-large`](https://huggingface.co/facebook/pe-av-large) | 51.6 | all frames |

The `-16-frame` variants sample exactly 16 frames (evenly spaced apart) from each video, while the base variants support variable-length videos.

## Quick Start

The model is available in both [`transformers`](https://github.com/huggingface/transformers/tree/main) as well as [`perception_models`](https://github.com/facebookresearch/perception_models/tree/main) libraries

## `perception_models` Usage

```python
import torch
from core.audio_visual_encoder import PEAudioVisual, PEAudioVisualTransform

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model and transform
model = PEAudioVisual.from_config("pe-av-large", pretrained=True).to(device)
transform = PEAudioVisualTransform.from_config("pe-av-large")

video_files = ["video1.mp4", "video2.mp4"]
descriptions = ["description1", "description2"]
audio_files = ["audio1.wav", "audio2.wav"]

# Process inputs and get embeddings
inputs = transform(videos=video_files, text=descriptions, audio=audio_files).to(device)

with torch.inference_mode(), torch.autocast(device.type, dtype=torch.bfloat16):
    outputs = model(**inputs)

# Access different embeddings
audio_embeds = outputs.audio_embeds  # Audio-only embeddings
visual_embeds = outputs.visual_embeds  # Video-only embeddings
audio_visual_embeds = outputs.audio_visual_embeds  # Joint audio-visual embeddings
audio_text_embeds = outputs.audio_text_embeds  # Text embeddings aligned to audio
visual_text_embeds = outputs.visual_text_embeds  # Text embeddings aligned to video
audio_visual_text_embeds = outputs.audio_visual_text_embeds  # Text embeddings aligned to audio-visual
audio_plus_text_embeds = outputs.audio_plus_text_embeds  # Joint audio and text embedding
visual_plus_text_embeds = outputs.visual_plus_text_embeds  # Joint video and text embedding

# Compute the dot product to get their similarities
audio_visual_similarity = audio_embeds @ visual_embeds.T
# When computing similarity against text embeddings, use the
# appropriate text embedding based on the other modality
audio_text_similarity = audio_embeds @ audio_text_embeds.T
video_text_similarity = visual_embeds @ visual_text_embeds.T
```

Note that you can omit any of the modalities, and use the same `forward` method.  The corresponding embeddings in `output` will be `None`.  For example:

```python
inputs = transform(videos=video_files, text=descriptions).to(device)

with torch.inference_mode(), torch.autocast(device.type, dtype=torch.bfloat16):
    outputs = model(**inputs)

audio_embeds = outputs.audio_embeds  # None
visual_embeds = outputs.visual_embeds  # available
audio_visual_embeds = outputs.audio_visual_embeds # None
audio_visual_text_embeds = outputs.audio_visual_text_embeds # None
audio_text_embeds = outputs.audio_text_embeds  # None
visual_text_embeds = outputs.visual_text_embeds  # available
audio_plus_text_embeds = outputs.audio_plus_text_embeds  # None
visual_plus_text_embeds = outputs.visual_plus_text_embeds  # Available
```

We also provide methods for directly encoding an individual modality:

```python
def encode_video_text(self, input_ids, attention_mask=None)
def encode_audio_text(self, input_ids, attention_mask=None)
def encode_audio_video_text(self, input_ids, attention_mask=None)
def encode_audio(self, input_values, padding_mask=None, input_features=None)
def encode_video(self, pixel_values_videos, padding_mask_videos=None, pe_features=None)
def encode_audio_video(
    self,
    input_values,
    pixel_values_videos,
    padding_mask=None,
    padding_mask_videos=None,
    pe_features=None,  # optionally re-use pre-computed PE features
    input_features=None,  # Optionally re-use pre-computed audio codec features
)
def encode_audio_plus_text(
    self,
    input_ids,
    input_values,
    attention_mask=None,
    padding_mask=None,
    input_features=None  # Optionally re-use pre-computed audio codec features
)
def encode_video_plus_text(
    self,
    input_ids,
    pixel_values_videos,
    attention_mask=None,
    padding_mask_videos=None,
    pe_features=None,  # optionally re-use pre-computed PE features
)
```

## `transformers` Usage

```python
from transformers import PeAudioVideoModel, PeAudioVideoProcessor
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = PeAudioVideoModel.from_pretrained("facebook/pe-av-large")
processor = PeAudioVideoProcessor.from_pretrained("facebook/pe-av-large")

model = model.to(device)

video_files = ["video1.mp4", "video2.mp4"]
descriptions = ["description1", "description2"]
audio_files = ["audio1.wav", "audio2.wav"]

# Process inputs and get embeddings
inputs = processor(
    videos=video_files, text=descriptions, audio=audio_files, return_tensors="pt", padding=True
)

with torch.inference_mode(), torch.autocast(device.type, dtype=torch.bfloat16):
    outputs = model(**inputs.to(device), return_loss=True)

audio_embeds = outputs.audio_embeds  # Audio-only embeddings
video_embeds = outputs.video_embeds  # Video-only embeddings
audio_video_embeds = outputs.audio_video_embeds  # Joint audio-video embeddings
text_audio_video_embeds = outputs.audio_video_text_embeds  # Text embeddings aligned to audio-video
text_audio_embeds = outputs.text_audio_embeds  # Text embeddings aligned to audio
text_video_embeds = outputs.text_video_embeds  # Text embeddings aligned to video
audio_plus_text_embeds = outputs.audio_plus_text_embeds  # Joint audio and text embedding
video_plus_text_embeds = outputs.video_plus_text_embeds  # Joint video and text embedding

# For classification, you can use the logits_* fields of the output
audio_text_preds = outputs.logits_audio_text.sigmoid()

# The overall loss is also available in the output (requires passing return_loss=True)
loss = outputs.loss

```

We also provide methods for directly encoding an individual modality:

```python
def get_text_audio_embeds(self, input_ids, attention_mask=None)

def get_text_video_embeds(self, input_ids, attention_mask=None)

def get_text_audio_video_embeds(self, input_ids, attention_mask=None)

def get_audio_embeds(self, input_values, padding_mask=None)

def get_video_embeds(self, pixel_values_videos, padding_mask_videos=None)

def get_audio_video_embeds(
    self,
    input_values: torch.Tensor,
    pixel_values_videos: torch.Tensor,
    padding_mask: Optional[torch.Tensor] = None,
    padding_mask_videos: Optional[torch.Tensor] = None,
    return_audio_embeds: bool = False,
    return_video_embeds: bool = False,
)

def get_audio_plus_text_embeds(
    self,
    input_ids: torch.Tensor,
    input_values: torch.Tensor,
    attention_mask: Optional[torch.Tensor] = None,
    padding_mask: Optional[torch.Tensor] = None,
)

def get_video_plus_text_embeds(
    self,
    input_ids: torch.Tensor,
    pixel_values_videos: torch.Tensor,
    attention_mask: Optional[torch.Tensor] = None,
    padding_mask_videos: Optional[torch.Tensor] = None,
)

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
