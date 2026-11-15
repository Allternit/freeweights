# ettin-reranker-1b-v1

This is a [Cross Encoder](https://www.sbert.net/docs/cross_encoder/usage/usage.html) model finetuned from [jhu-clsp/ettin-encoder-1b](https://huggingface.co/jhu-clsp/ettin-encoder-1b) on the [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data) dataset using the [sentence-transformers](https://www.SBERT.net) library. It computes scores for pairs of texts, which can be used for text reranking and semantic search.

See the [release blogpost](https://huggingface.co/blog/ettin-reranker) for details on the training recipe, evaluation results, and speed benchmarks against other public rerankers. The [Evaluation](#evaluation) section below also has the headline numbers.

## Model Details

### Model Description
- **Model Type:** Cross Encoder
- **Base model:** [jhu-clsp/ettin-encoder-1b](https://huggingface.co/jhu-clsp/ettin-encoder-1b) <!-- at revision befd76be43d08b89ff9957012f3ff29d0842780b -->
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
  (1): Pooling({'embedding_dimension': 1792, 'pooling_mode': 'cls', 'include_prompt': True})
  (2): Dense({'in_features': 1792, 'out_features': 1792, 'bias': False, 'activation_function': 'torch.nn.modules.activation.GELU', 'module_input_name': 'sentence_embedding', 'module_output_name': 'sentence_embedding'})
  (3): LayerNorm({'dimension': 1792})
  (4): Dense({'in_features': 1792, 'out_features': 1, 'bias': True, 'activation_function': 'torch.nn.modules.linear.Identity', 'module_input_name': 'sentence_embedding', 'module_output_name': 'scores'})
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
    "cross-encoder/ettin-reranker-1b-v1",
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
# [ 2.984375 11.9375    5.71875   9.625   ]

# Or rank passages by relevance to a single query
ranked = model.rank(query, passages)
print(ranked)
# [{'corpus_id': 1, 'score': np.float32(11.9375)}, ...]
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
| map         | 0.6111 (+0.1215)     | 0.3971 (+0.1362)     | 0.7361 (+0.3165)     | 0.5993 (+0.2342)     | 0.4946 (-0.0553)     | 0.7337 (+0.0640)     | 0.9295 (+0.1612)     | 0.6853 (+0.2747)     | 0.9432 (+0.1713)     | 0.6963 (+0.1844)     | 0.4873 (+0.2470)      | 0.3412 (+0.0669)     | 0.9509 (+0.1201)        |
| mrr@10      | 0.6142 (+0.1367)     | 0.6391 (+0.1393)     | 0.7547 (+0.3280)     | 0.6997 (+0.2089)     | 0.8275 (-0.0796)     | 0.7406 (+0.0625)     | 0.9800 (+0.0571)     | 0.6985 (+0.3054)     | 0.9800 (+0.2000)     | 0.8822 (+0.0816)     | 0.7342 (+0.3303)      | 0.5922 (+0.0327)     | 0.9733 (+0.1052)        |
| **ndcg@10** | **0.6978 (+0.1574)** | **0.4485 (+0.1235)** | **0.7980 (+0.2974)** | **0.6605 (+0.2231)** | **0.5840 (-0.1098)** | **0.7775 (+0.0676)** | **0.9515 (+0.1237)** | **0.7637 (+0.2749)** | **0.9607 (+0.1513)** | **0.7631 (+0.1487)** | **0.5740 (+0.2563)**  | **0.3991 (+0.0639)** | **0.9668 (+0.0981)**    |

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
| map         | 0.6620 (+0.1571)     |
| mrr@10      | 0.7782 (+0.1468)     |
| **ndcg@10** | **0.7189 (+0.1443)** |

> [!NOTE]
> The [release blogpost](https://huggingface.co/blog/ettin-reranker) quotes a slightly higher NanoBEIR mean NDCG@10 of `0.7237` for this model, computed in `fp32` rather than the `bfloat16` used by the training-time evaluation above. Both numbers are valid.

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

- `per_device_train_batch_size`: 4
- `num_train_epochs`: 1
- `learning_rate`: 3e-06
- `warmup_steps`: 0.03
- `bf16`: True
- `per_device_eval_batch_size`: 4
- `load_best_model_at_end`: True
- `seed`: 12

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 4
- `num_train_epochs`: 1
- `max_steps`: -1
- `learning_rate`: 3e-06
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
- `per_device_eval_batch_size`: 4
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
- `dataloader_num_workers`: 0
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
| Epoch   | Step       | Training Loss | Validation Loss | NanoMSMARCO_R100_ndcg@10 | NanoNFCorpus_R100_ndcg@10 | NanoNQ_R100_ndcg@10  | NanoFiQA2018_R100_ndcg@10 | NanoTouche2020_R100_ndcg@10 | NanoSciFact_R100_ndcg@10 | NanoHotpotQA_R100_ndcg@10 | NanoArguAna_R100_ndcg@10 | NanoFEVER_R100_ndcg@10 | NanoDBPedia_R100_ndcg@10 | NanoClimateFEVER_R100_ndcg@10 | NanoSCIDOCS_R100_ndcg@10 | NanoQuoraRetrieval_R100_ndcg@10 | NanoBEIR_R100_mean_ndcg@10 |
|:-------:|:----------:|:-------------:|:---------------:|:------------------------:|:-------------------------:|:--------------------:|:-------------------------:|:---------------------------:|:------------------------:|:-------------------------:|:------------------------:|:----------------------:|:------------------------:|:-----------------------------:|:------------------------:|:-------------------------------:|:--------------------------:|
| 0.0000  | 1          | 76.3278       | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.0250  | 7002       | 4.8750        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.0500  | 14004      | 0.9298        | 0.5204          | 0.7122 (+0.1718)         | 0.4922 (+0.1672)          | 0.7952 (+0.2945)     | 0.6233 (+0.1859)          | 0.6020 (-0.0918)            | 0.7809 (+0.0710)         | 0.9575 (+0.1298)          | 0.6976 (+0.2087)         | 0.9453 (+0.1358)       | 0.7601 (+0.1458)         | 0.5736 (+0.2559)              | 0.4162 (+0.0811)         | 0.9620 (+0.0933)                | 0.7168 (+0.1422)           |
| 0.0750  | 21006      | 0.7986        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.1000  | 28008      | 0.7383        | 0.4539          | 0.7105 (+0.1701)         | 0.4824 (+0.1574)          | 0.7999 (+0.2993)     | 0.6212 (+0.1838)          | 0.5942 (-0.0996)            | 0.7817 (+0.0718)         | 0.9553 (+0.1275)          | 0.7018 (+0.2130)         | 0.9490 (+0.1396)       | 0.7640 (+0.1496)         | 0.5735 (+0.2558)              | 0.4241 (+0.0889)         | 0.9688 (+0.1001)                | 0.7174 (+0.1429)           |
| 0.1250  | 35010      | 0.6972        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.1500  | 42012      | 0.6661        | 0.4238          | 0.7250 (+0.1845)         | 0.4786 (+0.1535)          | 0.8072 (+0.3065)     | 0.6234 (+0.1860)          | 0.5803 (-0.1135)            | 0.7793 (+0.0694)         | 0.9511 (+0.1234)          | 0.7110 (+0.2222)         | 0.9493 (+0.1398)       | 0.7668 (+0.1524)         | 0.5723 (+0.2546)              | 0.4183 (+0.0832)         | 0.9673 (+0.0986)                | 0.7177 (+0.1431)           |
| 0.1750  | 49014      | 0.6429        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.2000  | 56016      | 0.6225        | 0.3714          | 0.7289 (+0.1885)         | 0.4862 (+0.1611)          | 0.8099 (+0.3093)     | 0.6304 (+0.1929)          | 0.5761 (-0.1177)            | 0.7852 (+0.0753)         | 0.9538 (+0.1261)          | 0.7170 (+0.2282)         | 0.9457 (+0.1363)       | 0.7725 (+0.1581)         | 0.5751 (+0.2573)              | 0.4089 (+0.0737)         | 0.9654 (+0.0967)                | 0.7196 (+0.1451)           |
| 0.2250  | 63018      | 0.6043        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.2500  | 70020      | 0.5909        | 0.3706          | 0.7158 (+0.1754)         | 0.4799 (+0.1548)          | 0.8154 (+0.3147)     | 0.6383 (+0.2009)          | 0.5771 (-0.1167)            | 0.7927 (+0.0828)         | 0.9524 (+0.1247)          | 0.7125 (+0.2237)         | 0.9465 (+0.1371)       | 0.7703 (+0.1559)         | 0.5792 (+0.2615)              | 0.4053 (+0.0702)         | 0.9625 (+0.0938)                | 0.7191 (+0.1445)           |
| 0.2750  | 77022      | 0.5762        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.3000  | 84024      | 0.5674        | 0.3519          | 0.7079 (+0.1675)         | 0.4903 (+0.1652)          | 0.8032 (+0.3025)     | 0.6422 (+0.2048)          | 0.5937 (-0.1001)            | 0.7918 (+0.0818)         | 0.9541 (+0.1264)          | 0.7310 (+0.2422)         | 0.9504 (+0.1410)       | 0.7604 (+0.1460)         | 0.5713 (+0.2536)              | 0.3968 (+0.0616)         | 0.9661 (+0.0974)                | 0.7199 (+0.1454)           |
| 0.3250  | 91026      | 0.5560        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.3500  | 98028      | 0.5469        | 0.3438          | 0.7146 (+0.1741)         | 0.4748 (+0.1498)          | 0.8036 (+0.3029)     | 0.6455 (+0.2080)          | 0.5760 (-0.1178)            | 0.7841 (+0.0742)         | 0.9508 (+0.1231)          | 0.7416 (+0.2528)         | 0.9516 (+0.1422)       | 0.7643 (+0.1499)         | 0.5753 (+0.2576)              | 0.4049 (+0.0697)         | 0.9677 (+0.0990)                | 0.7196 (+0.1450)           |
| 0.3750  | 105030     | 0.5390        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.4000  | 112032     | 0.5311        | 0.3273          | 0.7130 (+0.1726)         | 0.4694 (+0.1444)          | 0.7990 (+0.2984)     | 0.6438 (+0.2064)          | 0.5836 (-0.1102)            | 0.7971 (+0.0872)         | 0.9530 (+0.1253)          | 0.7557 (+0.2668)         | 0.9528 (+0.1434)       | 0.7634 (+0.1490)         | 0.5795 (+0.2617)              | 0.3944 (+0.0592)         | 0.9681 (+0.0994)                | 0.7210 (+0.1464)           |
| 0.4250  | 119034     | 0.5240        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.4500  | 126036     | 0.5167        | 0.3326          | 0.7020 (+0.1616)         | 0.4574 (+0.1324)          | 0.8008 (+0.3002)     | 0.6433 (+0.2059)          | 0.5939 (-0.0999)            | 0.7906 (+0.0807)         | 0.9541 (+0.1264)          | 0.7691 (+0.2803)         | 0.9556 (+0.1462)       | 0.7631 (+0.1487)         | 0.5739 (+0.2562)              | 0.3995 (+0.0644)         | 0.9681 (+0.0995)                | 0.7209 (+0.1463)           |
| 0.4750  | 133038     | 0.5111        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| **0.5** | **140040** | **0.5055**    | **0.3117**      | **0.7017 (+0.1612)**     | **0.4598 (+0.1347)**      | **0.8083 (+0.3077)** | **0.6490 (+0.2116)**      | **0.5931 (-0.1007)**        | **0.7948 (+0.0849)**     | **0.9508 (+0.1231)**      | **0.7788 (+0.2899)**     | **0.9532 (+0.1438)**   | **0.7697 (+0.1554)**     | **0.5750 (+0.2572)**          | **0.4012 (+0.0661)**     | **0.9725 (+0.1038)**            | **0.7237 (+0.1491)**       |
| 0.5250  | 147042     | 0.5014        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.5500  | 154044     | 0.4959        | 0.3148          | 0.7077 (+0.1673)         | 0.4558 (+0.1307)          | 0.8064 (+0.3058)     | 0.6637 (+0.2263)          | 0.5897 (-0.1042)            | 0.7815 (+0.0716)         | 0.9502 (+0.1225)          | 0.7543 (+0.2655)         | 0.9538 (+0.1444)       | 0.7640 (+0.1496)         | 0.5730 (+0.2552)              | 0.4001 (+0.0649)         | 0.9701 (+0.1014)                | 0.7208 (+0.1462)           |
| 0.5750  | 161046     | 0.4909        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.6000  | 168048     | 0.4868        | 0.3049          | 0.6990 (+0.1586)         | 0.4731 (+0.1480)          | 0.8101 (+0.3094)     | 0.6543 (+0.2169)          | 0.5765 (-0.1174)            | 0.7919 (+0.0820)         | 0.9529 (+0.1252)          | 0.7612 (+0.2723)         | 0.9617 (+0.1523)       | 0.7592 (+0.1449)         | 0.5760 (+0.2582)              | 0.3966 (+0.0615)         | 0.9675 (+0.0988)                | 0.7215 (+0.1470)           |
| 0.6250  | 175050     | 0.4833        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.6500  | 182052     | 0.4803        | 0.3067          | 0.7067 (+0.1663)         | 0.4568 (+0.1317)          | 0.8063 (+0.3057)     | 0.6528 (+0.2154)          | 0.5771 (-0.1167)            | 0.7817 (+0.0718)         | 0.9529 (+0.1252)          | 0.7536 (+0.2647)         | 0.9638 (+0.1544)       | 0.7658 (+0.1514)         | 0.5662 (+0.2485)              | 0.4023 (+0.0671)         | 0.9671 (+0.0984)                | 0.7195 (+0.1449)           |
| 0.6750  | 189054     | 0.4767        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.7000  | 196056     | 0.4732        | 0.3055          | 0.7035 (+0.1631)         | 0.4548 (+0.1297)          | 0.8020 (+0.3013)     | 0.6625 (+0.2251)          | 0.5833 (-0.1105)            | 0.7948 (+0.0849)         | 0.9529 (+0.1252)          | 0.7657 (+0.2769)         | 0.9615 (+0.1521)       | 0.7591 (+0.1448)         | 0.5742 (+0.2565)              | 0.3979 (+0.0627)         | 0.9685 (+0.0998)                | 0.7216 (+0.1471)           |
| 0.7250  | 203058     | 0.4705        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.7500  | 210060     | 0.4685        | 0.2933          | 0.7026 (+0.1622)         | 0.4598 (+0.1347)          | 0.8094 (+0.3087)     | 0.6538 (+0.2164)          | 0.5804 (-0.1134)            | 0.7842 (+0.0743)         | 0.9537 (+0.1260)          | 0.7699 (+0.2811)         | 0.9517 (+0.1423)       | 0.7605 (+0.1461)         | 0.5749 (+0.2572)              | 0.3976 (+0.0625)         | 0.9680 (+0.0993)                | 0.7205 (+0.1460)           |
| 0.7750  | 217062     | 0.4658        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.8000  | 224064     | 0.4634        | 0.2923          | 0.7094 (+0.1690)         | 0.4556 (+0.1306)          | 0.7980 (+0.2973)     | 0.6504 (+0.2130)          | 0.5777 (-0.1161)            | 0.7848 (+0.0748)         | 0.9515 (+0.1237)          | 0.7705 (+0.2817)         | 0.9554 (+0.1460)       | 0.7601 (+0.1457)         | 0.5729 (+0.2552)              | 0.3969 (+0.0618)         | 0.9676 (+0.0989)                | 0.7193 (+0.1447)           |
| 0.8250  | 231066     | 0.4605        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.8500  | 238068     | 0.4585        | 0.2897          | 0.6979 (+0.1575)         | 0.4451 (+0.1200)          | 0.7996 (+0.2990)     | 0.6579 (+0.2205)          | 0.5838 (-0.1100)            | 0.7781 (+0.0682)         | 0.9515 (+0.1237)          | 0.7659 (+0.2771)         | 0.9627 (+0.1533)       | 0.7652 (+0.1509)         | 0.5805 (+0.2628)              | 0.3988 (+0.0637)         | 0.9671 (+0.0985)                | 0.7196 (+0.1450)           |
| 0.8750  | 245070     | 0.4572        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.9000  | 252072     | 0.4551        | 0.2895          | 0.6991 (+0.1587)         | 0.4488 (+0.1237)          | 0.8066 (+0.3060)     | 0.6568 (+0.2194)          | 0.5910 (-0.1029)            | 0.7835 (+0.0736)         | 0.9537 (+0.1260)          | 0.7627 (+0.2739)         | 0.9536 (+0.1442)       | 0.7642 (+0.1499)         | 0.5734 (+0.2556)              | 0.3988 (+0.0637)         | 0.9665 (+0.0978)                | 0.7199 (+0.1454)           |
| 0.9250  | 259074     | 0.4540        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 0.9501  | 266076     | 0.4529        | 0.2875          | 0.6966 (+0.1562)         | 0.4572 (+0.1322)          | 0.7954 (+0.2948)     | 0.6609 (+0.2235)          | 0.5844 (-0.1094)            | 0.7815 (+0.0716)         | 0.9537 (+0.1260)          | 0.7686 (+0.2798)         | 0.9581 (+0.1487)       | 0.7646 (+0.1503)         | 0.5806 (+0.2629)              | 0.3996 (+0.0644)         | 0.9669 (+0.0982)                | 0.7206 (+0.1461)           |
| 0.9751  | 273078     | 0.4526        | -               | -                        | -                         | -                    | -                         | -                           | -                        | -                         | -                        | -                      | -                        | -                             | -                        | -                               | -                          |
| 1.0     | 280065     | -             | 0.2879          | 0.6978 (+0.1574)         | 0.4485 (+0.1235)          | 0.7980 (+0.2974)     | 0.6605 (+0.2231)          | 0.5840 (-0.1098)            | 0.7775 (+0.0676)         | 0.9515 (+0.1237)          | 0.7637 (+0.2749)         | 0.9607 (+0.1513)       | 0.7631 (+0.1487)         | 0.5740 (+0.2563)              | 0.3991 (+0.0639)         | 0.9668 (+0.0981)                | 0.7189 (+0.1443)           |

* The bold row denotes the saved checkpoint.

### Training Time
- **Training**: 20.0 hours
- **Evaluation**: 46.6 minutes
- **Total**: 20.7 hours

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