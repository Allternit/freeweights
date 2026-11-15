# RuModernBERT-small

The Russian version of the modernized bidirectional encoder-only Transformer model, [ModernBERT](https://arxiv.org/abs/2412.13663).
RuModernBERT was pre-trained on approximately 2 trillion tokens of Russian, English, and code data with a context length of up to 8,192 tokens, using data from the internet, books, scientific sources, and social media.

|                                                                               | Model Size | Hidden Dim | Num Layers | Vocab Size | Context Length |    Task   |
|------------------------------------------------------------------------------:|:----------:|:----------:|:----------:|:----------:|:--------------:|:---------:|
|                                              deepvk/RuModernBERT-small [this] |     35M    |     384    |     12     |    50368   |      8192      | Masked LM |
|   [deepvk/RuModernBERT-base](https://huggingface.co/deepvk/RuModernBERT-base) |    150M    |     768    |     22     |    50368   |      8192      | Masked LM |

## Notice ⚠️

The patched tokenizer is provided under the [patched-tokenizer](https://huggingface.co/deepvk/RuModernBERT-small/tree/patched-tokenizer) revision.

<details>
<summary>Details</summary>

We observed that several Russian lowercase letters were split into multiple subword tokens. This can be problematic for tasks like Named Entity Recognition (NER), where it is important that the first token of a word is a semantically meaningful unit.

To address this, we release a patched revision of the tokenizer with minimal but targeted change. Six common Russian lowercase letters *(а, е, и, н, о, т)* are now encoded as single tokens. These tokens were assigned to [unusedX] slots in the vocabulary. Corresponding BPE merges were added to ensure proper single-token encoding during inference. To preserve compatibility with the pretrained model each new token was initialized with the embedding of its uppercase counterpart both in tok_embedding and lm_head. To prevent duplicate vectors and maintain robustness, a small amount of Gaussian noise was added during initialization with gamma 1e-3.

We evaluated the patched model on 20 tasks from the RuMTEB benchmark and did not observe any statistically significant differences in performance compared to the original version. If your task is sensitive to tokenization granularity, such as in NER, we recommend using this updated version.

Usage example:

```python
from transformers import AutoTokenizer, AutoModelForMaskedLM

model_id = "deepvk/RuModernBERT-small"

# You can specify revision
revision = "patched-tokenizer"
tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
model = AutoModelForMaskedLM.from_pretrained(model_id, revision=revision, attn_implementation="flash_attention_2")
```

</details>


## Usage

Don't forget to update `transformers` and install `flash-attn` if your GPU supports it.

```python
from transformers import AutoTokenizer, AutoModelForMaskedLM

# Prepare model
model_id = "deepvk/RuModernBERT-small"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForMaskedLM.from_pretrained(model_id, attn_implementation="flash_attention_2")
model = model.eval()

# Prepare input
text = "Мама мыла [MASK]."
inputs = tokenizer(text, return_tensors="pt")
masked_index = inputs["input_ids"][0].tolist().index(tokenizer.mask_token_id)

# Make prediction
outputs = model(**inputs)

# Show prediction
predicted_token_id = outputs.logits[0, masked_index].argmax(axis=-1)
predicted_token = tokenizer.decode(predicted_token_id)
print("Predicted token:", predicted_token)
# Predicted token:  посуду
```

## Training Details

This is the small version with 35 million parameters.

### Tokenizer

We trained a new tokenizer following the original configuration.
We maintained the size of the vocabulary and added the same special tokens.
The tokenizer was trained on a mixture of Russian and English from FineWeb.

### Dataset

Pre-training includes three main stages: massive pre-training, context extension, and cooldown.
Unlike the original model, we did not use the same data for all stages.
For the second and third stages, we used cleaner data sources.

|           Data Source | Stage 1  | Stage 2 | Stage 3  |
|----------------------:|:--------:|:-------:|:--------:|
|       FineWeb (En+Ru) |    ✅    |    ❌    |    ❌    |
|  CulturaX-Ru-Edu (Ru) |    ❌    |    ✅    |    ❌    |
|          Wiki (En+Ru) |    ✅    |    ✅    |    ✅    |
|            ArXiv (En) |    ✅    |    ✅    |    ✅    |
|          Book (En+Ru) |    ✅    |    ✅    |    ✅    |
|                  Code |    ✅    |    ✅    |    ✅    |
| StackExchange (En+Ru) |    ✅    |    ✅    |    ✅    |
|           Social (Ru) |    ✅    |    ✅    |    ✅    |
|      **Total Tokens** |   1.3T   |   250B  |    50B   |


### Context length

In the first stage, the model was trained with a context length of `1,024`.
In the second and third stages, it was extended to `8,192`.

## Evaluation

To evaluate the model, we measure quality on the [`encodechka`](https://github.com/avidale/encodechka) and [`Russian Super Glue (RSG)`](https://russiansuperglue.com/) benchmarks.
For RSG, we perform a grid search for optimal hyperparameters and report metrics from the **dev** split.

For a fair comparison, we compare the RuModernBERT model only with raw encoders that were not trained on retrieval or sentence embedding tasks.

### Russian Super Glue

<img src="./rsg.jpg">

| Model                                                                          | RCB       |  PARus | MuSeRC  | TERRa | RUSSE   | RWSD    | DaNetQA | Score     |
|-------------------------------------------------------------------------------:|:---------:|:------:|:-------:|:-----:|:-------:|:-------:|:-------:|:---------:|
| [deepvk/deberta-v1-distill](https://huggingface.co/deepvk/deberta-v1-distill)  | 0.433     |  0.56  | 0.625   | 0.590 | 0.943   | 0.569   | 0.726   | 0.635     |
| [deepvk/deberta-v1-base](https://huggingface.co/deepvk/deberta-v1-base)        | 0.450     |  0.61  | 0.722   | 0.704 | 0.948   | 0.578   | **0.760**   | 0.682     |
| [ai-forever/ruBert-base](https://huggingface.co/ai-forever/ruBert-base)        | 0.491     |  0.61  | 0.663   | 0.769 | 0.962   | 0.574   | 0.678   | 0.678     |
| deepvk/RuModernBERT-small [this]                                               | 0.555     |  **0.64**  | 0.746   | 0.593 | 0.930   | 0.574   | 0.743   | 0.683     |
| [deepvk/RuModernBERT-base](https://huggingface.co/deepvk/RuModernBERT-base)    | **0.556** |  0.61  | **0.857**   | **0.818** | **0.977**   | **0.583**   | 0.758   | **0.737**     |

### Encodechka

|                                                                                     | Model Size |   STS-B  | Paraphraser |   XNLI   | Sentiment | Toxicity | Inappropriateness |  Intents | IntentsX |  FactRu  |  RuDReC  |   Avg. S   |  Avg. S+W |
|------------------------------------------------------------------------------------:|:----------:|:--------:|:-----------:|:--------:|:---------:|:--------:|:-----------------:|:--------:|:--------:|:--------:|:--------:|:----------:|:---------:|
|         [cointegrated/rubert-tiny](https://huggingface.co/cointegrated/rubert-tiny) |    11.9M   |   0.66   |     0.53    | **0.40** |    0.71   |   0.89   |        0.68       |   0.70   | **0.58** |   0.24   |   0.34   |    0.645   |   0.575   |
|       [deepvk/deberta-v1-distill](https://huggingface.co/deepvk/deberta-v1-distill) |    81.5M   | **0.70** |   **0.57**  |   0.38   |  **0.77** | **0.98** |        0.79       |   0.77   |   0.36   |   0.36   | **0.44** |    0.665   | **0.612** |
|             [deepvk/deberta-v1-base](https://huggingface.co/deepvk/deberta-v1-base) |    124M    |   0.68   |     0.54    |   0.38   |    0.76   | **0.98** |      **0.80**     | **0.78** |   0.29   |   0.29   |   0.40   |    0.653   |   0.591   |
|   [answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base) |    150M    |   0.50   |     0.29    |   0.36   |    0.64   |   0.79   |        0.62       |   0.59   |   0.10   |   0.22   |   0.20   |    0.486   |   0.431   |
|             [ai-forever/ruBert-base](https://huggingface.co/ai-forever/ruBert-base) |    178M    |   0.67   |     0.53    |   0.39   |  **0.77** | **0.98** |        0.78       |   0.77   |   0.38   |    🥴    |    🥴    |    0.659   |    🥴    |
| [DeepPavlov/rubert-base-cased](https://huggingface.co/DeepPavlov/rubert-base-cased) |    180M    |   0.63   |     0.50    |   0.38   |    0.73   |   0.94   |        0.74       |   0.74   |   0.31   |    🥴    |    🥴    |    0.621   |    🥴    |
|     deepvk/RuModernBERT-small [this]                                                |     35M    |  0.64    |     0.50    |   0.36   |    0.72   |   0.95   |        0.73       |   0.72   |   0.47   |   0.28   |   0.26   |    0.636   |   0.563   |
|         [deepvk/RuModernBERT-base](https://huggingface.co/deepvk/RuModernBERT-base) |    150M    |   0.67   |     0.54    |   0.35   |    0.75   |   0.97   |        0.76       |   0.76   | **0.58** | **0.37** |   0.36   | **0.673**  |   0.611   |

## Citation

```
@misc{deepvk2025rumodernbert,
    title={RuModernBERT: Modernized BERT for Russian},
    author={Spirin, Egor and Malashenko, Boris and Sokolov Andrey},
    url={https://huggingface.co/deepvk/rumodernbert-base},
    publisher={Hugging Face}
    year={2025},
}
```