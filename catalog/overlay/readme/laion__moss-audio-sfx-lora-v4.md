# MOSS-Audio SFX LoRA v4

LoRA adapter for **sound event detection** with timestamps, fine-tuned on top of [OpenMOSS-Team/MOSS-Audio-8B-Instruct](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Instruct).

Given an audio file, the model predicts a JSON list of sound events with `start_time`, `end_time`, and `caption`.

## Model Details

| Parameter | Value |
|-----------|-------|
| **Base model** | `OpenMOSS-Team/MOSS-Audio-8B-Instruct` |
| **LoRA rank** | 128 |
| **LoRA alpha** | 256 |
| **Target modules** | All LM linear layers (q/k/v/o/up/gate/down_proj) |
| **Training samples** | 10,998 unique soundscapes |
| **Epochs** | 2 |
| **Best checkpoint** | Step 2750 (epoch 2) |
| **Eval loss** | 2.76 |
| **Adapter size** | 667 MB |
| **Training hardware** | 8x A100 80GB (DeepSpeed ZeRO-2) |
| **PEFT version** | 0.18.0 |

## Training Data

Trained on [laion/in-the-wild-soundscapes-gemini2.5-pro](https://huggingface.co/datasets/laion/in-the-wild-soundscapes-gemini2.5-pro) — 10,998 real-world soundscape recordings annotated by Gemini 2.5 Pro with timestamped sound event captions.

Each training sample consists of:
- **Audio**: Real-world soundscape (resampled to 16 kHz)
- **Prompt**: `"Please describe all audio events in this audio together with start time, end time, and caption for {medium/short} segments that are {overlapping/not overlapping}."`
- **Target**: JSON array of `{"caption": "...", "start_time": float, "end_time": float}`

## Quick Start

### Inference

```python
import torch
from peft import PeftModel

# You need the MOSS-Audio source code:
# git clone https://github.com/OpenMOSS/MOSS-Audio
import sys; sys.path.insert(0, "MOSS-Audio")
from src.modeling_moss_audio import MossAudioModel
from src.processing_moss_audio import MossAudioProcessor
from src.audio_io import load_audio

BASE_MODEL = "OpenMOSS-Team/MOSS-Audio-8B-Instruct"
LORA_REPO = "laion/moss-audio-sfx-lora-v4"

# Load base model + LoRA
processor = MossAudioProcessor.from_pretrained(BASE_MODEL, trust_remote_code=True)
model = MossAudioModel.from_pretrained(
    BASE_MODEL, trust_remote_code=True,
    dtype=torch.bfloat16, device_map="cuda:0",
)
model = PeftModel.from_pretrained(model, LORA_REPO)
model = model.merge_and_unload()
model.eval()

# Run inference
prompt = "Please describe all audio events in this audio together with start time, end time, and caption for medium segments that are overlapping."
audio = load_audio("your_audio.wav", sample_rate=processor.config.mel_sr)

inputs = processor(text=prompt, audios=[audio], return_tensors="pt").to("cuda:0")
if inputs.get("audio_data") is not None:
    inputs["audio_data"] = inputs["audio_data"].to(torch.bfloat16)
inputs["audio_input_mask"] = inputs["input_ids"] == processor.audio_token_id

with torch.no_grad():
    gen = model.generate(**inputs, max_new_tokens=4096, do_sample=False, use_cache=True)

output = processor.decode(gen[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True)
print(output)
```

### Example Output

```json
[
  {"caption": "Birds chirping and singing in a forest setting", "start_time": 0.0, "end_time": 8.5},
  {"caption": "Wind rustling through leaves and branches", "start_time": 2.3, "end_time": 12.0},
  {"caption": "A dog barking twice in the distance", "start_time": 6.1, "end_time": 7.8},
  {"caption": "Car engine passing on a nearby road", "start_time": 9.0, "end_time": 13.2}
]
```

### Prompt Variants

The model supports 4 prompt configurations via `{segment_duration}` and `{overlapping}`:

| Configuration | Typical Output |
|--------------|----------------|
| `medium`, `overlapping` | 6-10 events, broader windows, recommended for downstream use |
| `medium`, `not overlapping` | 5-8 events, non-overlapping windows |
| `short`, `overlapping` | 10-15 events, fine-grained |
| `short`, `not overlapping` | 8-12 events, non-overlapping |

**Recommended**: `medium` + `overlapping` — produces broader predictions that a downstream model (e.g., MOSS-Audio-8B-Thinking) can refine into specific events.

## Training

See `train.py` in this repository for the full training script. Key command:

```bash
accelerate launch \
    --num_processes 8 \
    --use_deepspeed \
    --deepspeed_config_file ds_config_zero2.json \
    train.py \
    --model_dir OpenMOSS-Team/MOSS-Audio-8B-Instruct \
    --data_path soundscapes_train/train.jsonl \
    --output_dir ./lora_output \
    --use_lora True \
    --lora_rank 128 \
    --lora_alpha 256 \
    --num_train_epochs 2 \
    --per_device_train_batch_size 1 \
    --gradient_accumulation_steps 1 \
    --learning_rate 5e-5 \
    --lr_scheduler_type cosine \
    --warmup_ratio 0.05 \
    --bf16 True \
    --gradient_checkpointing True \
    --max_len 8192
```

### Training Hyperparameters

| Parameter | Value |
|-----------|-------|
| Learning rate | 5e-5 |
| Scheduler | Cosine |
| Warmup | 5% of steps |
| Weight decay | 0.01 |
| Batch size | 1 per device |
| Grad accumulation | 1 |
| Precision | bf16 |
| Max sequence length | 8192 tokens |
| DeepSpeed | ZeRO-2 |

## Version History

| Version | Rank | Data | Eval Loss | Notes |
|---------|------|------|-----------|-------|
| v1 | 64 | 5K samples | 3.4 | Initial experiment |
| v2 | 64 | 8K samples | 3.1 | More data |
| v3 | 64 | 10K samples | 2.9 | Full dataset |
| **v4** | **128** | **10,998 samples** | **2.76** | **Best: higher rank** |
| v5 | 128 | 22K mixed | 5.53 | Mixed LAION+Gemini data, regression |

## Use in the Universal Audio Annotation Pipeline

This LoRA adapter is a component of the [Universal Audio Annotation Pipeline](https://github.com/LAION-AI/univeral-audio-annotation-pipeline). In the full pipeline:

1. Three ASR systems transcribe speech (VibeVoice, Parakeet, Qwen3)
2. Whisper experts analyze voice attributes (emotion, timbre, style)
3. **This LoRA model detects sound events** (SFX, music, ambient sounds)
4. MOSS-Audio-8B-Thinking combines all upstream context into structured annotations

## Citation

```bibtex
@misc{moss-audio-sfx-lora-v4,
  title={MOSS-Audio SFX LoRA v4: Sound Event Detection Adapter},
  author={LAION},
  year={2025},
  url={https://huggingface.co/laion/moss-audio-sfx-lora-v4},
}
```

## License

Apache 2.0
