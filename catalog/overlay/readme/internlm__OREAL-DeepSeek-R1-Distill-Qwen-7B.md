# OREAL-DeepSeek-R1-Distill-Qwen-7B

## Links

- [Arxiv](https://arxiv.org/abs/2502.06781)
- [Github](https://github.com/InternLM/OREAL)
- [Model Collection](https://huggingface.co/collections/internlm/oreal-67aaccf5a8192c1ba3cff018)
- [Data](https://huggingface.co/datasets/InternLM/OREAL-RL-Prompts)

## Introduction

We introduce **OREAL-7B** and **OREAL-32B**, a mathematical reasoning model series trained using **O**utcome **RE**w**A**rd-based reinforcement **L**earning, a novel RL framework designed for tasks where only binary outcome rewards are available. 

With **OREAL**, a [**7B model**](https://huggingface.co/internlm/OREAL-DeepSeek-R1-Distill-Qwen-7B) achieves **94.0 pass@1** accuracy on MATH-500, matching the performance of previous 32B models. [**OREAL-32B**](https://huggingface.co/internlm/OREAL-32B) further surpasses previous distillation-trained 32B models, reaching **95.0 pass@1** accuracy on MATH-500.  

![main_fig](./figs/main_fig.jpg)

Our method leverages best-of-N (BoN) sampling for behavior cloning and reshapes negative sample rewards to ensure gradient consistency. Also, to address the challenge of sparse rewards in long chain-of-thought reasoning, we incorporate an on-policy token-level reward model that identifies key tokens in reasoning trajectories for importance sampling. For more details, please refer to our [paper]().

## Evaluation Results

| Model                              | MATH-500 | AIME2024 | AIME2025-I | LiveMath | Olympiad |
|------------------------------------|---------|---------|-----------|---------|----------|
| **API Models**                     |         |         |           |         |          |
| GPT-4o-1120                        | 72.8    | 16.7    | 13.3      | 44.8    | 33.7     |
| Claude-3.5-Sonnet-1022             | 78.3    | 13.3    | 3.3       | 46.7    | 35.4     |
| OpenAI-o1-preview                  | 85.5    | 44.6    | 40.0      | 71.0    | 43.6     |
| OpenAI-o1-mini                     | 90.0    | 56.6    | 46.7      | 74.4    | 46.3     |
| **7B Models**                      |         |         |           |         |          |
| Qwen2.5-Instrust-7B                | 76.6    | 13.3    | 0.0       | 37.0    | 29.1     |
| Qwen2.5-Math-Instrust-7B           | 81.8    | 20.0    | 13.3      | 44.1    | 31.1     |
| rStar-Math-7B                      | 78.4*   | 26.7*   | -         | -       | 47.1*    |
| Qwen2.5-7B-SimpleRL                | 82.4*   | 26.7*   | -         | -       | 37.6*    |
| Eurus-2-7B-PRIME                   | 79.2*   | 26.7*   | -         | -       | 42.1*    |
| DeepSeek-R1-Distill-Qwen-7B        | _92.8*_ | **55.5*** | **40.0**  | **65.6** | _64.1_  |
| **OREAL-7B**                       | 91.0    | 33.3    | 33.3      | 62.6    | 59.9     |
| **OREAL-DSR1-Distill-Qwen-7B**     | **94.0** | _50.0_  | **40.0**  | **65.6** | **66.1** |
| **32B Models**                     |         |         |           |         |          |
| Qwen2.5-Instrust-32B               | 80.6    | 20.0    | 13.3      | 50.8    | 40.4     |
| QwQ-32B-Preview                    | 90.6    | 50.0    | 40.0      | _72.7_  | 58.5     |
| DeepSeek-R1-Distill-Qwen-32B       | 94.3*   | **72.6*** | **46.7**  | 67.7    | _71.2_  |
| **OREAL-32B**                      | **95.0** | _60.0_  | **46.7**  | **74.8** | **72.4** |


**Note:** Overall evaluation results for **OREAL** and each baseline.
**OREAL-DSR1-Distill-Qwen-7B** denotes the DeepSeek-R1-Distill-Qwen-7B trained by **OREAL**.
`AIME2025-I`, `LiveMath`, and `Olympiad` represent `AIME 2025 Part1`, `LiveMathBench`, and `OlympiadBench`, respectively.
For models at the parameter scale of 7B and 32B, we use Bold and Italics to represent the best and second best performance, respectively. For part of the baseline, we directly use the results from their report, marked with *. We use [LMDeploy](https://github.com/InternLM/LMDeploy) to inference and use [OpenCompass](https://github.com/open-compass/opencompass) to evaluate the performance of the models.


## Model Collection

We release not only the **RL** models, but also the **SFT** models for the **OREAL** series. We hope this can help the community and benefit the research of Math Reasoning RL.

| Model | Link |
|-------|------|
|**RL Models**|
| OREAL-7B | [Hugging Face](https://huggingface.co/internlm/OREAL-7B) |
| OREAL-DSR1-Distill-Qwen-7B | [Hugging Face](https://huggingface.co/internlm/OREAL-DeepSeek-R1-Distill-Qwen-7B) |
| OREAL-32B | [Hugging Face](https://huggingface.co/internlm/OREAL-32B) |
| **SFT Models** | 
| OREAL-7B-SFT | [Hugging Face](https://huggingface.co/internlm/OREAL-7B-SFT) |
| OREAL-32B-SFT | [Hugging Face](https://huggingface.co/internlm/OREAL-32B-SFT) |

We also release the prompts utilzed in our RL training phase.

| Dataset | Link |
|---------|------|
| RL Prompts | [Hugging Face](https://huggingface.co/datasets/InternLM/OREAL-RL-Prompts) |

## Usage

OREAL-7B and OREAL-32B use a system prompt to guide the model to reason during training and testing time. The system prompt is as follows:

```python
system_prompt = "You are an expert mathematician with extensive experience in mathematical competitions. You approach problems through systematic thinking and rigorous reasoning. When solving problems, follow these thought processes:\n\n## Deep Understanding\nTake time to fully comprehend the problem before attempting a solution. Consider:\n- What is the real question being asked?\n- What are the given conditions and what do they tell us?\n- Are there any special restrictions or assumptions?\n- Which information is crucial and which is supplementary?\n\n## Multi-angle Analysis\nBefore solving, conduct thorough analysis:\n- What mathematical concepts and properties are involved?\n- Can you recall similar classic problems or solution methods?\n- Would diagrams or tables help visualize the problem?\n- Are there special cases that need separate consideration?\n\n## Systematic Thinking\nPlan your solution path:\n- Propose multiple possible approaches\n- Analyze the feasibility and merits of each method\n- Choose the most appropriate method and explain why\n- Break complex problems into smaller, manageable steps\n\n## Rigorous Proof\nDuring the solution process:\n- Provide solid justification for each step\n- Include detailed proofs for key conclusions\n- Pay attention to logical connections\n- Be vigilant about potential oversights\n\n## Repeated Verification\nAfter completing your solution:\n- Verify your results satisfy all conditions\n- Check for overlooked special cases\n- Consider if the solution can be optimized or simplified\n- Review your reasoning process\n\nRemember:\n1. Take time to think thoroughly rather than rushing to an answer\n2. Rigorously prove each key conclusion\n3. Keep an open mind and try different approaches\n4. Summarize valuable problem-solving methods\n5. Maintain healthy skepticism and verify multiple times\n\nYour response should reflect deep mathematical understanding and precise logical thinking, making your solution path and reasoning clear to others.\n\nWhen you're ready, present your complete solution with:\n- Clear problem understanding\n- Detailed solution process\n- Key insights\n- Thorough verification\n\nFocus on clear, logical progression of ideas and thorough explanation of your mathematical reasoning. Provide answers in the same language as the user asking the question, repeat the final answer using a '\\boxed{}' without any units, you have [[8192]] tokens to complete the answer."
```

For OREAL-DSR1-Distill-Qwen-7B, we use the default chat template of its original model.

The chat template for these models are already set in the tokenizer_config.json file. Use the `tokenizer.apply_chat_template()` function to apply the chat template.

```python
question = [{'role': 'user', 'content': 'What is the sum of the first 100 natural numbers?'}]
tokenizer.apply_chat_template(question, add_generation_prompt=True)
```


## Citation

If you find this work useful in your research, please consider citing:

```bibtex
@article{lyu2025exploring,
  title={Exploring the Limit of Outcome Reward for Learning Mathematical Reasoning},
  author={Lyu, Chengqi and Gao, Songyang and Gu, Yuzhe and Zhang, Wenwei and Gao, Jianfei and Liu, Kuikun and Wang, Ziyi and Li, Shuaibin and Zhao, Qian and Huang, Haian and others},
  journal={arXiv preprint arXiv:2502.06781},
  year={2025}
}
```