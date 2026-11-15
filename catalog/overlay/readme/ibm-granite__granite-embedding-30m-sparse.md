# Granite-Embedding-30m-Sparse

**Model Summary:**
Granite-Embedding-30m-Sparse is a 30M parameter sparse biencoder embedding model from the Granite Experimental suite that can be used to generate high quality text embeddings. This model produces variable length bag-of-word like dictionary, containing expansions of sentence tokens and their corresponding weights and is trained using a combination of open source relevance-pair datasets with permissive, enterprise-friendly license, and IBM collected and generated datasets. While maintaining competitive scores on academic benchmarks such as BEIR, this model also performs well on many enterprise use cases. This model is developed using retrieval oriented pretraining, contrastive finetuning and knowledge distillation for improved performance.

- **Developers:** Granite Embedding Team, IBM
- **GitHub Repository:** [ibm-granite/granite-embedding-models](https://github.com/ibm-granite/granite-embedding-models)
- **Paper:** [Techincal Report](https://arxiv.org/abs/2502.20204)
- **Release Date**: February 26th, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English.

**Intended use:** 
The model is designed to produce variable length bag-of-word like dictionary, containing expansions of sentence tokens and their corresponding weights, for a given text, which can be used for text similarity, retrieval, and search applications.

**Usage with Milvus:** 
The model is compatible with Milvus Vector DB and is very easy to use:

First, install the pymilvus library
```shell
pip install pymilvus[model]
```

The model can then be used to encode pairs of text and find the similarity between their representations

```python

from pymilvus import model
from pymilvus import MilvusClient, DataType

client = MilvusClient("./milvus_demo.db")

client.drop_collection(collection_name="my_sparse_collection")

schema = client.create_schema(
    auto_id=True,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="pk", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
schema.add_field(field_name="id", datatype=DataType.VARCHAR, is_primary=False, max_length=100)
schema.add_field(field_name="embeddings", datatype=DataType.SPARSE_FLOAT_VECTOR)

index_params = client.prepare_index_params()

index_params.add_index(field_name="embeddings",
                               index_name="sparse_inverted_index",
                               index_type="SPARSE_INVERTED_INDEX",
                               metric_type="IP",
                               params={"drop_ratio_build": 0.2})
client.create_collection(
    collection_name="my_sparse_collection",
    schema=schema,
    index_params=index_params
)

embeddings_model = model.sparse.SpladeEmbeddingFunction(
    model_name="ibm-granite/granite-embedding-30m-sparse", 
    device="cpu",
    batch_size=2,
    k_tokens_query=50,
    k_tokens_document=192
)

# Prepare documents to be ingested
docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

# SpladeEmbeddingFunction.encode_documents returns sparse matrix or sparse array depending
# on the milvus-model version. reshape(1,-1) ensures the format is correct for ingestion.
doc_vector = [{"embeddings": doc_emb.reshape(1,-1), "id": f"item_{i}"} for i, doc_emb in enumerate(embeddings_model.encode_documents(docs))]


client.insert(
    collection_name="my_sparse_collection",
    data=doc_vector
)

# Prepare search parameters
search_params = {
    "params": {"drop_ratio_search": 0.2},  # Additional optional search parameters
}

# Prepare the query vector

queries = [
      "When was artificial intelligence founded", 
      "Where was Turing born?"
]
query_vector = embeddings_model.encode_documents(queries)

res = client.search(
    collection_name="my_sparse_collection",
    data=query_vector,
    limit=1, #top k documents to return
    output_fields=["id"],
    search_params=search_params,
)

for r in res:
    print(r)

```

**Usage with Sentence Transformers:** 

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```

Then you can load this model and run inference.
```python

from sentence_transformers import SparseEncoder

# Download from the 🤗 Hub
model = SparseEncoder("ibm-granite/granite-embedding-30m-sparse")

# Run inference
docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]
docs_embeddings = model.encode_document(docs, max_active_dims=192)
print(docs_embeddings.shape)
# [3, 50265]

queries = ["When was artificial intelligence founded", "Where was Turing born?"]
queries_embeddings = model.encode_query(queries, max_active_dims=50)
print(queries_embeddings.shape)
# [2, 50265]

# Get the similarity scores for the embeddings
similarities = model.similarity(queries_embeddings, docs_embeddings)
print(similarities.shape)
# [2, 3]

for i, query in enumerate(queries):
    best_doc_index = similarities[i].argmax().item()

    print(f"Query: {query}")
    print(f"Best doc associate: Similarity: {similarities[i][best_doc_index]:.4f}, Doc: {docs[best_doc_index]}")
    intersection = model.intersection(queries_embeddings[i], docs_embeddings[best_doc_index])
    decoded_intersection = model.decode(intersection, top_k=10)
    print("Top 10 tokens influencing the similarity:")
    for token, score in decoded_intersection:
        print(f"Token: {token}, Score: {score:.4f}")

# Query: When was artificial intelligence founded
# Best doc associate: Similarity: 12.3641, Doc: Artificial intelligence was founded as an academic discipline in 1956.
# Top 10 tokens influencing the similarity:
# Token: ĠAI, Score: 2.7591
# Token: Ġintelligence, Score: 2.2971
# Token: Ġartificial, Score: 1.7654
# Token: Ġfounded, Score: 1.3254
# Token: Ġinvention, Score: 0.9808
# Token: Ġlearning, Score: 0.4847
# Token: Ġcomputer, Score: 0.4789
# Token: Ġrobot, Score: 0.3466
# Token: Ġestablishment, Score: 0.3371
# Token: Ġscientific, Score: 0.2804
# Query: Where was Turing born?
# Best doc associate: Similarity: 17.1359, Doc: Born in Maida Vale, London, Turing was raised in southern England.
# Top 10 tokens influencing the similarity:
# Token: uring, Score: 2.9761
# Token: ĠTuring, Score: 2.4544
# Token: Ġborn, Score: 2.4314
# Token: ing, Score: 1.7760
# Token: ure, Score: 1.7626
# Token: Ġcomput, Score: 1.3356
# Token: Ġraised, Score: 1.3285
# Token: able, Score: 1.1940
# Token: Ġphilosopher, Score: 0.4118
# Token: Ġmachine, Score: 0.3977

```

**Evaluation:**

Granite-Embedding-30m-Sparse is competive in performance to the naver/splade-v3-distilbert despite being half the parameter size. We also compare the sparse model with similar sized dense embedding counterpart `ibm-granite/granite-embedding-30m-english`. The performance of the models on MTEB Retrieval (i.e., BEIR) is reported below. 
To maintain consistency with results reported by `naver/splade-v3-distilbert`, we do not include CQADupstack and MS-MARCO in the table below.

| Model                           | Paramters (M)| Vocab Size |  BEIR Retrieval (13) |
|---------------------------------|:------------:|:-------------------:|:-------------------: |
|naver/splade-v3-distilbert   |67            |30522                  |50.0                 |
|granite-embedding-30m-english    |30            |50265                  |50.6                 |
|granite-embedding-30m-sparse    |30            |50265                  |50.8                 |


**Model Architecture:**
Granite-Embedding-30m-Sparse is based on an encoder-only RoBERTa like transformer architecture, trained internally at IBM Research.

| Model                     | granite-embedding-30m-sparse |
| :---------                | :-------:| 
| Embedding size            | **384**  | 
| Number of layers          | **6**    | 
| Number of attention heads | **12**   | 
| Intermediate size         | **1536** | 
| Activation Function       | **GeLU** | 
| Vocabulary Size           | **50265**|
| Max. Sequence Length      | **512**  | 
| # Parameters              | **30M**  | 


**Training Data:**
Overall, the training data consists of four key sources: (1) unsupervised title-body paired data scraped from the web, (2) publicly available paired with permissive, enterprise-friendly license, (3) IBM-internal paired data targetting specific technical domains, and (4) IBM-generated synthetic data. The data is listed below:

| **Dataset**                                        | **Num. Pairs** | 
|----------------------------------------------------|:---------------:|
| SPECTER citation triplets                          | 684,100         | 
| Stack Exchange Duplicate questions (titles)        | 304,525         | 
| Stack Exchange Duplicate questions (bodies)        | 250,519         | 
| Stack Exchange Duplicate questions (titles+bodies) | 250,460         | 
| Natural Questions (NQ)                             | 100,231         | 
| SQuAD2.0                                           | 87,599          | 
| PAQ (Question, Answer) pairs                       | 64,371,441       | 
| Stack Exchange (Title, Answer) pairs               | 4,067,139        | 
| Stack Exchange (Title, Body) pairs                 | 23,978,013       | 
| Stack Exchange (Title+Body, Answer) pairs          | 187,195         | 
| S2ORC Citation pairs (Titles)                      | 52,603,982       | 
| S2ORC (Title, Abstract)                            | 41,769,185       | 
| S2ORC (Citations, abstracts)                       | 52,603,982       | 
| WikiAnswers Duplicate question pairs               | 77,427,422       | 
| SearchQA                                           | 582,261         | 
| HotpotQA                                           | 85,000          | 
| Fever                                              | 109,810         | 
| Arxiv                                              | 2,358,545        | 
| Wikipedia                                          | 20,745,403       | 
| PubMed                                             | 20,000,000       | 
| Miracl En Pairs                                    | 9,016           | 
| DBPedia Title-Body Pairs                           | 4,635,922        | 
| Synthetic: Query-Wikipedia Passage                 | 1,879,093        | 
| Synthetic: Fact Verification                       | 9,888           | 
| IBM Internal Triples                               | 40,290          | 
| IBM Internal Title-Body Pairs                      | 1,524,586        | 

Notably, we do not use the popular MS-MARCO retrieval dataset in our training corpus due to its non-commercial license.

**Infrastructure:**
We train Granite Embedding Models using IBM's computing cluster, Cognitive Compute Cluster, which is outfitted with NVIDIA A100 80gb GPUs. This cluster provides a scalable and efficient infrastructure for training our models over multiple GPUs.

**Ethical Considerations and Limitations:** 
The data used to train the base language model was filtered to remove text containing hate, abuse, and profanity. Granite-Embedding-30m-Sparse is trained only for English texts, and has a context length of 512 tokens (longer texts will be truncated to this size).

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources

## Citation
```
@misc{awasthy2025graniteembeddingmodels,
      title={Granite Embedding Models}, 
      author={Parul Awasthy and Aashka Trivedi and Yulong Li and Mihaela Bornea and David Cox and Abraham Daniels and Martin Franz and Gabe Goodhart and Bhavani Iyer and Vishwajeet Kumar and Luis Lastras and Scott McCarley and Rudra Murthy and Vignesh P and Sara Rosenthal and Salim Roukos and Jaydeep Sen and Sukriti Sharma and Avirup Sil and Kate Soule and Arafat Sultan and Radu Florian},
      year={2025},
      eprint={2502.20204},
      archivePrefix={arXiv},
      primaryClass={cs.IR},
      url={https://arxiv.org/abs/2502.20204}, 
}
``` 