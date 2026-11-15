# Granite-speech-3.2-8b

**Model Summary:**
Granite-speech-3.2-8b is a compact and efficient speech-language model, specifically designed for automatic speech recognition (ASR) and automatic speech translation (AST). Granite-speech-3.2-8b uses a two-pass design, unlike integrated models that combine speech and language into a single pass. Initial calls to granite-speech-3.2-8b will transcribe audio files into text. To process the transcribed text using the underlying Granite language model, users must make a second call as each step must be explicitly initiated.

The model was trained on a collection of public corpora comprising diverse datasets for ASR and AST as well as synthetic datasets tailored to support the speech translation task. Granite-speech-3.2 was trained by modality aligning granite-3.2-8b-instruct (https://huggingface.co/ibm-granite/granite-3.2-8b-instruct) to speech on publicly available open source corpora containing audio inputs and text targets.

**Evaluations:**

We evaluated granite-speech-3.2-8b alongside other speech-language models (SLMs) in the less than 8b parameter range as well as dedicated ASR and AST systems on standard benchmarks. The evaluation spanned multiple public benchmarks, with particular emphasis on English ASR tasks while also including AST for En-X translation. 

![image/png](https://cdn-uploads.huggingface.co/production/uploads/666ec38102791b3b49f453e8/ZX49euxuzd45QcpWwp5Yz.png)

![image/png](https://cdn-uploads.huggingface.co/production/uploads/666ec38102791b3b49f453e8/JSGpEMSTquwsAFOYBx7AZ.png)

![image/png](https://cdn-uploads.huggingface.co/production/uploads/666ec38102791b3b49f453e8/zwpNY8J8bD46EU_ksMEb-.png)

**Release Date**: April 2nd, 2025 

**License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:**
English

**Intended Use:** 
The model is intended to be used in enterprise applications that involve processing of speech inputs. In particular, the model is well-suited for English speech-to-text and speech translations from English to some major European languages such as French, Spanish, Italian, German, Portuguese as well as Japanese and Mandarin. For tasks that exclusively involve text-based input, we suggest using our Granite large language models, which are optimized for text-only processing and offer superior performance compared to this model.

## Generation:

Granite Speech model is in the process of being supported natively in `transformers` from the `main` branch. In the interim, below is a simple example of how to use the `granite-speech-3.2-8b` model.

### Usage with `transformers`

First, make sure to build the latest version of transformers:
```shell
pip install transformers>=4.49 peft torchaudio
```

Install a `torchaudio` backend, such as:

```shell
pip install soundfile
```

Then run the code:
```python
import torch
import torchaudio
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
from huggingface_hub import hf_hub_download

device = "cuda" if torch.cuda.is_available() else "cpu"

model_name = "ibm-granite/granite-speech-3.2-8b"
speech_granite_processor = AutoProcessor.from_pretrained(
    model_name, trust_remote_code=True)
tokenizer = speech_granite_processor.tokenizer
speech_granite = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_name, trust_remote_code=True).to(device)

# prepare speech and text prompt, using the appropriate prompt template

audio_path = hf_hub_download(repo_id=model_name, filename='10226_10111_000000.wav')
wav, sr = torchaudio.load(audio_path, normalize=True)
assert wav.shape[0] == 1 and sr == 16000 # mono, 16khz

# create text prompt
chat = [
    {
        "role": "system",
        "content": "Knowledge Cutoff Date: April 2024.\nToday's Date: December 19, 2024.\nYou are Granite, developed by IBM. You are a helpful AI assistant",
    },
    {
        "role": "user",
        "content": "<|audio|>can you transcribe the speech into a written format?",
    }
]

text = tokenizer.apply_chat_template(
    chat, tokenize=False, add_generation_prompt=True
)

# compute audio embeddings
model_inputs = speech_granite_processor(
    text,
    wav,
    device=device, # Computation device; returned tensors are put on CPU
    return_tensors="pt",
).to(device)
 
model_outputs = speech_granite.generate(
    **model_inputs,
    max_new_tokens=200,
    num_beams=4,
    do_sample=False,
    min_length=1,
    top_p=1.0,
    repetition_penalty=1.0,
    length_penalty=1.0,
    temperature=1.0,
    bos_token_id=tokenizer.bos_token_id,
    eos_token_id=tokenizer.eos_token_id,
    pad_token_id=tokenizer.pad_token_id,
)

# Transformers includes the input IDs in the response.
num_input_tokens = model_inputs["input_ids"].shape[-1]
new_tokens = torch.unsqueeze(model_outputs[0, num_input_tokens:], dim=0)

output_text = tokenizer.batch_decode(
    new_tokens, add_special_tokens=False, skip_special_tokens=True
)
print(f"STT output = {output_text[0].upper()}")
```

**Model Architecture:** 

The architecture of granite-speech-3.2-8b consists of the following components:

(1) Speech encoder: 10 conformer blocks trained with Connectionist Temporal Classification (CTC) on character-level targets on the subset containing
only ASR corpora (see configuration below). In addition, our CTC encoder uses block-attention with 4-seconds audio blocks and self-conditioned CTC
from the middle layer.

| Configuration parameter  | Value                | 
|-----------------|----------------------|
| Input dimension | 160 (80 logmels x 2) | 
| Nb. of layers   | 10                   | 
| Hidden dimension | 1024                | 
| Nb. of attention heads | 8             | 
| Attention head size    | 128           | 
| Convolution kernel size | 15           | 
| Output dimension        | 42           | 

(2) Speech projector and temporal downsampler (speech-text modality adapter): we use a 2-layer window query transformer (q-former) operating on
blocks of 15 1024-dimensional acoustic embeddings coming out of the last conformer block of the speech encoder that get downsampled by a factor of 5
using 3 trainable queries per block and per layer. The total temporal downsampling factor is 10 (2x from the encoder and 5x from the projector)
resulting in a 10Hz acoustic embeddings rate for the LLM. The encoder, projector and LoRA adapters were fine-tuned/trained jointly on all the
corpora mentioned under **Training Data**.

(3) Large language model: granite-3.2-8b-instruct with 128k context length (https://huggingface.co/ibm-granite/granite-3.2-8b-instruct).

(4) LoRA adapters: rank=64 applied to the query, value projection matrices

**Training Data:** 

Overall, our training data is largely comprised of two key sources: (1) publicly available datasets (2) Synthetic data created from publicly
available datasets specifically targeting the speech translation task. A detailed description of the training datasets can be found in the table
below:

| Name | Task | Nb. hours | Source |
|-----------|--------------|----------------|--------------|
| CommonVoice-17 English  | ASR | 2600 |   https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0 |
| MLS English             | ASR | 44000 |   https://huggingface.co/datasets/facebook/multilingual_librispeech |
| Librispeech             | ASR | 1000 |  https://huggingface.co/datasets/openslr/librispeech_asr | 
| VoxPopuli English       | ASR | 500 |  https://huggingface.co/datasets/facebook/voxpopuli | 
| AMI                     | ASR | 100 | https://huggingface.co/datasets/edinburghcstr/ami | 
| YODAS English           | ASR | 10000 |  https://huggingface.co/datasets/espnet/yodas
| CommonVoice-17 En->Ja   | AST | 2600 | translated with granite-3.2-8b and phi-4 |
| CommonVoice-17 En->De   | AST | 2600 | translated with granite-3.2-8b and phi-4 | 
| MLS English             | other | 44000 | transcripts description provided by granite-3.1-8b | 
| CREMA-D                 | SER | 3 | https://github.com/CheyneyComputerScience/CREMA-D | 
| MELD                    | SER | 7 | https://github.com/declare-lab/MELD |

**Infrastructure:**
We train Granite Speech using IBM's super computing cluster, Blue Vela, which is outfitted with NVIDIA H100 GPUs. This cluster provides a scalable
and efficient infrastructure for training our models over thousands of GPUs. The training of this particular model was completed in 10 days on 32
H100 GPUs.

**Ethical Considerations and Limitations:** 
The use of Large Speech and Language Models may involve risks and ethical considerations that people should be aware of. These risks may include bias and fairness, misinformation, and autonomous decision-making. We urge the community to use granite-speech-3.2-8b in a manner consistent with IBM's Responsible Use Guide or similar responsible use structures. IBM recommends using this model for automatic speech recognition tasks. The model's modular design improves safety by limiting how audio inputs can influence the system. If an unfamiliar or malformed prompt is received, the model simply echoes it with its transcription. This minimizes the risk of adversarial inputs, unlike integrated models that directly interpret audio and may be more exposed to such attacks. Note that more general speech tasks may pose higher inherent risks of triggering unwanted outputs. 

To enhance safety, we recommend using granite-speech-3.2-8b alongside Granite Guardian. Granite Guardian is a fine-tuned instruct model designed to detect and flag risks in prompts and responses across key dimensions outlined in the IBM AI Risk Atlas. Its training, which includes both human-annotated and synthetic data informed by internal red-teaming, enables it to outperform similar open-source models on standard benchmarks, providing an additional layer of safety.

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 🚀 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources