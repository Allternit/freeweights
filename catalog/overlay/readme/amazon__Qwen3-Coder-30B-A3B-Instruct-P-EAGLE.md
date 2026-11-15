# Model Overview

P-EAGLE is a parallel-drafting speculative decoding model that generates K draft tokens in a single forward pass. It transforms EAGLE—the state-of-the-art speculative decoding method—from autoregressive to parallel draft generation.

### Model Details
The model architecture is illustrated in the following figure. Specifically, we trained a 4-layer P-EAGLE for Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 as the target model, with number of parallel-token prediction as 18. 

P-EAGLE follows the vanila EAGLE 3 using three layers of hidden states from the target model.

<img src="https://cdn-uploads.huggingface.co/production/uploads/64ab5fe189aa67e4a251b6b4/UBBMgZvXkOduu_LpUunQy.png" width="50%">

### Model Description

- **Developed by:** AWS
- **Model type:** EAGLE
- **Language(s) (NLP):** English
- **License:** Apache License 2.0
- **Target model:** [Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8)

### Model Sources

- **Paper**: [P-EAGLE: Parallel-Drafting EAGLE with Scalable Training](https://www.arxiv.org/pdf/2602.01469)

### Training Data
- [nvidia/OpenCodeInstruct 200K](https://huggingface.co/datasets/nvidia/OpenCodeInstruct)
- [Ultrachat_200k](HuggingFaceH4/ultrachat_200k)

Similar to [nvidia/gpt-oss-120b-Eagle3-long-context](https://huggingface.co/nvidia/gpt-oss-120b-Eagle3-long-context): only prompts from the datasets were used for data synthesis (the original responses from GPT were not used for data synthesis) which is then used to train the P-Eagle.

### Usage
To serve the checkpoint in [vLLM](https://github.com/vllm-project/vllm)
```
vllm serve \
--model Qwen/Qwen3-Coder-30B-A3B-Instruct \
--tensor-parallel-size 1 \
--max-model-len 16384 \
--speculative-config '{"method": "eagle3", "model": "amazon/Qwen3-Coder-30B-A3B-Instruct-P-EAGLE", "num_speculative_tokens": 10, "parallel_drafting": true}' \
--no-enable-prefix-caching \
--async-scheduling
```

### Evaluation
From vllm-bench, the acceptance length (AL) on HumanEval dataset with different speculation length K is shown as below.

We use instruction-formatted prompts following standard practice for instruct models (similar to [DeepSeek-Coder evaluation](https://github.com/deepseek-ai/DeepSeek-Coder/blob/main/Evaluation/HumanEval/eval_instruct.py) and [Llama 3.1 8B instruction evaluation](https://huggingface.co/datasets/meta-llama/Llama-3.1-8B-Instruct-evals/viewer/Llama-3.1-8B-Instruct-evals__human_eval__details?row=1)). The instruction we add in front of each prompt is ```Complete the following Python function. Only output the code, no explanations.```

  | K | Acceptance Length |
  |---|-------------------|
  | 4 | 4.30 |
  | 10 | 6.66 |
  | 18 | 7.51 |

vLLM bench command is shown as below.
```
vllm bench serve \
      --backend openai-chat \
      --base-url http://localhost:8041 \
      --endpoint /v1/chat/completions \
      --model Qwen/Qwen3-Coder-30B-A3B-Instruct \
      --dataset-name custom \
      --dataset-path /home/ubuntu/eval_datasets/humaneval_qwen3coder_bench.jsonl \
      --custom-output-len 256 \
      --num-prompts 80 \
      --max-concurrency 1 \
      --temperature 0 \
      --request-rate inf \
      --save-result --save-detailed
```


### Ciatation
```
@article{hui2026p,
  title={P-EAGLE: Parallel-Drafting EAGLE with Scalable Training},
  author={Hui, Mude and Huang, Xin and Salas, Jaime Campos and Sun, Yue and Pemberton, Nathan and Song, Xiang and Khetan, Ashish and Karypis, George},
  journal={arXiv preprint arXiv:2602.01469},
  year={2026}
}
```