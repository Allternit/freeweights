<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->




# deberta-med-ner-2

This model is a fine-tuned version of [DeBERTa](https://huggingface.co/microsoft/deberta-v3-base) on the PubMED Dataset.

## Model description

Medical NER Model finetuned on BERT to recognize 41 Medical entities.



### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 2e-05
- train_batch_size: 8
- eval_batch_size: 16
- seed: 42
- gradient_accumulation_steps: 2
- total_train_batch_size: 16
- optimizer: Adam with betas=(0.9,0.999) and epsilon=1e-08
- lr_scheduler_type: cosine
- lr_scheduler_warmup_ratio: 0.1
- num_epochs: 30
- mixed_precision_training: Native AMP



## Usage
The easiest way is to load the inference api from huggingface and second method is through the pipeline object offered by transformers library.
```python
# Use a pipeline as a high-level helper
from transformers import pipeline
pipe = pipeline("token-classification", model="Clinical-AI-Apollo/Medical-NER", aggregation_strategy='simple')
result = pipe('45 year old woman diagnosed with CAD')



# Load model directly
from transformers import AutoTokenizer, AutoModelForTokenClassification

tokenizer = AutoTokenizer.from_pretrained("Clinical-AI-Apollo/Medical-NER")
model = AutoModelForTokenClassification.from_pretrained("Clinical-AI-Apollo/Medical-NER")
```

### Author

Author: [Saketh Mattupalli](https://huggingface.co/blaze999)

### Framework versions

- Transformers 4.37.0
- Pytorch 2.1.2
- Datasets 2.1.0
- Tokenizers 0.15.1