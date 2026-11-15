> [!NOTE]
> To fix endless generations + instructions on how to run QwQ-32B, read our [Tutorial here](https://docs.unsloth.ai/basics/tutorial-how-to-run-qwq-32b-effectively).
> 

<div>
  <p style="margin-top: 0;">
    <strong><a href="https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf">Unsloth Dynamic v2.0</a> achieves superior accuracy & outperforms other leading quant methods.</strong>
  </p>
  <p style="margin-bottom: 0; margin-top: 0;">
      <strong>Qwen-QwQ-32B with our bug fixes. <br> See <a href="https://huggingface.co/collections/unsloth/qwen-qwq-32b-collection-676b3b29c20c09a8c71a6235">our collection</a> for versions of QwQ-32B including GGUF & 4-bit formats.</strong>
  </p>
  <p style="margin-bottom: 0;">
    <em>Unsloth's QwQ-32B <a href="https://unsloth.ai/blog/dynamic-4bit">Dynamic Quants</a> is selectively quantized, greatly improving accuracy over standard 4-bit.</em>
  </p>
  <div style="display: flex; gap: 5px; align-items: center; ">
    <a href="https://github.com/unslothai/unsloth/">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/unsloth%20new%20logo.png" width="133">
    </a>
    <a href="https://discord.gg/unsloth">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/Discord%20button.png" width="173">
    </a>
    <a href="https://docs.unsloth.ai/basics/tutorial-how-to-run-qwq-32b-effectively">
      <img src="https://raw.githubusercontent.com/unslothai/unsloth/refs/heads/main/images/documentation%20green%20button.png" width="143">
    </a>
  </div>
<h1 style="margin-top: 0rem;">Finetune your own Reasoning model like R1 with Unsloth!</h2>
</div>

For Ollama: `ollama run hf.co/unsloth/QwQ-32B-GGUF:Q4_K_M`

For llama.cpp:
```python
import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id = "unsloth/QwQ-32B-GGUF",
    local_dir = "unsloth-QwQ-32B-GGUF",
    allow_patterns = ["*Q4_K_M*"], # For Q4_K_M
)
```
```bash
./llama.cpp/llama-cli \
    --model unsloth-QwQ-32B-GGUF/QwQ-32B-Q4_K_M.gguf \
    --threads 32 \
    --ctx-size 16384 \
    --n-gpu-layers 99 \
    --seed 3407 \
    --prio 2 \
    --temp 0.6 \
    --repeat-penalty 1.1 \
    --dry-multiplier 0.5 \
    --min-p 0.01 \
    --top-k 40 \
    --top-p 0.95 \
    -no-cnv \
    --samplers "top_k;top_p;min_p;temperature;dry;typ_p;xtc" \
    --prompt "<|im_start|>user\nCreate a Flappy Bird game in Python."
```
See https://docs.unsloth.ai/basics/tutorial-how-to-run-qwq-32b-without-bugs for more details!

> [!NOTE]
> To stop infinite generations - add `--samplers "top_k;top_p;min_p;temperature;dry;typ_p;xtc"`
>

# ✨ Finetune for Free

We have a free Google Colab notebook for turning Qwen2.5 (3B) into a reasoning model: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen2.5_(3B)-GRPO.ipynb

All notebooks are **beginner friendly**! Add your dataset, click "Run All", and you'll get a 2x faster finetuned model which can be exported to GGUF, vLLM or uploaded to Hugging Face.

| Unsloth supports          |    Free Notebooks                                                                                           | Performance | Memory use |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|-------------|----------|
| **GRPO with Phi-4**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Phi_4_(14B)-GRPO.ipynb)               | 2x faster | 80% less |
| **Llama-3.2 (3B)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Llama3.2_(1B_and_3B)-Conversational.ipynb)               | 2.4x faster | 58% less |
| **Llama-3.2 (11B vision)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Llama3.2_(11B)-Vision.ipynb)               | 2x faster | 60% less |
| **Qwen2 VL (7B)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen2_VL_(7B)-Vision.ipynb)               | 1.8x faster | 60% less |
| **Qwen2.5 (7B)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen2.5_(7B)-Alpaca.ipynb)               | 2x faster | 60% less |
| **Llama-3.1 (8B)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Llama3.1_(8B)-Alpaca.ipynb)               | 2.4x faster | 58% less |
| **Phi-4 (14B)** | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Phi_4-Conversational.ipynb)               | 2x faster | 50% less |
| **Gemma 2 (9B)**      | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Gemma2_(9B)-Alpaca.ipynb)               | 2.4x faster | 58% less |
| **Mistral (7B)**    | [▶️ Start on Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Mistral_v0.3_(7B)-Conversational.ipynb)               | 2.2x faster | 62% less |

- This [Llama 3.2 conversational notebook](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Llama3.2_(1B_and_3B)-Conversational.ipynb) is useful for ShareGPT ChatML / Vicuna templates.
- This [text completion notebook](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Mistral_(7B)-Text_Completion.ipynb) is for raw text. This [DPO notebook](https://colab.research.google.com/drive/15vttTpzzVXv_tJwEk-hIcQ0S9FcEWvwP?usp=sharing) replicates Zephyr.
- \* Kaggle has 2x T4s, but we use 1. Due to overhead, 1x T4 is 5x faster.


# QwQ-32B

<a href="https://chat.qwenlm.ai/" target="_blank" style="margin: 2px;">
    <img alt="Chat" src="https://img.shields.io/badge/%F0%9F%92%9C%EF%B8%8F%20Qwen%20Chat%20-536af5" style="display: inline-block; vertical-align: middle;"/>
</a>

## Introduction

QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. QwQ-32B is the medium-sized reasoning model, which is capable of achieving competitive performance against state-of-the-art reasoning models, e.g., DeepSeek-R1, o1-mini.

<p align="center">
  <img width="100%" src="figures/benchmark.jpg">
</p>


**This repo contains the QwQ 32B model**, which has the following features:
- Type: Causal Language Models
- Training Stage: Pretraining & Post-training (Supervised Finetuning and Reinforcement Learning)
- Architecture: transformers with RoPE, SwiGLU, RMSNorm, and Attention QKV bias
- Number of Parameters: 32.5B
- Number of Paramaters (Non-Embedding): 31.0B
- Number of Layers: 64
- Number of Attention Heads (GQA): 40 for Q and 8 for KV
- Context Length: Full 131,072 tokens

**Note:** For the best experience, please review the [usage guidelines](#usage-guidelines) before deploying QwQ models.

You can try our [demo](https://huggingface.co/spaces/Qwen/QwQ-32B-Demo) or access QwQ models via [QwenChat](https://chat.qwen.ai).

For more details, please refer to our [blog](https://qwenlm.github.io/blog/qwq-32b/), [GitHub](https://github.com/QwenLM/Qwen2.5), and [Documentation](https://qwen.readthedocs.io/en/latest/).

## Requirements

QwQ is based on Qwen2.5, whose code has been in the latest Hugging face `transformers`. We advise you to use the latest version of `transformers`.

With `transformers<4.37.0`, you will encounter the following error:
```
KeyError: 'qwen2'
```

## Quickstart

Here provides a code snippet with `apply_chat_template` to show you how to load the tokenizer and model and how to generate contents.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/QwQ-32B"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "How many r's are in the word \"strawberry\""
messages = [
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(response)
```

### Usage Guidelines

To achieve optimal performance, we recommend the following settings:

1. **Enforce Thoughtful Output**: Ensure the model starts with "\<think\>\n" to prevent generating empty thinking content, which can degrade output quality. If you use `apply_chat_template` and set `add_generation_prompt=True`, this is already automatically implemented, but it may cause the response to lack the \<think\> tag at the beginning. This is normal behavior.

2. **Sampling Parameters**:
   - Use Temperature=0.6 and TopP=0.95 instead of Greedy decoding to avoid endless repetitions.
   - Use TopK between 20 and 40 to filter out rare token occurrences while maintaining the diversity of the generated output.

3. **Standardize Output Format**: We recommend using prompts to standardize model outputs when benchmarking.
   - **Math Problems**: Include "Please reason step by step, and put your final answer within \boxed{}." in the prompt.
   - **Multiple-Choice Questions**: Add the following JSON structure to the prompt to standardize responses: "Please show your choice in the `answer` field with only the choice letter, e.g.,`\"answer\": \"C\"`." in the prompt.

4. **Handle Long Inputs**: For inputs exceeding 32,768 tokens, enable [YaRN](https://arxiv.org/abs/2309.00071) to improve the model's ability to capture long-sequence information effectively.

For supported frameworks, you could add the following to `config.json` to enable YaRN:
```json
{
  ...,
  "rope_scaling": {
    "factor": 4.0,
    "original_max_position_embeddings": 32768,
    "type": "yarn"
  }
}
```

For deployment, we recommend using vLLM. Please refer to our [Documentation](https://qwen.readthedocs.io/en/latest/deployment/vllm.html) for usage if you are not familar with vLLM.
Presently, vLLM only supports static YARN, which means the scaling factor remains constant regardless of input length, **potentially impacting performance on shorter texts**. 
We advise adding the `rope_scaling` configuration only when processing long contexts is required.

## Evaluation & Performance

Detailed evaluation results are reported in this [📑 blog](https://qwenlm.github.io/blog/qwq-32b/).

For requirements on GPU memory and the respective throughput, see results [here](https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html).

## Citation

If you find our work helpful, feel free to give us a cite.

```
@misc{qwq32b,
    title = {QwQ-32B: The Power of Scaling RL},
    url = {https://qwenlm.github.io/blog/qwq-32b/},
    author = {Qwen Team},
    month = {March},
    year = {2025}
}

@article{qwen2,
      title={Qwen2 Technical Report}, 
      author={An Yang and Baosong Yang and Binyuan Hui and Bo Zheng and Bowen Yu and Chang Zhou and Chengpeng Li and Chengyuan Li and Dayiheng Liu and Fei Huang and Guanting Dong and Haoran Wei and Huan Lin and Jialong Tang and Jialin Wang and Jian Yang and Jianhong Tu and Jianwei Zhang and Jianxin Ma and Jin Xu and Jingren Zhou and Jinze Bai and Jinzheng He and Junyang Lin and Kai Dang and Keming Lu and Keqin Chen and Kexin Yang and Mei Li and Mingfeng Xue and Na Ni and Pei Zhang and Peng Wang and Ru Peng and Rui Men and Ruize Gao and Runji Lin and Shijie Wang and Shuai Bai and Sinan Tan and Tianhang Zhu and Tianhao Li and Tianyu Liu and Wenbin Ge and Xiaodong Deng and Xiaohuan Zhou and Xingzhang Ren and Xinyu Zhang and Xipin Wei and Xuancheng Ren and Yang Fan and Yang Yao and Yichang Zhang and Yu Wan and Yunfei Chu and Yuqiong Liu and Zeyu Cui and Zhenru Zhang and Zhihao Fan},
      journal={arXiv preprint arXiv:2407.10671},
      year={2024}
}
```