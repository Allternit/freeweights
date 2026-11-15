# ModernBERT NER (CoNLL2003)

This model is a fine-tuned version of [answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base) on the conll2003 dataset for Named Entity Recognition (NER).

Robust performance on tasks involving the recognition of `Persons`, `Organizations`, and `Locations`.

It achieves the following results on the evaluation set:
- Loss: 0.0992
- Precision: 0.8349
- Recall: 0.8563
- F1: 0.8455
- Accuracy: 0.9752

## Model Details

- **Base Model:** ModernBERT: [https://doi.org/10.48550/arXiv.2412.13663](https://doi.org/10.48550/arXiv.2412.13663).
- **Fine-tuning Dataset:** CoNLL2003: [https://huggingface.co/datasets/eriktks/conll2003](https://huggingface.co/datasets/eriktks/conll2003).
- **Task:** Named Entity Recognition (NER)

## Training Data

The model is fine-tuned on the CoNLL2003 dataset, a well-known benchmark for NER.
This dataset provides a solid foundation for the model to generalize on general English text.

## Example Usage

Below is an example of how to use the model with the Hugging Face Transformers library:

```python
from transformers import pipeline

ner = pipeline(task="token-classification", model="IsmaelMousa/modernbert-ner-conll2003", aggregation_strategy="max")

results = ner("Hi, I'm Ismael Mousa from Palestine working for NVIDIA inc.")

for entity in results:
    for key, value in entity.items():
        if key == "entity_group":
            print(f"{entity['word']} => {entity[key]}")
```

Results:

```
Ismael Mousa => PER
Palestine => LOC
NVIDIA => ORG
```

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 1e-06
- train_batch_size: 8
- eval_batch_size: 8
- seed: 42
- optimizer: Use adamw_torch with betas=(0.9,0.999) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: linear
- num_epochs: 10

### Training results

| Training Loss | Epoch | Step  | Validation Loss | Precision | Recall | F1     | Accuracy |
|:-------------:|:-----:|:-----:|:---------------:|:---------:|:------:|:------:|:--------:|
| 0.2306        | 1.0   | 1756  | 0.2243          | 0.6074    | 0.6483 | 0.6272 | 0.9406   |
| 0.1415        | 2.0   | 3512  | 0.1583          | 0.7258    | 0.7536 | 0.7394 | 0.9583   |
| 0.1143        | 3.0   | 5268  | 0.1335          | 0.7731    | 0.7989 | 0.7858 | 0.9657   |
| 0.0913        | 4.0   | 7024  | 0.1145          | 0.7958    | 0.8256 | 0.8104 | 0.9699   |
| 0.0848        | 5.0   | 8780  | 0.1079          | 0.8120    | 0.8408 | 0.8261 | 0.9720   |
| 0.0728        | 6.0   | 10536 | 0.1036          | 0.8214    | 0.8452 | 0.8331 | 0.9730   |
| 0.0623        | 7.0   | 12292 | 0.1032          | 0.8258    | 0.8487 | 0.8371 | 0.9737   |
| 0.0599        | 8.0   | 14048 | 0.0990          | 0.8289    | 0.8527 | 0.8406 | 0.9745   |
| 0.0558        | 9.0   | 15804 | 0.0998          | 0.8331    | 0.8541 | 0.8434 | 0.9750   |
| 0.0559        | 10.0  | 17560 | 0.0992          | 0.8349    | 0.8563 | 0.8455 | 0.9752   |


### Framework versions

- Transformers 4.48.0.dev0
- Pytorch 2.2.1+cu121
- Datasets 3.2.0
- Tokenizers 0.21.0