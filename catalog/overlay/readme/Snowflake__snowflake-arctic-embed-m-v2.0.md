<h1 align="center">Snowflake's Arctic-embed-m-v2.0</h1>
<h4 align="center">
   <p>
       <a href=#news>News</a> |
       <a href=#models>Models</a> |
       <a href=#usage>Usage</a>  |
       <a href="#evaluation">Evaluation</a> |
       <a href="#contact">Contact</a> |
       <a href="#faq">FAQ</a>
       <a href="#license">License</a> |
       <a href="#acknowledgement">Acknowledgement</a>
   <p>
</h4>

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=d5cb84e7-4b3a-4d82-85a1-19ec3721c447" />

## News
- 12/11/2024: Release of [Technical Report](https://arxiv.org/abs/2412.04506)
- 12/04/2024: Release of [snowflake-arctic-embed-l-v2.0](https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0) and [snowflake-arctic-embed-m-v2.0](https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0) our newest models with multilingual workloads in mind.


## Models
Snowflake arctic-embed-m-v2.0 is the newest addition to the suite of embedding models Snowflake has released optimizing for retrieval performance and inference efficiency. 
Arctic Embed 2.0 introduces a new standard for multilingual embedding models, combining high-quality multilingual text retrieval without sacrificing performance in English. 
Released under the permissive Apache 2.0 license, Arctic Embed 2.0 is ideal for applications that demand reliable, enterprise-grade multilingual search and retrieval at scale.

Key Features:

1. Multilingual without compromise: Excels in English and non-English retrieval, outperforming leading open-source and proprietary models on benchmarks like MTEB Retrieval, CLEF, and MIRACL.

2. Inference efficiency: Its 113m non-embedding parameters inference is fast and efficient for any scale. 

3. Compression-friendly: Achieves high-quality retrieval with embeddings as small as 128 bytes/vector using Matryoshka Representation Learning (MRL) and quantization-aware embedding training. **Please note that like our v1.5 model, the MRL for this model is 256 dimensions, and high-quality 128-byte compression is achieved via 4-bit quantization (e.g. using a [`pq256x4fs` fast-scan FAISS index](https://github.com/facebookresearch/faiss/wiki/The-index-factory#encodings) or using the [example code published alongside our 1.5 model](https://github.com/Snowflake-Labs/arctic-embed/blob/main/compressed_embeddings_examples/score_arctic_embed_m_v1dot5_with_quantization.ipynb)).**

4. Long Context Support: arctic-embed-m-v2.0 builds on [GTE-multilingual-base](https://huggingface.co/Alibaba-NLP/gte-multilingual-base) which can support a context window of up to 8192 via the use of RoPE. 


### Quality Benchmarks
Unlike most other open-source models, Arctic-embed-m-v2.0 excels across English (via MTEB Retrieval) and multilingual (via MIRACL and CLEF). 
You no longer need to support models to empower high-quality English and multilingual retrieval. All numbers mentioned below are the average NDCG@10 across the dataset being discussed. 

| Model Name | # params | # non-emb params | # dimensions | BEIR (15) | MIRACL (4) | CLEF (Focused) | CLEF (Full) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **snowflake-arctic-m-v2.0** | 305M | 113M | 768 | **55.4** | 55.2 | **51.7** | **53.9** |
| snowflake-arctic-m | 109M | 86M | 768 | 54.9 | 24.9 | 34.4 | 29.1 |
| me5 base | 560M | 303M | 1024 | 51.4 | 54.0 | 43.0 | 34.6 |
| bge-m3 (BAAI) | 568M | 303M | 1024 | 48.8 | **56.8** | 40.8 | 41.3 |
| gte (Alibaba) | 305M | 113M | 768 | 51.1 | 52.3 | 47.7 | 53.1 |

Aside from high-quality retrieval, arctic delivers embeddings that are easily compressible. By leveraging vector truncation via MRL to decrease vector size by 3x with about 3% degradation in quality. 
Combine MRLed vectors with vector compression (Int4) to power retrieval in 128 bytes per doc. 

| Model |  | BEIR (15) | Relative Performance | MIRACL (4) | Relative Performance | CLEF (5) | Relative Performance | CLEF (Full) | Relative Performance |
|---|---|:---:|:---:|:---:|:---:|:---:|---|---|---|
| snowflake-arctic-m-v2.0 | 768 | 55.4 | N/A | 55.2 | N/A | 51.7 | N/A | 53.9 | N/A |
| snowflake-arctic-m-v2.0 | 256 | 54.4 | -1.81% | 54.0 | -2.17% | 50.6 | -2.13% | 52.3 | -3.06% |

## Usage

### Using Sentence Transformers

```python
from sentence_transformers import SentenceTransformer

# Load the model
model_name = 'Snowflake/snowflake-arctic-embed-m-v2.0'
model = SentenceTransformer(model_name, trust_remote_code=True)

# Define the queries and documents
queries = ['what is snowflake?', 'Where can I get the best tacos?']
documents = ['The Data Cloud!', 'Mexico City of Course!']

# Compute embeddings: use `prompt_name="query"` to encode queries!
query_embeddings = model.encode(queries, prompt_name="query") 
document_embeddings = model.encode(documents)

# Compute cosine similarity scores
scores = model.similarity(query_embeddings, document_embeddings)

# Output the results
for query, query_scores in zip(queries, scores):
    doc_score_pairs = list(zip(documents, query_scores))
    doc_score_pairs = sorted(doc_score_pairs, key=lambda x: x[1], reverse=True)
    print("Query:", query)
    for document, score in doc_score_pairs:
        print(score, document)

```

### Using Huggingface Transformers


You can use the transformers package to use Snowflake's arctic-embed model, as shown below. For optimal retrieval quality, use the CLS token to embed each text portion and use the query prefix below (just on the query).

```python
import torch
from transformers import AutoModel, AutoTokenizer

model_name = 'Snowflake/snowflake-arctic-embed-m-v2.0'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name, add_pooling_layer=False, trust_remote_code=True)
model.eval()

query_prefix = 'query: '
queries  = ['what is snowflake?', 'Where can I get the best tacos?']
queries_with_prefix = ["{}{}".format(query_prefix, i) for i in queries]
query_tokens = tokenizer(queries_with_prefix, padding=True, truncation=True, return_tensors='pt', max_length=8192)

documents = ['The Data Cloud!', 'Mexico City of Course!']
document_tokens =  tokenizer(documents, padding=True, truncation=True, return_tensors='pt', max_length=8192)

# Compute token embeddings
with torch.no_grad():
    query_embeddings = model(**query_tokens)[0][:, 0]
    document_embeddings = model(**document_tokens)[0][:, 0]


# normalize embeddings
query_embeddings = torch.nn.functional.normalize(query_embeddings, p=2, dim=1)
document_embeddings = torch.nn.functional.normalize(document_embeddings, p=2, dim=1)

scores = torch.mm(query_embeddings, document_embeddings.transpose(0, 1))
for query, query_scores in zip(queries, scores):
    doc_score_pairs = list(zip(documents, query_scores))
    doc_score_pairs = sorted(doc_score_pairs, key=lambda x: x[1], reverse=True)
    #Output passages & scores
    print("Query:", query)
    for document, score in doc_score_pairs:
        print(score, document)
```

### Using Huggingface Transformers.js

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model for retrieval, as follows:

```js
import { pipeline, dot } from '@huggingface/transformers';

// Create feature extraction pipeline
const extractor = await pipeline('feature-extraction', 'Snowflake/snowflake-arctic-embed-m-v2.0');

// Generate sentence embeddings
const sentences = [
    'query: what is snowflake?',
    'The Data Cloud!',
    'Mexico City of Course!',
]
const output = await extractor(sentences, { normalize: true, pooling: 'cls' });

// Compute similarity scores
const [source_embeddings, ...document_embeddings ] = output.tolist();
const similarities = document_embeddings.map(x => dot(source_embeddings, x));
console.log(similarities); // [0.32719788157046004, 0.06960141111667434]
```


## Contact


Feel free to open an issue or pull request if you have any questions or suggestions about this project.
You also can email Daniel Campos(daniel.campos@snowflake.com).


## License
Arctic is licensed under the [Apache-2](https://www.apache.org/licenses/LICENSE-2.0). The released models can be used for commercial purposes free of charge.