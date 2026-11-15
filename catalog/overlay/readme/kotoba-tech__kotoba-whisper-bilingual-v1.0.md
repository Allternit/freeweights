# Kotoba-Whisper-Bilingual (v1.0)

[**faster-whisper weight**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0-faster), [**whisper.cpp weight**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0-ggml)


_Kotoba-Whisper-Bilingual_ is a collection of distilled [Whisper](https://arxiv.org/abs/2212.04356) models trained for
- **Japanese ASR**
- **English ASR**
- **Speech-to-text translation (Japanese -> English)**
- **Speech-to-text translation (English -> Japanese)**

developed through the collaboration bewteen
[Asahi Ushio](https://asahiushio.com) and [Kotoba Technologies](https://twitter.com/kotoba_tech).
Following the original work of distil-whisper ([Robust Knowledge Distillation via Large-Scale Pseudo Labelling](https://arxiv.org/abs/2311.00430)), 
we employ OpenAI's [Whisper large-v3](https://huggingface.co/openai/whisper-large-v3) as the teacher model for Japanese and English ASR, while we translate the 
transcription into English and Japanese by external LLM to obtain training dataset for speech-to-text translation.
We employ [ReazonSpeech](https://huggingface.co/datasets/japanese-asr/ja_asr.reazon_speech_all) for Japanese ASR and Japanese speech to English text translation, 
and [Multilingual LibriSpeech](https://huggingface.co/datasets/japanese-asr/en_asr.mls) for English ASR and English speech to Japanese text translation.
Kotoba-whisper-bilingual's loss objective consists of cross-entropy on both of ASR and translation tasks, while KL divergence loss only for ASR task.
The student model consists the full encoder of the teacher large-v3 model and the decoder with two layers initialized from the first and last layer of the large-v3 model.

As kotoba-whisper uses the same architecture as [distil-whisper/distil-large-v3](https://huggingface.co/distil-whisper/distil-large-v3),
it inherits the benefit of the improved latency compared to [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3) 
(**6.3x faster than large-v3**, see the table below taken from [distil-whisper/distil-large-v3](https://huggingface.co/distil-whisper/distil-large-v3)).


## Evaluation

We compare our kotoba-whisper-bilingual with OpenAI whisper models, kotoba-whisper models, and cascaded models for translation.
**Worth noting that kotoba-whisper-bilingual is the only model that can do Japanese and English ASR and speech-to-text translation between Japanese and English**, as 
OpenAI whisper is not trained for English to Japanese speech-to-text translation, and other models are specific to the Task (eg. kotoba-whisper is Japanese ASR and
distil whisper is English ASR only).

### Speech2Text Translation (Japanese->English): WER (smaller is better)

| model                                                                                                                                                                                                     |   [CoVoST2 (Ja->En)](https://huggingface.co/datasets/japanese-asr/ja2en.s2t_translation)|   [Fleurs (Ja->En)](https://huggingface.co/datasets/japanese-asr/ja2en.s2t_translation) |
|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------:|------------------------------------------------------------------------------------------------------:|
| [**kotoba-tech/kotoba-whisper-bilingual-v1.0**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0)                                                                                             |                                                                                                   73.9 |                                                                                                  98.7 |
| [japanese-asr/ja-cascaded-s2t-translation](https://huggingface.co/japanese-asr/ja-cascaded-s2t-translation) ([facebook/nllb-200-3.3B](https://huggingface.co/facebook/nllb-200-3.3B))                     |                                                                                                   64.3 |                                                                                                  67.1 |
| [japanese-asr/ja-cascaded-s2t-translation](https://huggingface.co/japanese-asr/ja-cascaded-s2t-translation) ([facebook/nllb-200-1.3B](https://huggingface.co/facebook/nllb-200-1.3B))                     |                                                                                                   65.4 |                                                                                                  68.9 |
| [japanese-asr/ja-cascaded-s2t-translation](https://huggingface.co/japanese-asr/ja-cascaded-s2t-translation) ([facebook/nllb-200-distilled-1.3B](https://huggingface.co/facebook/nllb-200-distilled-1.3B)) |                                                                                                   65.6 |                                                                                                  67.4 |
| [japanese-asr/ja-cascaded-s2t-translation](https://huggingface.co/japanese-asr/ja-cascaded-s2t-translation) ([facebook/nllb-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M)) |                                                                                                   68.2 |                                                                                                  72.2 |
| [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)                                                                                                                                 |                                                                                                   71   |                                                                                                  86.1 |
| [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)                                                                                                                                 |                                                                                                   66.4 |                                                                                                  78.8 |
| [openai/whisper-large](https://huggingface.co/openai/whisper-large)                                                                                                                                       |                                                                                                   66.5 |                                                                                                  86.1 |
| [openai/whisper-medium](https://huggingface.co/openai/whisper-medium)                                                                                                                                     |                                                                                                   70.3 |                                                                                                  97.2 |
| [openai/whisper-small](https://huggingface.co/openai/whisper-small)                                                                                                                                       |                                                                                                   97.3 |                                                                                                 132.2 |
| [openai/whisper-base](https://huggingface.co/openai/whisper-base)                                                                                                                                         |                                                                                                  186.2 |                                                                                                 349.6 |
| [openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)                                                                                                                                         |                                                                                                  377.2 |                                                                                                 474   | 


### Speech2Text Translation (English->Japanese): CER (smaller is better)

| model                                                                                                                                                                                                     |   [CoVoST2 (En->Ja)](https://huggingface.co/datasets/japanese-asr/en2ja.s2t_translation)|   [Fleurs (En->JA)](https://huggingface.co/datasets/japanese-asr/en2ja.s2t_translation) |
|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------:|------------------------------------------------------------------------------------------------------:|
| [**kotoba-tech/kotoba-whisper-bilingual-v1.0**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0)                                                                                             |                                                                                                   69.1 |                                                                                                  74.4 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-3.3B](https://huggingface.co/facebook/nllb-200-3.3B))                     |                                                                                                   62.4 |                                                                                                  63.5 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-1.3B](https://huggingface.co/facebook/nllb-200-1.3B))                     |                                                                                                   64.4 |                                                                                                  67.2 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-distilled-1.3B](https://huggingface.co/facebook/nllb-200-distilled-1.3B)) |                                                                                                   62.4 |                                                                                                  62.9 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M)) |                                                                                                   63.4 |                                                                                                  66.2 |
| [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)                                                                                                                                 |                                                                                                  178.9 |                                                                                                 209.5 |
| [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)                                                                                                                                 |                                                                                                  179.6 |                                                                                                 201.8 |
| [openai/whisper-large](https://huggingface.co/openai/whisper-large)                                                                                                                                       |                                                                                                  178.7 |                                                                                                 201.8 |
| [openai/whisper-medium](https://huggingface.co/openai/whisper-medium)                                                                                                                                     |                                                                                                  178.7 |                                                                                                 202   |
| [openai/whisper-small](https://huggingface.co/openai/whisper-small)                                                                                                                                       |                                                                                                  178.9 |                                                                                                 206.8 |
| [openai/whisper-base](https://huggingface.co/openai/whisper-base)                                                                                                                                         |                                                                                                  179.5 |                                                                                                 214.2 |
| [openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)                                                                                                                                         |                                                                                                  185.2 |                                                                                                 200.5 | 


### ASR (Japanese): CER (smaller is better)

| model                                                                                                                                             |   [CommonVoice 8 (Japanese test set)](https://huggingface.co/datasets/japanese-asr/ja_asr.common_voice_8_0) |   [JSUT Basic 5000](https://huggingface.co/datasets/japanese-asr/ja_asr.jsut_basic5000) |   [ReazonSpeech (held out test set)](https://huggingface.co/datasets/japanese-asr/ja_asr.reazonspeech_test) |
|:--------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------:|----------------------------------------------------------------------------------------:|------------------------------------------------------------------------------------------------------------:|
| [**kotoba-tech/kotoba-whisper-bilingual-v1.0**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0)                                     |                                                                                                         9.8 |                                                                                     9.3 |                                                                                                        16.8 |
| [kotoba-tech/kotoba-whisper-v2.0](https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0)                                                         |                                                                                                         9.2 |                                                                                     8.4 |                                                                                                        11.6 |
| [kotoba-tech/kotoba-whisper-v1.0](https://huggingface.co/kotoba-tech/kotoba-whisper-v1.0)                                                         |                                                                                                         9.4 |                                                                                     8.5 |                                                                                                        12.2 |
| [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)                                                                         |                                                                                                         8.5 |                                                                                     7.1 |                                                                                                        14.9 |
| [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)                                                                         |                                                                                                         9.7 |                                                                                     8.2 |                                                                                                        28.1 |
| [openai/whisper-large](https://huggingface.co/openai/whisper-large)                                                                               |                                                                                                        10   |                                                                                     8.9 |                                                                                                        34.1 |
| [openai/whisper-medium](https://huggingface.co/openai/whisper-medium)                                                                             |                                                                                                        11.5 |                                                                                    10   |                                                                                                        33.2 |
| [openai/whisper-small](https://huggingface.co/openai/whisper-small)                                                                               |                                                                                                        15.1 |                                                                                    14.2 |                                                                                                        41.5 |
| [openai/whisper-base](https://huggingface.co/openai/whisper-base)                                                                                 |                                                                                                        28.6 |                                                                                    24.9 |                                                                                                        70.4 |
| [openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)                                                                                 |                                                                                                        53.7 |                                                                                    36.5 |                                                                                                       137.9 |
| [reazon-research/reazonspeech-nemo-v2](https://huggingface.co/reazon-research/reazonspeech-nemo-v2)                                               |                                                                                                         9.1 |                                                                                     7.4 |                                                                                                        11.2 | 



### ASR (English): WER (smaller is better)

| model                                                                                                           |   [ESB](https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval) (ami) |   [ESB](https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval) (earnings22) |   [ESB](https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval) (librispeech) |   [ESB](https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval) (tedlium) |   [ESB](https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval) (voxpopuli) |
|:----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------:|-----------------------------------------------------------------------------------:|------------------------------------------------------------------------------------:|--------------------------------------------------------------------------------:|----------------------------------------------------------------------------------:|
| [**kotoba-tech/kotoba-whisper-bilingual-v1.0**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0)   |                                                                        16.7 |                                                                               15.3 |                                                                                 2.4 |                                                                             4.1 |                                                                               8.3 |
| [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)                                       |                                                                        17.9 |                                                                               14.9 |                                                                                 2.1 |                                                                             3.8 |                                                                              12.7 |
| [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)                                       |                                                                        18.9 |                                                                               16.7 |                                                                                 2.3 |                                                                             4.9 |                                                                               7.7 |
| [openai/whisper-large](https://huggingface.co/openai/whisper-large)                                             |                                                                        18.8 |                                                                               14.9 |                                                                                 2.6 |                                                                             4.2 |                                                                               7.7 |
| [openai/whisper-medium](https://huggingface.co/openai/whisper-medium)                                           |                                                                        18.3 |                                                                               14.9 |                                                                                 2.5 |                                                                             4.3 |                                                                               7.9 |
| [openai/whisper-small](https://huggingface.co/openai/whisper-small)                                             |                                                                        23.1 |                                                                               17.2 |                                                                                 3.5 |                                                                             5.3 |                                                                              10.8 |
| [openai/whisper-base](https://huggingface.co/openai/whisper-base)                                               |                                                                        26.6 |                                                                               21   |                                                                                 6   |                                                                             6.1 |                                                                              11.3 |
| [openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)                                               |                                                                        31.9 |                                                                               30.5 |                                                                                 8.2 |                                                                            11.7 |                                                                              15.1 | 
| [japanese-asr/distil-whisper-bilingual-v1.0](https://huggingface.co/japanese-asr/distil-whisper-bilingual-v1.0) |                                                                        20.7 |                                                                               18.6 |                                                                                 2.4 |                                                                             6.4 |                                                                              10   |


### Inference Speed
Although the cascaded approach is better in translation task, due to the nature of cascaded approach, the pipeline 
has additional complexity and memory consumption compared to the single end2end models for the sake of high accuracy.
Following table shows the mean inference time on a single RTX 4090 (VRAM 24 GB) in second averaged over 10 trials on audio sample with different durations, along with the parameter size.


| model                                                                                                                                                                                                     | Param. (M) | 10 (sec.) | 30 (sec.) | 60 (sec.) | 300 (sec.) | 
|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------:|------:|------:|------:|------:|
| [**kotoba-tech/kotoba-whisper-bilingual-v1.0**](https://huggingface.co/kotoba-tech/kotoba-whisper-bilingual-v1.0)                                                                                         |        756 | 0.041 | 0.111 | 0.214 | 1.077 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-3.3B](https://huggingface.co/facebook/nllb-200-3.3B))                     |       4056 | 0.173 | 0.247 | 0.352 | 1.772 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-1.3B](https://huggingface.co/facebook/nllb-200-1.3B))                     |       2056 | 0.173 | 0.24  | 0.348 | 1.515 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-distilled-1.3B](https://huggingface.co/facebook/nllb-200-distilled-1.3B)) |       2056 | 0.17  | 0.245 | 0.348 | 1.882 |
| [japanese-asr/en-cascaded-s2t-translation](https://huggingface.co/japanese-asr/en-cascaded-s2t-translation) ([facebook/nllb-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M)) |       1256 | 0.108 | 0.179 | 0.283 | 1.33  |

## Transformers Usage
Kotoba-Whisper is supported in the Hugging Face 🤗 Transformers library from version 4.39 onwards. To run the model, first 
install the latest version of Transformers. 

```bash
pip install --upgrade pip
pip install --upgrade transformers accelerate
```

The model can be used with the [`pipeline`](https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline)
class to transcribe short-form audio files (< 30-seconds) as follows:

Download sample audio.
```shell
wget https://huggingface.co/datasets/japanese-asr/en_asr.esb_eval/resolve/main/sample.wav -O sample_en.wav
wget https://huggingface.co/datasets/japanese-asr/ja_asr.jsut_basic5000/resolve/main/sample.flac -O sample_ja.flac
```

```python
import torch
from transformers import pipeline
from datasets import load_dataset

# config
torch_dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model_kwargs = {"attn_implementation": "sdpa"} if torch.cuda.is_available() else {}
pipe = pipeline(
    "automatic-speech-recognition",
    model="kotoba-tech/kotoba-whisper-bilingual-v1.0",
    torch_dtype=torch_dtype,
    device=device,
    model_kwargs=model_kwargs,
    chunk_length_s=15,
    batch_size=16
)

# Japanese ASR
generate_kwargs = {"language": "ja", "task": "transcribe"}
result = pipe("sample_ja.flac", generate_kwargs=generate_kwargs)
print(result["text"])

# English ASR
generate_kwargs = {"language": "en", "task": "transcribe"}
result = pipe("sample_en.wav", generate_kwargs=generate_kwargs)
print(result["text"])

# Translate Japanese speech to English text
generate_kwargs = {"language": "en", "task": "translate"}
result = pipe("sample_ja.flac", generate_kwargs=generate_kwargs)
print(result["text"])

# Translate English speech to Japanese text
generate_kwargs = {"language": "ja", "task": "translate"}
result = pipe("sample_en.wav", generate_kwargs=generate_kwargs)
print(result["text"])
```

- For segment-level timestamps, pass the argument `return_timestamps=True` and return the `"chunks"` output:
```python
result = pipe(sample, return_timestamps=True, generate_kwargs=generate_kwargs)
print(result["chunks"])
```


## Training
Please refer to [https://github.com/kotoba-tech/kotoba-whisper](https://github.com/kotoba-tech/kotoba-whisper) for the model training detail.
Datasets used in distillation and the whole model variations can be found at [https://huggingface.co/japanese-asr](https://huggingface.co/japanese-asr).


## Acknowledgements
* [OpenAI](https://openai.com/) for the Whisper [model](https://huggingface.co/openai/whisper-large-v3).
* Hugging Face 🤗 [Transformers](https://github.com/huggingface/transformers) for the model integration.
* Hugging Face 🤗 for the [Distil-Whisper codebase](https://github.com/huggingface/distil-whisper).
* [Reazon Human Interaction Lab](https://research.reazon.jp/) for the [ReazonSpeech dataset](https://huggingface.co/datasets/reazon-research/reazonspeech).

