# Nomic Embed Code: A State-of-the-Art Code Retriever

[Blog](https://www.nomic.ai/blog/posts/introducing-state-of-the-art-nomic-embed-code) | [Technical Report](https://arxiv.org/abs/2412.01007) | [AWS SageMaker](https://aws.amazon.com/marketplace/seller-profile?id=seller-tpqidcj54zawi) | [Atlas Embedding and Unstructured Data Analytics Platform](https://atlas.nomic.ai)


`nomic-embed-code` is a state-of-the-art code embedding model that excels at code retrieval tasks:

- **High Performance**: Outperforms Voyage Code 3 and OpenAI Embed 3 Large on CodeSearchNet
- **Multilingual Code Support**: Trained for multiple programming languages (Python, Java, Ruby, PHP, JavaScript, Go)
- **Advanced Architecture**: 7B parameter code embedding model
- **Fully Open-Source**: Model weights, training data, and [evaluation code](https://github.com/gangiswag/cornstack/) released

| Model | Python | Java | Ruby | PHP | JavaScript | Go |
|-------|--------|------|------|-----|------------|-----|
| **Nomic Embed Code** | **81.7** | **80.5** | 81.8 | **72.3** | 77.1 | **93.8** |
| Voyage Code 3 | 80.8 | **80.5** | **84.6** | 71.7 | **79.2** | 93.2 |
| OpenAI Embed 3 Large | 70.8 | 72.9 | 75.3 | 59.6 | 68.1 | 87.6 |
| Nomic CodeRankEmbed-137M | 78.4 | 76.9 | 79.3 | 68.8 | 71.4 | 92.7 |
| CodeSage Large v2 (1B) | 74.2 | 72.3 | 76.7 | 65.2 | 72.5 | 84.6 |
| CodeSage Large (1B) | 70.8 | 70.2 | 71.9 | 61.3 | 69.5 | 83.7 |
| Qodo Embed 1 7B | 59.9 | 61.6 | 68.4 | 48.5 | 57.0 | 81.4 |

## Model Architecture

- **Total Parameters**: 7B
- **Training Approach**: Trained on the CoRNStack dataset with dual-consistency filtering and progressive hard negative mining
- **Supported Languages**: Python, Java, Ruby, PHP, JavaScript, and Go

## Usage Guide

### Installation

You can install the necessary dependencies with:

```bash
pip install transformers sentence-transformers torch
```

### Transformers

```python
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained("nomic-ai/nomic-embed-code")
model = AutoModel.from_pretrained("nomic-ai/nomic-embed-code")

def last_token_pooling(hidden_states, attention_mask):
    sequence_lengths = attention_mask.sum(-1) - 1
    return hidden_states[torch.arange(hidden_states.shape[0]), sequence_lengths]

queries = ['Represent this query for searching relevant code: Calculate the n-th factorial']
codes = ['def fact(n):\n if n < 0:\n  raise ValueError\n return 1 if n == 0 else n * fact(n - 1)']
code_snippets = queries + codes

encoded_input = tokenizer(code_snippets, padding=True, truncation=True, return_tensors='pt')
model.eval()
with torch.no_grad():
    model_output = model(**encoded_input)[0]

embeddings = last_token_pooling(model_output, encoded_input['attention_mask'])
embeddings = F.normalize(embeddings, p=2, dim=1)
print(embeddings.shape)

similarity = F.cosine_similarity(embeddings[0], embeddings[1], dim=0)
print(similarity)
```

### SentenceTransformers

```python
from sentence_transformers import SentenceTransformer

queries = ['Calculate the n-th factorial']
code_snippets = ['def fact(n):\n if n < 0:\n  raise ValueError\n return 1 if n == 0 else n * fact(n - 1)']

model = SentenceTransformer("nomic-ai/nomic-embed-code")
query_emb = model.encode(queries, prompt_name="query")
code_emb = model.encode(code_snippets)

similarity = model.similarity(query_emb[0], code_emb[0])
print(similarity)
```


### CoRNStack Dataset Curation

Starting with the deduplicated Stackv2, we create text-code pairs from function docstrings and respective code. We filtered out low-quality pairs where the docstring wasn't English, too short, or that contained URLs, HTML tags, or invalid characters. We additionally kept docstrings with text lengths of 256 tokens or longer to help the model learn long-range dependencies.


![image/png](https://cdn-uploads.huggingface.co/production/uploads/607997c83a565c15675055b3/rb-J54KLgg21f59Ba1jWp.png)

After the initial filtering, we used dual-consistency filtering to remove potentially noisy examples. We embed each docstring and code pair and compute the similarity between each docstring and every code example. We remove pairs from the dataset if the corresponding code example is not found in the top-2 most similar examples for a given docstring.

During training, we employ a novel curriculum-based hard negative mining strategy to ensure the model learns from challenging examples. We use a softmax-based sampling strategy to progressively sample hard negatives with increasing difficulty over time.


## Join the Nomic Community

- Nomic Embed Ecosystem: [https://www.nomic.ai/embed](https://www.nomic.ai/embed)
- Website: [https://nomic.ai](https://nomic.ai)
- Twitter: [https://twitter.com/nomic_ai](https://twitter.com/nomic_ai)
- Discord: [https://discord.gg/myY5YDR8z8](https://discord.gg/myY5YDR8z8)

# Citation

If you find the model, dataset, or training code useful, please cite our work:

```bibtex
@misc{suresh2025cornstackhighqualitycontrastivedata,
      title={CoRNStack: High-Quality Contrastive Data for Better Code Retrieval and Reranking}, 
      author={Tarun Suresh and Revanth Gangi Reddy and Yifei Xu and Zach Nussbaum and Andriy Mulyar and Brandon Duderstadt and Heng Ji},
      year={2025},
      eprint={2412.01007},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2412.01007}, 
}
```