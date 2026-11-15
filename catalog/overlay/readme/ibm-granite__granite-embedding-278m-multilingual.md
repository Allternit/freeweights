# Granite-Embedding-278m-multilingual

**Model Summary:**
Granite-Embedding-278M-Multilingual is a 278M parameter model from the Granite Embeddings suite that can be used to generate high quality text embeddings. This model produces embedding vectors of size 768 and is trained using a combination of open source relevance-pair datasets with permissive, enterprise-friendly license, and IBM collected and generated datasets. This model is developed using contrastive finetuning, knowledge distillation and model merging for improved performance.

- **Developers:** Granite Embedding Team, IBM
- **GitHub Repository:** [ibm-granite/granite-embedding-models](https://github.com/ibm-granite/granite-embedding-models)
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Paper:** [Technical Report](https://arxiv.org/abs/2502.20204)
- **Release Date**: December 18th, 2024
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. Users may finetune Granite-Embedding-278M-Multilingual for languages beyond these 12 languages.

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

model_path = "ibm-granite/granite-embedding-278m-multilingual"
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
This is a simple example of how to use the Granite-Embedding-278m-Multilingual model with the Transformers library and PyTorch.

First, install the required libraries
```shell
pip install transformers torch
```

The model can then be used to encode pairs of text

```python
import torch
from transformers import AutoModel, AutoTokenizer

model_path = "ibm-granite/granite-embedding-278m-multilingual"

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
    # Perform pooling. granite-embedding-278m-multilingual uses CLS Pooling
    query_embeddings = model_output[0][:, 0]

# normalize the embeddings
query_embeddings = torch.nn.functional.normalize(query_embeddings, dim=1)

```

**Evaluation:**
The average performance of the Granite-Embedding-278M-Multilingual on Multilingual Miracl (across 18 langauges), Mintaka Retrieval (across 8 languages) and MTEB Retrieval for English (across 15 tasks), German (across 4 tasks), Spanish (across 2 tasks), Frenc (across 5 tasks), Japanese (across 2 tasks), Arabic (1 task), Korean (1 task) and Chinese (across 8 tasks) is reported below. 

| Model                              | Paramters (M)| Embedding Dimension | Miracl (18)   |  Mintaka Retrieval (8) | MTEB English (15) | MTEB German (4) |MTEB Spanish (2) | MTEB French (5) | MTEB Japanese (2) |  MTEB Arabic (1) | MTEB Korean (1) | MTEB Chinese (8) | 
|:-----------------------------------|:------------:|:-------------------:|:-------------:| :---------------------:|:-----------------:|:---------------:|:---------------:|:---------------:|:----------------:|:----------------:|:---------------:|:----------------:|
|granite-embedding-278M-multilingual | 278 | 768 | 58.3 | 23.2 | 48.2 | 71.2 | 52.6 | 54.1 | 61.7 | 64.2 | 71.8 | 45.2 | 

**Model Architecture:**
Granite-Embedding-278m-Multilingual is based on an encoder-only XLM-RoBERTa like transformer architecture, trained internally at IBM Research.

| Model                     | granite-embedding-30m-english | granite-embedding-125m-english    | granite-embedding-107M-multilingual | granite-embedding-278m-multilingual |
| :--------                 | :-------:| :-------:    | :---------:| :-----:|
| Embedding size            | 384      | 768          | 384    | **768**    |
| Number of layers          | 6        | 12           | 6      | **12**     |
| Number of attention heads | 12       | 12           | 12     | **12**     |
| Intermediate size         | 1536     | 3072         | 1536   | **3072**   |
| Activation Function       | GeLU     | GeLU         | GeLU   | **GeLU**   |
| Vocabulary Size           | 50265    | 50265        | 250002 | **250002** |
| Max. Sequence Length      | 512      | 512          | 512    | **512**    |
| # Parameters              | 30M      | 125M         | 107M   | **278M**   |


**Training Data:**
Overall, the training data consists of four key sources: (1) unsupervised title-body paired data scraped from the web, (2) publicly available paired with permissive, enterprise-friendly license, (3) IBM-internal paired data targetting specific technical domains, and (4) IBM-generated synthetic data. The data is listed below:

| **Dataset**                                                               | **Num. Pairs** | 
|:--------------------------------------------------------------------------|:--------------:|
| Multilingual MC4                                                          | 52,823,484     |
| Multilingual Webhose                                                      | 12,369,322     | 
| English Wikipedia                                                         | 20,745,403     | 
| Multilingual Wikimedia                                                    | 2,911,090      |
| Miracl Corpus (Title-Body)                                                | 10,120,398     |
| Stack Exchange Duplicate questions (titles)                               | 304,525        | 
| Stack Exchange Duplicate questions (titles)                               | 304,525        | 
| Stack Exchange Duplicate questions (bodies)                               | 250,519        | 
| Machine Translations of Stack Exchange Duplicate questions (titles)       | 187,195        | 
| Stack Exchange (Title, Answer) pairs                                      | 4,067,139      | 
| Stack Exchange (Title, Body) pairs                                        | 23,978,013     | 
| Stack Exchange (Title, Body) pairs                                        | 23,978,013     | 
| Machine Translations of Stack Exchange (Title+Body, Answer) pairs         | 1,827,15       | 
| SearchQA                                                                  | 582,261        | 
| S2ORC (Title, Abstract)                                                   | 41,769,185     | 
| WikiAnswers Duplicate question pairs                                      | 77,427,422     | 
| CCNews                                                                    | 614,664        |
| XSum                                                                      | 226,711        |
| SimpleWiki                                                                | 102,225        |
| Machine Translated Cross Lingual Parallel Corpora                         | 28,376,115     |
| SPECTER citation triplets                                                 | 684,100        | 
| Machine Translations of SPECTER citation triplets                         | 4,104,600      | 
| Natural Questions (NQ)                                                    | 100,231        | 
| SQuAD2.0                                                                  | 87,599         | 
| HotpotQA                                                                  | 85,000         | 
| Fever                                                                     | 109,810        | 
| PubMed                                                                    | 20,000,000     | 
| Multilingual Miracl Triples                                               | 81,409         | 
| Multilingual MrTydi Triples                                               | 48,715         | 
| Sadeeem Question Asnwering                                                | 4,037          | 
| DBPedia Title-Body Pairs                                                  | 4,635,922      | 
| Synthetic: English Query-Wikipedia Passage                                | 1,879,093      | 
| Synthetic: English Fact Verification                                      | 9,888          | 
| Synthetic: Multilingual Query-Wikipedia Passage                           | 300,266        |
| Synthetic: Multilingual News Summaries                                    | 37,489         |
| IBM Internal Triples                                                      | 40,290         | 
| IBM Internal Title-Body Pairs                                             | 1,524,586      |

Notably, we do not use the popular MS-MARCO retrieval dataset in our training corpus due to its non-commercial license, while other open-source models train on this dataset due to its high quality.

**Infrastructure:**
We train Granite Embedding Models using IBM's computing cluster, Cognitive Compute Cluster, which is outfitted with NVIDIA A100 80gb GPUs. This cluster provides a scalable and efficient infrastructure for training our models over multiple GPUs.

**Ethical Considerations and Limitations:** 
The data used to train the base language model was filtered to remove text containing hate, abuse, and profanity. Granite-Embedding-278m-Multilingual is finetuned on 12 languages, and has a context length of 512 tokens (longer texts will be truncated to this size).

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