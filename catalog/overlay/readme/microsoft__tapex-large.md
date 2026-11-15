# TAPEX (large-sized model) 

TAPEX was proposed in [TAPEX: Table Pre-training via Learning a Neural SQL Executor](https://arxiv.org/abs/2107.07653) by Qian Liu, Bei Chen, Jiaqi Guo, Morteza Ziyadi, Zeqi Lin, Weizhu Chen, Jian-Guang Lou. The original repo can be found [here](https://github.com/microsoft/Table-Pretraining).

## Model description

TAPEX (**Ta**ble **P**re-training via **Ex**ecution) is a conceptually simple and empirically powerful pre-training approach to empower existing models with *table reasoning* skills. TAPEX realizes table pre-training by learning a neural SQL executor over a synthetic corpus, which is obtained by automatically synthesizing executable SQL queries.

TAPEX is based on the BART architecture, the transformer encoder-encoder (seq2seq) model with a bidirectional (BERT-like) encoder and an autoregressive (GPT-like) decoder.

## Intended Uses

⚠️ This model checkpoint is **ONLY** used for fine-tuining on downstream tasks, and you **CANNOT** use this model for simulating neural SQL execution, i.e., employ TAPEX to execute a SQL query on a given table. The one that can neurally execute SQL queries is at [here](https://huggingface.co/microsoft/tapex-large-sql-execution).
> This separation of two models for two kinds of intention is because of a known issue in BART large, and we recommend readers to see [this comment](https://github.com/huggingface/transformers/issues/15559#issuecomment-1062880564) for more details.

### How to Fine-tuning

Please find the fine-tuning script [here](https://github.com/huggingface/transformers/tree/main/examples/research_projects/tapex).

### BibTeX entry and citation info

```bibtex
@inproceedings{
    liu2022tapex,
    title={{TAPEX}: Table Pre-training via Learning a Neural {SQL} Executor},
    author={Qian Liu and Bei Chen and Jiaqi Guo and Morteza Ziyadi and Zeqi Lin and Weizhu Chen and Jian-Guang Lou},
    booktitle={International Conference on Learning Representations},
    year={2022},
    url={https://openreview.net/forum?id=O50443AsCP}
}
```