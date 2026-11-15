<h1 align="center">Arctic-AWM-14B</h1>

<h3 align="center">Agent World Model: Infinity Synthetic Environments for Agentic Reinforcement Learning</h3>

<p align="center">
  <a href="https://github.com/Raibows">Zhaoyang Wang<sup>1</sup></a>,
  <a href="https://www.canwenxu.net/">Canwen Xu<sup>2</sup></a>,
  <a href="https://www.snowflake.com/en/blog/authors/boyi-liu/">Boyi Liu<sup>2</sup></a>,
  <a href="https://yitewang.github.io/">Yite Wang<sup>2</sup></a>,
  <a href="https://lillianwei-h.github.io/">Siwei Han<sup>1</sup></a>,<br/>
  <a href="https://yaozhewei.github.io/">Zhewei Yao<sup>2</sup></a>,
  <a href="https://www.huaxiuyao.io/">Huaxiu Yao<sup>1</sup></a>,
  <a href="https://www.snowflake.com/en/blog/authors/yuxiong-he/">Yuxiong He<sup>2</sup></a>
</p>
<p align="center">
  <sup>1</sup>UNC-Chapel Hill &nbsp; <sup>2</sup>Snowflake AI Research &nbsp;
</p>



# Overview

**Arctic-AWM-14B** is a multi-turn tool-use agent model trained with agentic reinforcement learning on [Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B), using the fully synthetic environments from [AgentWorldModel-1K](https://huggingface.co/datasets/Snowflake/AgentWorldModel-1K).

The model is trained to interact with tool-use environments exposed via a unified MCP (Model Context Protocol) interface, enabling strong multi-turn agentic capabilities.

For detailed usage of the model, please visit [https://github.com/Snowflake-Labs/agent-world-model](https://github.com/Snowflake-Labs/agent-world-model).

# Resources

Related resources are also available, please check:

| Resource | Link |
|----------|------|
| 📄 Paper | [📄 arxiv.org/abs/2602.10090](https://arxiv.org/abs/2602.10090) |
| 💻 Code | [💻 Snowflake-Labs/agent-world-model](https://github.com/Snowflake-Labs/agent-world-model) |
| 📦 AgentWorldModel-1K | [🤗 Snowflake/AgentWorldModel-1K](https://huggingface.co/datasets/Snowflake/AgentWorldModel-1K) |
| 🤖 Arctic-AWM-4B | [🤗 Snowflake/Arctic-AWM-4B](https://huggingface.co/Snowflake/Arctic-AWM-4B) |
| 🤖 Arctic-AWM-8B | [🤗 Snowflake/Arctic-AWM-8B](https://huggingface.co/Snowflake/Arctic-AWM-8B) |
| 🤖 Arctic-AWM-14B | [🤗 Snowflake/Arctic-AWM-14B](https://huggingface.co/Snowflake/Arctic-AWM-14B) |

# Citation

If you find this resource useful, please kindly cite:

```bibtex
@article{wang2026agentworldmodelinfinity,
      title={Agent World Model: Infinity Synthetic Environments for Agentic Reinforcement Learning}, 
      author={Zhaoyang Wang and Canwen Xu and Boyi Liu and Yite Wang and Siwei Han and Zhewei Yao and Huaxiu Yao and Yuxiong He},
      year={2026},
      eprint={2602.10090},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2602.10090}, 
}
```
