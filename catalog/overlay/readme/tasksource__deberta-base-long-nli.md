# Model Card for Model ID

deberta-v3-base with context length of 1280 fine-tuned on tasksource for 250k steps. I oversampled long NLI tasks (ConTRoL, doc-nli).
Training data include helpsteer v1/v2, logical reasoning tasks (FOLIO, FOL-nli, LogicNLI...), OASST, hh/rlhf, linguistics oriented NLI tasks, tasksource-dpo, fact verification tasks.

This checkpoint has strong zero-shot validation performance on many tasks (e.g. 70% on WNLI), and can be used for:
- Zero-shot entailment-based classification for arbitrary labels [ZS].
- Natural language inference [NLI]
- Further fine-tuning on a new task or tasksource task (classification, token classification, reward modeling or multiple-choice) [FT].

| dataset                   |   accuracy |
|:----------------------------|----------------:|
| anli/a1                     |            63.3 |
| anli/a2                     |            47.2 |
| anli/a3                     |            49.4 |
| nli_fever                   |            79.4 |
| FOLIO                       |            61.8 |
| ConTRoL-nli                 |            63.3 |
| cladder                     |            71.1 |
| zero-shot-label-nli         |            74.4 |
| chatbot_arena_conversations |            72.2 |
| oasst2_pairwise_rlhf_reward |            73.9 |
| doc-nli                     |            90.0 |

Zero-shot GPT-4 scores 61% on FOLIO (logical reasoning), 62% on cladder (probabilistic reasoning) and 56.4% on ConTRoL (long context NLI).

# [ZS] Zero-shot classification pipeline
```python
from transformers import pipeline
classifier = pipeline("zero-shot-classification",model="tasksource/deberta-base-long-nli")

text = "one day I will see the world"
candidate_labels = ['travel', 'cooking', 'dancing']
classifier(text, candidate_labels)
```
NLI training data of this model includes [label-nli](https://huggingface.co/datasets/tasksource/zero-shot-label-nli), a NLI dataset specially constructed to improve this kind of zero-shot classification.

# [NLI] Natural language inference pipeline

```python
from transformers import pipeline
pipe = pipeline("text-classification",model="tasksource/deberta-base-long-nli")
pipe([dict(text='there is a cat',
  text_pair='there is a black cat')]) #list of (premise,hypothesis)
# [{'label': 'neutral', 'score': 0.9952911138534546}]
```

# [TA] Tasksource-adapters: 1 line access to hundreds of tasks 

```python
# !pip install tasknet
import tasknet as tn
pipe = tn.load_pipeline('tasksource/deberta-base-long-nli','glue/sst2') # works for 500+ tasksource tasks
pipe(['That movie was great !', 'Awful movie.'])
# [{'label': 'positive', 'score': 0.9956}, {'label': 'negative', 'score': 0.9967}]
```
The list of tasks is available in model config.json.
This is more efficient than ZS since it requires only one forward pass per example, but it is less flexible.


# [FT] Tasknet: 3 lines fine-tuning

```python
# !pip install tasknet
import tasknet as tn
hparams=dict(model_name='tasksource/deberta-base-long-nli', learning_rate=2e-5)
model, trainer = tn.Model_Trainer([tn.AutoTask("glue/rte")], hparams)
trainer.train()
```


# Citation

More details on this [article:](https://aclanthology.org/2024.lrec-main.1361/) 
```
@inproceedings{sileo-2024-tasksource,
    title = "tasksource: A Large Collection of {NLP} tasks with a Structured Dataset Preprocessing Framework",
    author = "Sileo, Damien",
    editor = "Calzolari, Nicoletta  and
      Kan, Min-Yen  and
      Hoste, Veronique  and
      Lenci, Alessandro  and
      Sakti, Sakriani  and
      Xue, Nianwen",
    booktitle = "Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024)",
    month = may,
    year = "2024",
    address = "Torino, Italia",
    publisher = "ELRA and ICCL",
    url = "https://aclanthology.org/2024.lrec-main.1361",
    pages = "15655--15684",
}
```
