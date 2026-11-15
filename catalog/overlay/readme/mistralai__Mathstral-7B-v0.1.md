# Model Card for Mathstral-7b-v0.1

Mathstral 7B is a model specializing in mathematical and scientific tasks, based on Mistral 7B.
You can read more in the [official blog post](https://mistral.ai/news/mathstral/).

## Installation

It is recommended to use `mistralai/Mathstral-7b-v0.1` with [mistral-inference](https://github.com/mistralai/mistral-inference) 


```
pip install mistral_inference>=1.2.0
```


## Download

```py
from huggingface_hub import snapshot_download
from pathlib import Path

mistral_models_path = Path.home().joinpath('mistral_models', 'Mathstral-7b-v0.1')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Mathstral-7b-v0.1", allow_patterns=["params.json", "consolidated.safetensors", "tokenizer.model.v3"], local_dir=mistral_models_path)
```

### Chat

After installing `mistral_inference`, a `mistral-demo` CLI command should be available in your environment.

```
mistral-chat $HOME/mistral_models/Mathstral-7b-v0.1 --instruct --max_tokens 256
```

You can then start chatting with the model, *e.g.* prompt it with something like:


*"Albert likes to surf every week. Each surfing session lasts for 4 hours and costs $20 per hour. How much would Albert spend in 5 weeks?"*

### Usage in `transformers`

To use this model within the `transformers` library, install the latest release with `pip install --upgrade transformers` and run, for instance:

```py
from transformers import pipeline
import torch

checkpoint = "mistralai/Mathstral-7b-v0.1"
pipe = pipeline("text-generation", checkpoint, device_map="auto", torch_dtype=torch.bfloat16)

prompt = [{"role": "user", "content": "What are the roots of unity?"}]
out = pipe(prompt, max_new_tokens = 512)

print(out[0]['generated_text'][-1])
>>> "{'role': 'assistant', 'content': ' The roots of unity are the complex numbers that satisfy the equation $z^n = 1$, where $n$ is a positive integer. These roots are evenly spaced around the unit circle in the complex plane, and they have a variety of interesting properties and applications in mathematics and physics.'}"
```

You can also manually tokenize the input and generate text from the model, rather than using the higher-level pipeline:

```py
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

checkpoint = "mistralai/Mathstral-7b-v0.1"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForCausalLM.from_pretrained(checkpoint, device_map="auto", torch_dtype=torch.bfloat16)

prompt = [{"role": "user", "content": "What are the roots of unity?"}]
tokenized_prompt = tokenizer.apply_chat_template(prompt, add_generation_prompt=True, return_dict=True, return_tensors="pt").to(model.device)

out = model.generate(**tokenized_prompt, max_new_tokens=512)
tokenizer.decode(out[0])
>>> '<s>[INST] What are the roots of unity?[/INST] The roots of unity are the complex numbers that satisfy the equation $z^n = 1$, where $n$ is a positive integer. These roots are evenly spaced around the unit circle in the complex plane, and they have a variety of interesting properties and applications in mathematics and physics.</s>'
```

## Evaluation
We evaluate Mathstral 7B and open-weight models of the similar size on industry-standard benchmarks.
| Benchmarks | MATH | GSM8K (8-shot) | Odyssey Math maj@16 | GRE Math maj@16 | AMC 2023 maj@16 | AIME 2024 maj@16
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Mathstral 7B | **56.6** | 77.1 | **37.2** | 56.9 | **42.4** | **2/30** |
| DeepSeek Math 7B | 44.4 | **80.6** | 27.6 | 44.6 | 28.0 | 0/30 |
| Llama3 8B | 28.4 | 75.4 | 24.0 | 26.2 | 34.4 | 0/30 |
| GLM4 9B | 50.2 | 48.8 | 18.9 | 46.2 | 36.0 | 1/30 |
| QWen2 7B | **56.8** | 32.7 | 24.8 | **58.5** | 35.2 | **2/30** |
| Gemma2 9B | 48.3 | 69.5 | 18.6 | 52.3 | 31.2 | 1/30 |


## The Mistral AI Team

Albert Jiang, Alexandre Sablayrolles, Alexis Tacnet, Alok Kothari, Antoine Roux, Arthur Mensch, Audrey Herblin-Stoop, Augustin Garreau, Austin Birky, Bam4d, Baptiste Bout, Baudouin de Monicault, Blanche Savary, Carole Rambaud, Caroline Feldman, Devendra Singh Chaplot, Diego de las Casas, Eleonore Arcelin, Emma Bou Hanna, Etienne Metzger, Gaspard Blanchet, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Harizo Rajaona, Henri Roussez, Hichem Sattouf, Ian Mack, Jean-Malo Delignon, Jessica Chudnovsky, Justus Murke, Kartik Khandelwal, Lawrence Stewart, Louis Martin, Louis Ternon, Lucile Saulnier, Lélio Renard Lavaud, Margaret Jennings, Marie Pellat, Marie Torelli, Marie-Anne Lachaux, Marjorie Janiewicz, Mickaël Seznec, Nicolas Schuhl, Niklas Muhs, Olivier de Garrigues, Patrick von Platen, Paul Jacob, Pauline Buche, Pavan Kumar Reddy, Perry Savas, Pierre Stock, Romain Sauvestre, Sagar Vaze, Sandeep Subramanian, Saurabh Garg, Sophia Yang, Szymon Antoniak, Teven Le Scao, Thibault Schueller, Thibaut Lavril, Thomas Wang, Théophile Gervet, Timothée Lacroix, Valera Nemychnikova, Wendy Shang, William El Sayed, William Marshall