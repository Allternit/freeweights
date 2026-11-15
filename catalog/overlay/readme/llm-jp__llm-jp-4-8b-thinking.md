# llm-jp-4-8b-thinking

LLM-jp-4 is a series of large language models developed by the [Research and Development Center for Large Language Models](https://llmc.nii.ac.jp/) at the [National Institute of Informatics](https://www.nii.ac.jp/en/).

This repository provides the **llm-jp-4-8b-thinking** model.
For an overview of the LLM-jp-4 models across different parameter sizes, please refer to:
  - [LLM-jp-4 Models](https://huggingface.co/collections/llm-jp/llm-jp-4-models)

Base models are trained with pre-training and mid-training only.
Post-trained models are aligned using supervised fine-tuning (SFT) and direct preference optimization (DPO), without reinforcement learning.

For practical usage examples and detailed instructions on how to use the models, please also refer to our [cookbook](https://github.com/llm-jp/llm-jp-4-cookbook).

To support the continued development of LLM-jp, we would greatly appreciate it if you could share how you utilize LLM-jp outcomes via the [survey form](https://forms.gle/AvbNXTNT2ADsssHq5).


## Usage

Please refer to our [cookbook](https://github.com/llm-jp/llm-jp-4-cookbook) for practical usage examples and detailed instructions on how to use the models.


## Model Details

- **Model type:** Transformer-based Language Model
- **Architectures:**

Dense model:
|Params|Layers|Hidden size|Heads|Context length|Embedding parameters|Non-embedding parameters|Total parameters|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|8B|32|4,096|32|65,536|805,306,368|7,784,894,464|8,590,200,832|

MoE model:
|Params|Layers|Hidden size|Heads|Routed Experts|Activated Experts|Context length|Embedding parameters|Non-embedding parameters|Activated parameters|Total parameters|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|32B-A3B|32|2,560|40|128|8|65,536|503,316,480|31,635,712,512|3,827,476,992|32,139,028,992|


## Tokenizer


The tokenizer of this model is based on [huggingface/tokenizers](https://github.com/huggingface/tokenizers) Unigram byte-fallback model.
The vocabulary entries were converted from [`llm-jp-tokenizer v4.0`](https://github.com/llm-jp/llm-jp-tokenizer).
Please refer to [README.md](https://github.com/llm-jp/llm-jp-tokenizer) of `llm-jp-tokenizer` for details on the vocabulary construction procedure (the pure SentencePiece training does not reproduce our vocabulary).

> [!NOTE]
> The chat template of this model is designed to be compatible with the OpenAI Harmony response format.
> However, the tokenizer differs from the one assumed by the `openai-harmony` library, and therefore direct tokenization with `openai-harmony` is not supported.
> For correct behavior, please use the tokenizer provided with this model. For detailed usage, please refer to [our cookbook](https://github.com/llm-jp/llm-jp-4-cookbook).


## Training

### Pre-training

This model is trained through a multi-stage pipeline consisting of pre-training and mid-training phases, using a total of 11.7T tokens.

![pretraining_overview](./v4_pretraining_overview.png)

The corpora used for pre-training and mid-training are publicly available at the following links:
- [Pre-training](https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1)
- [Mid-training](https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2)

> [!NOTE]
> Although most of the corpora have been released, some portions are excluded from public release due to licensing constraints.

### Post-training

We have fine-tuned the pre-trained checkpoint using SFT and further aligned it with DPO.

The datasets used for post-training are also publicly available at the following links:
- [SFT](https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data)
- [DPO (for llm-jp-4-8b-thinking model)](https://huggingface.co/datasets/llm-jp/llm-jp-4-8b-thinking-dpo-data)
- [DPO (for llm-jp-4-32b-a3b-thinking model)](https://huggingface.co/datasets/llm-jp/llm-jp-4-32b-a3b-thinking-dpo-data)

## Evaluation

### [llm-jp-judge](https://github.com/llm-jp/llm-jp-judge)

We evaluated the model on a variety of tasks using an LLM-as-a-Judge framework. The descriptions of each task are as follows.

- MT-Bench (JA/EN): A benchmark for measuring multi-turn conversational task-solving ability.
- [AnswerCarefully](https://huggingface.co/datasets/llm-jp/AnswerCarefully): A benchmark for evaluating safety in Japanese. We used 336 questions from the v2.0 test set.
- [llm-jp-instructions](https://huggingface.co/datasets/llm-jp/llm-jp-instructions): A set of human-created single-turn question–answer pairs. We used 400 questions from the test set.

We evaluated the models using `gpt-5.4-2026-03-05`.
> [!NOTE]
> Note: In earlier evaluations of the llm-jp-3 series, we used `gpt-4o-2024-08-06`. The newer evaluator `gpt-5.4-2026-03-05` provides a stricter and more reliable assessment, which results in lower scores on benchmarks such as MT-Bench compared to those reported for the llm-jp-3 series.

The scores represent the average values obtained from three rounds of inference and evaluation.
For more details, please refer to the [codes](https://github.com/llm-jp/llm-jp-judge).


| Model Name                                                                                             | MT-Bench (JA)  | MT-Bench (EN)  | AnswerCarefully | llm-jp-instructions |
|:-------------------------------------------------------------------------------------------------------|----:|----:|----------------:|--------------------:|
| gpt-4o-2024-08-06                                                                                              | 7.29 | 7.69 | 4.00 | 4.07 |
| gpt-5.4-2026-03-05 (reasoning_effort = low)                                                                    | 8.87 | 8.76 | 4.38 | 4.79 |
| gpt-5.4-2026-03-05 (reasoning_effort = medium)                                                                 | 8.87 | 8.89 | 4.43 | 4.82 |
| gpt-5.4-2026-03-05 (reasoning_effort = high)                                                                   | 8.98 | 8.85 | 4.41 | 4.83 |
| [gpt-oss-20b (reasoning_effort = low)](https://huggingface.co/openai/gpt-oss-20b)                                | 7.21 | 7.95 | 3.39 | 3.08 |
| [gpt-oss-20b (reasoning_effort = medium)](https://huggingface.co/openai/gpt-oss-20b)                             | 7.33 | 7.85 | 3.55 | 3.16 |
| [llm-jp-4-8b-thinking (reasoning_effort = low)](https://huggingface.co/llm-jp/llm-jp-4-8b-thinking)              | 7.23 | 7.54 | 3.58 | 3.50 |
| [llm-jp-4-8b-thinking (reasoning_effort = medium)](https://huggingface.co/llm-jp/llm-jp-4-8b-thinking)           | 7.54 | 7.79 | 3.69 | 3.54 |
| [llm-jp-4-32b-a3b-thinking (reasoning_effort = low)](https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking)    | 7.57 | 7.70 | 3.61 | 3.61 |
| [llm-jp-4-32b-a3b-thinking (reasoning_effort = medium)](https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking) | 7.82 | 7.86 | 3.70 | 3.61 |


## Risks and Limitations

The models released here are in the early stages of our research and development and have not been tuned to ensure outputs align with human intent and safety considerations.


## Send Questions to

llm-jp(at)nii.ac.jp


## License

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)


## Acknowledgement

To develop this model, we used the NINJAL Web Japanese Corpus (whole-NWJC) from the National Institute for Japanese Language and Linguistics (NINJAL).


## Model Card Authors

*The names are listed in alphabetical order.*

Hirokazu Kiyomaru and Takashi Kodama.