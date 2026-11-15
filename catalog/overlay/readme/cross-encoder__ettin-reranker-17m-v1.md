# ettin-reranker-17m-v1

This is a [Cross Encoder](https://www.sbert.net/docs/cross_encoder/usage/usage.html) model finetuned from [jhu-clsp/ettin-encoder-17m](https://huggingface.co/jhu-clsp/ettin-encoder-17m) on the [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data) dataset using the [sentence-transformers](https://www.SBERT.net) library. It computes scores for pairs of texts, which can be used for text reranking and semantic search.

See the [release blogpost](https://huggingface.co/blog/ettin-reranker) for details on the training recipe, evaluation results, and speed benchmarks against other public rerankers. The [Evaluation](#evaluation) section below also has the headline numbers.

## Model Details

### Model Description
- **Model Type:** Cross Encoder
- **Base model:** [jhu-clsp/ettin-encoder-17m](https://huggingface.co/jhu-clsp/ettin-encoder-17m) <!-- at revision 987607455c61e7a5bbc85f7758e0512ea6d0ae4c -->
- **Maximum Sequence Length:** 7999 tokens
- **Number of Output Labels:** 1 label
- **Supported Modality:** Text
- **Training Dataset:** [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data)
- **Language:** en
- **License:** apache-2.0

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Documentation:** [Cross Encoder Documentation](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Cross Encoders on Hugging Face](https://huggingface.co/models?library=sentence-transformers&other=cross-encoder)

### Full Model Architecture

```
CrossEncoder(
  (0): Transformer({'transformer_task': 'feature-extraction', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'last_hidden_state'}}, 'module_output_name': 'token_embeddings', 'architecture': 'ModernBertModel'})
  (1): Pooling({'embedding_dimension': 256, 'pooling_mode': 'cls', 'include_prompt': True})
  (2): Dense({'in_features': 256, 'out_features': 256, 'bias': False, 'activation_function': 'torch.nn.modules.activation.GELU', 'module_input_name': 'sentence_embedding', 'module_output_name': 'sentence_embedding'})
  (3): LayerNorm({'dimension': 256})
  (4): Dense({'in_features': 256, 'out_features': 1, 'bias': True, 'activation_function': 'torch.nn.modules.linear.Identity', 'module_input_name': 'sentence_embedding', 'module_output_name': 'scores'})
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```

Then you can load this model and run inference.
```python
from sentence_transformers import CrossEncoder

# Download from the 🤗 Hub
model = CrossEncoder(
    "cross-encoder/ettin-reranker-17m-v1",
    model_kwargs={"dtype": "bfloat16", "attn_implementation": "flash_attention_2"},  # Optional: pip install kernels
)

# Get scores for pairs of inputs
query = "Which planet is known as the Red Planet?"
passages = [
    "Venus is often called Earth's twin because of its similar size and proximity.",
    "Mars, known for its reddish appearance, is often referred to as the Red Planet.",
    "Jupiter, the largest planet in our solar system, has a prominent red spot.",
    "Saturn, famous for its rings, is sometimes mistaken for the Red Planet.",
]
scores = model.predict([(query, passage) for passage in passages])
print(scores)
# [ 6.59375 10.5      8.5625  10.     ]

# Or rank passages by relevance to a single query
ranked = model.rank(query, passages)
print(ranked)
# [{'corpus_id': 1, 'score': np.float32(10.5)}, ...]
```

<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

## Evaluation

### MTEB(eng, v2) Retrieval

Each model in the ettin-reranker-v1 family was evaluated on the full [`MTEB(eng, v2)` Retrieval benchmark](https://github.com/embeddings-benchmark/mteb) (10 tasks, top-100 reranked) using MTEB's [two-stage reranking flow](https://embeddings-benchmark.github.io/mteb/get_started/advanced_usage/two_stage_reranking/), pairing each reranker with six embedding models that span the speed/quality spectrum.
The dashed retriever-only line in each chart below is the headline number to beat. Anything below it means the reranker actively hurts the pipeline on average:

| | |
|-|-|
| ![MTEB(eng, v2) Retrieval with static-retrieval-mrl-en-v1 + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_static-retrieval-mrl-en-v1.png) | ![MTEB(eng, v2) Retrieval with all-MiniLM-L6-v2 + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_all-MiniLM-L6-v2.png) |
| ![MTEB(eng, v2) Retrieval with bge-small-en-v1.5 + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_bge-small-en-v1.5.png) | ![MTEB(eng, v2) Retrieval with nomic-embed-text-v1.5 + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_nomic-embed-text-v1.5.png) |
| ![MTEB(eng, v2) Retrieval with embeddinggemma-300m + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_embeddinggemma-300m.png) | ![MTEB(eng, v2) Retrieval with jina-embeddings-v5-text-small-retrieval + reranker](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_jina-embeddings-v5-text-small-retrieval.png) |

<details><summary>Full table of results (click to expand)</summary>

Mean NDCG@10 over the 6 embedder pairings, sorted by MTEB. The released ettin-reranker-v1 family is in **bold**, and the teacher [`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2) is <u>underlined</u>.

| Reranker | Params | MTEB(eng, v2) Retrieval NDCG@10 |
| --- | ---: | ---: |
| [`Qwen/Qwen3-Reranker-4B`](https://huggingface.co/Qwen/Qwen3-Reranker-4B)<sup>†</sup> | 4.02B | 0.6367 |
| <u>[`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2)</u> | <u>1.54B</u> | <u>0.6115</u> |
| **[`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1)** | **1.00B** | **0.6114** |
| **[`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1)** | **401M** | **0.6091** |
| **[`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)** | **151M** | **0.5994** |
| [`Qwen/Qwen3-Reranker-0.6B`](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B) | 596M | 0.5940 |
| [`mixedbread-ai/mxbai-rerank-base-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v2) | 494M | 0.5920 |
| **[`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)** | **68.6M** | **0.5915** |
| [`jinaai/jina-reranker-m0`](https://huggingface.co/jinaai/jina-reranker-m0) | 2.44B | 0.5856 |
| [`Alibaba-NLP/gte-reranker-modernbert-base`](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base) | 150M | 0.5843 |
| **[`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1)** | **32.8M** | **0.5779** |
| [`ibm-granite/granite-embedding-reranker-english-r2`](https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2) | 150M | 0.5656 |
| **[`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)** | **17.6M** | **0.5576** |
| [`BAAI/bge-reranker-v2-m3`](https://huggingface.co/BAAI/bge-reranker-v2-m3) | 568M | 0.5526 |
| [`zeroentropy/zerank-2-reranker`](https://huggingface.co/zeroentropy/zerank-2-reranker)<sup>†</sup> | 4.02B | 0.5300 |
| [`BAAI/bge-reranker-large`](https://huggingface.co/BAAI/bge-reranker-large) | 560M | 0.5098 |
| [`cross-encoder/ms-marco-MiniLM-L6-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2) | 22.7M | 0.5082 |
| [`cross-encoder/ms-marco-MiniLM-L12-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2) | 33.4M | 0.5066 |
| [`mixedbread-ai/mxbai-rerank-large-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v1) | 435M | 0.5063 |
| [`cross-encoder/ms-marco-MiniLM-L4-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2) | 19.2M | 0.4979 |
| [`mixedbread-ai/mxbai-rerank-xsmall-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1) | 70.8M | 0.4968 |
| [`BAAI/bge-reranker-base`](https://huggingface.co/BAAI/bge-reranker-base) | 278M | 0.4890 |
| [`mixedbread-ai/mxbai-rerank-base-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1) | 184M | 0.4865 |

<sup>†</sup> Capped to `max_seq_length=8192` (the 4B Qwen3-based rerankers don't fit on a single H100 80GB at native context). Native-context evaluation is likely higher.

</details>

See the [release blogpost](https://huggingface.co/blog/ettin-reranker) for the full analysis and per-model commentary.

### Speed

All six released models were benchmarked against thirteen public rerankers on three hardware tiers, using [`sentence-transformers/natural-questions`](https://huggingface.co/datasets/sentence-transformers/natural-questions) at `max_length=512` with each model's best supported attention implementation. The full sweep over `fp32+SDPA`, `bf16+SDPA`, padded `bf16+FA2`, and unpadded `bf16+FA2` (showing why the ettin-reranker-v1 family is faster than other ModernBERT-based rerankers) is in the [release blogpost](https://huggingface.co/blog/ettin-reranker#speed). This table shows the throughput in pairs per second on a NVIDIA H100 80GB, all in `bfloat16`:

| Model | Params | Attn | pairs / second |
|---|---:|---|---|
| **[`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)** | **17M** | FA2 | **7517** |
| **[`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1)** | **32M** | FA2 | **6602** |
| **[`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)** | **68M** | FA2 | **4913** |
| [`cross-encoder/ms-marco-MiniLM-L4-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2) | 19M | FA2 | 4029 |
| [`cross-encoder/ms-marco-MiniLM-L6-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2) | 22M | FA2 | 3817 |
| [`cross-encoder/ms-marco-MiniLM-L12-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2) | 33M | FA2 | 3311 |
| **[`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)** | **150M** | FA2 | **3237** |
| [`BAAI/bge-reranker-base`](https://huggingface.co/BAAI/bge-reranker-base) | 278M | FA2 | 2858 |
| [`mixedbread-ai/mxbai-rerank-xsmall-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1) | 70M | eager | 2636 |
| [`mixedbread-ai/mxbai-rerank-base-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1) | 184M | eager | 1953 |
| **[`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1)** | **400M** | FA2 | **1738** |
| [`BAAI/bge-reranker-large`](https://huggingface.co/BAAI/bge-reranker-large) | 560M | FA2 | 1659 |
| [`BAAI/bge-reranker-v2-m3`](https://huggingface.co/BAAI/bge-reranker-v2-m3) | 568M | FA2 | 1569 |
| [`Alibaba-NLP/gte-reranker-modernbert-base`](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base) | 150M | FA2 | 1418 |
| [`ibm-granite/granite-embedding-reranker-english-r2`](https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2) | 150M | FA2 | 1404 |
| **[`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1)** | **1B** | FA2 | **928** |
| [`mixedbread-ai/mxbai-rerank-large-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v1) | 435M | eager | 867 |
| [`mixedbread-ai/mxbai-rerank-base-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v2) | 494M | FA2 | 809 |
| <u>[`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2)</u> | <u>1.5B</u> | FA2 | <u>387</u> |

<details><summary>Same benchmark on a consumer GPU (RTX 3090, 24 GB)</summary>

| Model | Params | Best attn | pairs / second |
|---|---:|---|---:|
| **[`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)** | **17M** | FA2 | **9008** |
| [`cross-encoder/ms-marco-MiniLM-L4-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2) | 19M | FA2 | 5071 |
| **[`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1)** | **32M** | FA2 | **4497** |
| [`cross-encoder/ms-marco-MiniLM-L6-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2) | 22M | FA2 | 4234 |
| [`cross-encoder/ms-marco-MiniLM-L12-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2) | 33M | FA2 | 2847 |
| **[`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)** | **68M** | FA2 | **1916** |
| [`mixedbread-ai/mxbai-rerank-xsmall-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1) | 70M | eager | 1677 |
| [`BAAI/bge-reranker-base`](https://huggingface.co/BAAI/bge-reranker-base) | 278M | FA2 | 1329 |
| **[`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)** | **150M** | FA2 | **982** |
| [`mixedbread-ai/mxbai-rerank-base-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1) | 184M | eager | 772 |
| [`ibm-granite/granite-embedding-reranker-english-r2`](https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2) | 150M | FA2 | 598 |
| [`Alibaba-NLP/gte-reranker-modernbert-base`](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base) | 150M | FA2 | 586 |
| [`BAAI/bge-reranker-large`](https://huggingface.co/BAAI/bge-reranker-large) | 560M | FA2 | 448 |
| [`BAAI/bge-reranker-v2-m3`](https://huggingface.co/BAAI/bge-reranker-v2-m3) | 568M | FA2 | 436 |
| **[`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1)** | **400M** | FA2 | **429** |
| [`mixedbread-ai/mxbai-rerank-large-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v1) | 435M | eager | 266 |
| [`mixedbread-ai/mxbai-rerank-base-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v2) | 494M | FA2 | 221 |
| **[`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1)** | **1B** | FA2 | **189** |
| <u>[`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2)</u> | <u>1.5B</u> | FA2 | <u>69</u> |

</details>

<details><summary>Same benchmark on CPU (Intel Core i7-13700K)</summary>

| Model | Params | Best attn | pairs / second |
|---|---:|---|---:|
| **[`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)** | **17M** | SDPA | **267.4** |
| [`cross-encoder/ms-marco-MiniLM-L4-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2) | 19M | SDPA | 206.2 |
| [`cross-encoder/ms-marco-MiniLM-L6-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2) | 22M | SDPA | 143.9 |
| **[`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1)** | **32M** | SDPA | **92.5** |
| [`cross-encoder/ms-marco-MiniLM-L12-v2`](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2) | 33M | SDPA | 75.9 |
| [`mixedbread-ai/mxbai-rerank-xsmall-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1) | 70M | eager | 38.9 |
| **[`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)** | **68M** | SDPA | **31.2** |
| [`BAAI/bge-reranker-base`](https://huggingface.co/BAAI/bge-reranker-base) | 278M | SDPA | 19.2 |
| [`Alibaba-NLP/gte-reranker-modernbert-base`](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base) | 150M | SDPA | 14.7 |
| [`ibm-granite/granite-embedding-reranker-english-r2`](https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2) | 150M | SDPA | 14.5 |
| **[`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)** | **150M** | SDPA | **14.0** |
| [`mixedbread-ai/mxbai-rerank-base-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1) | 184M | eager | 13.4 |
| [`BAAI/bge-reranker-large`](https://huggingface.co/BAAI/bge-reranker-large) | 560M | SDPA | 6.2 |
| [`BAAI/bge-reranker-v2-m3`](https://huggingface.co/BAAI/bge-reranker-v2-m3) | 568M | SDPA | 6.0 |
| **[`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1)** | **400M** | SDPA | **5.2** |
| [`mixedbread-ai/mxbai-rerank-large-v1`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v1) | 435M | eager | 4.3 |
| [`mixedbread-ai/mxbai-rerank-base-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v2) | 494M | SDPA | 3.5 |
| **[`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1)** | **1B** | SDPA | **2.1** |

</details>


### Metrics

#### Cross Encoder Reranking

* Datasets: `NanoMSMARCO_R100`, `NanoNFCorpus_R100`, `NanoNQ_R100`, `NanoFiQA2018_R100`, `NanoTouche2020_R100`, `NanoSciFact_R100`, `NanoHotpotQA_R100`, `NanoArguAna_R100`, `NanoFEVER_R100`, `NanoDBPedia_R100`, `NanoClimateFEVER_R100`, `NanoSCIDOCS_R100` and `NanoQuoraRetrieval_R100`
* Evaluated with [<code>CrossEncoderRerankingEvaluator</code>](https://sbert.net/docs/package_reference/cross_encoder/evaluation.html#sentence_transformers.cross_encoder.evaluation.CrossEncoderRerankingEvaluator) with these parameters:
  ```json
  {
      "at_k": 10,
      "always_rerank_positives": true
  }
  ```

| Metric      | NanoMSMARCO_R100     | NanoNFCorpus_R100    | NanoNQ_R100          | NanoFiQA2018_R100    | NanoTouche2020_R100  | NanoSciFact_R100     | NanoHotpotQA_R100    | NanoArguAna_R100     | NanoFEVER_R100       | NanoDBPedia_R100     | NanoClimateFEVER_R100 | NanoSCIDOCS_R100     | NanoQuoraRetrieval_R100 |
|:------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:---------------------|:----------------------|:---------------------|:------------------------|
| map         | 0.6086 (+0.1190)     | 0.3541 (+0.0931)     | 0.6581 (+0.2385)     | 0.4944 (+0.1293)     | 0.4834 (-0.0665)     | 0.7157 (+0.0459)     | 0.9094 (+0.1411)     | 0.5608 (+0.1501)     | 0.9192 (+0.1473)     | 0.6142 (+0.1024)     | 0.4356 (+0.1954)      | 0.2981 (+0.0238)     | 0.9296 (+0.0987)        |
| mrr@10      | 0.6112 (+0.1337)     | 0.5515 (+0.0516)     | 0.6903 (+0.2636)     | 0.6112 (+0.1204)     | 0.7939 (-0.1133)     | 0.7218 (+0.0438)     | 1.0000 (+0.0771)     | 0.5679 (+0.1748)     | 0.9490 (+0.1690)     | 0.8770 (+0.0763)     | 0.6746 (+0.2707)      | 0.5672 (+0.0077)     | 0.9533 (+0.0852)        |
| **ndcg@10** | **0.6800 (+0.1395)** | **0.4085 (+0.0835)** | **0.7183 (+0.2177)** | **0.5722 (+0.1348)** | **0.5748 (-0.1190)** | **0.7573 (+0.0474)** | **0.9388 (+0.1111)** | **0.6584 (+0.1696)** | **0.9415 (+0.1320)** | **0.6834 (+0.0690)** | **0.5131 (+0.1954)**  | **0.3601 (+0.0250)** | **0.9455 (+0.0768)**    |

#### Cross Encoder Nano BEIR

* Dataset: `NanoBEIR_R100_mean`
* Evaluated with [<code>CrossEncoderNanoBEIREvaluator</code>](https://sbert.net/docs/package_reference/cross_encoder/evaluation.html#sentence_transformers.cross_encoder.evaluation.CrossEncoderNanoBEIREvaluator) with these parameters:
  ```json
  {
      "dataset_names": [
          "msmarco",
          "nfcorpus",
          "nq",
          "fiqa2018",
          "touche2020",
          "scifact",
          "hotpotqa",
          "arguana",
          "fever",
          "dbpedia",
          "climatefever",
          "scidocs",
          "quoraretrieval"
      ],
      "dataset_id": "sentence-transformers/NanoBEIR-en",
      "rerank_k": 100,
      "at_k": 10,
      "always_rerank_positives": true
  }
  ```

| Metric      | Value                |
|:------------|:---------------------|
| map         | 0.6139 (+0.1091)     |
| mrr@10      | 0.7361 (+0.1047)     |
| **ndcg@10** | **0.6732 (+0.0987)** |

> [!NOTE]
> The [release blogpost](https://huggingface.co/blog/ettin-reranker) quotes a slightly higher NanoBEIR mean NDCG@10 of `0.6746` for this model, computed in `fp32` rather than the `bfloat16` used by the training-time evaluation above. Both numbers are valid.

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### ettin-reranker-v1-data

* Dataset: [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data)
* Size: 143,393,475 training samples
* Columns: <code>query</code>, <code>document</code>, and <code>label</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | document                                                                                          | label                                                              |
  |:--------|:------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                            | float                                                              |
  | details | <ul><li>min: 26 characters</li><li>mean: 55.52 characters</li><li>max: 249 characters</li></ul> | <ul><li>min: 63 characters</li><li>mean: 659.91 characters</li><li>max: 3975 characters</li></ul> | <ul><li>min: -2.94</li><li>mean: 8.51</li><li>max: 13.88</li></ul> |
* Samples:
  | query                                                                                         | document                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | label             |
  |:----------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------|
  | <code>Help me with my Reborn performance</code>                                               | <code>I was reading the comment section for Dotacinema's world of dota video, and a bunch of people were complaining how there were a lot of bugs and some talked about PERFORMANCE ISSUES. But there were also people saying that reborn has actually IMPROVED their gameplay?<br><br><br>I am one of those people who is running into performance issues and would desperately like to know how some are getting BETTER performance while others like me are getting worse. I'm not complaining about bugs, I'm complaing about framerate, I use to get 60 fps solid in source 1 but I now have 40 or at worst 30 fps in source 2.<br>I have an i3 processor/gtx560ti/16gb RAM<br><br>i dont think it's a potato pc, so I dont know what's happening, I cleaned my computer recently so dust isnt affecting anything in anyway.<br>So if you gained or had IMPROVED performance in source 2 please list the settings you are enabling, so I can see where I am at fault. (v sync is off btw)<br><br>TLDR: Have bad performance now from source 2, if you have good p...</code> | <code>9.5</code>  |
  | <code>Really wanna try out the game and expansion, ~$60 is hefty. Likelihood of sales?</code> | <code>As per title, steam sells the game and its expansions for $60 total. Heavy price to drop. Are there sales on any other website? This game looks fantastic to immerse in otherwise and I'm pleased that this subreddit has at least some attention to help out new folks!</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | <code>9.25</code> |
  | <code>Your Avatar. [MGSV Spoilers]</code>                                                     | <code>Was anyone else suprised he actually replaces the snake model in some cutscenes. I've only tried the first Quiet cutscenes, i was just amazed I haven't seen anybody else say this yet.<br>Sorry if repost.</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | <code>5.25</code> |
* Loss: [<code>MSELoss</code>](https://sbert.net/docs/package_reference/cross_encoder/losses.html#mseloss) with these parameters:
  ```json
  {
      "activation_fn": "torch.nn.modules.linear.Identity"
  }
  ```

### Evaluation Dataset

#### ettin-reranker-v1-data

* Dataset: [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data)
* Size: 5,000 evaluation samples
* Columns: <code>query</code>, <code>document</code>, and <code>label</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | document                                                                                        | label                                                              |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          | float                                                              |
  | details | <ul><li>min: 14 characters</li><li>mean: 52.62 characters</li><li>max: 168 characters</li></ul> | <ul><li>min: 11 characters</li><li>mean: 50.12 characters</li><li>max: 184 characters</li></ul> | <ul><li>min: 4.44</li><li>mean: 13.49</li><li>max: 18.62</li></ul> |
* Samples:
  | query                                                             | document                                                                               | label                |
  |:------------------------------------------------------------------|:---------------------------------------------------------------------------------------|:---------------------|
  | <code>Why do we need binomial distribution?</code>                | <code>Why is the binomial distribution important?</code>                               | <code>11.375</code>  |
  | <code>I already have Windows 10, can I delete Windows.old?</code> | <code>After resetting windows 10, can I safely delete the "old windows" folder?</code> | <code>10.875</code>  |
  | <code>How can guys last longer during sex?</code>                 | <code>How do men last longer in bed?</code>                                            | <code>10.8125</code> |
* Loss: [<code>MSELoss</code>](https://sbert.net/docs/package_reference/cross_encoder/losses.html#mseloss) with these parameters:
  ```json
  {
      "activation_fn": "torch.nn.modules.linear.Identity"
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `per_device_train_batch_size`: 128
- `num_train_epochs`: 1
- `learning_rate`: 0.00024
- `warmup_steps`: 0.03
- `bf16`: True
- `per_device_eval_batch_size`: 128
- `load_best_model_at_end`: True
- `seed`: 12
- `dataloader_num_workers`: 4

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 128
- `num_train_epochs`: 1
- `max_steps`: -1
- `learning_rate`: 0.00024
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_steps`: 0.03
- `optim`: adamw_torch
- `optim_args`: None
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `optim_target_modules`: None
- `gradient_accumulation_steps`: 1
- `average_tokens_across_devices`: True
- `max_grad_norm`: 1.0
- `label_smoothing_factor`: 0.0
- `bf16`: True
- `fp16`: False
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `use_cache`: False
- `neftune_noise_alpha`: None
- `torch_empty_cache_steps`: None
- `auto_find_batch_size`: False
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `include_num_input_tokens_seen`: no
- `log_level`: passive
- `log_level_replica`: warning
- `disable_tqdm`: False
- `project`: huggingface
- `trackio_space_id`: None
- `trackio_bucket_id`: None
- `trackio_static_space_id`: None
- `per_device_eval_batch_size`: 128
- `prediction_loss_only`: True
- `eval_on_start`: False
- `eval_do_concat_batches`: True
- `eval_use_gather_object`: False
- `eval_accumulation_steps`: None
- `include_for_metrics`: []
- `batch_eval_metrics`: False
- `save_only_model`: False
- `save_on_each_node`: False
- `enable_jit_checkpoint`: False
- `push_to_hub`: False
- `hub_private_repo`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_always_push`: False
- `hub_revision`: None
- `load_best_model_at_end`: True
- `ignore_data_skip`: False
- `restore_callback_states_from_checkpoint`: False
- `full_determinism`: False
- `seed`: 12
- `data_seed`: None
- `use_cpu`: False
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `dataloader_drop_last`: True
- `dataloader_num_workers`: 4
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `dataloader_prefetch_factor`: None
- `remove_unused_columns`: True
- `label_names`: None
- `train_sampling_strategy`: random
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `ddp_static_graph`: None
- `ddp_backend`: None
- `ddp_timeout`: 1800
- `fsdp`: []
- `fsdp_config`: {'min_num_params': 0, 'xla': False, 'xla_fsdp_v2': False, 'xla_fsdp_grad_ckpt': False}
- `deepspeed`: None
- `debug`: []
- `skip_memory_metrics`: True
- `do_predict`: False
- `resume_from_checkpoint`: None
- `warmup_ratio`: None
- `local_rank`: -1
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: proportional
- `router_mapping`: {}
- `learning_rate_mapping`: {}

</details>

### Training Logs
| Epoch      | Step       | Training Loss | Validation Loss | NanoMSMARCO_R100_ndcg@10 | NanoNFCorpus_R100_ndcg@10 | NanoNQ_R100_ndcg@10  | NanoFiQA2018_R100_ndcg@10 | NanoTouche2020_R100_ndcg@10 | NanoSciFact_R100_ndcg@10 | NanoHotpotQA_R100_ndcg@10 | NanoArguAna_R100_ndcg@10 | NanoFEVER_R100_ndcg@10 | NanoDBPedia_R100_ndcg@10 | NanoClimateFEVER_R100_ndcg@10 | NanoSCIDOCS_R100_ndcg@10 | NanoQuoraRetrieval_R100_ndcg@10 | NanoBEIR_R100_mean_ndcg@10 |
|:----------:|:----------:|:-------------:|:---------------:|:------------------------:|:-------------------------:|:--------------------:|:-------------------------:|:---------------------------:|:------------------------:|:-------------------------:|:------------------------:|:----------------------:|:------------------------:|:-----------------------------:|:------------------------:|:-------------------------------:|:--------------------------:|
| -1         | -1         | -             | -               | 0.0400 (-0.5004)         | 0.2605 (-0.0646)          | 0.0000 (-0.5006)     | 0.0769 (-0.3606)          | 0.1995 (-0.4943)            | 0.0979 (-0.6120)         | 0.0344 (-0.7933)          | 0.1805 (-0.3084)         | 0.0320 (-0.7774)       | 0.2502 (-0.3642)         | 0.0916 (-0.2261)              | 0.1174 (-0.2178)         | 0.1460 (-0.7227)                | 0.1174 (-0.4571)           |
| 0.0000     | 1          | 79.3092       | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.0250     | 3501       | 4.9674        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.0500     | 7002       | 2.1171        | 1.8083          | 0.6276 (+0.0872)         | 0.3866 (+0.0615)          | 0.6054 (+0.1047)     | 0.4742 (+0.0367)          | 0.5829 (-0.1109)            | 0.7033 (-0.0066)         | 0.9182 (+0.0905)          | 0.6248 (+0.1359)         | 0.8833 (+0.0739)       | 0.5854 (-0.0290)         | 0.4295 (+0.1117)              | 0.3368 (+0.0017)         | 0.8734 (+0.0047)                | 0.6178 (+0.0432)           |
| 0.0750     | 10503      | 1.8957        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.1000     | 14004      | 1.7727        | 1.7190          | 0.6237 (+0.0833)         | 0.4003 (+0.0753)          | 0.6080 (+0.1073)     | 0.4761 (+0.0387)          | 0.5723 (-0.1215)            | 0.7275 (+0.0176)         | 0.9145 (+0.0868)          | 0.6113 (+0.1225)         | 0.8688 (+0.0594)       | 0.6116 (-0.0028)         | 0.4295 (+0.1118)              | 0.3700 (+0.0349)         | 0.9034 (+0.0347)                | 0.6244 (+0.0498)           |
| 0.1250     | 17505      | 1.6963        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.1500     | 21006      | 1.6339        | 1.3415          | 0.6374 (+0.0970)         | 0.3852 (+0.0602)          | 0.6341 (+0.1335)     | 0.5103 (+0.0729)          | 0.5736 (-0.1202)            | 0.7049 (-0.0050)         | 0.9393 (+0.1116)          | 0.6468 (+0.1579)         | 0.8726 (+0.0632)       | 0.6748 (+0.0604)         | 0.4716 (+0.1539)              | 0.3670 (+0.0319)         | 0.9210 (+0.0523)                | 0.6414 (+0.0669)           |
| 0.1750     | 24507      | 1.5862        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.2000     | 28008      | 1.5412        | 1.1487          | 0.6855 (+0.1451)         | 0.3952 (+0.0702)          | 0.6974 (+0.1967)     | 0.5131 (+0.0757)          | 0.5872 (-0.1066)            | 0.6929 (-0.0170)         | 0.9432 (+0.1155)          | 0.6297 (+0.1409)         | 0.8756 (+0.0662)       | 0.6693 (+0.0550)         | 0.4455 (+0.1277)              | 0.3684 (+0.0332)         | 0.9231 (+0.0544)                | 0.6482 (+0.0736)           |
| 0.2250     | 31509      | 1.5041        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.2500     | 35010      | 1.4727        | 1.1108          | 0.6670 (+0.1265)         | 0.3924 (+0.0673)          | 0.6889 (+0.1883)     | 0.5271 (+0.0897)          | 0.5727 (-0.1212)            | 0.7069 (-0.0030)         | 0.9389 (+0.1112)          | 0.6432 (+0.1544)         | 0.9108 (+0.1014)       | 0.6667 (+0.0523)         | 0.5017 (+0.1839)              | 0.3758 (+0.0406)         | 0.9275 (+0.0588)                | 0.6553 (+0.0808)           |
| 0.2750     | 38511      | 1.4423        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.3000     | 42012      | 1.4194        | 1.0492          | 0.6345 (+0.0940)         | 0.4045 (+0.0794)          | 0.7183 (+0.2176)     | 0.5235 (+0.0861)          | 0.5584 (-0.1354)            | 0.7282 (+0.0183)         | 0.9320 (+0.1043)          | 0.6467 (+0.1579)         | 0.9280 (+0.1186)       | 0.6517 (+0.0374)         | 0.4485 (+0.1308)              | 0.3842 (+0.0491)         | 0.9516 (+0.0829)                | 0.6546 (+0.0801)           |
| 0.3250     | 45513      | 1.3960        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.3500     | 49014      | 1.3700        | 1.1569          | 0.6677 (+0.1273)         | 0.4075 (+0.0825)          | 0.7057 (+0.2050)     | 0.5382 (+0.1007)          | 0.5797 (-0.1141)            | 0.6941 (-0.0158)         | 0.9424 (+0.1147)          | 0.6319 (+0.1431)         | 0.9016 (+0.0922)       | 0.6609 (+0.0465)         | 0.4948 (+0.1771)              | 0.3856 (+0.0505)         | 0.9340 (+0.0654)                | 0.6572 (+0.0827)           |
| 0.3750     | 52515      | 1.3492        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.4000     | 56016      | 1.3274        | 1.0062          | 0.6543 (+0.1139)         | 0.3915 (+0.0664)          | 0.7242 (+0.2235)     | 0.5245 (+0.0871)          | 0.5851 (-0.1087)            | 0.7089 (-0.0010)         | 0.9404 (+0.1126)          | 0.6274 (+0.1385)         | 0.9074 (+0.0980)       | 0.6499 (+0.0355)         | 0.4788 (+0.1611)              | 0.3786 (+0.0435)         | 0.9304 (+0.0617)                | 0.6539 (+0.0794)           |
| 0.4250     | 59517      | 1.3128        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.4500     | 63018      | 1.2914        | 1.0094          | 0.6926 (+0.1522)         | 0.3927 (+0.0677)          | 0.6977 (+0.1971)     | 0.5574 (+0.1199)          | 0.5704 (-0.1234)            | 0.7072 (-0.0027)         | 0.9389 (+0.1112)          | 0.6589 (+0.1701)         | 0.8910 (+0.0816)       | 0.6628 (+0.0484)         | 0.4652 (+0.1475)              | 0.3769 (+0.0418)         | 0.9304 (+0.0617)                | 0.6571 (+0.0825)           |
| 0.4750     | 66519      | 1.2758        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.5000     | 70020      | 1.2610        | 1.0058          | 0.6693 (+0.1289)         | 0.4071 (+0.0820)          | 0.6857 (+0.1851)     | 0.5466 (+0.1092)          | 0.5775 (-0.1163)            | 0.7113 (+0.0014)         | 0.9361 (+0.1084)          | 0.6492 (+0.1604)         | 0.9282 (+0.1188)       | 0.6750 (+0.0606)         | 0.4937 (+0.1760)              | 0.3744 (+0.0392)         | 0.9353 (+0.0666)                | 0.6607 (+0.0862)           |
| 0.5250     | 73521      | 1.2465        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.5500     | 77022      | 1.2313        | 0.9005          | 0.6813 (+0.1408)         | 0.4077 (+0.0826)          | 0.7328 (+0.2321)     | 0.5586 (+0.1211)          | 0.5801 (-0.1137)            | 0.7205 (+0.0106)         | 0.9439 (+0.1162)          | 0.6519 (+0.1631)         | 0.9435 (+0.1341)       | 0.6829 (+0.0686)         | 0.4904 (+0.1727)              | 0.3759 (+0.0408)         | 0.9372 (+0.0686)                | 0.6697 (+0.0952)           |
| 0.5750     | 80523      | 1.2185        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.6000     | 84024      | 1.2050        | 0.8656          | 0.6841 (+0.1437)         | 0.3947 (+0.0696)          | 0.7289 (+0.2283)     | 0.5356 (+0.0982)          | 0.5723 (-0.1215)            | 0.7384 (+0.0284)         | 0.9426 (+0.1149)          | 0.6616 (+0.1727)         | 0.9118 (+0.1024)       | 0.6795 (+0.0652)         | 0.4829 (+0.1651)              | 0.3615 (+0.0264)         | 0.9449 (+0.0762)                | 0.6645 (+0.0900)           |
| 0.6250     | 87525      | 1.1912        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.6500     | 91026      | 1.1820        | 0.9074          | 0.6736 (+0.1331)         | 0.4048 (+0.0798)          | 0.7396 (+0.2390)     | 0.5499 (+0.1125)          | 0.5796 (-0.1142)            | 0.7363 (+0.0264)         | 0.9370 (+0.1093)          | 0.6665 (+0.1777)         | 0.9123 (+0.1029)       | 0.6841 (+0.0698)         | 0.4878 (+0.1700)              | 0.3681 (+0.0329)         | 0.9465 (+0.0778)                | 0.6682 (+0.0936)           |
| 0.6750     | 94527      | 1.1705        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.7000     | 98028      | 1.1571        | 0.8836          | 0.6693 (+0.1289)         | 0.4034 (+0.0783)          | 0.7235 (+0.2229)     | 0.5484 (+0.1110)          | 0.5820 (-0.1118)            | 0.7387 (+0.0288)         | 0.9371 (+0.1094)          | 0.6717 (+0.1829)         | 0.9091 (+0.0997)       | 0.6778 (+0.0635)         | 0.4857 (+0.1679)              | 0.3778 (+0.0427)         | 0.9462 (+0.0775)                | 0.6670 (+0.0924)           |
| 0.7250     | 101529     | 1.1483        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.7500     | 105030     | 1.1392        | 0.8832          | 0.6811 (+0.1407)         | 0.4055 (+0.0804)          | 0.7068 (+0.2061)     | 0.5486 (+0.1112)          | 0.5683 (-0.1255)            | 0.7110 (+0.0011)         | 0.9334 (+0.1056)          | 0.6630 (+0.1742)         | 0.9449 (+0.1355)       | 0.6786 (+0.0643)         | 0.5049 (+0.1871)              | 0.3638 (+0.0287)         | 0.9372 (+0.0685)                | 0.6652 (+0.0906)           |
| 0.7750     | 108531     | 1.1276        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.8000     | 112032     | 1.1186        | 0.8346          | 0.7039 (+0.1635)         | 0.3954 (+0.0704)          | 0.7085 (+0.2078)     | 0.5390 (+0.1016)          | 0.5785 (-0.1153)            | 0.7327 (+0.0227)         | 0.9415 (+0.1138)          | 0.6634 (+0.1746)         | 0.9365 (+0.1271)       | 0.6838 (+0.0694)         | 0.5140 (+0.1962)              | 0.3621 (+0.0270)         | 0.9367 (+0.0680)                | 0.6689 (+0.0944)           |
| 0.8250     | 115533     | 1.1098        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.8500     | 119034     | 1.1005        | 0.8532          | 0.6754 (+0.1349)         | 0.4059 (+0.0809)          | 0.7164 (+0.2157)     | 0.5602 (+0.1227)          | 0.5836 (-0.1102)            | 0.7584 (+0.0485)         | 0.9410 (+0.1133)          | 0.6725 (+0.1837)         | 0.9406 (+0.1312)       | 0.6796 (+0.0652)         | 0.5042 (+0.1865)              | 0.3774 (+0.0423)         | 0.9370 (+0.0683)                | 0.6733 (+0.0987)           |
| 0.8750     | 122535     | 1.0910        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.9001     | 126036     | 1.0844        | 0.8247          | 0.6643 (+0.1239)         | 0.4022 (+0.0771)          | 0.7191 (+0.2184)     | 0.5494 (+0.1120)          | 0.5786 (-0.1152)            | 0.7452 (+0.0353)         | 0.9367 (+0.1090)          | 0.6823 (+0.1935)         | 0.9410 (+0.1316)       | 0.6813 (+0.0669)         | 0.5063 (+0.1886)              | 0.3660 (+0.0309)         | 0.9474 (+0.0787)                | 0.6708 (+0.0962)           |
| 0.9251     | 129537     | 1.0791        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| **0.9501** | **133038** | **1.0716**    | **0.8534**      | **0.6756 (+0.1352)**     | **0.4061 (+0.0811)**      | **0.7230 (+0.2224)** | **0.5685 (+0.1311)**      | **0.5827 (-0.1111)**        | **0.7561 (+0.0462)**     | **0.9405 (+0.1128)**      | **0.6554 (+0.1666)**     | **0.9443 (+0.1349)**   | **0.6884 (+0.0741)**     | **0.5195 (+0.2017)**          | **0.3644 (+0.0293)**     | **0.9457 (+0.0770)**            | **0.6746 (+0.1001)**       |
| 0.9751     | 136539     | 1.0676        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 1.0        | 140032     | -             | 0.8175          | 0.6800 (+0.1395)         | 0.4085 (+0.0835)          | 0.7183 (+0.2177)     | 0.5722 (+0.1348)          | 0.5748 (-0.1190)            | 0.7573 (+0.0474)         | 0.9388 (+0.1111)          | 0.6584 (+0.1696)         | 0.9415 (+0.1320)       | 0.6834 (+0.0690)         | 0.5131 (+0.1954)              | 0.3601 (+0.0250)         | 0.9455 (+0.0768)                | 0.6732 (+0.0987)           |

* The bold row denotes the saved checkpoint.

### Training Time
- **Training**: 3.0 hours
- **Evaluation**: 7.9 minutes
- **Total**: 3.2 hours

### Framework Versions
- Python: 3.11.15
- Sentence Transformers: 5.4.1
- Transformers: 5.7.0
- PyTorch: 2.7.0+cu126
- Accelerate: 1.13.0
- Datasets: 4.8.5
- Tokenizers: 0.22.2

## Citation

### BibTeX

#### Ettin Reranker Blogpost
```bibtex
@misc{aarsen2026ettin-reranker,
    title = "Introducing the Ettin Reranker Family",
    author = "Aarsen, Tom",
    year = "2026",
    publisher = "Hugging Face",
    url = "https://huggingface.co/blog/ettin-reranker",
}
```

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->