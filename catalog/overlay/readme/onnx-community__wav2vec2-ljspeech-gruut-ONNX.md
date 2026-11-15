# wav2vec2-ljspeech-gruut (ONNX)


This is an ONNX version of [bookbot/wav2vec2-ljspeech-gruut](https://huggingface.co/bookbot/wav2vec2-ljspeech-gruut). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `automatic-speech-recognition`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline


---


# Wav2Vec2 LJSpeech Gruut

Wav2Vec2 LJSpeech Gruut is an automatic speech recognition model based on the [wav2vec 2.0](https://arxiv.org/abs/2006.11477) architecture. This model is a fine-tuned version of [Wav2Vec2-Base](https://huggingface.co/facebook/wav2vec2-base) on the [LJSpech Phonemes](https://huggingface.co/datasets/w11wo/ljspeech_phonemes) dataset.

Instead of being trained to predict sequences of words, this model was trained to predict sequence of phonemes, e.g. `["h", "ɛ", "l", "ˈoʊ", "w", "ˈɚ", "l", "d"]`. Therefore, the model's [vocabulary](https://huggingface.co/bookbot/wav2vec2-ljspeech-gruut/blob/main/vocab.json) contains the different IPA phonemes found in [gruut](https://github.com/rhasspy/gruut).

This model was trained using HuggingFace's PyTorch framework. All training was done on a Google Cloud Engine VM with a Tesla A100 GPU. All necessary scripts used for training could be found in the [Files and versions](https://huggingface.co/bookbot/wav2vec2-ljspeech-gruut/tree/main) tab, as well as the [Training metrics](https://huggingface.co/bookbot/wav2vec2-ljspeech-gruut/tensorboard) logged via Tensorboard.

## Model

| Model                     | #params | Arch.       | Training/Validation data (text) |
| ------------------------- | ------- | ----------- | ------------------------------- |
| `wav2vec2-ljspeech-gruut` | 94M     | wav2vec 2.0 | `LJSpech Phonemes` Dataset      |

## Evaluation Results

The model achieves the following results on evaluation:

| Dataset                      | PER (w/o stress) | CER (w/o stress) |
| ---------------------------- | :--------------: | :--------------: |
| `LJSpech Phonemes` Test Data |      0.99%       |      0.58%       |

## Usage

```py
from transformers import AutoProcessor, AutoModelForCTC, Wav2Vec2Processor
import librosa
import torch
from itertools import groupby
from datasets import load_dataset

def decode_phonemes(
    ids: torch.Tensor, processor: Wav2Vec2Processor, ignore_stress: bool = False
) -> str:
    """CTC-like decoding. First removes consecutive duplicates, then removes special tokens."""
    # removes consecutive duplicates
    ids = [id_ for id_, _ in groupby(ids)]

    special_token_ids = processor.tokenizer.all_special_ids + [
        processor.tokenizer.word_delimiter_token_id
    ]
    # converts id to token, skipping special tokens
    phonemes = [processor.decode(id_) for id_ in ids if id_ not in special_token_ids]

    # joins phonemes
    prediction = " ".join(phonemes)

    # whether to ignore IPA stress marks
    if ignore_stress == True:
        prediction = prediction.replace("ˈ", "").replace("ˌ", "")

    return prediction

checkpoint = "bookbot/wav2vec2-ljspeech-gruut"

model = AutoModelForCTC.from_pretrained(checkpoint)
processor = AutoProcessor.from_pretrained(checkpoint)
sr = processor.feature_extractor.sampling_rate

# load dummy dataset and read soundfiles
ds = load_dataset("patrickvonplaten/librispeech_asr_dummy", "clean", split="validation")
audio_array = ds[0]["audio"]["array"]

# or, read a single audio file
# audio_array, _ = librosa.load("myaudio.wav", sr=sr)

inputs = processor(audio_array, return_tensors="pt", padding=True)

with torch.no_grad():
    logits = model(inputs["input_values"]).logits

predicted_ids = torch.argmax(logits, dim=-1)
prediction = decode_phonemes(predicted_ids[0], processor, ignore_stress=True)
# => should give 'b ɪ k ʌ z j u ɚ z s l i p ɪ ŋ ɪ n s t ɛ d ə v k ɔ ŋ k ɚ ɪ ŋ ð ə l ʌ v l i ɹ z p ɹ ɪ n s ə s h æ z b ɪ k ʌ m ə v f ɪ t ə l w ɪ θ n b oʊ p ɹ ə ʃ æ ɡ i s ɪ t s ð ɛ ɹ ə k u ɪ ŋ d ʌ v'
```

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:

- `learning_rate`: 0.0001
- `train_batch_size`: 16
- `eval_batch_size`: 8
- `seed`: 42
- `gradient_accumulation_steps`: 2
- `total_train_batch_size`: 32
- `optimizer`: Adam with `betas=(0.9,0.999)` and `epsilon=1e-08`
- `lr_scheduler_type`: linear
- `lr_scheduler_warmup_steps`: 1000
- `num_epochs`: 30.0
- `mixed_precision_training`: Native AMP

### Training results

| Training Loss | Epoch | Step  | Validation Loss |  Wer   |  Cer   |
| :-----------: | :---: | :---: | :-------------: | :----: | :----: |
|    No log     |  1.0  |  348  |     2.2818      |  1.0   |  1.0   |
|    2.6692     |  2.0  |  696  |     0.2045      | 0.0527 | 0.0299 |
|    0.2225     |  3.0  | 1044  |     0.1162      | 0.0319 | 0.0189 |
|    0.2225     |  4.0  | 1392  |     0.0927      | 0.0235 | 0.0147 |
|    0.0868     |  5.0  | 1740  |     0.0797      | 0.0218 | 0.0143 |
|    0.0598     |  6.0  | 2088  |     0.0715      | 0.0197 | 0.0128 |
|    0.0598     |  7.0  | 2436  |     0.0652      | 0.0160 | 0.0103 |
|    0.0447     |  8.0  | 2784  |     0.0571      | 0.0152 | 0.0095 |
|    0.0368     |  9.0  | 3132  |     0.0608      | 0.0163 | 0.0112 |
|    0.0368     | 10.0  | 3480  |     0.0586      | 0.0137 | 0.0083 |
|    0.0303     | 11.0  | 3828  |     0.0641      | 0.0141 | 0.0085 |
|    0.0273     | 12.0  | 4176  |     0.0656      | 0.0131 | 0.0079 |
|    0.0232     | 13.0  | 4524  |     0.0690      | 0.0133 | 0.0082 |
|    0.0232     | 14.0  | 4872  |     0.0598      | 0.0128 | 0.0079 |
|    0.0189     | 15.0  | 5220  |     0.0671      | 0.0121 | 0.0074 |
|     0.017     | 16.0  | 5568  |     0.0654      | 0.0114 | 0.0069 |
|     0.017     | 17.0  | 5916  |     0.0751      | 0.0118 | 0.0073 |
|    0.0146     | 18.0  | 6264  |     0.0653      | 0.0112 | 0.0068 |
|    0.0127     | 19.0  | 6612  |     0.0682      | 0.0112 | 0.0069 |
|    0.0127     | 20.0  | 6960  |     0.0678      | 0.0114 | 0.0068 |
|    0.0114     | 21.0  | 7308  |     0.0656      | 0.0111 | 0.0066 |
|    0.0101     | 22.0  | 7656  |     0.0669      | 0.0109 | 0.0066 |
|    0.0092     | 23.0  | 8004  |     0.0677      | 0.0108 | 0.0065 |
|    0.0092     | 24.0  | 8352  |     0.0653      | 0.0104 | 0.0063 |
|    0.0088     | 25.0  | 8700  |     0.0673      | 0.0102 | 0.0063 |
|    0.0074     | 26.0  | 9048  |     0.0669      | 0.0105 | 0.0064 |
|    0.0074     | 27.0  | 9396  |     0.0707      | 0.0101 | 0.0061 |
|    0.0066     | 28.0  | 9744  |     0.0673      | 0.0100 | 0.0060 |
|    0.0058     | 29.0  | 10092 |     0.0689      | 0.0100 | 0.0059 |
|    0.0058     | 30.0  | 10440 |     0.0683      | 0.0099 | 0.0058 |


## Disclaimer

Do consider the biases which came from pre-training datasets that may be carried over into the results of this model.

## Authors

Wav2Vec2 LJSpeech Gruut was trained and evaluated by [Wilson Wongso](https://w11wo.github.io/). All computation and development are done on Google Cloud.

## Framework versions

- Transformers 4.26.0.dev0
- Pytorch 1.10.0
- Datasets 2.7.1
- Tokenizers 0.13.2
- Gruut 2.3.4
