# Model Card for Mistral-Nemo-Instruct-FP8-2407

The Mistral-Nemo-Instruct-FP8-2407 Large Language Model (LLM) is a quantized instruct fine-tuned version of the [Mistral-Nemo-Base-2407](https://huggingface.co/mistralai/Mistral-Nemo-Base-2407). Trained jointly by Mistral AI and NVIDIA, it significantly outperforms existing models smaller or similar in size.

For more details about this model please refer to our release [blog post](https://mistral.ai/news/mistral-nemo/).

## Key features
- Released under the **Apache 2 License**
- Pre-trained and instructed versions
- Trained with a **128k context window**
- Trained on a large proportion of **multilingual and code data**
- Drop-in replacement of Mistral 7B

## Model Architecture
Mistral Nemo is a transformer model, with the following architecture choices:
- **Layers:** 40
- **Dim:** 5,120
- **Head dim:** 128
- **Hidden dim:** 14,336
- **Activation Function:** SwiGLU
- **Number of heads:** 32
- **Number of kv-heads:** 8 (GQA)
- **Vocabulary size:** 2**17 ~= 128k
- **Rotary embeddings (theta = 1M)**

## Metrics

### Main Benchmarks

| Benchmark | Score |
| --- | --- |
| HellaSwag (0-shot) | 83.5% |
| Winogrande (0-shot) | 76.8% |
| OpenBookQA (0-shot) | 60.6% |
| CommonSenseQA (0-shot) | 70.4% |
| TruthfulQA (0-shot) | 50.3% |
| MMLU (5-shot) | 68.0% |
| TriviaQA (5-shot) | 73.8% |
| NaturalQuestions (5-shot) | 31.2% |

### Multilingual Benchmarks (MMLU)

| Language | Score |
| --- | --- |
| French | 62.3% |
| German | 62.7% |
| Spanish | 64.6% |
| Italian | 61.3% |
| Portuguese | 63.3% |
| Russian | 59.2% |
| Chinese | 59.0% |
| Japanese | 59.0% |

## Usage

The model can be used with the [vLLM](https://github.com/vllm-project/vllm) library.


**_Installation_**

Make sure to install a fresh version of vLLM:

```bash
pip install --upgrade vllm
```

Also make sure to have `mistral_common` installed:

```bash
pip install --upgrade mistral_common
```

**_Example_**

You can use Mistral-Nemo-Instruct-FP8-2407 in a server/client settings.

1. Spin up the server:

```python
vllm serve mistralai/Mistral-Nemo-Instruct-FP8-2407 --tokenizer_mode mistral --config_format mistral --load_format mistral --tool-call-parser mistral
```

2. To ping the client, you can use a simple Python snippet:

```python
import requests
import json

url = "http://localhost:8000/v1/chat/completions"
headers = {"Content-Type": "application/json", "Authorization": "Bearer token"}

model = "mistralai/Mistral-Nemo-Instruct-FP8-2407"

messages = [
    {
        "role": "user",
        "content": "How expensive would it be to ask a window cleaner to clean all windows in Paris. Make a reasonable guess in US Dollar."
    },
]

data = {"model": model, "messages": messages}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json()["choices"][0]["message"]["content"])
# To estimate the cost of hiring a window cleaner in Paris for all windows, we need to make several assumptions:

#1. Paris has approximately 45,000 buildings, according to the city's official statistics...
```

## Limitations

The Mistral Nemo Instruct model is a quick demonstration that the base model can be easily fine-tuned to achieve compelling performance. 
It does not have any moderation mechanisms. We're looking forward to engaging with the community on ways to
make the model finely respect guardrails, allowing for deployment in environments requiring moderated outputs.

## The Mistral AI Team

Albert Jiang, Alexandre Sablayrolles, Alexis Tacnet, Alok Kothari, Antoine Roux, Arthur Mensch, Audrey Herblin-Stoop, Augustin Garreau, Austin Birky, Bam4d, Baptiste Bout, Baudouin de Monicault, Blanche Savary, Carole Rambaud, Caroline Feldman, Devendra Singh Chaplot, Diego de las Casas, Eleonore Arcelin, Emma Bou Hanna, Etienne Metzger, Gaspard Blanchet, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Harizo Rajaona, Henri Roussez, Hichem Sattouf, Ian Mack, Jean-Malo Delignon, Jessica Chudnovsky, Justus Murke, Kartik Khandelwal, Lawrence Stewart, Louis Martin, Louis Ternon, Lucile Saulnier, Lélio Renard Lavaud, Margaret Jennings, Marie Pellat, Marie Torelli, Marie-Anne Lachaux, Marjorie Janiewicz, Mickaël Seznec, Nicolas Schuhl, Niklas Muhs, Olivier de Garrigues, Patrick von Platen, Paul Jacob, Pauline Buche, Pavan Kumar Reddy, Perry Savas, Pierre Stock, Romain Sauvestre, Sagar Vaze, Sandeep Subramanian, Saurabh Garg, Sophia Yang, Szymon Antoniak, Teven Le Scao, Thibault Schueller, Thibaut Lavril, Thomas Wang, Théophile Gervet, Timothée Lacroix, Valera Nemychnikova, Wendy Shang, William El Sayed, William Marshall