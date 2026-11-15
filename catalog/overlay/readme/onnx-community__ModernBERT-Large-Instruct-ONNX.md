# ModernBERT-Large-Instruct (ONNX)


This is an ONNX version of [answerdotai/ModernBERT-Large-Instruct](https://huggingface.co/answerdotai/ModernBERT-Large-Instruct). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `fill-mask`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FillMaskPipeline


---


# ModernBERT-Large-Instruct

## Table of Contents
1. [Model Summary](#model-summary)
2. [Usage](#Usage)
3. [Evaluation](#Evaluation)
4. [Limitations](#limitations)
5. [Training](#training)
6. [License](#license)
7. [Citation](#citation)

## Model Summary

ModernBERT-Instruct-Large is a lightly instruction-tuned version of [ModernBERT-large](https://huggingface.co/answerdotai/ModernBERT-large), trained using a mixed-objective (Answer Token Prediction & Dummy MLM) on 20M examples sampled from the FLAN collection.

Despite a very straightforward pre-training and inference pipeline, this model proves to be a very strong model in a variety of contexts, in both zero-shot and fully-finetuned settings.

For more details, we recommend checking out the [TIL Blog Post](), the [mini cookbook GitHub repository](https://github.com/AnswerDotAI/ModernBERT-Instruct-mini-cookbook) or the [Technical Report](https://arxiv.org/abs/2502.03793).

## Usage

In order to use ModernBERT-Large-Instruct, you need to install a version of `transformers` which natively supports ModernBERT (4.48+):

```sh
pip install -U transformers>=4.48.0
```

**⚠️ If your GPU supports it, we recommend using ModernBERT with Flash Attention 2 to reach the highest efficiency. To do so, install Flash Attention as follows, then use the model as normal:**

```bash
pip install flash-attn
```

All tasks are then performed using the Model's Masked Language Modelling head, load via `AutoModelForMaskedLM`. Here is an example to answer an MMLU question:


```python
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM

# Load model and tokenizer
model_name = "answerdotai/ModernBERT-Large-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
if device == 'cuda':
    model = AutoModelForMaskedLM.from_pretrained(model_name, attn_implementation="flash_attention_2")
else:
    model = AutoModelForMaskedLM.from_pretrained(model_name)

model.to(device)

# Format input for classification or multiple choice. This is a random example from MMLU.
text = """You will be given a question and options. Select the right answer.
QUESTION: If (G, .) is a group such that (ab)^-1 = a^-1b^-1, for all a, b in G, then G is a/an
CHOICES:
- A: commutative semi group
- B: abelian group
- C: non-abelian group
- D: None of these
ANSWER: [unused0] [MASK]"""

# Get prediction
inputs = tokenizer(text, return_tensors="pt").to(device)
outputs = model(**inputs)
mask_idx = (inputs.input_ids == tokenizer.mask_token_id).nonzero()[0, 1]
pred_id = outputs.logits[0, mask_idx].argmax()
answer = tokenizer.decode(pred_id)
print(f"Predicted answer: {answer}")  # Outputs: B
```

## Evaluation

Results are taken from the [technical report](https://arxiv.org/abs/2502.03793). Results for MMLU and MMLU-Pro are taken from [SmolLM2 (†)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct) and the [MMLU-Pro leaderboard (‡)](https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro) whenever possible.

### Zero-Shot

| Model                     | MMLU      | MMLU-Pro    | ADEv2      | NIS      | OSE        | Average   |
|---------------------------|-----------|-------------|------------|----------|------------|-----------|
| **0.3-0.5B**              |           |             |            |          |            |           |
| Tasksource-NLI            | 36.08     | 16.54       | _65.17_   | 58.72    | 21.11      | _39.52_  |
| RoBERTa-Large-SST         | 31.30     | 13.63       | 43.61     | 75.00    | **40.67**  | 40.84    |
| UniMC                     | 38.48     | **18.83**   | 23.29     | 73.96    | 36.88      | 38.29    |
| ModernBERT-Large-Instruct | **43.06** | 17.16       | **53.31** | **85.53**| 20.62      | **43.94**|
| SmoLM2-360M               | 35.8†     | 11.38‡     | -         | -        | -          | -        |
| Qwen2-0.5B                | 33.7†     | 15.93‡     | -         | -        | -          | -        |
| **1B+**                   |           |             |            |          |            |           |
| Llama3.2-1B               | 45.83     | 22.6      | -         | -        | -          | -        |
| SmoLM2-1.7B               | 48.44     | 18.31‡     | -         | -        | -          | -        |
| Qwen2.5-1.5B              | ***59.67***| ***32.1‡***| -         | -        | -          | -        |


### Fine-Tuned

| Model                      | MNLI      | Yahoo!  | 20ng      | AGNews   | SST-2      | IMDB    | SST-5     | Average  |
|----------------------------|-----------|---------|-----------|----------|------------|---------|-----------|----------|
| ModernBERT (cls head)      | 90.8†    | 77.75   | **73.96** | **95.34**| **97.1†** | 96.52   | 59.28     | 84.39    |
| ModernBERT-Large-Instruct  | **91.03** | **77.88**| **73.96** | 95.24    | 96.22      | **97.2**| **61.13** | **84.67**|


## Limitations

ModernBERT’s training data is primarily English and code, so performance is best on these languages. ModernBERT-Large-Instruct is a first version, demonstrating the strong potential of using the MLM head for downstream tasks without complex pipelines. However, it is very likely to have failure cases and it could be improved further.


## License

Apache 2.0

## Citation

If you use ModernBERT-Large-Instruct in your work, please cite:

```
@misc{clavié2025itsmasksimpleinstructiontuning,
      title={It's All in The [MASK]: Simple Instruction-Tuning Enables BERT-like Masked Language Models As Generative Classifiers}, 
      author={Benjamin Clavié and Nathan Cooper and Benjamin Warner},
      year={2025},
      eprint={2502.03793},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2502.03793}, 
}
```
