### Summary
This model map provides information about a model based on Whisper Large v3 that has been fine-tuned for speech recognition in German. Whisper is a powerful speech recognition platform developed by OpenAI. This model has been specially optimized for processing and recognizing German speech.



### Applications
This model can be used in various application areas, including

- Transcription of spoken German language
- Voice commands and voice control
- Automatic subtitling for German videos
- Voice-based search queries in German
- Dictation functions in word processing programs


## Model family

| Model                            | Parameters | link                                                         |
|----------------------------------|------------|--------------------------------------------------------------|
| Whisper large v3 german          | 1.54B      | [link](https://huggingface.co/primeline/whisper-large-v3-german) |
| Whisper large v3 turbo german    | 809M       | [link](https://huggingface.co/primeline/whisper-large-v3-turbo-german)
| Distil-whisper large v3 german   | 756M       | [link](https://huggingface.co/primeline/distil-whisper-large-v3-german) |
| tiny whisper                     | 37.8M      | [link](https://huggingface.co/primeline/whisper-tiny-german) |


## Evaluations - Word error rate

| Dataset                             | openai-whisper-large-v3-turbo | openai-whisper-large-v3 | primeline-whisper-large-v3-german | nyrahealth-CrisperWhisper (large)| primeline-whisper-large-v3-turbo-german |
|-------------------------------------|-------------------------------|-------------------------|-----------------------------------|---------------------------|-----------------------------------------|
| Tuda-De                             | 8.300                         | 7.884                   | 7.711                             | **5.148**                 | 6.441                                   |
| common_voice_19_0                   | 3.849                         | 3.484                   | 3.215                             | **1.927**                 | 3.200                                   |
| multilingual librispeech            | 3.203                         | 2.832                   | 2.129                             | 2.815                     | **2.070**                               |
| All                                 | 3.649                         | 3.279                   | 2.734                             | 2.662                     | **2.628**                               |

The data and code for evaluations are available [here](https://huggingface.co/datasets/flozi00/asr-german-mixed-evals)

### Training data
The training data for this model includes a large amount of spoken German from various sources. The data was carefully selected and processed to optimize recognition performance.


### Training process
The training of the model was performed with the following hyperparameters

- Batch size: 12288
- Epochs: 3
- Learning rate: 1e-6
- Data augmentation: No
- Optimizer: [Ademamix](https://arxiv.org/abs/2409.03137)


### How to use

```python
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from datasets import load_dataset
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model_id = "primeline/whisper-large-v3-turbo-german"
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)
processor = AutoProcessor.from_pretrained(model_id)
pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    max_new_tokens=128,
    chunk_length_s=30,
    batch_size=16,
    return_timestamps=True,
    torch_dtype=torch_dtype,
    device=device,
)
dataset = load_dataset("distil-whisper/librispeech_long", "clean", split="validation")
sample = dataset[0]["audio"]
result = pipe(sample)
print(result["text"])
```


## [About us](https://primeline-ai.com/en/)

[![primeline AI](https://primeline-ai.com/wp-content/uploads/2024/02/pl_ai_bildwortmarke_original.svg)](https://primeline-ai.com/en/)


Your partner for AI infrastructure in Germany

Experience the powerful AI infrastructure that drives your ambitions in Deep Learning, Machine Learning & High-Performance Computing. 

Optimized for AI training and inference.



Model author: [Florian Zimmermeister](https://huggingface.co/flozi00)

**Disclaimer**

```
This model is not a product of the primeLine Group. 

It represents research conducted by [Florian Zimmermeister](https://huggingface.co/flozi00), with computing power sponsored by primeLine. 

The model is published under this account by primeLine, but it is not a commercial product of primeLine Solutions GmbH.

Please be aware that while we have tested and developed this model to the best of our abilities, errors may still occur. 

Use of this model is at your own risk. We do not accept liability for any incorrect outputs generated by this model.
```