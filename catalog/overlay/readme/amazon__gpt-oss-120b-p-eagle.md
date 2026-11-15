# Model Overview

P-EAGLE is a parallel-drafting speculative decoding model that generates K draft tokens in a single forward pass. It transforms EAGLE—the state-of-the-art speculative decoding method—from autoregressive to parallel draft generation.

### Model Details
The model architecture is illustrated in the following figure. Specifically, we trained a 4-layer P-EAGLE for GPT-OSS 120B as the target model, with number of parallel-token prediction as 8.  

P-EAGLE follows the vanila EAGLE 3 using three layers of hidden states from the target model.

<img src="https://cdn-uploads.huggingface.co/production/uploads/64ab5fe189aa67e4a251b6b4/UBBMgZvXkOduu_LpUunQy.png" width="50%">

### Model Description

- **Developed by:** AWS
- **Model type:** EAGLE
- **Language(s) (NLP):** English
- **License:** Apache License 2.0
- **Target model:** [GPT-OSS 120B](https://huggingface.co/openai/gpt-oss-120b)

### Model Sources

- **Paper**: [P-EAGLE: Parallel-Drafting EAGLE with Scalable Training](https://www.arxiv.org/pdf/2602.01469)

### Training Data
- [Ultrachat_200k](HuggingFaceH4/ultrachat_200k)
- [Magpie-Llama-3.1-Pro-300K-Filtered](https://huggingface.co/datasets/Magpie-Align/Magpie-Llama-3.1-Pro-300K-Filtered)

Similar to [nvidia/gpt-oss-120b-Eagle3-long-context](https://huggingface.co/nvidia/gpt-oss-120b-Eagle3-long-context): only prompts from the datasets were used for data synthesis (the original responses from GPT were not used for data synthesis) which is then used to train the P-Eagle.

### Usage
To serve the checkpoint in [vLLM](https://github.com/vllm-project/vllm)
```
CUDA_VISIBLE_DEVICES=0 VLLM_USE_FLASHINFER_MOE_MXFP4_MXFP8=1 \
  vllm serve openai/gpt-oss-120b \
  --speculative-config '{"method": "eagle3", "model": "amazon/gpt-oss-120b-p-eagle", "num_speculative_tokens": 5, "parallel_drafting": true}' \
  —tp 1 \
  --max-num-batched-tokens 32768 \
  --kv-cache-dtype fp8 \
  --async-scheduling \
  --stream-interval 20 \
  --max-cudagraph-capture-size 4096 \
  --no-enable-prefix-caching \
  --port 8040 \
  --gpu-memory-utilization 0.9 \
  --max-num-seqs 128 \
  --max-model-len 32768
```

### Evaluation
From vllm-bench, with speculation length of 5 and max-new-token of 2048, we see the following acceptance length. 
- **MT-Bench**: 2.68.
- **HumanEval**: 3.15.
- **GSM-8K**: 3.55.

The command to run benchmarking is shown as below.

```
vllm bench serve \
    --backend openai-chat \
    --base-url http://localhost:8040 \
    --endpoint /v1/chat/completions \
    --model openai/gpt-oss-120b \
    --dataset-name custom \
    --dataset-path /home/ubuntu/eval_datasets/humaneval_custom.jsonl \
    --custom-output-len 2048 \
    --num-prompts 164 \
    --max-concurrency 1 \
    --request-rate inf \
    --temperature 0 \
    --save-result \
    --save-detailed \
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