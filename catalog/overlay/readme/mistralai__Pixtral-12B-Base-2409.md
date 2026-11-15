# Pixtral-12B-Base-2409

The Pixtral-12B-Base-2409 is the pretrained base model of [Pixtral-12B-2409](https://huggingface.co/mistralai/Pixtral-12B-2409) 
consisting of 12B parameters plus a 400M parameter vision encoder.

For more details about this model please refer to our release [blog post](https://mistral.ai/news/pixtral-12b/).

Feel free to try it [here](https://chat.mistral.ai/chat)

## Key features
- Natively multimodal, trained with interleaved image and text data
- 12B parameter Multimodal Decoder + 400M parameter Vision Encoder
- Supports variable image sizes
- Leading performance in its weight class on multimodal tasks
- Maintains state-of-the-art performance on text-only benchmarks
- Sequence length: 128k
- License: Apache 2.0

## Usage Examples

### vLLM (recommended)

We recommend using Pixtral with the [vLLM library](https://github.com/vllm-project/vllm)
to implement production-ready inference pipelines with Pixtral.

**_Installation_**

Make sure you install `vLLM >= v0.6.2`:

```
pip install --upgrade vllm
```

Also make sure you have `mistral_common >= 1.4.4` installed:

```
pip install --upgrade mistral_common
```

You can also make use of a ready-to-go [docker image](https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39?context=explore).

**_Example_**

```py
from vllm import LLM
from vllm.sampling_params import SamplingParams
from vllm.inputs.data import TokensPrompt
import requests
from PIL import Image
from io import BytesIO
from vllm.multimodal import MultiModalDataBuiltins

from mistral_common.protocol.instruct.messages import TextChunk, ImageURLChunk

model_name = "mistralai/Pixtral-12B-Base-2409"
sampling_params = SamplingParams(max_tokens=8192)

llm = LLM(model=model_name, tokenizer_mode="mistral")

url = "https://huggingface.co/datasets/patrickvonplaten/random_img/resolve/main/yosemite.png"
response = requests.get(url)
image = Image.open(BytesIO(response.content))

prompt = "The image shows a"

user_content = [ImageURLChunk(image_url=url), TextChunk(text=prompt)]

tokenizer = llm.llm_engine.tokenizer.tokenizer.mistral.instruct_tokenizer
tokens, _ = tokenizer.encode_user_content(user_content, False)

prompt = TokensPrompt(
    prompt_token_ids=tokens, multi_modal_data=MultiModalDataBuiltins(image=[image])
)
outputs = llm.generate(prompt, sampling_params=sampling_params)

print(outputs[0].outputs[0].text)
# ' view of a river flowing through the landscape, with prominent rock formations visible on either side of the river. The scene is captured using the UWA 14-24mm zoom lens, which provides a wide-angle perspective,
# allowing for a comprehensive view of the surroundings. The photo is credited to Greg Dowdy.
```

### Mistral-inference

We recommend using [mistral-inference](https://github.com/mistralai/mistral-inference) to quickly try out / "vibe-check" Pixtral.


**_Install_**

Make sure to have `mistral_inference >= 1.4.1` installed.

```
pip install mistral_inference --upgrade
```

**_Download_**

```py
from huggingface_hub import snapshot_download
from pathlib import Path

mistral_models_path = Path.home().joinpath('mistral_models', 'Pixtral')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Pixtral-12B-Base-2409", allow_patterns=["params.json", "consolidated.safetensors", "tekken.json"], local_dir=mistral_models_path)
```

**_Python_**

You can also run the model in a Python shell as follows.

```py
from mistral_inference.transformer import Transformer
from mistral_inference.generate import generate

from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.protocol.instruct.messages import TextChunk, ImageURLChunk

mistral_models_path = "/mnt/vast/shared/william/pixtral_pretrain_release"
tokenizer = MistralTokenizer.from_file(f"{mistral_models_path}/tekken.json")
model = Transformer.from_folder(mistral_models_path)

url = "https://huggingface.co/datasets/patrickvonplaten/random_img/resolve/main/yosemite.png"
prompt = "The above image presents a"

user_content = [ImageURLChunk(image_url=url), TextChunk(text=prompt)]

tokens, images = tokenizer.instruct_tokenizer.encode_user_content(user_content, False)

out_tokens, _ = generate(
    [tokens],
    model,
    images=[images],
    max_tokens=256,
    temperature=0.35,
    eos_id=tokenizer.instruct_tokenizer.tokenizer.eos_id,
)
result = tokenizer.decode(out_tokens[0])

print("Prompt:", prompt)
print("Completion:", result)
```

## Limitations

The Pixtral model does not have any moderation mechanisms. We're looking forward to engaging with the community on ways to
make the model finely respect guardrails, allowing for deployment in environments requiring moderated outputs.

## The Mistral AI Team

Albert Jiang, Alexandre Sablayrolles, Alexis Tacnet, Alok Kothari, Antoine Roux, Arthur Mensch, Audrey Herblin-Stoop, Augustin Garreau, Austin Birky, Bam4d, Baptiste Bout, Baudouin de Monicault, Blanche Savary, Carole Rambaud, Caroline Feldman, Devendra Singh Chaplot, Diego de las Casas, Diogo Costa, Eleonore Arcelin, Emma Bou Hanna, Etienne Metzger, Gaspard Blanchet, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Harizo Rajaona, Henri Roussez, Hichem Sattouf, Ian Mack, Jean-Malo Delignon, Jessica Chudnovsky, Justus Murke, Kartik Khandelwal, Lawrence Stewart, Louis Martin, Louis Ternon, Lucile Saulnier, Lélio Renard Lavaud, Margaret Jennings, Marie Pellat, Marie Torelli, Marie-Anne Lachaux, Marjorie Janiewicz, Mickaël Seznec, Nicolas Schuhl, Niklas Muhs, Olivier de Garrigues, Patrick von Platen, Paul Jacob, Pauline Buche, Pavan Kumar Reddy, Perry Savas, Pierre Stock, Romain Sauvestre, Sagar Vaze, Sandeep Subramanian, Saurabh Garg, Sophia Yang, Szymon Antoniak, Teven Le Scao, Thibault Schueller, Thibaut Lavril, Thomas Wang, Théophile Gervet, Timothée Lacroix, Valera Nemychnikova, Wendy Shang, William El Sayed, William Marshall