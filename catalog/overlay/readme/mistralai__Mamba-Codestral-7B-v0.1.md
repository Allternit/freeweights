# Model Card for Mamba-Codestral-7B-v0.1

Codestral Mamba is an open code model based on the Mamba2 architecture. It performs on par with state-of-the-art Transformer-based code models. \
You can read more in the [official blog post](https://mistral.ai/news/codestral-mamba/).


## Installation

It is recommended to use `mistralai/Mamba-Codestral-7B-v0.1` with [mistral-inference](https://github.com/mistralai/mistral-inference) 


```
pip install mistral_inference>=1 mamba-ssm causal-conv1d
```

or directly with the original [`mamba`](https://github.com/state-spaces/mamba) package:

```
pip install mamba_ssm causal-conv1d
```

## Download

```py
from huggingface_hub import snapshot_download
from pathlib import Path

mistral_models_path = Path.home().joinpath('mistral_models', 'Mamba-Codestral-7B-v0.1')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Mamba-Codestral-7B-v0.1", allow_patterns=["params.json", "consolidated.safetensors", "tokenizer.model.v3"], local_dir=mistral_models_path)
```

### Chat

After installing `mistral_inference`, a `mistral-demo` CLI command should be available in your environment.

```
mistral-chat $HOME/mistral_models/Mamba-Codestral-7B-v0.1 --instruct  --max_tokens 256
```

## Evaluation
We evaluate Codestral Mamba, Codestral and open-weight models of similar size on industry-standard benchmarks.
| Benchmarks | HumanEval | MBPP | Spider | CruxE | HumanEval C++ | HumanEvalJava |HumanEvalJS |HumanEval Bash |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| CodeGemma 1.1 7B | 61.0% | 67.7% | 46.3% | 50.4% | 49.1% | 41.8% | 52.2% | 9.4% |
| CodeLlama 7B | 31.1% | 48.2% | 29.3% | 50.1% | 31.7% | 29.7% | 31.7% | 11.4% |
| DeepSeek v1.5 7B | 65.9% | **70.8%** | **61.2%** | 55.5% | 59.0% | **62.7%** | 60.9% | **33.5%** |
| **Codestral Mamba (7B)** | **75.0%** | 68.5% | 58.8% | **57.8%** | **59.8%** | 57.0% | **61.5%** | 31.1% |
|
| **Codestral (22B)** | **81.1%%** | **78.2%%** | **63.5%%** | 51.3% | **65.2%** | **63.3%** | -  | **42.4%** |
| CodeLlama 34B | 43.3% | 75.1% | 50.8% | 55.2% | 51.6% | 57.0% | 59.0% | 29.7% |

## The Mistral AI Team

Albert Jiang, Alexandre Sablayrolles, Alexis Tacnet, Alok Kothari, Antoine Roux, Arthur Mensch, Audrey Herblin-Stoop, Augustin Garreau, Austin Birky, Bam4d, Baptiste Bout, Baudouin de Monicault, Blanche Savary, Carole Rambaud, Caroline Feldman, Devendra Singh Chaplot, Diego de las Casas, Eleonore Arcelin, Emma Bou Hanna, Etienne Metzger, Gaspard Blanchet, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Harizo Rajaona, Henri Roussez, Hichem Sattouf, Ian Mack, Jean-Malo Delignon, Jessica Chudnovsky, Justus Murke, Kartik Khandelwal, Lawrence Stewart, Louis Martin, Louis Ternon, Lucile Saulnier, Lélio Renard Lavaud, Margaret Jennings, Marie Pellat, Marie Torelli, Marie-Anne Lachaux, Marjorie Janiewicz, Mickaël Seznec, Nicolas Schuhl, Niklas Muhs, Olivier de Garrigues, Patrick von Platen, Paul Jacob, Pauline Buche, Pavan Kumar Reddy, Perry Savas, Pierre Stock, Romain Sauvestre, Sagar Vaze, Sandeep Subramanian, Saurabh Garg, Sophia Yang, Szymon Antoniak, Teven Le Scao, Thibault Schueller, Thibaut Lavril, Thomas Wang, Théophile Gervet, Timothée Lacroix, Valera Nemychnikova, Wendy Shang, William El Sayed, William Marshall