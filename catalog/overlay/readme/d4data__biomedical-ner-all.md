## About the Model
An English Named Entity Recognition model, trained on Maccrobat to recognize the bio-medical entities (107 entities) from a given text corpus (case reports etc.). This model was built on top of distilbert-base-uncased

- Dataset: Maccrobat https://figshare.com/articles/dataset/MACCROBAT2018/9764942
- Carbon emission: 0.0279399890043426 Kg
- Training time: 30.16527 minutes
- GPU used : 1 x GeForce RTX 3060 Laptop GPU

Checkout the tutorial video for explanation of this model and corresponding python library: https://youtu.be/xpiDPdBpS18

## Usage
The easiest way is to load the inference api from huggingface and second method is through the pipeline object offered by transformers library.
```python
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForTokenClassification

tokenizer = AutoTokenizer.from_pretrained("d4data/biomedical-ner-all")
model = AutoModelForTokenClassification.from_pretrained("d4data/biomedical-ner-all")

pipe = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple") # pass device=0 if using gpu
pipe("""The patient reported no recurrence of palpitations at follow-up 6 months after the ablation.""")
```

## Author
This model is part of the Research topic "AI in Biomedical field" conducted by Deepak John Reji, Shaina Raza. If you use this work (code, model or dataset), please star at:
> https://github.com/dreji18/Bio-Epidemiology-NER

## You can support me here :)
<a href="https://www.buymeacoffee.com/deepakjohnreji" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>