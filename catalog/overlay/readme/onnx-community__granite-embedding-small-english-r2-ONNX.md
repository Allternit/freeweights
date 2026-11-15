# Granite-Embedding-Small-English-R2

**Model Summary:** Granite-embedding-small-english-r2 is a 47M parameter dense biencoder embedding model from the Granite Embeddings collection that can be used to generate high quality text embeddings. This model produces embedding vectors of size 384 based on context length of upto 8192 tokens. Compared to most other open-source models, this model was only trained using open-source relevance-pair datasets with permissive, enterprise-friendly license, plus IBM collected and generated datasets. 

The r2 models show strong performance across standard and IBM-built information retrieval benchmarks (BEIR, ClapNQ), 
code retrieval (COIR), long-document search benchmarks (MLDR, LongEmbed), conversational multi-turn (MTRAG), 
table retrieval (NQTables, OTT-QA, AIT-QA, MultiHierTT, OpenWikiTables), and on many enterprise use cases.

These models use a bi-encoder architecture to generate high-quality embeddings from text inputs such as queries, passages, and documents, enabling seamless comparison through cosine similarity. Built using retrieval oriented pretraining, contrastive finetuning, knowledge distillation, and model merging, granite-embedding-small-english-r2 is optimized to ensure strong alignment between query and passage embeddings.

The latest granite embedding r2 release introduces two English embedding models, both based on the ModernBERT architecture:
- _granite-embedding-english-r2_ (**149M** parameters): with an output embedding size of _768_, replacing _granite-embedding-125m-english_. 
- **_granite-embedding-small-english-r2_** (**47M** parameters): A _first-of-its-kind_ reduced-size model, with 8192 context length support, fewer layers and a smaller output embedding size (_384_), replacing _granite-embedding-30m-english_. 

## Model Details

- **Developed by:** Granite Embedding Team, IBM
- **Repository:** [ibm-granite/granite-embedding-models](https://github.com/ibm-granite/granite-embedding-models)
- **Paper:** [Granite Embedding R2 Models](https://arxiv.org/abs/2508.21085)
- **Language(s):** English
- **Release Date**: Aug 15, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Usage

**Intended Use:** The model is designed to produce fixed length vector representations for a given text, which can be used for text similarity, retrieval, and search applications.


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
const model_id = "onnx-community/granite-embedding-small-english-r2-ONNX";
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
//  [ 0.8931542634963989, 0.6678562164306641 ],
//  [ 0.712432324886322, 0.8434768915176392 ]
// ]
```

## Evaluation Results
Granite embedding r2 models show a strong performance across tasks diverse tasks. 

Performance of the granite models on MTEB Retrieval (i.e., BEIR), MTEB-v2, code retrieval (CoIR), long-document search benchmarks (MLDR, LongEmbed), conversational multi-turn (MTRAG), 
table retrieval (NQTables, OTT-QA, AIT-QA, MultiHierTT, OpenWikiTables),  benchmarks is reported in the below tables. 

The average speed to encode documents on a single H100 GPU using a sliding window with 512 context length chunks is also reported. 
Nearing encoding speed of 200 documents per second granite-embedding-small-english-r2 demonstrates speed and efficiency, while mainintaining competitive performance.

| Model                              | Parameters (M) | Embedding Size | BEIR Retrieval (15) | MTEB-v2 (41)| CoIR (10) | MLDR (En) | MTRAG (4) |  Encoding Speed (dosc/sec) |
|------------------------------------|:--------------:|:--------------:|:-------------------:|:-----------:|:---------:|:---------:|:---------:|:-------------------------------:|
| granite-embedding-125m-english     |      125       |      768       |        52.3         |     62.1   |   50.3    |   35.0    |   49.4   |               149             |
| granite-embedding-30m-english      |       30       |      384       |        49.1         |     60.2   |   47.0    |   32.6    |   48.6   |               198             |
| granite-embedding-english-r2       |      149       |      768       |        53.1         |     62.8   |   55.3    |   40.7    |   56.7   |               144             |
| granite-embedding-small-english-r2 |       47       |      384       |        50.9         |     61.1   |   53.8    |   39.8    |   48.1   |               199             |



|Model                              | Parameters (M)| Embedding Size|**AVERAGE**|MTEB-v2 Retrieval (10)| CoIR (10)| MLDR (En)| LongEmbed (6)| Table IR (5)| MTRAG (4) | Encoding Speed (docs/sec)|
|-----------------------------------|:-------------:|:-------------:|:---------:|:--------------------:|:--------:|:--------:|:------------:|:-----------:|:--------:|-----------:|
|e5-small-v2                        |33|384|45.39|48.5|47.1|29.9|40.7|72.31|33.8| 138|
|bge-small-en-v1.5                  |33|384|45.22|53.9|45.8|31.4|32.1|69.91|38.2| 138|
|||||||||||
|granite-embedding-english-r2       |149|768|59.5|56.4|54.8|41.6|67.8|78.53|57.6| 144|
|granite-embedding-small-english-r2 | 47|384|55.6|53.9|53.4|40.1|61.9|75.51|48.9| 199|


### Model Architecture and Key Features

The latest granite embedding r2 release introduces two English embedding models, both based on the ModernBERT architecture:
- _granite-embedding-english-r2_ (**149M** parameters): with an output embedding size of _768_, replacing _granite-embedding-125m-english_. 
- _granite-embedding-small-english-r2_ (**47M** parameters): A _first-of-its-kind_ reduced-size model, with fewer layers and a smaller output embedding size (_384_), replacing _granite-embedding-30m-english_. 

The following table shows the structure of the two models:

| Model                     | **granite-embedding-small-english-r2** | granite-embedding-english-r2   |
| :---------                | :-------:|:--------:| 
| Embedding size            | **384**      | 768      | 
| Number of layers          | **12**       | 22       | 
| Number of attention heads | **12**       | 12       | 
| Intermediate size         | **1536**     | 1152     | 
| Activation Function       | **GeGLU**    | GeGLU    | 
| Vocabulary Size           | **50368**    | 50368    | 
| Max. Sequence Length      | **8192**     | 8192     | 
| # Parameters              | **47M**      | 149M     | 


### Training and Optimization

The granite embedding r2 models incorporate key enhancements from the ModernBERT architecture, including: 
- Alternating attention lengths to accelerate processing 
- Rotary position embeddings for extended sequence length 
- A newly trained tokenizer optimized with code and text data 
- Flash Attention 2.0 for improved efficiency 
- Streamlined parameters, eliminating unnecessary bias terms


## Data Collection
Granite embedding r2 models are trained using data from four key sources: 
1. Unsupervised title-body paired data scraped from the web
2. Publicly available paired with permissive, enterprise-friendly license
3. IBM-internal paired data targetting specific technical domains
4. IBM-generated synthetic data

Notably, we _do not use_ the popular MS-MARCO retrieval dataset in our training corpus due to its non-commercial license (many open-source models use this dataset due to its high quality). 

The underlying encoder models using GneissWeb, an IBM-curated dataset composed exclusively of open, commercial-friendly sources.

For governance, all our data undergoes a data clearance process subject to technical, business, and governance review. This comprehensive process captures critical information about the data, including but not limited to their content description ownership, intended use, data classification, licensing information, usage restrictions, how the data will be acquired, as well as an assessment of sensitive information (i.e, personal information). 

## Infrastructure
We trained the granite embedding english r2 models using IBM's computing cluster, BlueVela Cluster, which is outfitted with NVIDIA H100 80GB GPUs. This cluster provides a scalable and efficient infrastructure for training our models over multiple GPUs.

## Ethical Considerations and Limitations
Granite-embedding-small-english-r2 leverages both permissively licensed open-source and select proprietary data for enhanced performance. The training data for the base language model was filtered to remove text containing hate, abuse, and profanity. Granite-embedding-small-english-r2 is trained only for English texts, and has a context length of 8192 tokens (longer texts will be truncated to this size).

- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources

## Citation
```
@misc{awasthy2025graniteembeddingr2models,
      title={Granite Embedding R2 Models}, 
      author={Parul Awasthy and Aashka Trivedi and Yulong Li and Meet Doshi and Riyaz Bhat and Vignesh P and Vishwajeet Kumar and Yushu Yang and Bhavani Iyer and Abraham Daniels and Rudra Murthy and Ken Barker and Martin Franz and Madison Lee and Todd Ward and Salim Roukos and David Cox and Luis Lastras and Jaydeep Sen and Radu Florian},
      year={2025},
      eprint={2508.21085},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2508.21085}, 
}
```