# Qwen2-57B-A14B-Instruct-GGUF

## Introduction

Qwen2 is the new series of Qwen large language models. For Qwen2, we release a number of base language models and instruction-tuned language models ranging from 0.5 to 72 billion parameters, including a Mixture-of-Experts model (57B-A14B).

Compared with the state-of-the-art opensource language models, including the previous released Qwen1.5, Qwen2 has generally surpassed most opensource models and demonstrated competitiveness against proprietary models across a series of benchmarks targeting for language understanding, language generation, multilingual capability, coding, mathematics, reasoning, etc.

For more details, please refer to our [blog](https://qwenlm.github.io/blog/qwen2/), [GitHub](https://github.com/QwenLM/Qwen2), and [Documentation](https://qwen.readthedocs.io/en/latest/).

In this repo, we provide quantized models in the GGUF formats, including `q2_k`, `q3_k_m`, `q4_0`, `q4_k_m`, `q5_0`, `q5_k_m`, `q6_k` and `q8_0`.

This is the GGUF repo for Qwen2-57B-A14B-Instruct, which is an MoE model.

## Model Details
Qwen2 is a language model series including decoder language models of different model sizes. For each size, we release the base language model and the aligned chat model. It is based on the Transformer architecture with SwiGLU activation, attention QKV bias, group query attention, etc. Additionally, we have an improved tokenizer adaptive to multiple natural languages and codes.

## Training details
We pretrained the models with a large amount of data, and we post-trained the models with both supervised finetuning and direct preference optimization.


## Requirements
We advise you to clone [`llama.cpp`](https://github.com/ggerganov/llama.cpp) and install it following the official guide. We follow the latest version of llama.cpp. 
In the following demonstration, we assume that you are running commands under the repository `llama.cpp`.


## How to use
Cloning the repo may be inefficient, and thus you can manually download the GGUF file that you need or use `huggingface-cli` (`pip install huggingface_hub`) as shown below:
```shell
huggingface-cli download Qwen/Qwen2-57B-A14B-Instruct-GGUF qwen2-57b-a14b-instruct-q4_0.gguf --local-dir . --local-dir-use-symlinks False
```

However, for large files, we split them into multiple segments due to the limitation of 50G for a single file to be uploaded. 
Specifically, for the split files, they share a prefix, with a suffix indicating its index. For examples, the `q8_0` GGUF files are:

```
qwen2-57b-a14b-instruct-q8_0-00001-of-00002.gguf
qwen2-57b-a14b-instruct-q8_0-00002-of-00002.gguf
```

They share the prefix of `qwen2-57b-a14b-instruct-q5_k_m`, but have their own suffix for indexing respectively, say `-00001-of-00002`. 
To use the split GGUF files, you need to merge them first with the command `llama-gguf-split` as shown below:

```bash
./llama-gguf-split --merge qwen2-57b-a14b-instruct-q8_0-00001-of-00002.gguf qwen2-57b-a14b-instruct-q8_0.gguf
```

With the upgrade of APIs of llama.cpp, `llama-gguf-split` is equivalent to the previous `gguf-split`. 
For the arguments of this command, the first is the path to the first split GGUF file, and the second is the path to the output GGUF file.


To run Qwen2, you can use `llama-cli` (the previous `main`) or `llama-server` (the previous `server`). 
We recommend using the `llama-server` as it is simple and compatible with OpenAI API. For example:

```bash
./llama-server -m qwen2-57b-a14b-instruct-q5_0.gguf -ngl 28 -fa
```

(Note: `-ngl 28` refers to offloading 28 layers to GPUs, and `-fa` refers to the use of flash attention.)

Then it is easy to access the deployed service with OpenAI API:

```python
import openai

client = openai.OpenAI(
    base_url="http://localhost:8080/v1", # "http://<Your api-server IP>:port"
    api_key = "sk-no-key-required"
)

completion = client.chat.completions.create(
    model="qwen",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "tell me something about michael jordan"}
    ]
)
print(completion.choices[0].message.content)
```

If you choose to use `llama-cli`, pay attention to the removal of `-cml` for the ChatML template. Instead you should use `--in-prefix` and `--in-suffix` to tackle this problem.

```bash
./llama-cli -m qwen2-57b-a14b-instruct-q5_0.gguf \
  -n 512 -co -i -if -f prompts/chat-with-qwen.txt \
  --in-prefix "<|im_start|>user\n" \
  --in-suffix "<|im_end|>\n<|im_start|>assistant\n" \
  -ngl 28 -fa
```

## Evaluation

We implement perplexity evaluation using wikitext following the practice of `llama.cpp` with `./llama-perplexity` (the previous `./perplexity`). 
In the following we report the PPL of GGUF models of different sizes and different quantization levels.

|Size    | fp16    | q8_0    | q6_k    | q5_k_m  | q5_0    | q4_k_m  | q4_0    | q3_k_m  | q2_k    | iq1_m   |
|--------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
|0.5B    | 15.11   | 15.13   | 15.14   | 15.24   | 15.40   | 15.36   | 16.28   | 15.70   | 16.74   | -       |
|1.5B    | 10.43   | 10.43   | 10.45   | 10.50   | 10.56   | 10.61   | 10.79   | 11.08   | 13.04   | -       |
|7B      | 7.93    | 7.94    | 7.96    | 7.97    | 7.98    | 8.02    | 8.19    | 8.20    | 10.58   | -       |
|57B-A14B| 6.81    | 6.81    | 6.83    | 6.84    | 6.89    | 6.99    | 7.02    | 7.43    | -       | -       |
|72B     | 5.58    | 5.58    | 5.59    | 5.59    | 5.60    | 5.61    | 5.66    | 5.68    | 5.91    | 6.75    |


## Citation

If you find our work helpful, feel free to give us a cite.

```
@article{qwen2,
  title={Qwen2 Technical Report},
  year={2024}
}
```