# Matroyshka Re-Ranker

**More details please refer to our Github: [FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding/tree/master/research/Matroyshka_reranker).**

Matroyshka Re-Ranker ([paper](https://dl.acm.org/doi/abs/10.1145/3696410.3714620))

## Usage

```
git clone https://github.com/FlagOpen/FlagEmbedding.git
cd ./FlagEmbedding/research/Matroyshka_reranker
```

```python
from rank_model import MatroyshkaReranker

compress_ratio = 2 # config your compress ratio
compress_layers = [8, 16] # cofig your layers to compress
cutoff_layers = [20, 24] # config your layers to output

reranker = MatroyshkaReranker(
    model_name_or_path='BAAI/Matroyshka-ReRanker-passage',
    peft_path=[
        './models/Matroyshka-ReRanker-passage/compensate/layer/full'
    ]
    use_fp16=True,
    cache_dir='./model_cache',
    compress_ratio=compress_ratio,
    compress_layers=compress_layers,
    cutoff_layers=cutoff_layers
)

score = reranker.compute_score(['query', 'passage'])
print(score)

scores = reranker.compute_score([['what is panda?', 'hi'], ['what is panda?', 'The giant panda (Ailuropoda melanoleuca), sometimes called a panda bear or simply panda, is a bear species endemic to China.']])
print(scores)
```

## Citation

If you find this repository useful, please consider giving a star and citation

```bibtex
@inproceedings{liu2025fitting,
  title={Fitting Into Any Shape: A Flexible LLM-Based Re-Ranker With Configurable Depth and Width},
  author={Liu, Zheng and Li, Chaofan and Xiao, Shitao and Li, Chaozhuo and Zhang, Chen Jason and Liao, Hao and Lian, Defu and Shao, Yingxia},
  booktitle={Proceedings of the ACM on Web Conference 2025},
  pages={3942--3951},
  year={2025}
}
```