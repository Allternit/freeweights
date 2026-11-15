# Qwen2-0.5B-Instruct-MLX

## Introduction

Qwen2 is the new series of Qwen large language models. For Qwen2, we release a number of base language models and instruction-tuned language models ranging from 0.5 to 72 billion parameters, including a Mixture-of-Experts model. This repo contains the instruction-tuned 0.5B Qwen2 model.

Compared with the state-of-the-art opensource language models, including the previous released Qwen1.5, Qwen2 has generally surpassed most opensource models and demonstrated competitiveness against proprietary models across a series of benchmarks targeting for language understanding, language generation, multilingual capability, coding, mathematics, reasoning, etc.

For more details, please refer to our [blog](https://qwenlm.github.io/blog/qwen2/) and [GitHub](https://github.com/QwenLM/Qwen2). This is the MLX quantized model of Qwen2-0.5B-Instruct.
<br>

## Model Details
Qwen2 is a language model series including decoder language models of different model sizes. For each size, we release the base language model and the aligned chat model. It is based on the Transformer architecture with SwiGLU activation, attention QKV bias, group query attention, etc. Additionally, we have an improved tokenizer adaptive to multiple natural languages and codes.

## Training details
We pretrained the models with a large amount of data, and we post-trained the models with both supervised finetuning and direct preference optimization.


## Requirements

Run the following commands to install the required MLX packages.

```
pip install mlx-lm mlx -U
```


## Quickstart

Here provides a code snippet with `apply_chat_template` to show you how to load the tokenizer and model and how to generate contents.

```python
from mlx_lm import load, generate

model, tokenizer = load('Qwen/Qwen2-0.5B-Instruct-MLX', tokenizer_config={"eos_token": "<|im_end|>"})

prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

response = generate(model, tokenizer, prompt=text, verbose=True, top_p=0.8, temp=0.7, repetition_penalty=1.05, max_tokens=512)
```

## Citation

If you find our work helpful, feel free to give us a cite.

```
@article{qwen2,
  title={Qwen2 Technical Report},
  year={2024}
}
```