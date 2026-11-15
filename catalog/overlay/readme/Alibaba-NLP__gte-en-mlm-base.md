## gte-en-mlm-base


We introduce `GTE-v1.5` series, new generalized text encoder, embedding and reranking models that the context length of up to 8192.
The models are built upon the transformer++ encoder backbone (BERT + RoPE + GLU, code refer to [`Alibaba-NLP/new-impl`](https://huggingface.co/Alibaba-NLP/new-impl))
as well as the vocabulary of `bert-base-uncased`.

This text encoder is the `GTEv1.5-en-MLM-base-8192` in table 13 of our [paper](https://arxiv.org/pdf/2407.19669).

- **Developed by**: Institute for Intelligent Computing, Alibaba Group
- **Model type**: Text Encoder
- **Paper**: [mGTE: Generalized Long-Context Text Representation and Reranking
Models for Multilingual Text Retrieval](https://arxiv.org/pdf/2407.19669).

### Model list
| Models | Language | Model Size | Max Seq. Length | GLUE | XTREME-R |
|:-----: | :-----: |:-----: |:-----: |:-----: | :-----: |
|[`gte-multilingual-mlm-base`](https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base)| Multiple | 306M | 8192 | 83.47 | 64.44 |
|[`gte-en-mlm-base`](https://huggingface.co/Alibaba-NLP/gte-en-mlm-base) | English | - | 8192 | 85.61 | - |
|[`gte-en-mlm-large`](https://huggingface.co/Alibaba-NLP/gte-en-mlm-large) | English | - | 8192 | 87.58| - |


## Training Details

### Training Data

- Masked language modeling (MLM): `c4-en`

### Training Procedure 

To enable the backbone model to support a context length of 8192, we adopted a multi-stage training strategy.
The model first undergoes preliminary MLM pre-training on shorter lengths.
And then, we resample the data, reducing the proportion of short texts, and continue the MLM pre-training.

The entire training process is as follows:
- MLM-2048: lr 5e-4, mlm_probability 0.3, batch_size 4096, num_steps 70000, rope_base 10000
- MLM-8192: lr 5e-5, mlm_probability 0.3, batch_size 1024, num_steps 20000, rope_base 500000



## Evaluation

| Models | Language | Model Size | Max Seq. Length | GLUE | XTREME-R |
|:-----: | :-----: |:-----: |:-----: |:-----: | :-----: |
|**[`gte-multilingual-mlm-base`](https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base)**| Multiple | 306M | 8192 | 83.47 | 64.44 |
|**[`gte-en-mlm-base`](https://huggingface.co/Alibaba-NLP/gte-en-mlm-base)** | English | 137M | 8192 | 85.61 | - |
|**[`gte-en-mlm-large`](https://huggingface.co/Alibaba-NLP/gte-en-mlm-large)** | English | 435M | 8192 | 87.58| - |
|[`MosaicBERT-base`](https://huggingface.co/mosaicml/mosaic-bert-base)| English|  137M | 128 | 85.4 | - |
|[`MosaicBERT-base-2048`](https://huggingface.co/mosaicml/mosaic-bert-base-seqlen-2048)| English|  137M | 2048 | 85 | - |
|`JinaBERT-base`| English|  137M | 512 | 85 | - |
|[`nomic-bert-2048`](https://huggingface.co/nomic-ai/nomic-bert-2048)| English|  137M | 2048 | 84 | - |
|`MosaicBERT-large`| English | 434M | 128 | 86.1 | - |
|`JinaBERT-large`| English | 434M | 512 | 83.7 | - |
|[`XLM-R-base`](https://huggingface.co/FacebookAI/xlm-roberta-base) | Multiple |  279M | 512 | 80.44 | 62.02 |
|[`RoBERTa-base`](https://huggingface.co/FacebookAI/roberta-base)| English | 125M | 512 | 86.4 | - |
|[`RoBERTa-large`](https://huggingface.co/FacebookAI/roberta-large)| English | 355M | 512 | 88.9 | - |


## Citation

If you find our paper or models helpful, please consider citing them as follows:

```
@misc{zhang2024mgte,
  title={mGTE: Generalized Long-Context Text Representation and Reranking Models for Multilingual Text Retrieval}, 
  author={Xin Zhang and Yanzhao Zhang and Dingkun Long and Wen Xie and Ziqi Dai and Jialong Tang and Huan Lin and Baosong Yang and Pengjun Xie and Fei Huang and Meishan Zhang and Wenjie Li and Min Zhang},
  year={2024},
  eprint={2407.19669},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2407.19669}, 
}
```