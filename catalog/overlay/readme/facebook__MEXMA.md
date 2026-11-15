Current pre-trained cross-lingual sentence encoders approaches use sentence-level objectives only. This can lead to loss of information, especially for tokens, which then degrades the sentence representation. We propose MEXMA, a novel approach that integrates both sentence-level and token-level objectives. The sentence representation in one language is used to predict masked tokens in another language, with both the sentence representation and all tokens directly updating the encoder. We show that adding token-level objectives greatly improves the sentence representation quality across several tasks. Our approach outperforms current pre-trained cross-lingual sentence encoders on bi-text mining as well as several downstream tasks. We also analyse the information encoded in our tokens, and how the sentence representation is built from them.

# Usage
You use this model as you would any other XLM-RoBERTa model, taking into account that the "pooler" has not been trained, so you should use the CLS the encoder outputs directly as your sentence representation:
```
from transformers import AutoTokenizer, XLMRobertaModel

tokenizer = AutoTokenizer.from_pretrained("facebook/MEXMA")
model = XLMRobertaModel.from_pretrained("facebook/MEXMA", add_pooling_layer=False)
example_sentences = ['Sentence1', 'Sentence2']
example_inputs = tokenizer(example_sentences, return_tensors='pt')

outputs = model(**example_inputs)
sentence_representation = outputs.last_hidden_state[:, 0]
print(sentence_representation.shape) # torch.Size([2, 1024])
```

You can also use this model with SentenceTransformers:
```
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("facebook/MEXMA")
example_sentences = ['Sentence1', 'Sentence2']
sentence_representation = model.encode(example_sentences)
print(sentence_representation.shape) # torch.Size([2, 1024])
```

# License
This model is released under the MIT license.

# Training code
For the training code of this model, please check the official [MEXMA repo](https://github.com/facebookresearch/mexma).

# Paper
[MEXMA: Token-level objectives improve sentence representations](https://arxiv.org/abs/2409.12737)

# Citation
If you use this model in your work, please cite:
```
@inproceedings{janeiro-etal-2025-mexma,
    title = "{MEXMA}: Token-level objectives improve sentence representations",
    author = "Janeiro, Jo{\~a}o Maria  and
      Piwowarski, Benjamin  and
      Gallinari, Patrick  and
      Barrault, Loic",
    editor = "Che, Wanxiang  and
      Nabende, Joyce  and
      Shutova, Ekaterina  and
      Pilehvar, Mohammad Taher",
    booktitle = "Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)",
    month = jul,
    year = "2025",
    address = "Vienna, Austria",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2025.acl-long.1168/",
    doi = "10.18653/v1/2025.acl-long.1168",
    pages = "23960--23995",
    ISBN = "979-8-89176-251-0",
    abstract = "Cross-lingual sentence encoders (CLSE) create fixed-size sentence representations with aligned translations. Current pre-trained CLSE approaches use sentence-level objectives only. This can lead to loss of information, especially for tokens, which then degrades the sentence representation. We propose MEXMA, a novel approach that integrates both sentence-level and token-level objectives. The sentence representation in one language is used to predict masked tokens in another language, with both the sentence representation and *all tokens directly update the encoder*. We show that adding token-level objectives greatly improves the sentence representation quality across several tasks. Our approach outperforms current pre-trained cross-lingual sentence encoders on bitext mining as well as several downstream tasks. We also analyse the information encoded in our tokens, and how the sentence representation is built from them."
}
```
