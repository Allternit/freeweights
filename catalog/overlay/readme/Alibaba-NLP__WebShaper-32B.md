# WebShaper: Agentically Data Synthesizing via Information-Seeking Formalization



**Github:** https://github.com/Alibaba-NLP/WebAgent

**Paper:** https://arxiv.org/pdf/2507.15061




## TLTR
WebShaper is a synthesized training dataset for information-seeking (IS) task. It is based on our proposed task formalization of IS, and synthesized by our Expander Agent. WebShaper would cover a broader range of task forms, reasoning structure, and diversified knowledge.

## Description
The advent of Large Language Model (LLM)-powered agents has revolutionized artificial intelligence by enabling solutions to complex, open-ended tasks through web-based information-seeking (IS) capabilities.

The scarcity of high-quality training data has limited the development of IS agents. Existing data synthesis approaches typically adopt an information-driven paradigm that first collects web data and then generates questions based on the retrieval. However, this may lead to inconsistency between information structure and reasoning structure, as well as between the question and the corresponding answer.

To mitigate, we propose a formalization-driven IS data synthesis framework, WebShaper, which systematically formalizes IS tasks using set-theoretic constructs. Central to the formalization is the concept of Knowledge Projections (KP), which enables precise control over reasoning structure by KP operation compositions. During synthesis, we begin by creating seed tasks, then use a multi-step expansion process. At each step, an agentic Expander expands the current formal question more complex with retrieval and validation tools based on our formalization.

We release 500 data. More data is coming soon!

## How to use
Data fields:

● id: Unique id of each data.

● question: Synthesized question in natural language.

● formalization: formalization of the question in our list representation. 

● answer: Answer for the question.

● urls: all urls for retrieved and used information for the question.


## 🚩 Citation

If this work is helpful, please kindly cite as:

```bigquery
@misc{tao2025webshaperagenticallydatasynthesizing,
      title={WebShaper: Agentically Data Synthesizing via Information-Seeking Formalization}, 
      author={Zhengwei Tao and Jialong Wu and Wenbiao Yin and Junkai Zhang and Baixuan Li and Haiyang Shen and Kuan Li and Liwen Zhang and Xinyu Wang and Yong Jiang and Pengjun Xie and Fei Huang and Jingren Zhou},
      year={2025},
      eprint={2507.15061},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2507.15061}, 
}
```


