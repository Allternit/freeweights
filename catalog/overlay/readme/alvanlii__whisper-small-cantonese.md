<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# Whisper Small Cantonese - Alvin

This model is a fine-tuned version of [openai/whisper-small](https://huggingface.co/openai/whisper-small) on the Cantonese language. It achieves a 7.93 CER (without punctuations), 9.72 CER (with punctuations) on Common Voice 16.0

## Training and evaluation data
For training,
- CantoMap: Winterstein, Grégoire, Tang, Carmen and Lai, Regine (2020) "CantoMap: a Hong Kong Cantonese MapTask Corpus", in Proceedings of The 12th Language Resources and Evaluation Conference, Marseille: European Language Resources Association, p. 2899-2906.
- Cantonse-ASR: Yu, Tiezheng, Frieske, Rita, Xu, Peng, Cahyawijaya, Samuel, Yiu, Cheuk Tung, Lovenia, Holy, Dai, Wenliang, Barezi, Elham, Chen, Qifeng, Ma, Xiaojuan, Shi, Bertram, Fung, Pascale (2022) "Automatic Speech Recognition Datasets in Cantonese: A Survey and New Dataset", 2022. Link: https://arxiv.org/pdf/2201.02419.pdf

|Name|# of Hours|
|--|--|
|Common Voice 16.0 zh-HK Train|138|
|Common Voice 16.0 yue Train|85|
|Common Voice 17.0 yue Train|178|
|Cantonese-ASR|72|
|CantoMap|23|
|[Pseudo-Labelled YouTube Data](https://huggingface.co/datasets/alvanlii/cantonese-youtube-pseudo-transcription)|438|


For evaluation, Common Voice 16.0 yue Test set is used.

## Results
- CER (lower is better): 0.0972
  - down from 0.1073, 0.1581 in the previous versions
- CER (punctuations removed): 0.0793
- GPU Inference with Fast Attention (example below): 0.055s/sample
  - Note all GPU evaluations are done on RTX 3090 GPU
- GPU Inference: 0.308s/sample
- CPU Inference: 2.57s/sample
- GPU VRAM: ~1.5 GB


## Using the Model
```
import librosa

import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

y, sr = librosa.load('audio.mp3', sr=16000)

MODEL_NAME = "alvanlii/whisper-small-cantonese"

processor = WhisperProcessor.from_pretrained(MODEL_NAME)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_NAME)

processed_in = processor(y, sampling_rate=sr, return_tensors="pt")
gout = model.generate(
    input_features=processed_in.input_features, 
    output_scores=True, return_dict_in_generate=True
)
transcription = processor.batch_decode(gout.sequences, skip_special_tokens=True)[0]
print(transcription)
```
- Alternatively, you can use huggingface pipelines
```
from transformers import pipeline
MODEL_NAME = "alvanlii/whisper-small-cantonese" 
lang = "zh"
pipe = pipeline(
    task="automatic-speech-recognition",
    model=MODEL_NAME,
    chunk_length_s=30,
    device=device,
)
pipe.model.config.forced_decoder_ids = pipe.tokenizer.get_decoder_prompt_ids(language=lang, task="transcribe")
text = pipe(file)["text"]
```

## Model Speedup
Just add attn_implementation="sdpa" for Flash Attention. 
```
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    "alvanlii/whisper-small-cantonese",
    torch_dtype=torch_dtype,
    low_cpu_mem_usage=True,
    use_safetensors=True,
    attn_implementation="sdpa",
)
```
Using Flash Attention reduced the amount of time taken per sample from 0.308s to 0.055s.

## Speculative Decoding
You can use a bigger model, then use `alvanlii/whisper-small-cantonese` to speed up inference with basically no loss in accuracy.
```
model_id = "simonl0909/whisper-large-v2-cantonese"
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id,
    torch_dtype=torch_dtype,
    low_cpu_mem_usage=True,
    use_safetensors=True,
    attn_implementation="sdpa",
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

assistant_model_id = "alvanlii/whisper-small-cantonese"

assistant_model = AutoModelForSpeechSeq2Seq.from_pretrained(
    assistant_model_id,
    torch_dtype=torch_dtype,
    low_cpu_mem_usage=True,
    use_safetensors=True,
    attn_implementation="sdpa",
)

assistant_model.to(device)
...
model.generate(**inputs, use_cache=True, assistant_model=assistant_model)
```
In the original `simonl0909/whisper-large-v2-cantonese` model, it runs at 0.714s/sample for a CER of 7.65. \
Using speculative decoding with `alvanlii/whisper-small-cantonese`, it runs at 0.137s/sample for a CER of 7.67, which is much faster.

## Whisper.cpp
Uploaded a GGML bin file for Whisper cpp as of June 2024. You can download the bin file [here](https://huggingface.co/alvanlii/whisper-small-cantonese/blob/main/ggml-model.bin) and try it out [here](https://whisper.ggerganov.com/). 

## Whisper CT2
For use in WhisperX or FasterWhisper, a CT2 file is needed. The converted model is under [here](https://huggingface.co/alvanlii/whisper-small-cantonese/tree/main/cts)

## Training Hyperparameters
- learning_rate: 5e-5
- train_batch_size: 25 (on 1 3090 GPU)
- eval_batch_size: 8
- gradient_accumulation_steps: 4
- total_train_batch_size: 25x4=100
- optimizer: Adam with betas=(0.9,0.999) and epsilon=1e-08
- lr_scheduler_type: linear
- lr_scheduler_warmup_steps: 500
- training_steps: 15000
- augmentation: None