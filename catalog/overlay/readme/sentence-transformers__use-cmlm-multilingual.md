# use-cmlm-multilingual
This is a pytorch version of the [universal-sentence-encoder-cmlm/multilingual-base-br](https://tfhub.dev/google/universal-sentence-encoder-cmlm/multilingual-base-br/1) model. It can be used to map 109 languages to a shared vector space. As the model is based [LaBSE](https://huggingface.co/sentence-transformers/LaBSE), it perform quite comparable on downstream tasks.


## Usage (Sentence-Transformers)

Using this model becomes easy when you have [sentence-transformers](https://www.SBERT.net) installed:

```
pip install -U sentence-transformers
```

Then you can use the model like this:

```python
from sentence_transformers import SentenceTransformer
sentences = ["This is an example sentence", "Each sentence is converted"]

model = SentenceTransformer('sentence-transformers/use-cmlm-multilingual')
embeddings = model.encode(sentences)
print(embeddings)
```



## Full Model Architecture
```
SentenceTransformer(
  (0): Transformer({'max_seq_length': 256, 'do_lower_case': False}) with Transformer model: BertModel 
  (1): Pooling({'word_embedding_dimension': 768, 'pooling_mode_cls_token': False, 'pooling_mode_mean_tokens': True, 'pooling_mode_max_tokens': False, 'pooling_mode_mean_sqrt_len_tokens': False})
  (2): Normalize()
)
```

## Citing & Authors

Have a look at [universal-sentence-encoder-cmlm/multilingual-base-br](https://tfhub.dev/google/universal-sentence-encoder-cmlm/multilingual-base-br/1) for the respective publication that describes this model.

