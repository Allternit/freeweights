<!-- <div align="center">
<p align="center">
  <img src="assets/overall.jpg" width="50%" height="50%" />
</p>
</div> -->

<div align="center">
<h1>E2Rank: Your Text Embedding can Also be an Effective and Efficient Listwise Reranker</h1>

<a href="https://Alibaba-NLP.github.io/E2Rank/">🤖 Website</a> | 
<a href="https://arxiv.org/abs/2510.22733">📄 Arxiv Paper</a> | 
<a href="https://huggingface.co/collections/Alibaba-NLP/e2rank">🤗 Huggingface Collection</a> |
<a href="#🚩-citation">🚩 Citation</a>

</div>

# 📌 Introduction

We introduce E2Rank, 
meaning **E**fficient **E**mbedding-based **Rank**ing
(also meaning **Embedding-to-Rank**), 
which extends a single text embedding model
to perform both high-quality retrieval and listwise reranking, 
thereby achieving strong effectiveness with remarkable efficiency. 

By applying cosine similarity between the query and
document embeddings as a unified ranking function, the listwise ranking prompt,
which is constructed from the original query and its candidate documents, serves
as an enhanced query enriched with signals from the top-K documents, akin to
pseudo-relevance feedback (PRF) in traditional retrieval models. This design 
preserves the efficiency and representational quality of the base embedding model
while significantly improving its reranking performance. 

Empirically, E2Rank achieves state-of-the-art results on the BEIR reranking benchmark 
and demonstrates competitive performance on the reasoning-intensive BRIGHT benchmark,
with very low reranking latency. We also show that the ranking training process
improves embedding performance on the MTEB benchmark. 
Our findings indicate that a single embedding model can effectively unify retrieval and reranking,
offering both computational efficiency and competitive ranking accuracy.

**Our work highlights the potential of single embedding models to serve as unified retrieval-reranking engines, offering a practical, efficient, and accurate alternative to complex multi-stage ranking systems.**


# 🚀 Quick Start

## Model List

| Supported Task              | Model Name           | Size | Layers | Sequence Length | Embedding Dimension | Instruction Aware |
|-----------------------------|----------------------|------|--------|-----------------|---------------------|-------------------|
| **Embedding + Reranking**   | [Alibaba-NLP/E2Rank-0.6B](https://huggingface.co/Alibaba-NLP/E2Rank-0.6B) | 0.6B | 28     | 32K             | 1024                | Yes            |
| **Embedding + Reranking**   | [Alibaba-NLP/E2Rank-4B](https://huggingface.co/Alibaba-NLP/E2Rank-4B)     | 4B   | 36     | 32K             | 2560                | Yes            |
| **Embedding + Reranking**   | [Alibaba-NLP/E2Rank-8B](https://huggingface.co/Alibaba-NLP/E2Rank-8B)     | 8B   | 36     | 32K             | 4096                | Yes            |
| Embedding Only              | [Alibaba-NLP/E2Rank-0.6B-Embedding-Only](https://huggingface.co/Alibaba-NLP/E2Rank-0.6B-Embedding-Only) | 0.6B | 28     | 32K             | 1024                | Yes         |
| Embedding Only              | [Alibaba-NLP/E2Rank-0.6B-Embedding-Only](https://huggingface.co/Alibaba-NLP/E2Rank-4B-Embedding-Only)   | 4B   | 36     | 32K             | 2560                | Yes         |
| Embedding Only              | [Alibaba-NLP/E2Rank-0.6B-Embedding-Only](https://huggingface.co/Alibaba-NLP/E2Rank-8B-Embedding-Only)   | 8B   | 36     | 32K             | 4096                | Yes         |


> **Note**:
> - `Embedding Only` indicates that the model is trained only with the constrative learning and support embedding tasks, while `Embedding + Reranking` indicates the **full E2Rank model** trained with both embedding and reranking objectives (for more detals, please refer to the [paper]()). 
> - `Instruction Aware` notes whether the model supports customizing the input instruction according to different tasks.
<!-- > - For `Listwise Reranking` models, they are supervised fine-tuned from the Qwen3 Models in the paradigm of RankGPT and support only the reranking task. -->

## Usage

### Embedding Model

The usage of E2Rank as an embedding model is similar to [Qwen3-Embedding](https://github.com/QwenLM/Qwen3-Embedding). The only difference is that Qwen3-Embedding will automatically append an EOS token, while E2Rank requires users to manully append the special token `<|endoftext|>` at the end of each input text.


**vLLM Usage (recommended)**

```python
# Requires vllm>=0.8.5
import torch
import vllm
from vllm import LLM
from vllm.config import PoolerConfig

def get_detailed_instruct(task_description: str, query: str) -> str:
    return f'Instruct: {task_description}\nQuery:{query}'

# Each query must come with a one-sentence instruction that describes the task
task = 'Given a web search query, retrieve relevant passages that answer the query'

queries = [
    get_detailed_instruct(task, 'What is the capital of China?'),
    get_detailed_instruct(task, 'Explain gravity')
]
# No need to add instruction for retrieval documents
documents = [
    "The capital of China is Beijing.",
    "Gravity is a force that attracts two bodies towards each other. It gives weight to physical objects and is responsible for the movement of planets around the sun."
]
input_texts = queries + documents
input_texts = [t + "<|endoftext|>" for t in input_texts]

model = LLM(
    model="Alibaba-NLP/E2Rank-0.6B",
    task="embed", 
    override_pooler_config=PoolerConfig(pooling_type="LAST", normalize=True)
)

outputs = model.embed(input_texts)
embeddings = torch.tensor([o.outputs.embedding for o in outputs])
scores = (embeddings[:2] @ embeddings[2:].T)
print(scores.tolist())
# [[0.5958386659622192, 0.030148349702358246], [0.060259245336055756, 0.5595865249633789]]
```

<details>
<summary><b>Transformers Usage</b></summary>

```python
# Requires transformers>=4.51.0
import torch
import torch.nn.functional as F

from torch import Tensor
from transformers import AutoTokenizer, AutoModel


def last_token_pool(last_hidden_states: Tensor, attention_mask: Tensor) -> Tensor:
    left_padding = (attention_mask[:, -1].sum() == attention_mask.shape[0])
    if left_padding:
        return last_hidden_states[:, -1]
    else:
        sequence_lengths = attention_mask.sum(dim=1) - 1
        batch_size = last_hidden_states.shape[0]
        return last_hidden_states[torch.arange(batch_size, device=last_hidden_states.device), sequence_lengths]


def get_detailed_instruct(task_description: str, query: str) -> str:
    return f'Instruct: {task_description}\nQuery:{query}'

# Each query must come with a one-sentence instruction that describes the task
task = 'Given a web search query, retrieve relevant passages that answer the query'

queries = [
    get_detailed_instruct(task, 'What is the capital of China?'),
    get_detailed_instruct(task, 'Explain gravity')
]
# No need to add instruction for retrieval documents
documents = [
    "The capital of China is Beijing.",
    "Gravity is a force that attracts two bodies towards each other. It gives weight to physical objects and is responsible for the movement of planets around the sun."
]
input_texts = queries + documents
input_texts = [t + "<|endoftext|>" for t in input_texts]

tokenizer = AutoTokenizer.from_pretrained('Alibaba-NLP/E2Rank-0.6B', padding_side='left')
model = AutoModel.from_pretrained('Alibaba-NLP/E2Rank-0.6B')

max_length = 8192

# Tokenize the input texts
batch_dict = tokenizer(
    input_texts,
    padding=True,
    truncation=True,
    max_length=max_length,
    return_tensors="pt",
)
batch_dict.to(model.device)
with torch.no_grad():
    outputs = model(**batch_dict)
    embeddings = last_token_pool(outputs.last_hidden_state, batch_dict['attention_mask'])

    # normalize embeddings
    embeddings = F.normalize(embeddings, p=2, dim=1)
    scores = (embeddings[:2] @ embeddings[2:].T)

print(scores.tolist())
# [[0.5950675010681152, 0.030417663976550102], [0.061970409005880356, 0.562691330909729]]
```
</details>


### Reranking

For using E2Rank as a reranker, you only need to perform additional processing on the query by adding (part of) the docs that needs to be reranked to the *listwise prompt*, while the rest is the same as using the embedding model.

**vLLM Usage (recommended)**

```python
# Requires vllm>=0.8.5
import torch
import vllm
from vllm import LLM
from vllm.config import PoolerConfig

model = LLM(
    model="./checkpoints/E2Rank-0.6B",
    task="embed", 
    override_pooler_config=PoolerConfig(pooling_type="LAST", normalize=True)
)
tokenizer = model.get_tokenizer()

def get_listwise_prompt(task_description: str, query: str, documents: list[str], num_input_docs: int = 20) -> str:
    input_docs = documents[:num_input_docs]
    input_docs = "\n".join([f"[{i}] {doc}" for i, doc in enumerate(input_docs, start=1)])
    messages = [{
        "role": "user", 
        "content": f'{task_description}\nDocuments:\n{input_docs}Search Query:{query}'
    }]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )
    return text

task = 'Given a web search query and some relevant documents, rerank the documents that answer the query:'

queries = [
    'What is the capital of China?',
    'Explain gravity'
]

# No need to add instruction for retrieval documents
documents = [
    "The capital of China is Beijing.",
    "Gravity is a force that attracts two bodies towards each other. It gives weight to physical objects and is responsible for the movement of planets around the sun."
]
documents = [doc + "<|endoftext|>" for doc in documents]

pseudo_queries = [
    get_listwise_prompt(task, queries[0], documents),
    get_listwise_prompt(task, queries[1], documents)
]  # no need to add the EOS token here

input_texts = pseudo_queries + documents

outputs = model.embed(input_texts)
embeddings = torch.tensor([o.outputs.embedding for o in outputs])
scores = (embeddings[:2] @ embeddings[2:].T)
print(scores.tolist())
# [[0.8516960144042969, 0.24043934047222137], [0.33099934458732605, 0.7905282974243164]]
```

<details>
<summary><b>Transformers Usage</b></summary>

```python
# Requires transformers>=4.51.0
import torch
import torch.nn.functional as F

from torch import Tensor
from transformers import AutoTokenizer, AutoModel


tokenizer = AutoTokenizer.from_pretrained('./checkpoints/E2Rank-0.6B', padding_side='left')
model = AutoModel.from_pretrained('./checkpoints/E2Rank-0.6B')


def last_token_pool(last_hidden_states: Tensor, attention_mask: Tensor) -> Tensor:
    left_padding = (attention_mask[:, -1].sum() == attention_mask.shape[0])
    if left_padding:
        return last_hidden_states[:, -1]
    else:
        sequence_lengths = attention_mask.sum(dim=1) - 1
        batch_size = last_hidden_states.shape[0]
        return last_hidden_states[torch.arange(batch_size, device=last_hidden_states.device), sequence_lengths]


def get_listwise_prompt(task_description: str, query: str, documents: list[str], num_input_docs: int = 20) -> str:
    input_docs = documents[:num_input_docs]
    input_docs = "\n".join([f"[{i}] {doc}" for i, doc in enumerate(input_docs, start=1)])
    messages = [{
        "role": "user", 
        "content": f'{task_description}\nDocuments:\n{input_docs}Search Query:{query}'
    }]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )
    return text

task = 'Given a web search query and some relevant documents, rerank the documents that answer the query:'

queries = [
    'What is the capital of China?',
    'Explain gravity'
]

# No need to add instruction for retrieval documents
documents = [
    "The capital of China is Beijing.",
    "Gravity is a force that attracts two bodies towards each other. It gives weight to physical objects and is responsible for the movement of planets around the sun."
]
documents = [doc + "<|endoftext|>" for doc in documents]

pseudo_queries = [
    get_listwise_prompt(task, queries[0], documents),
    get_listwise_prompt(task, queries[1], documents)
]  # no need to add the EOS token here

input_texts = pseudo_queries + documents


max_length = 8192
# Tokenize the input texts
batch_dict = tokenizer(
    input_texts,
    padding=True,
    truncation=True,
    max_length=max_length,
    return_tensors="pt",
)
batch_dict.to(model.device)
with torch.no_grad():
    outputs = model(**batch_dict)
    embeddings = last_token_pool(outputs.last_hidden_state, batch_dict['attention_mask'])

    # normalize embeddings
    embeddings = F.normalize(embeddings, p=2, dim=1)
    scores = (embeddings[:2] @ embeddings[2:].T)

print(scores.tolist())
# [[0.8513513207435608, 0.24268491566181183], [0.33154672384262085, 0.7923378944396973]]
```
</details>

### End-to-end search

Since E2Rank extends a single text embedding model to perform both high-quality retrieval and listwise reranking, you can directly use it to build an end-to-end search system. By reusing the embeddings computed during the retrieval stage, E2Rank only need to compute the pseudo query's embedding and can efficiently rerank the retrieved documents with minimal additional computational overhead.

Example code is coming soon.

# 📊 Evaluation

## Reranking Benchmark

### BEIR

|                                                            | Covid | NFCorpus | Touche | DBPedia | SciFact | Signal |  News | Robust |    Avg.   |
|------------------------------------------------------------|:-----:|:--------:|:------:|:-------:|:-------:|:------:|:-----:|:------:|:---------:|
| BM25                                                       | 59.47 |   30.75  |  44.22 |  31.80  |  67.89  |  33.05 | 39.52 |  40.70 |   43.43   |
| *Zero-shot Listwise Reranker*                              |       |          |        |         |         |        |       |        |           |
| RankGPT-4o                                                 | 83.41 |   39.67  |  32.26 |  45.56  |  77.41  |  34.20 | 51.92 |  60.25 |   53.09   |
| RankGPT-4o-mini                                            | 80.03 |   38.73  |  30.91 |  44.54  |  73.14  |  33.64 | 50.91 |  57.41 |   51.16   |
| RankQwen3-14B                                              | 84.45 |   38.94  |  38.30 |  44.52  |  78.64  |  33.58 | 51.24 |  59.66 |   53.67   |
| RankQwen3-32B                                              | 83.48 |   39.22  |  37.13 |  45.00  |  78.22  |  32.12 | 51.08 |  60.74 |   53.37   |
| *Fine-tuned Listwise Reranker based on Qwen3*              |       |          |        |         |         |        |       |        |           |
| RankQwen3-0.6B                                             | 78.35 |   36.41  |  37.54 |  39.19  |  71.01  |  30.96 | 44.43 |  46.31 |   48.03   |
| RankQwen3-4B                                               | 83.91 |   39.88  |  32.66 |  43.91  |  76.37  |  32.15 | 50.81 |  59.36 |   52.38   |
| RankQwen3-8B                                               | 85.37 |   40.05  |  31.73 |  45.44  |  78.96  |  32.48 | 52.36 |  60.72 |   53.39   |
| *Ours*                                                     |       |          |        |         |         |        |       |        |           |
| **E2Rank-0.6B**                                            | 79.17 |   38.60  |  41.91 |  41.96  |  73.43  |  35.26 | 52.75 |  53.67 |   52.09   |
| **E2Rank-4B**                                              | 83.30 |   39.20  |  43.16 |  42.95  |  77.19  |  34.48 | 52.71 |  60.16 |   54.14   |
| **E2Rank-8B**                                              | 84.09 |   39.08  |  42.06 |  43.44  |  77.49  |  34.01 | 54.25 |  60.34 | **54.35** |

## Embedding Benchmark

### MTEB (Eng, v1)

| Models                             | Retr. | Rerank. | Clust. | PairClass. | Class. |  STS  | Summ. |    Avg.   |
|------------------------------------|:-----:|:-------:|:------:|:----------:|:------:|:-----:|:-----:|:---------:|
| Instructor-xl                      | 49.26 |  57.29  |  44.74 |    86.62   |  73.12 | 83.06 | 32.32 | 61.79     |
| BGE-large-en-v1.5                  | 54.29 |  60.03  |  46.08 |    87.12   |  75.97 | 83.11 | 31.61 | 64.23     |
| GritLM-7B                          | 53.10 |  61.30  |  48.90 |    86.90   |  77.00 | 82.80 | 29.40 | 64.70     |
| E5-Mistral-7b-v1                   | 52.78 |  60.38  |  47.78 |    88.47   |  76.80 | 83.77 | 31.90 | 64.56     |
| Echo-Mistral-7b-v1                 | 55.52 |  58.14  |  46.32 |    87.34   |  77.43 | 82.56 | 30.73 | 64.68     |
| LLM2Vec-Mistral-7B                 | 55.99 |  58.42  |  45.54 |    87.99   |  76.63 | 84.09 | 29.96 | 64.80     |
| LLM2Vec-Meta-LLaMA-3-8B            | 56.63 |  59.68  |  46.45 |    87.80   |  75.92 | 83.58 | 30.94 | 65.01     |
| **E2Rank-0.6B**                    | 51.74 |  55.97  |  40.85 |    83.93   |  73.66 | 81.41 | 30.90 | 61.25     |
| **E2Rank-4B**                      | 55.33 |  59.10  |  44.27 |    87.14   |  77.08 | 84.03 | 30.06 | 64.47     |
| **E2Rank-8B**                      | 56.89 |  59.58  |  44.75 |    86.96   |  76.81 | 84.52 | 30.23 | **65.03** |

> Note: For baselines, we only compared with models that are trained using public datasets.


# 🚩 Citation

If this work is helpful, please kindly cite as:

```bibtext
@misc{liu2025e2rank,
      title={E2Rank: Your Text Embedding can Also be an Effective and Efficient Listwise Reranker}, 
      author={Qi Liu and Yanzhao Zhang and Mingxin Li and Dingkun Long and Pengjun Xie and Jiaxin Mao},
      year={2025},
      eprint={2510.22733},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2510.22733}, 
}
```

If you have any questions, feel free to contact us via qiliu6777[AT]gmail.com or create an issue.
