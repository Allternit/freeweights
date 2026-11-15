## KB-Whisper Tiny

The National Library of Sweden releases a new suite of Whisper models trained on over 50,000 hours of Swedish speech. In evaluations across [FLEURS](https://huggingface.co/datasets/google/fleurs), [CommonVoice](https://huggingface.co/datasets/mozilla-foundation/common_voice_16_1) and [NST](https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-56/), our best performing model reduces the Word Error Rate (WER) by an average of 47% compared to OpenAI's `whisper-large-v3`. The performance of smaller Whisper model sizes on Swedish speech has also substantially improved, with `kb-whisper-small` outperforming `openai/whisper-large-v3` (a model six times its size).

| Model size  |   | FLEURS | CommonVoice | NST  |
|------------|---------|--------|-------------|------|
| [tiny](https://huggingface.co/KBLab/kb-whisper-tiny)       | **KBLab**   | **13.2**  | **12.9**  | **11.2**  |
|            | OpenAI  | 59.2   | 67.8   | 85.2   |
| [base](https://huggingface.co/KBLab/kb-whisper-base)       | **KBLab**   | **9.1**   | **8.7**   | **7.8**   |
|            | OpenAI  | 39.6   | 52.1   | 53.4   |
| [small](https://huggingface.co/KBLab/kb-whisper-small)      | **KBLab**   | **7.3**   | **6.4**   | **6.6**   |
|            | OpenAI  | 20.6   | 26.4   | 26.4   |
| [medium](https://huggingface.co/KBLab/kb-whisper-medium)     | **KBLab**   | **6.6**   | **5.4**   | **5.8**   |
|            | OpenAI  | 12.1   | 15.8   | 17.1   |
| [large-v3](https://huggingface.co/KBLab/kb-whisper-large)   | **KBLab**   | **5.4**   | **4.1**   | **5.2**   |
|            | OpenAI  | 7.8    | 9.5    | 11.3    |

Table: **Word Error Rate (WER)** comparison between KBLab's Whisper models and the corresponding OpenAI versions. 

### 2025-05-13 Update! 
The default when loading our models through Hugging Face is **Stage 2**. 
As of May 2025 there exists two **Stage 2** versions in addition to the default, namely **Subtitle** and **Strict** that specify the transcription style. 
By specifying `revision="subtitle"` in `.from_pretrained()` the model version with a more condensed style of transcribing is accessed. 
By specifying `revision="strict"` in `.from_pretrained()` the more verbatim-like version of the model is accessed. 
Below is an example of how this argument is passed in the `.from_pretrained()` function 
```python
import torch
from datasets import load_dataset
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model_id = "KBLab/kb-whisper-tiny"
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, use_safetensors=True, cache_dir="cache", revision="strict"
)
```
The verbosity of the transcription styles of the three model versions ranges from the least verbose **Subtitle**, to **Stage 2** (default) to the most verbose **Strict**. 



### Usage

We provide checkpoints in different formats: `Hugging Face`, `whisper.cpp` (GGML), `onnx`, and `ctranslate2` (used in `faster-whisper` and `WhisperX`).

#### Hugging Face

Inference example for using `KB-Whisper` with Hugging Face:

```python
import torch
from datasets import load_dataset
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model_id = "KBLab/kb-whisper-tiny"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, use_safetensors=True, cache_dir="cache"
)
model.to(device)
processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

generate_kwargs = {"task": "transcribe", "language": "sv"}
# Add return_timestamps=True for output with timestamps
res = pipe("audio.mp3", 
           chunk_length_s=30,
           generate_kwargs={"task": "transcribe", "language": "sv"})
print(res)
```

#### Faster-whisper

[Faster-whisper](https://github.com/SYSTRAN/faster-whisper) provides fast and efficient inference via a reimplementation of Whisper using `ctranslate2`. 

```python
#### faster-whisper model ####
from faster_whisper import WhisperModel

model_id = "KBLab/kb-whisper-tiny"
model = WhisperModel(
    model_id,
    device="cuda",
    compute_type="float16",
    download_root="cache", # cache directory
    # condition_on_previous_text = False # Can reduce hallucinations if we don't use prompts
)

# Transcribe audio.wav (convert to 16khz mono wav first via ffmpeg)
segments, info = model.transcribe("audio.wav", condition_on_previous_text=False)
print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
```

#### WhisperX

[WhisperX](https://github.com/m-bain/whisperX) provides a convenient method of getting accurate word level timestamps. The library combines (force aligns) the text output of Whisper with the accurate timestamps of Wav2vec2. We provide an example below of how to use `KB-Whisper` together with [KBLab/wav2vec2-large-voxrex-swedish](https://huggingface.co/KBLab/wav2vec2-large-voxrex-swedish).

```python
import whisperx

device = "cuda"
audio_file = "audio.wav"
batch_size = 16  # reduce if low on GPU mem
compute_type = "float16"  # change to "int8" if low on GPU mem (may reduce accuracy)

# 1. Transcribe with original whisper (batched)
model = whisperx.load_model(
    "KBLab/kb-whisper-tiny", device, compute_type=compute_type, download_root="cache"  # cache_dir
)

audio = whisperx.load_audio(audio_file)
result = model.transcribe(audio, batch_size=batch_size)
print(result["segments"])  # before alignment

# delete model if low on GPU resources
# import gc; gc.collect(); torch.cuda.empty_cache(); del model

# 2. Align whisper output
model_a, metadata = whisperx.load_align_model(
    language_code=result["language"],
    device=device,
    model_name="KBLab/wav2vec2-large-voxrex-swedish",
    model_dir="cache",  # cache_dir
)
result = whisperx.align(
    result["segments"], model_a, metadata, audio, device, return_char_alignments=False
)

print(result["segments"])  # word level timestamps after alignment
```

#### Whisper.cpp / GGML

We provide GGML checkpoints used in the apps `whisper.cpp` and `MacWhisper`. To use our model with `whisper.cpp` first clone the repository and build the library:

```
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
cmake -B build
cmake --build build --config Release
```

To use the model you need to download one of the GGML checkpoints we have uploaded. You can either press the download buttons [here](https://huggingface.co/KBLab/kb-whisper-tiny/tree/main), or download using `wget`:

```
wget https://huggingface.co/KBLab/kb-whisper-tiny/resolve/main/ggml-model-q5_0.bin # Quantized version
# wget https://huggingface.co/KBLab/kb-whisper-tiny/resolve/main/ggml-model.bin # Non-quantized version
```

Run inference by specifying the model path after the argument `-m`, along with the path to the audio file as the last positional argument.

```
./build/bin/whisper-cli -m ggml-model-q5_0.bin ../audio.wav
```

#### onnx (optimum) and transformers.js usage

You can use the `onnx` checkpoints via Hugging Face's `optimum` library in the following manner:

```python
from optimum.onnxruntime import ORTModelForSpeechSeq2Seq
from transformers import AutoProcessor

model_id = "KBLab/kb-whisper-tiny"
processor = AutoProcessor.from_pretrained(model_id, cache_dir="cache")
model = ORTModelForSpeechSeq2Seq.from_pretrained(
    model_id,
    cache_dir="cache",
    subfolder="onnx",
)

import soundfile as sf
audio = sf.read("audio.wav")

inputs = processor.feature_extractor(audio[0], sampling_rate=16000, return_tensors="pt")
gen_tokens = model.generate(**inputs, max_length=300)
processor.decode(gen_tokens[0], skip_special_tokens=True)
```

An example of an app that runs inference locally in the browser with `transformers.js` and `KB-Whisper` can be found at [https://whisper.mesu.re/](https://whisper.mesu.re/) (created by Pierre Mesure). A template for setting up such an app with javascript can be found at [https://github.com/xenova/whisper-web](https://github.com/xenova/whisper-web). 

### Training data

Our models have been trained on over 50,000 hours of Swedish audio with text transcriptions. The models were trained in 2 stages, each characterized by the application of different quality filters and thresholds for said filters. 

Stage 1 employed low threshold values (0 to 0.30 BLEU depending on dataset), whereas Stage 2 used stricter thresholds (`BLEU >= 0.7`, weighted ROUGE-N `>= 0.7`, CER of first and last 10 characters `<= 0.2`).

| Dataset      | Continued pretraining (h) -- Stage 1 | Finetuning (h) -- Stage 2 |
|-------------|--------------------------|--------------|
| Subtitles   | 34,261                   | 3,110        |
| Riksdag     | 21,949                   | 5,119        |
| ISOF        | 54                       | 54           |
| NST         | 250                      | 250          |
| **Total**   | **56,514**               | **8,533**    |


The default when loading our models through Hugging Face is **Stage 2**. We have however also uploaded continued pretraining checkpoints and tagged them. You can load these other checkpoints by specifying the `revision` in `.from_pretrained()`. The pretrained checkpoints tag can for example be found here: [`pretrained-checkpoint`](https://huggingface.co/KBLab/kb-whisper-large/tree/pretrained-checkpoint). The Stage 2 default model tag is named `standard`. We supply two different stage 2 checkpoints -- one with a more condensed style of transcribing -- under the name `subtitle`, and one more verbose called `strict`. 

### Evaluation


#### WER compared to OpenAI
| Model size  |  | FLEURS | CommonVoice | NST  |
|------------|---------|--------|-------------|------|
| [tiny](https://huggingface.co/KBLab/kb-whisper-tiny)       | **KBLab**   | **13.2**  | **12.9**  | **11.2**  |
|            | OpenAI  | 59.2   | 67.8   | 85.2   |
| [base](https://huggingface.co/KBLab/kb-whisper-base)       | **KBLab**   | **9.1**   | **8.7**   | **7.8**   |
|            | OpenAI  | 39.6   | 52.1   | 53.4   |
| [small](https://huggingface.co/KBLab/kb-whisper-small)     | **KBLab**   | **7.3**   | **6.4**   | **6.6**   |
|            | OpenAI  | 20.6   | 26.4   | 26.4   |
| [medium](https://huggingface.co/KBLab/kb-whisper-medium)   | **KBLab**   | **6.6**   | **5.4**   | **5.8**   |
|            | OpenAI  | 12.1   | 15.8   | 17.1   |
| [large-v3](https://huggingface.co/KBLab/kb-whisper-large)  | **KBLab**   | **5.4**   | **4.1**   | **5.2**   |
|            | OpenAI  | 7.8    | 9.5    | 11.3    |

#### WER for different KBLab stage2 versions

| Model size  |  | FLEURS | CommonVoice | NST  |
|------------|---------|--------|-------------|------|
| [tiny](https://huggingface.co/KBLab/kb-whisper-tiny)       | **standard**   | **13.2**  | **12.9**  | **11.2**  |
|            | strict    | 14.1   | 13.4   | 11.0   |
|            | subtitle  | 13.3   | 12.9   | 11.4   |
| [base](https://huggingface.co/KBLab/kb-whisper-base)       | **standard**   | **9.1**   | **8.7**   | **7.8**   |
|            | strict    | 10.4   | 9.6    | 8.4    |
|            | subtitle  | 9.1    | 8.7    | 7.9    |
| [small](https://huggingface.co/KBLab/kb-whisper-small)     | **standard**   | **7.3**   | **6.4**   | **6.6**   |
|            | strict    | 8.2    | 7.0    | 6.7    |
|            | subtitle  | 7.3    | 6.4    | 6.6    |
| [medium](https://huggingface.co/KBLab/kb-whisper-medium)   | **standard**   | **6.6**   | **5.4**   | **5.8**   |
|            | strict    | 6.8    | 5.4    | 6.0    |
| [large-v3](https://huggingface.co/KBLab/kb-whisper-large)  | **standard**   | **5.4**   | **4.1**   | **5.2**   |
|            | strict    | 5.3    | 4.0    | 5.1    |
|            | subtitle  | 5.3    | 4.1    | 5.3    |

#### BLEU Score compared to OpenAI
| Model size  |   | FLEURS | CommonVoice | NST  |
|------------|---------|--------|-------------|------|
| [tiny](https://huggingface.co/KBLab/kb-whisper-tiny)       | **KBLab**   | **76.6**  | **73.7**  | **74.3**  |
|            | OpenAI  | 26.9   | 21.1   | 24.0   |
| [base](https://huggingface.co/KBLab/kb-whisper-base)       | **KBLab**   | **83.2**   | **79.9**   | **78.3**   |
|            | OpenAI  | 41.1   | 32.5   | 36.9   |
| [small](https://huggingface.co/KBLab/kb-whisper-small)     | **KBLab**   | **86.6**   | **83.5**   | **79.6**   |
|            | OpenAI  | 64.0   | 56.5   | 58.2   |
| [medium](https://huggingface.co/KBLab/kb-whisper-medium)   | **KBLab**   | **87.6**   | **85.0**   | **80.2**   |
|            | OpenAI  | 77.1   | 70.1   | 68.9   |
| [large-v3](https://huggingface.co/KBLab/kb-whisper-large)  | **KBLab**   | **89.8**   | **87.2**   | **81.1**   |
|            | OpenAI  | 84.9    | 79.1    | 75.1    |

#### BLEU Score for different KBLab stage2 versions
| Model size  |   | FLEURS | CommonVoice | NST  |
|------------|---------|--------|-------------|------|
| [tiny](https://huggingface.co/KBLab/kb-whisper-tiny)       | **standard**   | **76.6**  | **73.7**  | **74.3**  |
|            | strict      | 75.3    | 72.9    | 74.6    |
|            | subtitle    | 76.6    | 73.7    | 74.1    |
| [base](https://huggingface.co/KBLab/kb-whisper-base)       | **standard**   | **83.2**   | **79.9**   | **78.3**   |
|            | strict      | 81.0    | 78.4    | 77.5    |
|            | subtitle    | 83.2    | 79.8    | 78.2    |
| [small](https://huggingface.co/KBLab/kb-whisper-small)     | **standard**   | **86.6**   | **83.5**   | **79.6**   |
|            | strict      | 84.9    | 82.4    | 79.3    |
|            | subtitle    | 86.6    | 83.5    | 79.6    |
| [medium](https://huggingface.co/KBLab/kb-whisper-medium)   | **standard**   | **87.6**   | **85.0**   | **80.2**   |
|            | strict      | 87.3    | 84.9    | 80.1    |
| [large-v3](https://huggingface.co/KBLab/kb-whisper-large)  | **standard**   | **89.8**   | **87.2**   | **81.1**   |
|            | strict      | 90.0    | 87.4    | 81.2    |
|            | subtitle    | 89.8    | 87.3    | 81.0    |



### Acknowledgements

We acknowledge the EuroHPC Joint Undertaking for awarding this project access to the EuroHPC supercomputer LEONARDO, hosted by CINECA (Italy) and the LEONARDO consortium through an EuroHPC AI and Data-Intensive Applications Access call.


### Citation

KB-Whisper is a product of KBLab of the National Library of Sweden. 
Key contributors include [Faton Rekathati](https://huggingface.co/Lauler), [Justyna Sikora](https://huggingface.co/justynasikora), [Robin Kurtz](https://huggingface.co/robinq), [Agnes Toftgård](https://huggingface.co/agnestoftgard), and [Leonora Vesterbacka](https://huggingface.co/Leonoravesterbacka), under the direction of Love Börjeson.  
Please refer to the following paper if you want to cite our work with KB-Whisper. 

```
Vesterbacka, L., Rekathati, F., Kurtz, R., Sikora, J., Toftgård, A. (2025) Swedish Whispers; Leveraging a Massive Speech Corpus for Swedish Speech Recognition. Proc. Interspeech 2025, 758-762, doi: 10.21437/Interspeech.2025-2646
```

Bibtex citation:

```
@inproceedings{vesterbacka25_interspeech,
  title     = {{Swedish Whispers; Leveraging a Massive Speech Corpus for Swedish Speech Recognition}},
  author    = {{Leonora Vesterbacka and Faton Rekathati and Robin Kurtz and Justyna Sikora and Agnes Toftgård}},
  year      = {{2025}},
  booktitle = {{Interspeech 2025}},
  pages     = {{758--762}},
  doi       = {{10.21437/Interspeech.2025-2646}},
  issn      = {{2958-1796}},
}
```

You can find our [Interspeech 2025 article here](https://www.isca-archive.org/interspeech_2025/vesterbacka25_interspeech.html#), and the [arXiv preprint here](https://www.arxiv.org/abs/2505.17538).