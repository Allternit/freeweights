## Multilingual Toxicity Classifier for 15 Languages (2025)

This is an instance of [bert-base-multilingual-cased](https://huggingface.co/google-bert/bert-base-multilingual-cased) that was fine-tuned on binary toxicity classification task based on our updated (2025) dataset [textdetox/multilingual_toxicity_dataset](https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset).

Now, the models covers 15 languages from various language families:

| Language  | Code | F1 Score |
|-----------|------|---------|
| English   | en   | 0.9035  |
| Russian   | ru   | 0.9224  |
| Ukrainian | uk   | 0.9461  |
| German    | de   | 0.5181  |
| Spanish   | es   | 0.7291  |
| Arabic    | ar   | 0.5139  |
| Amharic   | am   | 0.6316  |
| Hindi     | hi   | 0.7268  |
| Chinese   | zh   | 0.6703  |
| Italian   | it   | 0.6485  |
| French    | fr   | 0.9125  |
| Hinglish  | hin  | 0.6850  |
| Hebrew    | he   | 0.8686  |
| Japanese  | ja   | 0.8644  |
| Tatar     | tt   | 0.6170  |

## How to use

```python
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained('textdetox/bert-multilingual-toxicity-classifier')
model = AutoModelForSequenceClassification.from_pretrained('textdetox/bert-multilingual-toxicity-classifier')

batch = tokenizer.encode("You are amazing!", return_tensors="pt")

output = model(batch)
# idx 0 for neutral, idx 1 for toxic
```

## Citation
The model is prepared for [TextDetox 2025 Shared Task](https://pan.webis.de/clef25/pan25-web/text-detoxification.html) evaluation.

```
@inproceedings{dementieva2025overview,
  title={Overview of the Multilingual Text Detoxification Task at PAN 2025},
  author={Dementieva, Daryna and
      Protasov, Vitaly and
      Babakov, Nikolay and
      Rizwan, Naquee and
      Alimova, Ilseyar and
      Brune, Caroline and
      Konovalov, Vasily and
      Muti, Arianna and
      Liebeskind, Chaya and
      Litvak, Marina and
      Nozza, Debora, and
      Shah Khan, Shehryaar and
      Takeshita, Sotaro and
      Vanetik, Natalia and
      Ayele, Abinew Ali and
      Schneider, Frolian and
      Wang, Xintog and
      Yimam, Seid Muhie and
      Elnagar, Ashraf and
      Mukherjee, Animesh and
      Panchenko, Alexander},
    booktitle={Working Notes of CLEF 2025 -- Conference and Labs of the Evaluation Forum},
    editor={Guglielmo Faggioli and Nicola Ferro and Paolo Rosso and Damiano Spina},
    month =                    sep,
    publisher =                {CEUR-WS.org},
    series =                   {CEUR Workshop Proceedings},
    site =                     {Vienna, Austria},
    url =                      {https://ceur-ws.org/Vol-4038/paper_278.pdf},
    year =                     2025
}
```