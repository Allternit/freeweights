# INTELLECT-2

INTELLECT-2 is a 32 billion parameter language model trained through a reinforcement learning run leveraging globally distributed, permissionless GPU resources contributed by the community.

The model was trained using [prime-rl](https://github.com/PrimeIntellect-ai/prime-rl), a framework designed for distributed asynchronous RL, using GRPO over verifiable rewards along with modifications for improved training stability. For detailed information on our infrastructure and training recipe, see our [technical report](https://www.primeintellect.ai/intellect-2).


![image/png](https://cdn-uploads.huggingface.co/production/uploads/64a32edf17b9f57eaec2ea65/KxI7k7byQs4ATme0naIzV.png)

## Model Information

- Training Dataset (verifiable math & coding tasks): [PrimeIntellect/Intellect-2-RL-Dataset](https://huggingface.co/datasets/PrimeIntellect/INTELLECT-2-RL-Dataset)
- Base Model: [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B)
- Training Code: [prime-rl](https://github.com/PrimeIntellect-ai/prime-rl)

## Usage

INTELLECT-2 is based on the `qwen2` architecture, making it compatible with popular libraries and inference engines such as [vllm](https://github.com/vllm-project/vllm) or [sglang](https://github.com/sgl-project/sglang).

Given that INTELLECT-2 was trained with a length control budget, you will achieve the best results by appending the prompt `"Think for 10000 tokens before giving a response."` to your instruction. As reported in our technical report, the model did not train for long enough to fully learn the length control objective, which is why results won't differ strongly if you specify lengths other than 10,000. If you wish to do so, you can expect the best results with 2000, 4000, 6000 and 8000, as these were the other target lengths present during training.

## Performance

During training, INTELLECT-2 improved upon QwQ in its mathematical and coding abilities. Performance on IFEval slightly decreased, which can likely be attributed to the lack of diverse training data and pure focus on mathematics and coding.

![image/png](https://cdn-uploads.huggingface.co/production/uploads/64a32edf17b9f57eaec2ea65/4k_Nmj2g8MqC7I6ORIkMH.png)

| **Model**           | **AIME24** | **AIME25** | **LiveCodeBench (v5)** | **GPQA-Diamond** | **IFEval** |
| ------------------- | ---------- | ---------- | ---------------------- | ---------------- | ---------- |
| INTELLECT-2        | **78.8**   | 64.9       | **67.8**               | 66.8             | 81.5       |
| QwQ-32B             | 76.6       | 64.8       | 66.1                   | 66.3             | 83.4       |
| Qwen-R1-Distill-32B | 69.9       | 58.4       | 55.1                   | 65.2             | 72.0       |
| Deepseek-R1         | 78.6       | 65.1       | 64.1                   | 71.6             | 82.7       |



## Citation

Feel free to cite INTELLECT-2:

```
@misc{primeintellectteam2025intellect2reasoningmodeltrained,
      title={INTELLECT-2: A Reasoning Model Trained Through Globally Decentralized Reinforcement Learning}, 
      author={Prime Intellect Team and Sami Jaghouar and Justus Mattern and Jack Min Ong and Jannik Straube and Manveer Basra and Aaron Pazdera and Kushal Thaman and Matthew Di Ferrante and Felix Gabriel and Fares Obeid and Kemal Erdem and Michael Keiblinger and Johannes Hagemann},
      year={2025},
      eprint={2505.07291},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2505.07291}, 
}
```
