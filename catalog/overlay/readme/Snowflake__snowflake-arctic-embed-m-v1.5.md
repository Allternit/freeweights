<h1 align="center">Snowflake's Arctic-embed-m-v1.5</h1>
<h4 align="center">
   <p>
       <a href=#news>News</a> |
       <a href=#this-model>This Model</a>  |
       <a href=#usage>Usage</a>  |
       <a href="#faq">FAQ</a> |
       <a href="#contact">Contact</a> |
       <a href="#license">License</a> |
       <a href="#acknowledgement">Acknowledgement</a>
   <p>
</h4>
<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=8ab1f2d9-8425-4212-9bf3-717f7ac637e4" /> 


## News
12/11/2024: Release of [Technical Report for 2.0 model](https://arxiv.org/abs/2412.04506)

12/04/2024: Release of [L-2.0](https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0) and [M-2.0](https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0)

07/26/2024: Release preprint [[2407.18887] Embedding And Clustering Your Data Can Improve Contrastive Pretraining](https://arxiv.org/abs/2407.18887) on arXiv.

07/18/2024: Release of `snowflake-arctic-embed-m-v1.5`, capable of producing highly compressible embedding vectors that preserve quality even when squished as small as 128 bytes per vector. Details about the development of this model are available in the [launch post on the Snowflake engineering blog](https://www.snowflake.com/engineering-blog/arctic-embed-m-v1-5-enterprise-retrieval/).

05/10/2024: Release of the [technical report on Arctic Embed](https://arxiv.org/abs/2405.05374)

04/16/2024: Original release the `snowflake-arctic-embed` family of text embedding models.


## This Model

This model is an updated version of [snowflake-arctic-embed-m](https://huggingface.co/Snowflake/snowflake-arctic-embed-m/) designed to improve embedding vector compressibility. This model achieves a slightly higher performance overall without compression, and it is additionally capable of retaining most of its retrieval quality even down to 128 byte embedding vectors through a combination of [Matryoshka Representation Learning (MRL)](https://arxiv.org/abs/2205.13147) and uniform scalar quanitization.

| Model Name                                                                                      | MTEB Retrieval Score (NDCG @ 10) |
|:------------------------------------------------------------------------------------------------|:---------------------------------|
| [snowflake-arctic-embed-m-v1.5](https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v1.5) | 55.14                            |
| [snowflake-arctic-embed-m](https://huggingface.co/Snowflake/snowflake-arctic-embed-m/)          | 54.91                            |

Compared to several other models trained with MRL to produce 256-dimensional embedding vectors, `snowflake-arctic-embed-m-v1.5` retains a higher degree of original model quality and delivers better retrieval quality on the MTEB Retrieval benchmark.

| Model                         | Model Parameters   | MTEB Retrieval Score at 256 Dimensions (fraction of arctic-embed-m-v1.5)   |
|:------------------------------|:-------------------|:---------------------------------------------------------------------------|
| Snowflake arctic-embed-m-v1.5 | 109M               | 54.2 (100%)                                                                |
| Google gecko                  | 1200M              | 52.4 (97%)                                                                 |
| OpenAI text-embedding-3-large | Not Published      | 51.7 (95%)                                                                 |
| Nomic nomic-embed-text-v1.5   | 138M               | 50.8 (94%)                                                                 |


Additionally, this model was designed to pair well with a corpus-independent scalar quantization scheme to achieve great performance even in as little as 128 bytes per vector (24x compression compared to 768 dimensional vectors stored in float32).

| Model Version   |   Dimensionality | Scalar Quantization   | Bytes Per Vector (fraction of baseline)   | MTEB Retrieval Score (fraction of baseline)   | Vectors Per GB (improvement over baseline)   |
|:----------------|-----------------:|:----------------------|:------------------------------------------|:----------------------------------------------|:---------------------------------------------|
| v1              |              768 | None (float32)        | 3072 (100%)                               | 54.9 (100%)                                   | 0.33M (1.0x)                                 |
| v1              |              768 | int8                  | 768 (25%)                                 | 54.9 (100%)                                   | 1.3M (4x)                                    |
| v1.5            |              768 | int8                  | 768 (25%)                                 | 55.1 (100%)                                   | 1.3M (4x)                                    |
| v1.5            |              256 | int8                  | 256 (8.3%)                                | 54.2 (99%)                                    | 3.9M (12x)                                   |
| v1.5            |              256 | int4                  | 128 (4.2%)                                | 53.7 (98%)                                    | 7.8M (24x)                                   |

NOTE: Good uniform scalar quantization ranges to use with this model (and which were used in the eval above), are -0.18 to +0.18 for 4bit and -0.3 to +0.3 for 8bit. For a detailed walkthrough of using integer quantization with `snowflake-arctic-embed-m-v1.5`, check out our [example notebook on GitHub](https://github.com/Snowflake-Labs/arctic-embed/tree/main/compressed_embeddings_examples/score_arctic_embed_m_v1dot5_with_quantization.ipynb).

## Usage

### Using Sentence Transformers

You can use the sentence-transformers package to use any of the snowflake-arctic-embed models. Here's an example for `snowflake-arctic-embed-m-v1.5`.

```python
import torch
from sentence_transformers import SentenceTransformer
from torch.nn.functional import normalize

# Model constant.
MODEL_ID = "Snowflake/snowflake-arctic-embed-m-v1.5"

# Your queries and docs.
queries = ['what is snowflake?', 'Where can I get the best tacos?']
documents = ['The Data Cloud!', 'Mexico City of Course!']

# Load the model.
model = SentenceTransformer(MODEL_ID)

# Generate text embeddings.
query_embeddings = model.encode(queries, prompt_name="query")
document_embeddings = model.encode(documents)

# Scores via dotproduct.
scores = query_embeddings @ document_embeddings.T

# Pretty-print the results.
for query, query_scores in zip(queries, scores):
    doc_score_pairs = list(zip(documents, query_scores))
    doc_score_pairs = sorted(doc_score_pairs, key=lambda x: x[1], reverse=True)
    print(f'Query: "{query}"')
    for document, score in doc_score_pairs:
        print(f'Score: {score:.4f} | Document: "{document}"')
    print()

#### OUTPUT ####
# Query: "what is snowflake?"
# Score: 0.3521 | Document: "The Data Cloud!"
# Score: 0.2358 | Document: "Mexico City of Course!"

# Query: "Where can I get the best tacos?"
# Score: 0.3884 | Document: "Mexico City of Course!"
# Score: 0.2389 | Document: "The Data Cloud!"
#

#### Variation: Truncated Embeddings ####
query_embeddings_256 = normalize(torch.from_numpy(query_embeddings)[:, :256])
document_embeddings_256 = normalize(torch.from_numpy(document_embeddings)[:, :256])
scores_256 = query_embeddings_256 @ document_embeddings_256.T

# Pretty-print the results.
for query, query_scores in zip(queries, scores_256):
    doc_score_pairs = sorted(zip(documents, query_scores), key=lambda x: x[1], reverse=True)
    print(f'Query: "{query}"')
    for document, score in doc_score_pairs:
        print(f'Score: {score:.4f} | Document: "{document}"')
    print()

#### OUTPUT ####
# Query: "what is snowflake?"
# Score: 0.3852 | Document: "The Data Cloud!"
# Score: 0.2721 | Document: "Mexico City of Course!"

# Query: "Where can I get the best tacos?"
# Score: 0.4337 | Document: "Mexico City of Course!"
# Score: 0.2886 | Document: "The Data Cloud!"
#
```

### Using Huggingface transformers

You can use the transformers package to use an snowflake-arctic-embed model, too. For optimal retrieval quality, remember to use the CLS token for embeddings and to use the query prefix below (just on the query).


```python
import torch
from torch.nn.functional import normalize
from transformers import AutoModel, AutoTokenizer

# Model constants.
MODEL_ID = "Snowflake/snowflake-arctic-embed-m-v1.5"
QUERY_PREFIX = 'Represent this sentence for searching relevant passages: '

# Your queries and docs.
queries  = ['what is snowflake?', 'Where can I get the best tacos?']
documents = ['The Data Cloud!', 'Mexico City of Course!']

# Load the model and tokenizer.
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModel.from_pretrained(MODEL_ID, add_pooling_layer=False)
model.eval()

# Add query prefix and tokenize queries and docs.
queries_with_prefix = [f"{QUERY_PREFIX}{q}" for q in queries]
query_tokens = tokenizer(queries_with_prefix, padding=True, truncation=True, return_tensors='pt', max_length=512)
document_tokens =  tokenizer(documents, padding=True, truncation=True, return_tensors='pt', max_length=512)

# Use the model to generate text embeddings.
with torch.inference_mode():
    query_embeddings = model(**query_tokens)[0][:, 0]
    document_embeddings = model(**document_tokens)[0][:, 0]

# Remember to normalize embeddings.
query_embeddings = normalize(query_embeddings)
document_embeddings = normalize(document_embeddings)

# Scores via dotproduct.
scores = query_embeddings @ document_embeddings.T

# Pretty-print the results.
for query, query_scores in zip(queries, scores):
    doc_score_pairs = list(zip(documents, query_scores))
    doc_score_pairs = sorted(doc_score_pairs, key=lambda x: x[1], reverse=True)
    print(f'Query: "{query}"')
    for document, score in doc_score_pairs:
        print(f'Score: {score:.4f} | Document: "{document}"')
    print()

#### OUTPUT ####
# Query: "what is snowflake?"
# Score: 0.3521 | Document: "The Data Cloud!"
# Score: 0.2358 | Document: "Mexico City of Course!"

# Query: "Where can I get the best tacos?"
# Score: 0.3884 | Document: "Mexico City of Course!"
# Score: 0.2389 | Document: "The Data Cloud!"
#

#### Variation: Truncated Embeddings ####
query_embeddings_256 = normalize(query_embeddings[:, :256])
document_embeddings_256 = normalize(document_embeddings[:, :256])
scores_256 = query_embeddings_256 @ document_embeddings_256.T

# Pretty-print the results.
for query, query_scores in zip(queries, scores_256):
    doc_score_pairs = sorted(zip(documents, query_scores), key=lambda x: x[1], reverse=True)
    print(f'Query: "{query}"')
    for document, score in doc_score_pairs:
        print(f'Score: {score:.4f} | Document: "{document}"')
    print()

#### OUTPUT ####
# Query: "what is snowflake?"
# Score: 0.3852 | Document: "The Data Cloud!"
# Score: 0.2721 | Document: "Mexico City of Course!"

# Query: "Where can I get the best tacos?"
# Score: 0.4337 | Document: "Mexico City of Course!"
# Score: 0.2886 | Document: "The Data Cloud!"
#
```

### Using Transformers.js

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@xenova/transformers) by running:
```bash
npm i @xenova/transformers
```

You can then use the model to compute embeddings as follows:

```js
import { pipeline, dot } from '@xenova/transformers';

// Create feature extraction pipeline
const extractor = await pipeline('feature-extraction', 'Snowflake/snowflake-arctic-embed-m-v1.5', {
    quantized: false, // Comment out this line to use the quantized version
});

// Generate sentence embeddings
const sentences = [
    'Represent this sentence for searching relevant passages: Where can I get the best tacos?',
    'The Data Cloud!',
    'Mexico City of Course!',
]
const output = await extractor(sentences, { normalize: true, pooling: 'cls' });

// Compute similarity scores
const [source_embeddings, ...document_embeddings ] = output.tolist();
const similarities = document_embeddings.map(x => dot(source_embeddings, x));
console.log(similarities); // [0.15664823859882132, 0.24481869975470627]
```

### Compressing to 128 bytes

This model is designed to generate embeddings which compress well down to 128 bytes via a two-part compression scheme:
1. Truncation and renormalization to 256 dimensions (a la Matryoskha Representation Learning, see [the original paper for reference](https://arxiv.org/abs/2205.13147)).
2. 4-bit uniform scalar quantization of all 256 values to the same range (-0.18 to +0.18).
   - For 8-bit uniform scalar quantization, the slightly wider range -0.3 to +0.3 tends to work slightly better given how much more granular 8-bit quantization is.

For an in-depth examples, check out our [arctic-embed GitHub repositiory](https://github.com/Snowflake-Labs/arctic-embed).

## FAQ


TBD


## Contact


Feel free to open an issue or pull request if you have any questions or suggestions about this project.
You also can email Daniel Campos(daniel.campos@snowflake.com).


## License


Arctic is licensed under the [Apache-2](https://www.apache.org/licenses/LICENSE-2.0). The released models can be used for commercial purposes free of charge.


## Acknowledgement


We want to thank the open-source community, which has provided the great building blocks upon which we could make our models.
We thank our modeling engineers, Danmei Xu, Luke Merrick, Gaurav Nuti, and Daniel Campos, for making these great models possible.
We thank our leadership, Himabindu Pucha, Kelvin So, Vivek Raghunathan, and Sridhar Ramaswamy, for supporting this work.
We also thank the open-source community for producing the great models we could build on top of and making these releases possible.
Finally, we thank the researchers who created BEIR and MTEB benchmarks.
It is largely thanks to their tireless work to define what better looks like that we could improve model performance.
