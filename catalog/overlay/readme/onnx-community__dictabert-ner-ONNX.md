# DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew

State-of-the-art language model for Hebrew, released [here](https://arxiv.org/abs/2308.16687).

This is the fine-tuned BERT-base model for the named-entity-recognition task.

For the bert-base models for other tasks, see [here](https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b).

Sample usage:

```python
from transformers import pipeline
oracle = pipeline('ner', model='dicta-il/dictabert-ner', aggregation_strategy='simple')
# if we set aggregation_strategy to simple, we need to define a decoder for the tokenizer. Note that the last wordpiece of a group will still be emitted
from tokenizers.decoders import WordPiece
oracle.tokenizer.backend_tokenizer.decoder = WordPiece()
sentence = '''דוד בן-גוריון (16 באוקטובר 1886 - ו' בכסלו תשל"ד) היה מדינאי ישראלי וראש הממשלה הראשון של מדינת ישראל.'''
oracle(sentence)
```

Output:
```json
[
  {
    "entity_group": "PER",
    "score": 0.9999443,
    "word": "דוד בן - גוריון",
    "start": 0,
    "end": 13
  },
  {
    "entity_group": "TIMEX",
    "score": 0.99987966,
    "word": "16 באוקטובר 1886",
    "start": 15,
    "end": 31
  },
  {
    "entity_group": "TIMEX",
    "score": 0.9998579,
    "word": "ו' בכסלו תשל\"ד",
    "start": 34,
    "end": 48
  },
  {
    "entity_group": "TTL",
    "score": 0.99963045,
    "word": "וראש הממשלה",
    "start": 68,
    "end": 79
  },
  {
    "entity_group": "GPE",
    "score": 0.9997943,
    "word": "ישראל",
    "start": 96,
    "end": 101
  }
]
```

## Citation

If you use DictaBERT in your research, please cite ```DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew```

**BibTeX:**

```bibtex
@misc{shmidman2023dictabert,
      title={DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew}, 
      author={Shaltiel Shmidman and Avi Shmidman and Moshe Koppel},
      year={2023},
      eprint={2308.16687},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

## License

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg


