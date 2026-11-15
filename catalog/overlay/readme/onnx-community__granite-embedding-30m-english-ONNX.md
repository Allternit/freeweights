# Granite-Embedding-30m-English (revision r1.1)

**Model Summary:**
Granite-Embedding-30m-English is a 30M parameter dense bi-encoder embedding model from the Granite Embeddings suite that can be used to generate high quality text embeddings. This model produces embedding vectors of size 384 and is trained using a combination of open source relevance-pair datasets with permissive, enterprise-friendly license, and IBM collected and generated datasets. While maintaining competitive scores on academic benchmarks such as BEIR, this model also performs well on many enterprise use cases. This model is developed using retrieval oriented pre-training, contrastive fine-tuning, knowledge distillation and model merging for improved performance.

***Granite-embedding-30m-r1.1*** was specifically designed to support multi-turn information retrieval and is designed to handle contextual document retrieval in multi-turn conversational information retrieval. Granite-embedding-30m-r1.1 was trained on data tailored for multi-turn conversational information retrieval and uses multi-teacher distillation over granite-embedding-30m-english (https://huggingface.co/ibm-granite/granite-embedding-30m-english) 

- **Developers:** Granite Embedding Team, IBM
- **GitHub Repository:** [ibm-granite/granite-embedding-models](https://github.com/ibm-granite/granite-embedding-models)
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Paper:** [Technical Report](https://arxiv.org/abs/2502.20204)
- **Release Date**: August 29, 2025 (granite-embedding-30m-english-r1.1)
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English.

**Intended use:** 
The model is designed to produce fixed length vector representations for a given text, which can be used for text similarity, retrieval, and search applications.


**Usage with Transformers.js:** 

This is a simple example of how to use the granite-embedding-small-english-r2 model with the Transformers.js library.


If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

The model can then be used to encode pairs of text

```js
import { AutoModel, AutoTokenizer, matmul } from "@huggingface/transformers";

// Download from the 🤗 Hub
const model_id = "onnx-community/granite-embedding-30m-english-ONNX";
const tokenizer = await AutoTokenizer.from_pretrained(model_id);
const model = await AutoModel.from_pretrained(model_id, {
  dtype: "fp32", // Options: "fp32" | "fp16" | "q8" | "q4" | "q4f16"
});

// Prepare queries and documents
const input_queries = [
  " Who made the song My achy breaky heart? ",
  "summit define",
];
const input_passages = [
  "Achy Breaky Heart is a country song written by Don Von Tress. Originally titled Don't Tell My Heart and performed by The Marcy Brothers in 1991. ",
  "Definition of summit for English Language Learners. : 1 the highest point of a mountain : the top of a mountain. : 2 the highest level. : 3 a meeting or series of meetings between the leaders of two or more governments.",
];
const inputs = await tokenizer([...input_queries, ...input_passages], {
  padding: true,
});

// Generate embeddings
const { sentence_embedding } = await model(inputs);
const normalized_sentence_embedding = sentence_embedding.normalize();

// Compute similarities
const scores = await matmul(
  normalized_sentence_embedding.slice([0, input_queries.length]),
  normalized_sentence_embedding
    .slice([input_queries.length, null])
    .transpose(1, 0),
);
const scores_list = scores.tolist();
console.log(scores_list);
// [
//   [ 0.84034663438797, 0.498334139585495 ],
//   [ 0.4650711715221405, 0.5818834900856018 ]
// ]
```

**Evaluation:**

Granite-Embedding-30M-English model is twice as fast as other models with similar embedding dimensions, while maintaining competitive performance. The performance of the Granite-Embedding-30M-English model on MTEB Retrieval (i.e., BEIR) and code retrieval (CoIR) benchmarks is reported below. 

| Model                           | Paramters (M)| Embedding Dimension |  MTEB Retrieval (15) |  CoIR (10) | 
|---------------------------------|:------------:|:-------------------:|:-------------------: |:----------:|
|granite-embedding-30m-english    |30            |384                  |49.1                  |47.0        | 


granite-embedding-30m-r1.1 revision maintains the fast speed of granite-embedding-30m-english while demontratring strong performance on multi-turn information retrieval benchmarks. The performance of the granite-embedding-30M-r1.1 model on MTEB Retrieval (i.e., BEIR) and multi-turn information retrieval (MTRAG(https://github.com/IBM/mt-rag-benchmark), Multidoc2dial(https://github.com/IBM/multidoc2dial)) datasets is reported below. 


| Model                                     | Parameters (M)| Embedding Dimension |  MTEB Retrieval (15) |  MT-RAG    | Mdoc2dial | 
|-------------------------------------------|:------------:|:-------------------:|:-------------------: |:----------:| :--------:|
|granite-embedding-30m-english              |30            |384                  |49.1                  |49.16       | 85.42     |
|**granite-embedding-30m-english-r1.1**     |30            |384                  |48.9                  |**52.33**   | **85.78** |
|bge-small-en-v1.5                          |33            |512                  |53.86                 |38.26       | 83.71     |
|e5-small-v2                                |33            |384                  |48.46                 |28.72       | 75.7      |

**Model Architecture:**
granite-embedding-30m-English is based on an encoder-only RoBERTa like transformer architecture, trained internally at IBM Research. granite-embedding-30m-r1.1 shares the same architecture as granite-embedding-30m-English

| Model                     | granite-embedding-30m-english | granite-embedding-125m-english    | granite-embedding-107m-multilingual | granite-embedding-278m-multilingual |
| :---------                | :-------:| :--------:   | :-----:| :-----:|
| Embedding size            | **384**  | 768          | 384    | 768    |
| Number of layers          | **6**    | 12           | 6      | 12     |
| Number of attention heads | **12**   | 12           | 12     | 12     |
| Intermediate size         | **1536** | 3072         | 1536   | 3072   |
| Activation Function       | **GeLU** | GeLU         | GeLU   | GeLU   |
| Vocabulary Size           | **50265**| 50265        | 250002 | 250002 |
| Max. Sequence Length      | **512**  | 512          | 512    | 512    |
| # Parameters              | **30M**  | 125M         | 107M   | 278M   |

**Training Data:**
Overall, the training data consists of four key sources: (1) unsupervised title-body paired data scraped from the web, (2) publicly available paired with permissive, enterprise-friendly license, (3) IBM-internal paired data targeting specific technical domains, and (4) IBM-generated synthetic data. The data is listed below:

| **Dataset**                                        | **Num. Pairs** | 
|----------------------------------------------------|:---------------:|
| SPECTER citation triplets                          | 684,100         | 
| Stack Exchange Duplicate questions (titles)        | 304,525         | 
| Stack Exchange Duplicate questions (bodies)        | 250,519         | 
| Stack Exchange Duplicate questions (titles+bodies) | 250,460         | 
| Natural Questions (NQ)                             | 100,231         | 
| SQuAD2.0                                           | 87,599          | 
| PAQ (Question, Answer) pairs                       | 64,371,441      | 
| Stack Exchange (Title, Answer) pairs               | 4,067,139       | 
| Stack Exchange (Title, Body) pairs                 | 23,978,013      | 
| Stack Exchange (Title+Body, Answer) pairs          | 187,195         | 
| S2ORC Citation pairs (Titles)                      | 52,603,982      | 
| S2ORC (Title, Abstract)                            | 41,769,185      | 
| S2ORC (Citations, abstracts)                       | 52,603,982      | 
| WikiAnswers Duplicate question pairs               | 77,427,422      | 
| SearchQA                                           | 582,261         | 
| HotpotQA                                           | 85,000          | 
| Fever                                              | 109,810         | 
| Arxiv                                              | 2,358,545       | 
| Wikipedia                                          | 20,745,403      | 
| PubMed                                             | 20,000,000      | 
| Miracl En Pairs                                    | 9,016           | 
| DBPedia Title-Body Pairs                           | 4,635,922       | 
| Synthetic: Query-Wikipedia Passage                 | 1,879,093       | 
| Synthetic: Fact Verification                       | 9,888           | 
| IBM Internal Triples                               | 40,290          | 
| IBM Internal Title-Body Pairs                      | 1,524,586       | 
| MultiDoc2Dial Train (MultiTurn Conversation)       | 21,451          |
| Synthetic IBM internal data                        | 19,533          |

Notably, we do not use the popular MS-MARCO retrieval dataset in our training corpus due to its non-commercial license, while other open-source models train on this dataset due to its high quality.

**Infrastructure:**
We train Granite Embedding Models using IBM's computing cluster, Cognitive Compute Cluster, which is outfitted with NVIDIA A100 80gb GPUs. This cluster provides a scalable and efficient infrastructure for training our models over multiple GPUs.

**Ethical Considerations and Limitations:** 
The data used to train the base language model was filtered to remove text containing hate, abuse, and profanity. Granite-embedding-30m-english and Granite-embedding-30m-r1.1 are trained only for English texts, and has a context length of 512 tokens (longer texts will be truncated to this size).

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources
