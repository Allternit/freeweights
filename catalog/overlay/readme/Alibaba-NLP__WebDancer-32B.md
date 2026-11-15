This model was presented in the paper [WebDancer: Towards Autonomous Information Seeking Agency](https://huggingface.co/papers/2505.22648).

You can download the model then run the inference scipts in https://github.com/Alibaba-NLP/WebAgent.

- Native agentic search reasoning model using ReAct framework towards autonomous information seeking agency and Deep Research-like model.
- We introduce a four-stage training paradigm comprising browsing data construction, trajectory sampling, supervised fine-tuning for effective cold start, and reinforcement learning for improved generalization, enabling the agent to autonomously acquire autonomous search and reasoning skills.
- Our data-centric approach integrates trajectory-level supervision fine-tuning and reinforcement learning (DAPO) to develop a scalable pipeline for training agentic systems via SFT or RL.
- WebDancer achieves a Pass@3 score of 61.1% on GAIA and 54.6% on WebWalkerQA.