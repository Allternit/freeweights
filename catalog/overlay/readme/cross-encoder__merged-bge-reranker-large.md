# merged-bge-reranker-large

This is a [Cross Encoder](https://www.sbert.net/docs/cross_encoder/usage/usage.html) model created by a 50/50 linear merge of [BGE-reranker-large](https://huggingface.co/BAAI/bge-reranker-large) and [BGE-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3), using the [`CrossEncoder.merge`](https://www.sbert.net/docs/package_reference/cross_encoder/model.html#sentence_transformers.cross_encoder.model.CrossEncoder.merge) method from the [sentence-transformers](https://www.SBERT.net) library. It jointly encodes a query and document into a relevance score and can be used to rerank search results. Higher raw logits indicate greater relevance.

The merged model scores above the average of its two parents on **7 of the 11 NanoBEIR datasets**, including **2 where it beats both**. It achieves a mean nDCG@10 of **0.6981**, compared with **0.6705** for BGE-reranker-large and **0.6929** for BGE-reranker-v2-m3, using the same inference settings for all three models.

On the seven datasets evaluated after candidate selection, the merge scores **0.6919**, compared with **0.6911** for BGE-reranker-large and **0.6876** for M3. This additional-seven gain is small. Its paired query bootstrap intervals against both parents include zero.

See [Model Creation](#model-creation) for the full generation script.

## Model Details

### Model Description

- **Model Type:** Cross Encoder
- **Base models:** [BGE-reranker-large](https://huggingface.co/BAAI/bge-reranker-large) and [BGE-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- **Maximum Sequence Length:** 512 tokens per query-document pair
- **Output Dimensionality:** 1 score
- **Scoring Function:** Relevance Logit
- **Supported Modality:** Text
- **Language:** English
- **License:** Apache-2.0. The BGE-reranker-large parent is MIT-licensed and BGE-reranker-v2-m3 is Apache-2.0-licensed.

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Documentation:** [Cross Encoder Documentation](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Parent model:** [BGE-reranker-large](https://huggingface.co/BAAI/bge-reranker-large)
- **Parent model:** [BGE-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)

### Full Model Architecture

```
CrossEncoder(
  (0): Transformer({'transformer_task': 'sequence-classification', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'logits'}}, 'module_output_name': 'scores', 'architecture': 'XLMRobertaForSequenceClassification'})
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

model = CrossEncoder("cross-encoder/merged-bge-reranker-large")
queries = ['Which planet is known as the Red Planet?']
documents = [
    "Venus is often called Earth's twin because of its similar size and proximity.",
    'Mars, known for its reddish appearance, is often referred to as the Red Planet.',
    'Saturn, famous for its rings, is sometimes mistaken for the Red Planet.',
]
scores = model.predict([(queries[0], document) for document in documents])
print(scores)
# [-0.08445622  3.0177891   1.9747379 ]
```

## Evaluation

### Metrics

#### NanoBEIR

* Dataset: [NanoBEIR-en](https://huggingface.co/datasets/sentence-transformers/NanoBEIR-en)
* Evaluated with the standard 11-dataset `CrossEncoderNanoBEIREvaluator` protocol. ArguAna and Touche2020 are excluded.
* Reranked frozen BM25 top-100 candidates plus all positive documents. This protocol has a maximum possible nDCG@10 of 1.0.
* Maximum joint query-document length: 512 tokens. FP32 inference with SDPA attention and raw logits.
* Metric: nDCG@10. The mean is unweighted across datasets.

The parent models were evaluated with the same prompts and length limits.

| Dataset | merged-bge-reranker-large | BGE-reranker-large | BGE-reranker-v2-m3 |
| --- | --- | --- | --- |
| msmarco | 0.702798 | <u>0.708274</u> | 0.686683 |
| nq | 0.775433 | 0.517611 | <u>0.780807</u> |
| fiqa2018 | 0.577971 | 0.512348 | <u>0.586117</u> |
| nfcorpus | 0.388690 | <u>0.425460</u> | 0.387621 |
| scidocs | <u>0.415029</u> | 0.381989 | 0.391821 |
| dbpedia | <u>0.743545</u> | 0.712892 | 0.711882 |
| quoraretrieval | 0.932649 | 0.869035 | <u>0.975003</u> |
| climatefever | 0.453822 | <u>0.523998</u> | 0.434706 |
| fever | 0.942481 | <u>0.956722</u> | 0.944993 |
| hotpotqa | 0.967206 | <u>0.967804</u> | 0.967523 |
| scifact | 0.779089 | <u>0.799382</u> | 0.754452 |
| **mean** | **<u>0.698065</u>** | **0.670501** | **0.692874** |

## Model Creation

The complete XLM-RoBERTa backbone and classification head were merged in fp32 with equal weights, without any additional training. M3's position embedding table and matching buffers were first cropped from 8194 to 514 rows, covering the 512-token joint input limit. This crop preserves M3's logits at that input limit. The source M3 model supports 8192-token inputs. Both parents were evaluated at the same 512-token limit as the merge.

This is all it took:

```python
# pip install "sentence-transformers[merge]"
import torch
from sentence_transformers import CrossEncoder

large = CrossEncoder("BAAI/bge-reranker-large")
m3 = CrossEncoder("BAAI/bge-reranker-v2-m3")
large.max_seq_length = m3.max_seq_length = 512
embeddings = m3.model.roberta.embeddings
embeddings.position_embeddings = torch.nn.Embedding.from_pretrained(
    embeddings.position_embeddings.weight[:514].clone(), freeze=False, padding_idx=1,
)
for name in ("position_ids", "token_type_ids"):
    setattr(embeddings, name, getattr(embeddings, name)[:, :514].clone())
m3.config.max_position_embeddings = 514
model = CrossEncoder.merge([large, m3], method="linear", parameters={"weight": [0.5, 0.5]}, dtype="float32")
model.activation_fn = torch.nn.Identity()
model.save_pretrained("merged-bge-reranker-large")
```

### Framework Versions

- Python: 3.12.3
- Sentence Transformers: 6.2.0
- Transformers: 5.4.0
- PyTorch: 2.11.0+cu128
- Mergekit: 0.1.5
- Datasets: 4.8.5
- Tokenizers: 0.22.2

## Citation

### BibTeX

```bibtex
@misc{li2023making,
      title={Making Large Language Models A Better Foundation For Dense Retrieval}, 
      author={Chaofan Li and Zheng Liu and Shitao Xiao and Yingxia Shao},
      year={2023},
      eprint={2312.15503},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
@misc{chen2024bge,
      title={BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation}, 
      author={Jianlv Chen and Shitao Xiao and Peitian Zhang and Kun Luo and Defu Lian and Zheng Liu},
      year={2024},
      eprint={2402.03216},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

### Mergekit

```bibtex
@inproceedings{goddard-etal-2024-arcees,
    title = "Arcee{'}s {M}erge{K}it: A Toolkit for Merging Large Language Models",
    author = "Goddard, Charles and Siriwardhana, Shamane and Ehghaghi, Malikeh and Meyers, Luke and Karpukhin, Vladimir and Benedict, Brian and McQuade, Mark and Solawetz, Jacob",
    editor = "Dernoncourt, Franck and Preo{\c{t}}iuc-Pietro, Daniel and Shimorina, Anastasia",
    booktitle = "Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing: Industry Track",
    month = nov,
    year = "2024",
    address = "Miami, Florida, US",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2024.emnlp-industry.36",
    doi = "10.18653/v1/2024.emnlp-industry.36",
    pages = "477--485",
}
```
