<div align="center">
<img src="https://cdn-uploads.huggingface.co/production/uploads/609bbe2f4932693ca2009d6a/kbQOAarw0eaApow3M9HIl.png" alt="LightOn" width="512">

[![Website](https://img.shields.io/badge/LightOn-Website-blue?logo=google-chrome)](https://lighton.ai)
[![LinkedIn](https://img.shields.io/badge/LightOn-LinkedIn-0A66C2?logo=linkedin)](https://www.linkedin.com/company/lighton/)
[![X](https://img.shields.io/badge/@LightOnIO-X-black?logo=x)](https://x.com/LightOnIO)

  📚 [Collection](https://huggingface.co/collections/lightonai/denseon-and-lateon) | 📝 [Blog](https://huggingface.co/blog/lightonai/denseon-lateon)

</div>

<h1 align="center">DenseOn</h1>

<h3 align="center">State-of-the-Art Dense Retrieval Model by LightOn</h3>

<p align="center">
<a href="https://huggingface.co/lightonai/DenseOn">DenseOn</a> |
<a href="https://huggingface.co/lightonai/LateOn">LateOn</a> |
<a href="https://github.com/lightonai/pylate">PyLate</a> |
<a href="https://github.com/lightonai/fast-plaid">FastPLAID</a>
</p>

> 🎯 **TL;DR**: A 149M-parameter dense (single-vector) retrieval model achieving **56.20 nDCG@10 on BEIR**, the first sub-150M dense model to break the 56 mark, **topping all base-size dense models** and outperforming several models **4× larger**. 

## About the LateOn / DenseOn Family

State-of-the-art retrieval is increasingly dominated by closed models, either hidden behind APIs or trained on undisclosed data. This blocks reproducibility, prevents study of possible data leakage, and gatekeeps progress to a handful of private labs. We thus decided to gather and curate a large amount of data and explore various mixtures. We release all the data used in our explorations:
- [Gathered pre-training data](https://huggingface.co/datasets/lightonai/embeddings-pre-training), 1.4B query-documents pairs alongside annotations used for non-destructive filtering (structural filtering, deduplication, cross-encoder pair relevancy)
- [Best pre-training mixture](https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated) found with already applied filters
- [Fine-tuning datasets](https://huggingface.co/datasets/lightonai/embeddings-fine-tuning) with query, positive and 2048 mined documents alongside their scores for 1.88M samples.

Based on our findings, we trained LateOn (multi-vector/ColBERT) and DenseOn (single vector/dense) models on a proprietary Apache 2.0-compatible training dataset and release those models as well.
Both are built on the [ModernBERT](https://huggingface.co/answerdotai/ModernBERT-base) backbone at 149M parameters, a size we believe sits at the sweet spot: large enough to handle real-world queries and documents, small enough to serve at high throughput in latency-sensitive production systems.
For more information, please read our [blogpost](https://huggingface.co/blog/lightonai/denseon-lateon).

## DenseOn

**DenseOn** is a dense (single-vector) retrieval model built on ModernBERT (149M parameters), trained by [LightOn](https://lighton.ai). It encodes queries and documents independently using cosine similarity with `query:`/`document:` prefixes and CLS pooling.

DenseOn achieves **56.75** average NDCG@10 on BEIR (15 datasets) and **57.71** on decontaminated BEIR (12 datasets), topping all base-size dense models and outperforming models up to 4x larger. 
Notably it:
- **Tops all base-size dense models on BEIR**, ahead of GTE-ModernBERT (55.19) and on par with much larger Snowflake Arctic Embed L v2 (55.22, 568M) and Qwen3-Embedding-0.6B (55.52).
- **Holds up under decontamination**: when training-overlap samples are stripped from the BEIR corpora, DenseOn improves to **57.71 nDCG@10** on the 12-dataset decontaminated split.

Alongside DenseOn, we also trained [LateOn](https://huggingface.co/lightonai/LateOn), a late-interaction variant trained using the same setup. It achieves stronger BEIR results shares the usual benefits of late interaction models (better generalization, long context capabilities, ...). For more information about late interaction models, you can check our previous work on the matter such as [ColBERT-Zero](https://huggingface.co/lightonai/ColBERT-Zero) and give [Pylate](https://lightonai.github.io/pylate/) a shot (the best entry point in the late interaction ecosystem developped at LightOn).

See our [blog post](https://huggingface.co/blog/lightonai/denseon-lateon) for full results and analysis.

## Results

### BEIR (15 datasets, NDCG@10)

| Model | Average | Size | Emb dim | ArguAna | CQADupstackRetrieval | ClimateFEVER | DBPedia | FEVER | FiQA2018 | HotpotQA | MSMARCO | NFCorpus | NQ | QuoraRetrieval | SCIDOCS | SciFact | TRECCOVID | Touche2020 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [modernbert-embed-base](https://huggingface.co/nomic-ai/modernbert-embed-base) | 52.89 | 149 | 768 | 48.96 | 42.08 | 35.67 | 41.50 | 87.35 | 40.59 | 67.11 | 41.47 | 33.40 | 62.15 | 88.85 | 18.59 | 69.63 | 84.15 | 31.91 |
| [bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) | 54.34 | 335 | 1024 | 64.52 | 42.23 | 36.57 | 44.11 | 87.18 | 45.02 | 74.10 | 42.49 | 38.06 | 55.03 | 89.07 | 22.63 | 74.64 | 74.70 | 24.81 |
| [gte-modernbert-base](https://huggingface.co/Alibaba-NLP/gte-modernbert-base) | 55.19 | 149 | 768 | **74.56** | 42.64 | **45.90** | 41.39 | **93.98** | 49.54 | 70.39 | 39.93 | 34.32 | 56.10 | 88.57 | 20.44 | **76.41** | 75.75 | 17.97 |
| [snowflake-arctic-embed-l-v2.0](https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0) | 55.22 | 568 | 1024 | 59.11 | 45.88 | 41.82 | 43.40 | 91.54 | 45.35 | 68.15 | **44.86** | 35.08 | **63.67** | 88.75 | 20.28 | 70.90 | 83.63 | 25.89 |
| [jina-embeddings-v5-text-nano](https://huggingface.co/jinaai/jina-embeddings-v5-text-nano) | 56.06 | 239 | 768 | 65.70 | *44.66* | 39.60 | **45.26** | 89.51 | 47.85 | 69.07 | 41.64 | 38.69 | 63.38 | 88.87 | 22.60 | 75.78 | 77.60 | 30.70 |
| [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B) | 55.52 | 600 | 1024 | 70.97 | 46.03 | 42.11 | 39.48 | 88.15 | 46.61 | 65.74 | 37.99 | 36.71 | 53.46 | 87.78 | **24.41** | 69.72 | **90.52** | **33.18** |
| [pplx-embed-v1-0.6b](https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b) | **56.70** | 600 | 1024 | 60.45 | 45.96 | 39.82 | 44.30 | 90.66 | 52.05 | 74.41 | 43.86 | 35.80 | 62.04 | 88.96 | 22.84 | 74.78 | 85.63 | 28.98 |
| [DenseOn-unsupervised](https://huggingface.co/lightonai/DenseOn-unsupervised) | 49.05 | 149 | 768 | 54.94 | 46.28 | 18.20 | 37.39 | 70.68 | 52.34 | 59.77 | 29.30 | 37.92 | 50.62 | 88.98 | 23.05 | 76.35 | 68.12 | 21.87 |
| [DenseOn](https://huggingface.co/lightonai/DenseOn) | 56.20 | 149 | 768 | 54.65 | **46.89** | 37.49 | **44.65** | 90.69 | **53.86** | **74.51** | 43.58 | **39.03** | 59.25 | **89.31** | 22.35 | 75.95 | 82.33 | 28.43 |


DenseOn reaches 56.20 NDCG@10 on BEIR, making it the top base-size dense retriever and the first sub-150M model to clear the 56 bar. At 149M parameters it decisively beats `GTE-ModernBERT` (55.19) at the same size, and more tellingly outperforms `snowflake-arctic-embed-l-v2.0` (55.22, 568M) and `Qwen3-Embedding-0.6B` (55.52, 595M) despite being roughly 4× smaller. DenseOn also stays within half a point of the strongest current-generation dense baselines, `pplx-embed-v1-0.6B` (56.70, 596M) and `jina-embeddings-v5-text-nano` (56.08, 239M), both substantially larger.


### Decontaminated BEIR (12 datasets, NDCG@10)

Standard benchmarks risk overestimating model quality when training data overlaps with evaluation corpora. This is a non-negligible risk in our case, as our mixture explorations are mostly built on BEIR evaluation. To quantify this and ensure that our model has not memorized possible leakage, we built decontaminated versions of the BEIR datasets by removing samples found in both the mGTE training dataset and in our internal training datasets. 
Since many retrieval models draw from similar public sources (Wikipedia, MS MARCO, Common Crawl, academic corpora), we expect significant overlap across models and believe the decontaminated benchmarks provide a meaningful, if imperfect, stress test. The decontaminated datasets are publicly available on HuggingFace.


Despite being in the toughest position (as the decontamination is based on our data), LateOn and DenseOn stay consistent under decontamination. 
LateOn keeps its #1 position and DenseOn stays in the top four (only falling behind our other strong multi-vector model, ColBERT-Zero). Neither model flinches, which is direct evidence of generalization rather than overfitting.

More broadly, ColBERT models seems to generalize better under decontamination: all three ColBERT models hold or improve their ranking, and they take 2 of the top 3 decontaminated positions. Although DenseOn holds strong, some dense models are hit harder, for example `GTE-ModernBERT`, dropping from 8th to last, which is particularly interesting considering our base mixture is derived from theirs. This highlights the strength of our curation methodology. While other models such as `Qwen3-Embedding-0.6B` also drop some ranks, hinting at an overlap with the BEIR evaluation, it is worth noting that newer models, such as the new `jina-embeddings-v5` and `pplx-embed-v1-0.6b` seems to exhibit stronger evidence of generalization rather than overfitting.

<div align="center">
<img src="https://cdn-uploads.huggingface.co/production/uploads/61dd91afdb45389905634d35/9kMmY66jIZsLxrQ6a7v3L.png" alt="LightOn" width="1024">
</div>

## Related Checkpoints

| Model | Stage | Link |
|:---|:---|:---|
| **DenseOn** *(this card)* | Pre-training + fine-tuning | [`lightonai/DenseOn`](https://huggingface.co/lightonai/DenseOn) |
| DenseOn-unsupervised | Pre-training only | [`lightonai/DenseOn-unsupervised`](https://huggingface.co/lightonai/DenseOn-unsupervised) |
| LateOn | Multi-vector counterpart | [`lightonai/LateOn`](https://huggingface.co/lightonai/LateOn) |
| LateOn-unsupervised | Multi-vector, pre-training only | [`lightonai/LateOn-unsupervised`](https://huggingface.co/lightonai/LateOn-unsupervised) |

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [DenseOn-unsupervised](https://huggingface.co/lightonai/DenseOn-unsupervised) (ModernBERT-base)
- **Maximum Sequence Length:** 512 tokens
- **Output Dimensionality:** 768 dimensions
- **Similarity Function:** Cosine Similarity
- **Pooling:** CLS token
- **Prompts:** `query:` for queries, `document:` for documents
- **Language:** English
- **License:** Apache 2.0

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/UKPLab/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'max_seq_length': 512, 'do_lower_case': False, 'architecture': 'ModernBertModel'})
  (1): Pooling({'word_embedding_dimension': 768, 'pooling_mode_cls_token': True, 'pooling_mode_mean_tokens': False, 'pooling_mode_max_tokens': False, 'pooling_mode_mean_sqrt_len_tokens': False, 'pooling_mode_weightedmean_tokens': False, 'pooling_mode_lasttoken': False, 'include_prompt': True})
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
from sentence_transformers import SentenceTransformer

# Download from the Hub
model = SentenceTransformer("lightonai/DenseOn")

# Run inference
queries = [
    "Which planet is known as the Red Planet?",
]
documents = [
    "Venus is often called Earth's twin because of its similar size and proximity.",
    "Mars, known for its reddish appearance, is often referred to as the Red Planet.",
    "Saturn, famous for its rings, is sometimes mistaken for the Red Planet.",
]

query_embeddings = model.encode(queries, prompt_name="query")
document_embeddings = model.encode(documents, prompt_name="document")
print(query_embeddings.shape, document_embeddings.shape)
# [1, 768] [3, 768]

# Get the similarity scores for the embeddings
similarities = model.similarity(query_embeddings, document_embeddings)
print(similarities)
```

## Training Details

### Framework Versions
- Python: 3.11.10
- Sentence Transformers: 5.1.1
- Transformers: 4.57.5
- PyTorch: 2.9.0+cu128
- Accelerate: 1.12.0
- Datasets: 3.6.0
- Tokenizers: 0.22.1

## Citation

### BibTeX

#### DenseOn and LateOn

```bibtex
@misc{sourty2026denseonlateon,
  title={DenseOn with the LateOn: Open State-of-the-Art Single and Multi-Vector Models},
  author={Sourty, Raphael and Chaffin, Antoine and Weller, Orion and Demoura, Paulo and Chatelain, Amelie},
  year={2026},
  howpublished={\url{https://huggingface.co/blog/lightonai/denseon-lateon}},
}
```

#### PyLate

```bibtex
@inproceedings{DBLP:conf/cikm/ChaffinS25,
  author       = {Antoine Chaffin and
                  Rapha{\"{e}}l Sourty},
  editor       = {Meeyoung Cha and
                  Chanyoung Park and
                  Noseong Park and
                  Carl Yang and
                  Senjuti Basu Roy and
                  Jessie Li and
                  Jaap Kamps and
                  Kijung Shin and
                  Bryan Hooi and
                  Lifang He},
  title        = {PyLate: Flexible Training and Retrieval for Late Interaction Models},
  booktitle    = {Proceedings of the 34th {ACM} International Conference on Information
                  and Knowledge Management, {CIKM} 2025, Seoul, Republic of Korea, November
                  10-14, 2025},
  pages        = {6334--6339},
  publisher    = {{ACM}},
  year         = {2025},
  url          = {https://github.com/lightonai/pylate},
  doi          = {10.1145/3746252.3761608},
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
    url = "https://arxiv.org/abs/1908.10084"
}
```

## Acknowledgements

We thank Xin Zhang, Zach Nussbaum, Tom Aarsen, Bo Wang, Eugene Yang, Benjamin Clavié, Nandan Thakur, Oskar Hallström and Iacopo Poli for their valuable contributions and feedback. We are grateful to the teams behind Sentence Transformers and the BEIR benchmark, and to the open-source retrieval community, in particular the authors of Nomic Embed.

This work was granted access to the HPC resources of IDRIS under GENCI allocations AS011016449, A0181016214, and A0171015706 (Jean Zay supercomputer). We also acknowledge the Barcelona Supercomputing Center (BSC-CNS) for providing access to MareNostrum 5 under EuroHPC AI Factory Fast Lane project EHPC-AIF-2025FL01-445.

