<div align="center">

<img src="figures/nbg.png" width="220" alt="Nanbeige Logo">
</div>


# News
🎉 In the [**Berkeley Function Calling Leaderboard**](https://gorilla.cs.berkeley.edu/leaderboard.html), Nanbeige4-3B-Thinking-2511 secures #25 overall—ranking among the top 10 open-source models and outperforming Qwen3-32B. This highlights its strong agentic reasoning and reliable function-calling capability, despite its compact size.

🎉 Nanbeige4-3B-Thinking-2511 ranks #15 on [**EQBench3**](https://eqbench.com/), demonstrating human-preference alignment and emotional intelligence comparable to much larger models.

🎉 Nanbeige4-3B-Thinking-2511 debuts at #11 on [**WritingBench**](https://huggingface.co/spaces/WritingBench/WritingBench)! Despite only 3B parameters, its creative-writing ability chops rival those of hundred-billion-parameter giants.

# Introduction
Nanbeige4-3B-Thinking-2511 is an enhanced iteration over our previous Nanbeige4-3B-Thinking-2510.
Through advanced knowledge distillation techniques and targeted reinforcement learning (RL) optimization, we have significantly scaled the model’s reasoning capabilities, delivering stronger and more reliable performance on diverse challenging benchmarks.
This version establishes new state-of-the-art (SOTA) results among open models under 32B parameters on AIME, GPQA-Diamond, Arena-Hard-V2, and BFCL-V4, which marks a major milestone in delivering powerful yet efficient reasoning capabilities at a compact scale.

* Technical Report: https://arxiv.org/pdf/2512.06266

<div align="center">

<img src="figures/nbg_performance.png">
</div>





## <span id="Inference">Quickstart</span>

For inference hyperparameters, we recommend the following settings:
* Temperature: 0.6
* Top-p: 0.95
* Repeat penalty: 1.0

For the chat scenario:
```
from transformers import AutoModelForCausalLM, AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(
  'Nanbeige/Nanbeige4-3B-Thinking-2511',
  use_fast=False,
  trust_remote_code=True
)
model = AutoModelForCausalLM.from_pretrained(
  'Nanbeige/Nanbeige4-3B-Thinking-2511',
  torch_dtype='auto',
  device_map='auto',
  trust_remote_code=True
)
messages = [
  {'role': 'user', 'content': 'Which number is bigger, 9.11 or 9.8?'}
]
prompt = tokenizer.apply_chat_template(
  messages,
  add_generation_prompt=True,
  tokenize=False
)
input_ids = tokenizer(prompt, add_special_tokens=False, return_tensors='pt').input_ids
output_ids = model.generate(input_ids.to('cuda'), eos_token_id=166101)
resp = tokenizer.decode(output_ids[0][len(input_ids[0]):], skip_special_tokens=True)
print(resp)
```

For the tool use scenario:
```
from transformers import AutoModelForCausalLM, AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(
  'Nanbeige/Nanbeige4-3B-Thinking-2511',
  use_fast=False,
  trust_remote_code=True
)
model = AutoModelForCausalLM.from_pretrained(
  'Nanbeige/Nanbeige4-3B-Thinking-2511',
  torch_dtype='auto',
  device_map='auto',
  trust_remote_code=True
)
messages = [
    {'role': 'user',  'content': 'Help me check the weather in Beijing now'}
]
tools = [{'type': 'function',
  'function': {'name': 'SearchWeather',
   'description': 'Find out current weather in a certain place on a certain day.',
   'parameters': {'type': 'dict',
    'properties': {'location': {'type': 'string',
      'description': 'A city in china.'},
    'required': ['location']}}}}]
prompt = tokenizer.apply_chat_template(
  messages,
  tools,
  add_generation_prompt=True,
  tokenize=False
)
input_ids = tokenizer(prompt, add_special_tokens=False, return_tensors='pt').input_ids
output_ids = model.generate(input_ids.to('cuda'), eos_token_id=166101)
resp = tokenizer.decode(output_ids[0][len(input_ids[0]):], skip_special_tokens=True)
print(resp)
```


# <span id="Limitations">Limitations</span>

While we place great emphasis on the safety of the model during the training process, striving to ensure that its outputs align with ethical and legal requirements, it may not completely avoid generating unexpected outputs due to the model's size and probabilistic nature. These outputs may include harmful content such as bias or discrimination. Please don't propagate such content. We do not assume any responsibility for the consequences resulting from the dissemination of inappropriate information.
<br>

# <span id="Limitations">Citation</span>
If you find our model useful or want to use it in your projects, please cite as follows:
```
@misc{yang2025nanbeige43btechnicalreportexploring,
      title={Nanbeige4-3B Technical Report: Exploring the Frontier of Small Language Models}, 
      author={Chen Yang and Guangyue Peng and Jiaying Zhu and Ran Le and Ruixiang Feng and Tao Zhang and Wei Ruan and Xiaoqi Liu and Xiaoxue Cheng and Xiyun Xu and Yang Song and Yanzipeng Gao and Yiming Jia and Yun Xing and Yuntao Wen and Zekai Wang and Zhenwei An and Zhicong Sun and Zongchao Chen},
      year={2025},
      eprint={2512.06266},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2512.06266}, 
}
```
<br>

# <span id="Limitations">Contact</span>
If you have any questions, please raise an issue or contact us at nanbeige@126.com.
<br>