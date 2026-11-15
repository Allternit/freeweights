# ZR1-1.5B

ZR1-1.5B is a small reasoning model trained extensively on both verified coding and mathematics problems with reinforcement learning. The model outperforms Llama-3.1-70B-Instruct on hard coding tasks and improves upon the base R1-Distill-1.5B model by over 50%, while achieving strong scores on math evaluations and a 37.91% pass@1 accuracy on GPQA-Diamond with just 1.5B parameters.

![ZR1-1.5B LiveBench evaluation results on LiveBench with greedy sampling: the model is very token efficient](zr1-1.5b-livebench.png)

## Data

For training we utilized the [PRIME Eurus-2-RL](https://huggingface.co/datasets/PRIME-RL/Eurus-2-RL-Data) dataset which combines the following math and code datasets:
- NuminaMath-CoT
- APPS, CodeContests, TACO, and Codeforces train set

We filtered math data by validating that questions are correctly graded when calling the evaluator with reference ground truth, and we removed all code examples with an empty list of test cases. Our final dataset comprised roughly 400k math + 25k code samples.

## Training Recipe 

We employ [PRIME (Process Reinforcement through IMplicit rEwards)](https://arxiv.org/abs/2502.01456), an online RL algorithm with process rewards, motivated by the improvement over GPRO demonstrated in the paper, as well as potentially more accurate token-level rewards due to the learned process reward model. We used the training batch accuracy filtering method from PRIME for training stability, and the iterative context lengthening technique demonstrated in [DeepScaleR](https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2) for faster training, which has also been [shown to improve token efficiency](https://arxiv.org/abs/2503.07572). After a warmup period with maximum generation length set to 12k tokens, we sequentially increased the maximum generation length during training, starting at 8k tokens before increasing to 16k and 24k.

We trained on a single 8xH100 node with the following specific algorithmic details.

- PRIME + RLOO with token-level granularity
- No `<think>` token prefill. 0.1 format reward/penalty
- Main train batch size 256 with n=4 samples per prompt. veRL dynamic batch size with max batch size set per GPU to support training with large generation length
- Max prompt length 1536, generation length increase over training. Started with 12k intended to ease model into shorter generation length training
- 12384 -> 8192 -> 16384 -> 24448
- Start with 1 PPO epoch, increase to 4 during 24k stage
- Accuracy filtering 0.2-0.8 and relax to 0.01-0.99 during 24k stage
- Oversample batches 2x for accuracy filtering

And the following training hyperparameters: 

- KL coefficient 0 (no KL divergence term)
- Entropy coefficient 0.001
- Actor LR 5e-7
- Reward beta train 0.05
- Reward LR 1e-6
- Reward grad clip 10
- Reward RM coefficient 5

## Evaluation

**Coding**
|  | Leetcode | LCB\_generation |
| :---- | :---- | :---- |
| ZR1-1.5B | **40%** | **39.74%** |
| R1-Distill-Qwen-1.5B | 12.22% | 24.36% |
| DeepCoder-1.5B | 21.11% | 35.90% |
| OpenHands-LM-1.5B | 18.88% | 29.49% |
| Qwen2.5-1.5B-Instruct | 20.56% | 24.36% |
| Qwen2.5-Coder-3B-Instruct | 35.55% | 39.74% |
| Llama-3.1-8B-Instruct | 14.44% | 23.08% |
| Llama-3.1-70B-Instruct | 37.22% | 34.62% |
| Eurus-2-7B-PRIME | 34.44% | 32.05% |
| Mistral-Small-2503 | \- | <u>38.46%</u> |
| Gemma-3-27b-it | \- | <u>39.74%</u> |
| Claude-3-Opus | \- | <u>37.18%</u> |

**LiveBench**
| Model | AMPS Hard | Math\_Comp | LCB\_Generation | Coding\_Completion |
| :---- | :---- | :---- | :---- | :---- |
| ZR1-1.5B | **74%** | 60.42% | **39.74%** | **12%** |
| DeepCoder-1.5B | 69% | **61.46%** | 35.90% | **12%** |
| DeepScaleR-1.5B | 64% | 50% | 24.36% | 6% |
| OpenHands-LM-1.5B | 24% | 29.48% | 29.49% | 8% |
| R1-Distill-1.5B | 54% | 37.50% | 24.36% | 6% |
| Qwen2.5-1.5B-Instruct | 38% | 20.83% | 24.36% | 4% |
| Qwen2.5-Math-1.5B-Instruct | 49% | 36.46% | 0% | 0% |
| Qwen2.5-3B-Instruct | 41% | 17.71% | 28.21% | 10% |
| R1-Distill-7B | 74% | 61.46% | 44.87% | 14% |
| Qwen2.5-7B-Instruct | 56% | 29.17% | 38.46% | 40% |
| Qwen2.5-Math-7B-Instruct | 62% | 45.83% | 16.67% | 4% |
| R1-Distill-14B | 77% | 69.79% | 64.10% | 18% |
| Qwen2.5-14B-Instruct | 59% | 43.75% | 46.15% | 54% |
| R1-Distill-32B | 74% | 75% | 60.26% | 26% |
| QwQ-32B-Preview | 78% | 67.71% | 52.56% | 22% |
| QwQ-32B | 83% | 87.5% | 87.18% | 46% |
| Qwen2.5-32B-Instruct | 62% | 54.17% | 51.23% | 54% |
| Qwen2.5-Coder-32B-Instruct | 48% | 53.13% | 55.13% | 58% |
| R1-Distill-Llama-70B\* | 65% | 78.13% | 69.23% | 34% |
| Qwen2.5-72B-Instruct | 66% | 52.08% | 50% | 62% |
| Qwen2.5-Math-72B-Instruct | 56% | 59.38% | 42.31% | 42% |
| DeepSeek-R1\* | 88% | 88.54% | 79.48% | 54% |

**General Math**
| model | AIME24 | AIME25 | AMC22\_23 | AMC24 | GPQA-D | MATH500 | Minerva | Olympiad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| ZR1-1.5B | 33.75% | 27.29% | 72.06% | 59.17% | **37.91%** | 88.34% | 33.52% | 56.87% |
| ZR1-1.5B (greedy) | 40% | 26.67% | 71.08% | 53.33% | 37.88% | **89.40%** | 32.72% | 57.93% |
| DeepScaleR-1.5B | **42.92%** | **27.71%** | 74.40% | **60.69%** | 34.66% | 89.36% | **35.50%** | **59.37%** |
| DeepScaleR-1.5B (greedy) | 33.33% | 33.33% | 67.47% | 57.77% | 29.29% | 84.60% | 31.62% | 52.44% |
| DeepCoder-1.5B | 41.88% | 24.79% | **75.30%** | 59.72% | 36.46% | 83.60% | 32.01% | 56.39% |
| Still-3-1.5B | 31.04% | 23.54% | 65.51% | 56.94% | 34.56% | 86.55% | 33.50% | 53.55% |
| Open-RS3-1.5B | 31.67% | 23.75% | 64.08% | 51.67% | 35.61% | 84.65% | 29.46% | 52.13% |
| R1-Distill-1.5B | 28.96% | 22.50% | 63.59% | 50.83% | 33.87% | 84.65% | 31.39% | 51.11% |
| R1-Distill-1.5B (greedy) | 26.67% | 13.33% | 51.81% | 24.44% | 30.81% | 73.40% | 25.74% | 40% |
| Qwen2.5-Math-1.5B-Instruct (greedy) | 10% | 6.67% | 42.17% | 26.67% | 28.28% | 75.20% | 28.31% | 40.74% |
| Qwen2.5-Math-7B-Instruct (greedy) | 20% | 3.33% | 46.99% | 31.11% | 32.32% | 83% | 37.13% | 42.22% |
| Qwen2.5-Math-72B-Instruct (greedy) | 26.67% | 6.67% | 59.04% | 46.67% | 43.94% | 85.40% | 42.65% | 50.37% |
| Eurus-2-7B-PRIME (greedy) | 20% | 13.33% | 56.62% | 40% | 36.36% | 81.20% | 36.76% | 44.15% |
| DeepHermes-3-Llama-3-3B (think prompt, greedy) | 0% | 3.33% | 12.05% | 11.11% | 30.30% | 34.40% | 10.66% | 10.52% |
| OpenHands-LM-1.5B (greedy) | 0% | 0% | 10.84% | 4.44% | 23.74% | 36.80% | 12.50% | 10.22% |

**Short CoT**

Our direct answer system prompt was: “Give a direct answer without thinking first.”

The table reports the average greedy pass@1 score across the following math evals: AIME24, AIME25, AMC22\_23, AMC24, GPQA-Diamond, MATH-500, MinervaMath, OlympiadBench

|  | avg pass@1 | max\_tokens |
| :---- | :---- | :---- |
| ZR1-1.5B | 51.13% | 32768 |
| ZR1-1.5B (truncated) | 46.83% | 4096 |
| ZR1-1.5B (direct answer prompt) | 45.38% | 4096 |
| ZR1-1.5B (truncated) | **40.39%** | 2048 |
| ZR1-1.5B (direct answer prompt) | 37% | 2048 |
| Qwen-2.5-Math-1.5B-Instruct  | 32.25% | 2048 |
| Qwen-2.5-Math-7B-Instruct | 37.01% | 2048 |

For Leetcode and LiveBench, we report pass@1 accuracy with greedy sampling. For the rest of the evaluations we report pass@1 accuracy averaged over 16 samples per question, with temperature 0.6 and top_p 0.95.

We use the following settings for SGLang:

```
python -m sglang.launch_server --model-path <model> --host 0.0.0.0 --port 5001 --mem-fraction-static=0.8 --dtype bfloat16 --random-seed 0 --chunked-prefill-size -1 --attention-backend triton --sampling-backend pytorch --disable-radix-cache --disable-cuda-graph-padding  --disable-custom-all-reduce --disable-mla --triton-attention-reduce-in-fp32
```

For vllm we disable prefix caching and chunked prefill.


## Citation
```bash
@misc{zyphra2025ZR1,
  title     = {ZR1-1.5B: A small but powerful reasoning model for math and code},
  author    = {Zyphra},
  year      = {2025},
}
```
