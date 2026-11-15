## VibeVoice-ASR (Transformers-compatible version)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/microsoft/VibeVoice)
[![Deploy on Foundry](https://img.shields.io/badge/Deploy-on_Foundry-blue?logo=microsoft)](https://huggingface.co/docs/microsoft-azure/foundry/guides/vibevoice-asr)
[![Live Playground](https://img.shields.io/badge/Live-Playground-green?logo=gradio)](https://aka.ms/vibevoice-asr)
[![Technical Report](https://img.shields.io/badge/arXiv-2601.18184-b31b1b?logo=arxiv)](https://arxiv.org/pdf/2601.18184)

**VibeVoice-ASR** is a unified speech-to-text model designed to handle **60-minute long-form audio** in a single pass, generating structured transcriptions containing **Who (Speaker), When (Timestamps), and What (Content)**, with support for **Customized Hotwords** and over **50 languages**.

➡️ **Demo:** [VibeVoice-ASR-Demo](https://aka.ms/vibevoice-asr)<br>
➡️ **Report:** [VibeVoice-ASR Technical Report](https://arxiv.org/pdf/2601.18184)<br>

<p align="left">
  <img src="figures/VibeVoice_ASR_archi.png" alt="VibeVoice-ASR Architecture" height="250px">
</p>


## 🔥 Key Features


- **🕒 60-minute Single-Pass Processing**:
  Unlike conventional ASR models that slice audio into short chunks (often losing global context), VibeVoice ASR accepts up to **60 minutes** of continuous audio input within 64K token length. This ensures consistent speaker tracking and semantic coherence across the entire hour.

- **👤 Customized Hotwords**:
  Users can provide customized hotwords (e.g., specific names, technical terms, or background info) to guide the recognition process, significantly improving accuracy on domain-specific content.

- **📝 Rich Transcription (Who, When, What)**:
  The model jointly performs ASR, diarization, and timestamping, producing a structured output that indicates *who* said *what* and *when*.
  
- **🌍 Multilingual & Code-Switching Support**:
  It supports over 50 languages, requires no explicit language setting, and natively handles code-switching within and across utterances. Language distribution can be found [here](#language-distribution).


## Usage

### Setup

VibeVoice-ASR is available as of v5.3.0 of Transformers!

```
pip install "transformers>=5.3.0"
```

### Loading model

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id)
```

### Speaker-timestamped transcription

A notable feature of VibeVoice ASR is its ability to transcribe multi-speaker content, denoting who spoke and when.

The example below transcribes the following audio.

<audio controls>
  <source src="https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav" type="audio/wav">
</audio>

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")
print(f"Model loaded on {model.device} with dtype {model.dtype}")

# Prepare inputs using `apply_transcription_request`
inputs = processor.apply_transcription_request(
    audio="https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav",
).to(model.device, model.dtype)

# Apply model
output_ids = model.generate(**inputs)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids)[0]
print("\n" + "=" * 60)
print("RAW OUTPUT")
print("=" * 60)
print(transcription)

transcription = processor.decode(generated_ids, return_format="parsed")[0]
print("\n" + "=" * 60)
print("TRANSCRIPTION (list of dicts)")
print("=" * 60)
for speaker_transcription in transcription:
    print(speaker_transcription)

# Remove speaker labels, only get raw transcription
transcription = processor.decode(generated_ids, return_format="transcription_only")[0]
print("\n" + "=" * 60)
print("TRANSCRIPTION ONLY")
print("=" * 60)
print(transcription)

"""
============================================================
RAW OUTPUT
============================================================
<|im_start|>assistant
[{"Start":0,"End":15.43,"Speaker":0,"Content":"Hello everyone and welcome to the Vibe Voice podcast. I'm your host, Alex, and today we're getting into one of the biggest debates in all of sports: who's the greatest basketball player of all time? I'm so excited to have Sam here to talk about it with me."},{"Start":15.43,"End":21.05,"Speaker":1,"Content":"Thanks so much for having me, Alex. And you're absolutely right. This question always brings out some seriously strong feelings."},{"Start":21.05,"End":31.66,"Speaker":0,"Content":"Okay, so let's get right into it. For me, it has to be Michael Jordan. Six trips to the finals, six championships. That kind of perfection is just incredible."},{"Start":31.66,"End":40.93,"Speaker":1,"Content":"Oh man, the first thing that always pops into my head is that shot against the Cleveland Cavaliers back in '89. Jordan just rises, hangs in the air forever, and just sinks it."}]<|im_end|>
<|endoftext|>

============================================================
TRANSCRIPTION (list of dicts)
============================================================
{'Start': 0, 'End': 15.43, 'Speaker': 0, 'Content': "Hello everyone and welcome to the Vibe Voice podcast. I'm your host, Alex, and today we're getting into one of the biggest debates in all of sports: who's the greatest basketball player of all time? I'm so excited to have Sam here to talk about it with me."}
{'Start': 15.43, 'End': 21.05, 'Speaker': 1, 'Content': "Thanks so much for having me, Alex. And you're absolutely right. This question always brings out some seriously strong feelings."}
{'Start': 21.05, 'End': 31.66, 'Speaker': 0, 'Content': "Okay, so let's get right into it. For me, it has to be Michael Jordan. Six trips to the finals, six championships. That kind of perfection is just incredible."}
{'Start': 31.66, 'End': 40.93, 'Speaker': 1, 'Content': "Oh man, the first thing that always pops into my head is that shot against the Cleveland Cavaliers back in '89. Jordan just rises, hangs in the air forever, and just sinks it."}

============================================================
TRANSCRIPTION ONLY
============================================================
Hello everyone and welcome to the Vibe Voice podcast. I'm your host, Alex, and today we're getting into one of the biggest debates in all of sports: who's the greatest basketball player of all time? I'm so excited to have Sam here to talk about it with me. Thanks so much for having me, Alex. And you're absolutely right. This question always brings out some seriously strong feelings. Okay, so let's get right into it. For me, it has to be Michael Jordan. Six trips to the finals, six championships. That kind of perfection is just incredible. Oh man, the first thing that always pops into my head is that shot against the Cleveland Cavaliers back in '89. Jordan just rises, hangs in the air forever, and just sinks it.
"""
```

The VibeVoice ASR model is trained to generate a string that resembles a JSON structure. The flag `return_format="parsed"` tries to return the generated output as a list of dicts, while `return_format="transcription_only"` tries to extract only the transcribed audio. If they fail, the generated output is returned as-is.

### Providing context

It is also possible to provide context. This can be useful if certain words cannot be transcribed correctly, such as proper nouns.

Below we transcribe an audio where the speaker (with a German accent) talks about VibeVoice, comparing with and without the context "About VibeVoice".

<audio controls>
  <source src="https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav" type="audio/wav">
</audio>

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")
print(f"Model loaded on {model.device} with dtype {model.dtype}")

# Without context
inputs = processor.apply_transcription_request(
    audio="https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
).to(model.device, model.dtype)
output_ids = model.generate(**inputs)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids, return_format="transcription_only")[0]
print(f"WITHOUT CONTEXT: {transcription}")

# With context
inputs = processor.apply_transcription_request(
    audio="https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
    prompt="About VibeVoice",
).to(model.device, model.dtype)
output_ids = model.generate(**inputs)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids, return_format="transcription_only")[0]
print(f"WITH CONTEXT   : {transcription}")

"""
WITHOUT CONTEXT: Revevoices is a novel framework designed for generating expressive, long-form, multi-speaker conversational audio.
WITH CONTEXT   : VibeVoice is this novel framework designed for generating expressive, long-form, multi-speaker, conversational audio.
"""
```


### Batch inference

Batch inference is possible by passing a list of audio and (if provided) a list of prompts of equal length.

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
audio = [
    "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
    "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav"
]
prompts = ["About VibeVoice", None]

processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")
print(f"Model loaded on {model.device} with dtype {model.dtype}")

inputs = processor.apply_transcription_request(audio, prompt=prompts).to(model.device, model.dtype)
output_ids = model.generate(**inputs)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids, return_format="transcription_only")

print(transcription)
```

### Adjusting tokenizer chunk (e.g. if out-of-memory)

A key feature of VibeVoice ASR is that it can transcribe up to 60 minutes of continuous audio. This is done by chunking audio into 60-second segments (1440000 samples at 24kHz) and caching the convolution states between each segment.

However, if chunks of 60 seconds are too large for your device, the `tokenizer_chunk_size` argument passed to `generate` can be adjusted. *Note it should be a multiple of the hop length (3200 for the original acoustic tokenizer).*

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

tokenizer_chunk_size = 64000    # default is 1440000 (60s @ 24kHz)
model_id = "microsoft/VibeVoice-ASR-HF"
audio = [
    "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
    "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav"
]
prompts = ["About VibeVoice", None]

processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")
print(f"Model loaded on {model.device} with dtype {model.dtype}")

inputs = processor.apply_transcription_request(audio, prompt=prompts).to(model.device, model.dtype)
output_ids = model.generate(**inputs, tokenizer_chunk_size=tokenizer_chunk_size)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids, return_format="transcription_only")
print(transcription)
```

### Chat template

VibeVoice ASR also accepts chat template inputs (`apply_transcription_request` is actually a wrapper for `apply_chat_template` for convenience):
```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")

chat_template = [
    [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "About VibeVoice"},
                {
                    "type": "audio",
                    "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
                },
            ],
        }
    ],
    [
        {
            "role": "user",
            "content": [
                {
                    "type": "audio",
                    "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav",
                },
            ],
        }
    ],
]

inputs = processor.apply_chat_template(
    chat_template,
    tokenize=True,
    return_dict=True,
).to(model.device, model.dtype)

output_ids = model.generate(**inputs)
generated_ids = output_ids[:, inputs["input_ids"].shape[1] :]
transcription = processor.decode(generated_ids, return_format="transcription_only")
print(transcription)
```

### Training

VibeVoice ASR can be trained with the loss outputted by the model.

```python
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, device_map="auto")
model.train()

# Prepare batch of 2
# -- NOTE: the original model is trained to output transcription, speaker ID, and timestamps in JSON-like format. Below we are only using the transcription text as the label
chat_template = [
    [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "VibeVoice is this novel framework designed for generating expressive, long-form, multi-speaker, conversational audio."},
                {
                    "type": "audio",
                    "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
                },
            ],
        }
    ],
    [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Hello everyone and welcome to the VibeVoice podcast. I'm your host, Alex, and today we're getting into one of the biggest debates in all of sports: who's the greatest basketball player of all time? I'm so excited to have Sam here to talk about it with me. Thanks so much for having me, Alex. And you're absolutely right. This question always brings out some seriously strong feelings. Okay, so let's get right into it. For me, it has to be Michael Jordan. Six trips to the finals, six championships. That kind of perfection is just incredible. Oh man, the first thing that always pops into my head is that shot against the Cleveland Cavaliers back in '89. Jordan just rises, hangs in the air forever, and just sinks it."},
                {
                    "type": "audio",
                    "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/example_output/VibeVoice-1.5B_output.wav",
                },
            ],
        }
    ],
]
inputs = processor.apply_chat_template(
    chat_template,
    tokenize=True,
    return_dict=True,
    output_labels=True,
).to(model.device, model.dtype)

loss = model(**inputs).loss
print("Loss:", loss.item())
loss.backward()
```

### Torch compile

The model can be compiled for faster inference/training.
```python
import time
import torch
from transformers import AutoProcessor, VibeVoiceAsrForConditionalGeneration

model_id = "microsoft/VibeVoice-ASR-HF"

num_warmup = 5
num_runs = 20

# Load processor + model
processor = AutoProcessor.from_pretrained(model_id)
model = VibeVoiceAsrForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.bfloat16,).to("cuda")

# Prepare static inputs
chat_template = [
    [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "VibeVoice is this novel framework designed for generating expressive, long-form, multi-speaker, conversational audio.",
                },
                {
                    "type": "audio",
                    "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
                },
            ],
        }
    ],
] * 4  # batch size 4
inputs = processor.apply_chat_template(
    chat_template,
    tokenize=True,
    return_dict=True,
).to("cuda", torch.bfloat16)

# Benchmark without compile
print("Warming up without compile...")
with torch.no_grad():
    for _ in range(num_warmup):
        _ = model(**inputs)

torch.cuda.synchronize()

print("\nBenchmarking without torch.compile...")
torch.cuda.synchronize()
start = time.time()
with torch.no_grad():
    for _ in range(num_runs):
        _ = model(**inputs)
torch.cuda.synchronize()
no_compile_time = (time.time() - start) / num_runs
print(f"Average time without compile: {no_compile_time:.4f}s")

# Benchmark with compile
print("\nCompiling model...")
model = torch.compile(model)

print("Warming up with compile (includes graph capture)...")
with torch.no_grad():
    for _ in range(num_warmup):
        _ = model(**inputs)

torch.cuda.synchronize()

print("\nBenchmarking with torch.compile...")
torch.cuda.synchronize()
start = time.time()
with torch.no_grad():
    for _ in range(num_runs):
        _ = model(**inputs)
torch.cuda.synchronize()
compile_time = (time.time() - start) / num_runs
print(f"Average time with compile: {compile_time:.4f}s")

speedup = no_compile_time / compile_time
print(f"\nSpeedup: {speedup:.2f}x")
```

### Pipeline usage

The model can be used as a pipeline, but you will have to define your own methods for parsing the raw output.

```python
from transformers import pipeline

model_id = "microsoft/VibeVoice-ASR-HF"
pipe = pipeline("any-to-any", model=model_id, device_map="auto")
chat_template = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "About VibeVoice"},
            {
                "type": "audio",
                "path": "https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav",
            },
        ],
    }
]
outputs = pipe(text=chat_template, return_full_text=False)

print("\n" + "=" * 60)
print("RAW PIPELINE OUTPUT")
print("=" * 60)
print(outputs)

"""
============================================================
RAW PIPELINE OUTPUT
============================================================
[{'input_text': [{'role': 'user', 'content': [{'type': 'text', 'text': 'About VibeVoice'}, {'type': 'audio', 'path': 'https://huggingface.co/datasets/bezzam/vibevoice_samples/resolve/main/realtime_model/vibevoice_tts_german.wav'}]}], 'generated_text': 'assistant\n[{"Start":0.0,"End":7.56,"Speaker":0,"Content":"VibeVoice is this novel framework designed for generating expressive, long-form, multi-speaker conversational audio."}]\n'}]
"""
```

## Evaluation

Below are results from the [technical report](https://arxiv.org/pdf/2601.18184).

<p align="center">
  <img src="figures/DER.jpg" alt="DER" width="70%">
  <img src="figures/cpWER.jpg" alt="cpWER" width="70%">
  <img src="figures/tcpWER.jpg" alt="tcpWER" width="70%">
</p>


### Open ASR Leaderboard

On the [Open ASR leaderboard](https://huggingface.co/spaces/hf-audio/open_asr_leaderboard), the following results were obtained:

| Dataset                | WER (%)  |
| ---------------------- | -------- |
| ami_test               | 17.20    |
| earnings22_test        | 13.17    |
| gigaspeech_test        | 9.67     |
| librispeech_test.clean | 2.20     |
| librispeech_test.other | 5.51     |
| spgispeech_test        | 3.80     |
| tedlium_test           | 2.57     |
| voxpopuli_test         | 8.01     |
| **Average**            | **7.77** |
| **RTFx**               | **51.80** |

## Language Distribution
<p align="center">
  <img src="figures/language_distribution_horizontal.png" alt="Language Distribution" width="80%">
</p>


## License
This project is licensed under the MIT License.

## Contact
This project was conducted by members of Microsoft Research. We welcome feedback and collaboration from our audience. If you have suggestions, questions, or observe unexpected/offensive behavior in our technology, please contact us at VibeVoice@microsoft.com.
If the team receives reports of undesired behavior or identifies issues independently, we will update this repository with appropriate mitigations.