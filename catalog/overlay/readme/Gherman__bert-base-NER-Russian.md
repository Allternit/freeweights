# Russian Named Entity Recognition Model

## Model description

This model is a fine-tuned version of `bert-base-multilingual-cased` for Named Entity Recognition (NER) in Russian text. It can identify various entity types such as person first names, middle names, last names, cities, districts, etc using the BIOLU tagging format.

## Intended uses & limitations

The model is designed to identify named entities in Russian text. It can be used for tasks such as information extraction, content analysis, and text preprocessing for downstream NLP tasks.

### How to use

Here's a simple example of how to use the model:

```python
from transformers import pipeline

ner_pipe = pipeline("ner", model="Gherman/bert-base-NER-Russian")

text = "Меня зовут Сергей Иванович из Москвы."
results = ner_pipe(text)

for result in results:
    print(f"Word: {result['word']}, Entity: {result['entity']}, Score: {result['score']:.4f}")
```

### Limitations and bias

- The model's performance may vary depending on the domain and style of the input text.
- It may struggle with rare or complex entity names not seen during training.
- The model might exhibit biases present in the training data.

## Training data

The model was trained on [Detailed-NER-Dataset-RU by AlexKly](https://github.com/AlexKly/Detailed-NER-Dataset-RU). Check it out, the dataset is pretty good!

### Label Information

The dataset is labeled using the BIOLU format, where:

- B: Beginning token of an entity
- I: Inner token of an entity
- O: Other (non-entity) token
- L: Last token of an entity
- U: Unit token (single-token entity)

The following entity types are included in the dataset:

Location (LOC) tags:
- COUNTRY
- REGION
- CITY
- DISTRICT
- STREET
- HOUSE

Person (PER) tags:
- LAST_NAME
- FIRST_NAME
- MIDDLE_NAME

For example, a full tag might look like "B-CITY" for the beginning token of a city name, or "U-COUNTRY" for a single-token country name.

## Training procedure

The model was fine-tuned from the `bert-base-multilingual-cased` checkpoint using the Hugging Face Transformers library.

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 2e-5
- train_batch_size: 16
- eval_batch_size: 16
- seed: 42
- optimizer: Adam with weight decay fix
- lr_scheduler_type: linear
- num_epochs: 10

### Framework versions

- Transformers 4.28.1
- Pytorch 1.13.0
- Datasets 2.12.0
- Tokenizers 0.13.3

## Evaluation results

The model achieves the following results on the evaluation set:

- Precision: 0.987843
- Recall: 0.988498
- F1 Score: 0.988170

## Ethical considerations

This model is intended for use in analyzing Russian text and should be used responsibly. Users should be aware of potential biases in the model's predictions and use the results judiciously, especially in applications that may impact individuals or groups.
