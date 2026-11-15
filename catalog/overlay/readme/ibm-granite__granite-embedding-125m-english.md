# Granite-Embedding-125m-English

**News:** 
Granite Embedding R2 models with 8192 context length released.

- [granite-embedding-english-r2](https://huggingface.co/ibm-granite/granite-embedding-english-r2) (149M parameters): with an output embedding size of 768, replacing granite-embedding-125m-english.
- [granite-embedding-small-english-r2](https://huggingface.co/ibm-granite/granite-embedding-small-english-r2) (47M parameters): A first-of-its-kind reduced-size model, with fewer layers and a smaller output embedding size (384), replacing granite-embedding-30m-english.

**Model Summary:**
Granite-Embedding-125m-English is a 125M parameter dense biencoder embedding model from the Granite Embeddings suite that can be used to generate high quality text embeddings. This model produces embedding vectors of size 768. Compared to most other open-source models, this model was only trained using open-source relevance-pair datasets with permissive, enterprise-friendly license, plus IBM collected and generated datasets. While maintaining competitive scores on academic benchmarks such as BEIR, this model also performs well on many enterprise use cases. This model is developed using retrieval oriented pretraining, contrastive finetuning and knowledge distillation.

- **Developers:** Granite Embedding Team, IBM
- **GitHub Repository:** [ibm-granite/granite-embedding-models](https://github.com/ibm-granite/granite-embedding-models)
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Paper:** [Technical Report](https://arxiv.org/abs/2502.20204)
- **Release Date**: December 18th, 2024
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English.

**Intended use:** 
The model is designed to produce fixed length vector representations for a given text, which can be used for text similarity, retrieval, and search applications.

**Usage with Sentence Transformers:** 
The model is compatible with SentenceTransformer library and is very easy to use:

First, install the sentence transformers library
```shell
pip install sentence_transformers
```

The model can then be used to encode pairs of text and find the similarity between their representations

```python
from sentence_transformers import SentenceTransformer, util

model_path = "ibm-granite/granite-embedding-125m-english"
# Load the Sentence Transformer model
model = SentenceTransformer(model_path)

input_queries = [
    ' Who made the song My achy breaky heart? ',
    'summit define'
    ]

input_passages = [
    "Achy Breaky Heart is a country song written by Don Von Tress. Originally titled Don't Tell My Heart and performed by The Marcy Brothers in 1991. ",
    "Definition of summit for English Language Learners. : 1 the highest point of a mountain : the top of a mountain. : 2 the highest level. : 3 a meeting or series of meetings between the leaders of two or more governments."
    ]

# encode queries and passages
query_embeddings = model.encode(input_queries)
passage_embeddings = model.encode(input_passages)

# calculate cosine similarity
print(util.cos_sim(query_embeddings, passage_embeddings))
```

**Usage with Huggingface Transformers:** 
This is a simple example of how to use the Granite-Embedding-125m-English model with the Transformers library and PyTorch.

First, install the required libraries
```shell
pip install transformers torch
```

The model can then be used to encode pairs of text

```python
import torch
from transformers import AutoModel, AutoTokenizer

model_path = "ibm-granite/granite-embedding-125m-english"

# Load the model and tokenizer
model = AutoModel.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
model.eval()

input_queries = [
    ' Who made the song My achy breaky heart? ',
    'summit define'
    ]

# tokenize inputs
tokenized_queries = tokenizer(input_queries, padding=True, truncation=True, return_tensors='pt')

# encode queries
with torch.no_grad():
    # Queries
    model_output = model(**tokenized_queries)
    # Perform pooling. granite-embedding-125m-english uses CLS Pooling
    query_embeddings = model_output[0][:, 0]

# normalize the embeddings
query_embeddings = torch.nn.functional.normalize(query_embeddings, dim=1)

```
**Evaluation:**

The performance of the Granite-Embedding-125M-English model on MTEB Retrieval (i.e., BEIR) and code retrieval (CoIR) benchmarks is reported below. 

| Model                           | Paramters (M)| Embedding Dimension |  MTEB Retrieval (15) |  CoIR (10) | 
|---------------------------------|:------------:|:-------------------:|:-------------------: |:----------:|
|granite-embedding-125m-english   |125           |768                  |52.3                  |50.3        | 

**Model Architecture:**
Granite-Embedding-125m-English is based on an encoder-only RoBERTa like transformer architecture, trained internally at IBM Research.

| Model                     | granite-embedding-30m-english | granite-embedding-125m-english    | granite-embedding-107m-multilingual | granite-embedding-278m-multilingual |
| :---------                | :-------:| :--------:   | :-----:| :-----:|
| Embedding size            | 384  | **768**        | 384    | 768    |
| Number of layers          | 6    | **12**           | 6      | 12     |
| Number of attention heads | 12   | **12**          | 12     | 12     |
| Intermediate size         | 1536 | **3072**         | 1536   | 3072   |
| Activation Function       | GeLU | **GeLU**         | GeLU   | GeLU   |
| Vocabulary Size           | 50265| **50265**        | 250002 | 250002 |
| Max. Sequence Length      | 512  | **512**          | 512    | 512    |
| # Parameters              | 30M  | **125M**         | 107M   | 278M   |


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

Notably, we do not use the popular MS-MARCO retrieval dataset in our training corpus due to its non-commercial license, while other open-source models train on this dataset due to its high quality.

**Infrastructure:**
We train Granite Embedding Models using IBM's computing cluster, Cognitive Compute Cluster, which is outfitted with NVIDIA A100 80gb GPUs. This cluster provides a scalable and efficient infrastructure for training our models over multiple GPUs.

**Ethical Considerations and Limitations:** 
The data used to train the base language model was filtered to remove text containing hate, abuse, and profanity. Granite-Embedding-125m-English is trained only for English texts, and has a context length of 512 tokens (longer texts will be truncated to this size).

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources

<!-- ## Citation
```
@misc{granite-embedding-models,
  author = {author 1, author2, ...},
  title = {},
  journal = {},
  volume = {},
  year = {2024},
  url = {https://arxiv.org/abs/0000.00000},
}
``` -->