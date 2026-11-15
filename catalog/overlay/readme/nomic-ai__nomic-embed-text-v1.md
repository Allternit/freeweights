# nomic-embed-text-v1: A Reproducible Long Context (8192) Text Embedder 

[Blog](https://www.nomic.ai/blog/posts/nomic-embed-text-v1) | [Technical Report](https://arxiv.org/abs/2402.01613) | [AWS SageMaker](https://aws.amazon.com/marketplace/seller-profile?id=seller-tpqidcj54zawi) | [Atlas Embedding and Unstructured Data Analytics Platform](https://atlas.nomic.ai)

`nomic-embed-text-v1` is 8192 context length text encoder that surpasses OpenAI text-embedding-ada-002 and text-embedding-3-small performance on short and long context tasks.

# Performance Benchmarks

| Name                             | SeqLen | MTEB      | LoCo     | Jina Long Context |  Open Weights | Open Training Code | Open Data   |
| :-------------------------------:| :----- | :-------- | :------: | :---------------: | :-----------: | :----------------: | :---------- |
| nomic-embed-text-v1              | 8192   | **62.39** |**85.53** | 54.16             | ✅            | ✅                  | ✅          |
| jina-embeddings-v2-base-en       | 8192   | 60.39     | 85.45    | 51.90             | ✅            | ❌                  | ❌          |
| text-embedding-3-small           | 8191   | 62.26     | 82.40    | **58.20**         | ❌            | ❌                  | ❌          |
| text-embedding-ada-002           | 8191   | 60.99     | 52.7     | 55.25             | ❌            | ❌                  | ❌          |


**Exciting Update!**: `nomic-embed-text-v1` is now multimodal! [nomic-embed-vision-v1](https://huggingface.co/nomic-ai/nomic-embed-vision-v1) is aligned to the embedding space of `nomic-embed-text-v1`, meaning any text embedding is multimodal!

## Usage

**Important**: the text prompt *must* include a *task instruction prefix*, instructing the model which task is being performed. 

For example, if you are implementing a RAG application, you embed your documents as `search_document: <text here>` and embed your user queries as `search_query: <text here>`.

**Notice**: From transformers v5.5.0 and sentence transformers v5.3.0, `trust_remote_code=True` will no longer be necessary. This will only be possible with the text-only series as of now.

## Task instruction prefixes

### `search_document`

#### Purpose: embed texts as documents from a dataset

This prefix is used for embedding texts as documents, for example as documents for a RAG index.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")
sentences = ['search_document: TSNE is a dimensionality reduction algorithm created by Laurens van Der Maaten']
embeddings = model.encode(sentences)
print(embeddings)
```

### `search_query`

#### Purpose: embed texts as questions to answer

This prefix is used for embedding texts as questions that documents from a dataset could resolve, for example as queries to be answered by a RAG application.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")
sentences = ['search_query: Who is Laurens van Der Maaten?']
embeddings = model.encode(sentences)
print(embeddings)
```

### `clustering`

#### Purpose: embed texts to group them into clusters

This prefix is used for embedding texts in order to group them into clusters, discover common topics, or remove semantic duplicates.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")
sentences = ['clustering: the quick brown fox']
embeddings = model.encode(sentences)
print(embeddings)
```

### `classification`

#### Purpose: embed texts to classify them

This prefix is used for embedding texts into vectors that will be used as features for a classification model

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")
sentences = ['classification: the quick brown fox']
embeddings = model.encode(sentences)
print(embeddings)
```

### Sentence Transformers
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")
sentences = ['search_query: What is TSNE?', 'search_query: Who is Laurens van der Maaten?']
embeddings = model.encode(sentences)
print(embeddings)
```

### Transformers

```python
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

sentences = ['search_query: What is TSNE?', 'search_query: Who is Laurens van der Maaten?']

tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModel.from_pretrained('nomic-ai/nomic-embed-text-v1')
model.eval()

encoded_input = tokenizer(sentences, padding=True, truncation=True, return_tensors='pt')

with torch.no_grad():
    model_output = model(**encoded_input)

embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
embeddings = F.normalize(embeddings, p=2, dim=1)
print(embeddings)
```

The model natively supports scaling of the sequence length past 2048 tokens. To do so, 

```diff
- tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
+ tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased', model_max_length=8192)


- model = AutoModel.from_pretrained('nomic-ai/nomic-embed-text-v1')
+ rope_parameters = {"rope_theta": 1000.0, "rope_type": "dynamic", "factor": 2.0}
+ model = AutoModel.from_pretrained('nomic-ai/nomic-embed-text-v1', rope_parameters=rope_parameters)
```

### Transformers.js

```js
import { pipeline } from '@xenova/transformers';

// Create a feature extraction pipeline
const extractor = await pipeline('feature-extraction', 'nomic-ai/nomic-embed-text-v1', {
    quantized: false, // Comment out this line to use the quantized version
});

// Compute sentence embeddings
const texts = ['search_query: What is TSNE?', 'search_query: Who is Laurens van der Maaten?'];
const embeddings = await extractor(texts, { pooling: 'mean', normalize: true });
console.log(embeddings);
```

## Nomic API

The easiest way to get started with Nomic Embed is through the Nomic Embedding API.

Generating embeddings with the `nomic` Python client is as easy as 

```python
from nomic import embed

output = embed.text(
    texts=['Nomic Embedding API', '#keepAIOpen'],
    model='nomic-embed-text-v1',
    task_type='search_document'
)

print(output)
```

For more information, see the [API reference](https://docs.nomic.ai/reference/endpoints/nomic-embed-text)


## Training
Click the Nomic Atlas map below to visualize a 5M sample of our contrastive pretraining data!

[![image/webp](https://cdn-uploads.huggingface.co/production/uploads/607997c83a565c15675055b3/pjhJhuNyRfPagRd_c_iUz.webp)](https://atlas.nomic.ai/map/nomic-text-embed-v1-5m-sample)

We train our embedder using a multi-stage training pipeline. Starting from a long-context [BERT model](https://huggingface.co/nomic-ai/nomic-bert-2048),
the first unsupervised contrastive stage trains on a dataset generated from weakly related text pairs, such as question-answer pairs from forums like StackExchange and Quora, title-body pairs from Amazon reviews, and summarizations from news articles.

In the second finetuning stage, higher quality labeled datasets such as search queries and answers from web searches are leveraged. Data curation and hard-example mining is crucial in this stage.

For more details, see the Nomic Embed [Technical Report](https://static.nomic.ai/reports/2024_Nomic_Embed_Text_Technical_Report.pdf) and corresponding [blog post](https://blog.nomic.ai/posts/nomic-embed-text-v1).

Training data to train the models is released in its entirety. For more details, see the `contrastors` [repository](https://github.com/nomic-ai/contrastors)


# Join the Nomic Community

- Nomic: [https://nomic.ai](https://nomic.ai)
- Discord: [https://discord.gg/myY5YDR8z8](https://discord.gg/myY5YDR8z8)
- Twitter: [https://twitter.com/nomic_ai](https://twitter.com/nomic_ai)


# Citation

If you find the model, dataset, or training code useful, please cite our work

```bibtex
@misc{nussbaum2024nomic,
      title={Nomic Embed: Training a Reproducible Long Context Text Embedder}, 
      author={Zach Nussbaum and John X. Morris and Brandon Duderstadt and Andriy Mulyar},
      year={2024},
      eprint={2402.01613},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```