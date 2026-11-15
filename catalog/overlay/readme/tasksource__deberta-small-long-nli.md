# Model Card for DeBERTa-v3-small-tasksource-nli


[DeBERTa-v3-small](https://hf.co/microsoft/deberta-v3-small) with context length of 1680 tokens fine-tuned on tasksource for 250k steps. I oversampled long NLI tasks (ConTRoL, doc-nli).
Training data include HelpSteer v1/v2, logical reasoning tasks (FOLIO, FOL-nli, LogicNLI...), OASST, hh/rlhf, linguistics oriented NLI tasks, tasksource-dpo, fact verification tasks.

This model is suitable for long context NLI or as a backbone for reward models or classifiers fine-tuning.

This checkpoint has strong zero-shot validation performance on many tasks (e.g. 70% on WNLI), and can be used for:
- Zero-shot entailment-based classification for arbitrary labels [ZS].
- Natural language inference [NLI]
- Further fine-tuning on a new task or tasksource task (classification, token classification or multiple-choice) [FT].


| test_name                   |        accuracy |
|:----------------------------|----------------:|
| anli/a1                     |            57.2 |
| anli/a2                     |            46.1 |
| anli/a3                     |            47.2 |
| nli_fever                   |            71.7 |
| FOLIO                       |            47.1 |
| ConTRoL-nli                 |            52.2 |
| cladder                     |            52.8 |
| zero-shot-label-nli         |            70.0 |
| chatbot_arena_conversations |            67.8 |
| oasst2_pairwise_rlhf_reward |            75.6 |
| doc-nli                     |            75.0 |


Zero-shot GPT-4 scores 61% on FOLIO (logical reasoning), 62% on cladder (probabilistic reasoning) and 56.4% on ConTRoL (long context NLI).


# [ZS] Zero-shot classification pipeline
```python
from transformers import pipeline
classifier = pipeline("zero-shot-classification",model="tasksource/deberta-small-long-nli")

text = "one day I will see the world"
candidate_labels = ['travel', 'cooking', 'dancing']
classifier(text, candidate_labels)
```
NLI training data of this model includes [label-nli](https://huggingface.co/datasets/tasksource/zero-shot-label-nli), a NLI dataset specially constructed to improve this kind of zero-shot classification.

# [NLI] Natural language inference pipeline

```python
from transformers import pipeline
pipe = pipeline("text-classification",model="tasksource/deberta-small-long-nli")
pipe([dict(text='there is a cat',
  text_pair='there is a black cat')]) #list of (premise,hypothesis)
# [{'label': 'neutral', 'score': 0.9952911138534546}]
```

# [FT] Tasknet: 3 lines fine-tuning

```python
# !pip install tasknet
import tasknet as tn
hparams=dict(model_name='tasksource/deberta-small-long-nli', learning_rate=2e-5)
model, trainer = tn.Model_Trainer([tn.AutoTask("glue/rte")], hparams)
trainer.train()
```


### Software and training details

The model was trained on 600 tasks for 250k steps with a batch size of 384 and a peak learning rate of 2e-5. Training took 14 days on Nvidia A30 24GB gpu.
This is the shared model with the MNLI classifier on top. Each task had a specific CLS embedding, which is dropped 10% of the time to facilitate model use without it. All multiple-choice model used the same classification layers. For classification tasks, models shared weights if their labels matched.


https://github.com/sileod/tasksource/ \
https://github.com/sileod/tasknet/ \
Training code: https://colab.research.google.com/drive/1iB4Oxl9_B5W3ZDzXoWJN-olUbqLBxgQS?usp=sharing

# Citation

More details on this [article:](https://arxiv.org/abs/2301.05948) 
```
@inproceedings{sileo-2024-tasksource,
    title = "tasksource: A Large Collection of {NLP} tasks with a Structured Dataset Preprocessing Framework",
    author = "Sileo, Damien",
    booktitle = "Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024)",
    month = may,
    year = "2024",
    address = "Torino, Italia",
    publisher = "ELRA and ICCL",
    url = "https://aclanthology.org/2024.lrec-main.1361",
    pages = "15655--15684",
}
```


# Model Card Contact

damien.sileo@inria.fr


</details>