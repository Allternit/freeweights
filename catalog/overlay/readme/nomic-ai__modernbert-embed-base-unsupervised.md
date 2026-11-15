# ModernBERT-Embed-Unsupervised

`modernbert-embed-unsupervised` is the unsupervised checkpoint trained with the [contrastors](https://github.com/nomic-ai/contrastors) library 
for 1 epoch over the 235M weakly-supervised contrastive pairs curated in [Nomic Embed](https://arxiv.org/abs/2402.01613).

We suggest using [moderbert-embed](https://huggingface.co/nomic-ai/modernbert-embed) for embedding tasks.

## Performance

The modernbert-unsupervised model performs similarly to the `nomic-embed-text-v1_unsup` model

| Model | Average (56) | Classification (12) | Clustering (11) | Pair Classification (3) | Reranking (4) | Retrieval (15) | STS (10) | Overall |
|-------|--------------|--------------------:|-----------------|------------------------|---------------|----------------|-----------|----------|
| nomic-embed-text-v1_unsup | 59.9 | 71.2 | 42.5 | 83.7 | 55.0 | 48.0 | 80.8 | 30.7 |
| modernbert-embed-unsupervised | 60.03 | 72.11 | 44.34 | 82.78 | 55.0 | 47.05 | 80.33 | 31.2 |

