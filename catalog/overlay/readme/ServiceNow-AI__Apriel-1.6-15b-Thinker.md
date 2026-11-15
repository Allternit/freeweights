# Apriel-1.6-15B-Thinker: Cost-efficient Frontier Multimodal Performance

<img src="https://cdn-uploads.huggingface.co/production/uploads/63d3095c2727d7888cbb54e2/Lt1t0tOO5emz1X23Azg-E.png" width="120" alt="thumbnail"/>      `/ˈɑː.pri.əl/`

---

# Table of Contents

1. [Summary](#summary)  
2. [Evaluation](#evaluation)  
3. [Intended Use](#intended-use)
4. [How to Use](#how-to-use) 
5. [Training Details](#training-details)  
6. [Limitations](#limitations)  
7. [Security and Responsible Use](#security-and-responsible-use)  
8. [License](#license)
9. [Citation](#citation)

---

# Summary

**Apriel-1.6-15B-Thinker** is an updated multimodal reasoning model in ServiceNow’s Apriel SLM series, building on [**Apriel-1.5-15B-Thinker**](https://huggingface.co/ServiceNow-AI/Apriel-1.5-15b-Thinker).
With significantly improved text and image reasoning capabilities, Apriel-1.6 achieves competitive performance against models up to 10x its size.
Like its predecessor, it benefits from extensive continual pre-training across both text and image domains.
We additionally perform post-training that focuses on Supervised Finetuning (SFT) and Reinforcement Learning (RL).
Apriel-1.6 obtains frontier performance without sacrificing reasoning token efficiency.
The model improves or maintains task performance when compared with Apriel-1.5-15B-Thinker, while **reducing reasoning token usage by more than 30\%**.

**Highlights**

- Achieves a score of **57** on the Artificial Analysis index outperforming models like Gemini 2.5 Flash, Claude Haiku 4.5 and GPT OSS 20b. It obtains a score on par with Qwen3 235B A22B, while being significantly more efficient.
- **Reduces reasoning token usage by more than 30%**, delivering significantly better efficiency than Apriel-1.5-15B-Thinker.
- Scores **69** on Tau2 Bench Telecom and **69** on IFBench, which are key benchmarks for the enterprise domain.
- At 15B parameters, the model fits on a single GPU, making it highly memory-efficient.
- Based on community feedback on Apriel-1.5-15B-Thinker, we simplified the chat template by removing redundant tags and introduced four special tokens to the tokenizer (`<tool_calls>`, `</tool_calls>`, `[BEGIN FINAL RESPONSE]`, `<|end|>`) for easier output parsing.

Please see our [blog post](https://huggingface.co/blog/ServiceNow-AI/apriel-1p6-15b-thinker) for more details

---

# Evaluation

- Text benchmarks included in the Artificial Analysis Index v3.0 use scores reported by [Artificial Analysis](https://artificialanalysis.ai/). All other benchmarks were evaluated internally.

  <table>
    <tr>
      <th>Category</th>
      <th>Benchmark</th>
      <th>Apriel-1.6-15B-Thinker</th>
      <th>Apriel-1.5-15B-Thinker</th>
      <th>GPT OSS 120B</th>
      <th>DeepSeek R1 0528</th>
      <th>Gemini 2.5 Flash (Sep)</th>
      <th>GPT 5 mini (high)</th>
      <th>Claude 4.5 Sonnet (thinking)</th>
      <th>o3-mini (high)</th>
    </tr>
    <tr>
      <td></td>
      <td>Average Score**</td>
      <td>53.62</td>
      <td>46.56</td>
      <td>52.56</td>
      <td>51.92</td>
      <td>50.71</td>
      <td>62.58</td>
      <td>60.37</td>
      <td>48.85</td>
    </tr>
    <!-- Function Calling -->
    <tr>
      <td rowspan="5" class="category">Function Calling</td>
      <td>BFCL v3 only</td>
      <td>63.50</td>
      <td>51.88</td>
      <td>50.62</td>
      <td>39.75</td>
      <td>39.75</td>
      <td>17.62</td>
      <td>-</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Tau2 bench Telecom</td>
      <td>69</td>
      <td>57.8</td>
      <td>66</td>
      <td>37</td>
      <td>32</td>
      <td>68</td>
      <td>50.8</td>
      <td>31</td>
    </tr>
    <tr>
      <td>Tau2 bench Retail</td>
      <td>66.67</td>
      <td>46.78</td>
      <td>61.4</td>
      <td>59.94</td>
      <td>61.69</td>
      <td>73.39</td>
      <td>69.8</td>
      <td>75.73</td>
    </tr>
    <tr>
      <td>Tau2 bench Airline</td>
      <td>58</td>
      <td>52</td>
      <td>45.3</td>
      <td>47.33</td>
      <td>56.66</td>
      <td>59.33</td>
      <td>58</td>
      <td>61.33</td>
    </tr>
    <tr>
      <td>ComplexFuncBench</td>
      <td>33.2</td>
      <td>19</td>
      <td>24.6</td>
      <td>24.2</td>
      <td>26.3</td>
      <td>37.5</td>
      <td>24.6</td>
      <td>18.9</td>
    </tr>

    <!-- Instruction Following -->
    <tr>
      <td rowspan="4" class="category">Instruction Following</td>
      <td>Agent IF</td>
      <td>57.2</td>
      <td>55</td>
      <td>54.20</td>
      <td>52.20</td>
      <td>49.70</td>
      <td>57.60</td>
      <td>54.50</td>
      <td>54.90</td>
    </tr>
    <tr>
      <td>Multi IF</td>
      <td>83.34</td>
      <td>76.91</td>
      <td>82.95</td>
      <td>73.76</td>
      <td>82.49</td>
      <td>85.37</td>
      <td>84.32</td>
      <td>87.28</td>
    </tr>
    <tr>
      <td>Multi-Challenge</td>
      <td>46.15</td>
      <td>41.39</td>
      <td>46.90</td>
      <td>44.50</td>
      <td>49.08</td>
      <td>57.90</td>
      <td>42.49</td>
      <td>38.46</td>
    </tr>
    <tr>
      <td>IF Bench</td>
      <td>69</td>
      <td>62</td>
      <td>69</td>
      <td>40</td>
      <td>50</td>
      <td>75</td>
      <td>57</td>
      <td>70.07</td>
    </tr>

    <!-- Math -->
    <tr>
      <td class="category">Math</td>
      <td>AIME 25</td>
      <td>88</td>
      <td>88</td>
      <td>93</td>
      <td>76</td>
      <td>73</td>
      <td>91</td>
      <td>88</td>
      <td>86.67</td>
    </tr>

    <!-- Coding -->
    <tr>
      <td rowspan="3" class="category">Coding</td>
      <td>Struct Eval</td>
      <td>79</td>
      <td>48.50</td>
      <td>71</td>
      <td>73</td>
      <td>70</td>
      <td>69.92</td>
      <td>76</td>
      <td>73</td>
    </tr>
    <tr>
      <td>LCB</td>
      <td>81</td>
      <td>73</td>
      <td>88</td>
      <td>77</td>
      <td>70</td>
      <td>84</td>
      <td>71</td>
      <td>73</td>
    </tr>
    <tr>
      <td>SciCode</td>
      <td>37</td>
      <td>35</td>
      <td>39</td>
      <td>40</td>
      <td>41</td>
      <td>39</td>
      <td>45</td>
      <td>40</td>
    </tr>

    <!-- Agentic -->
    <tr>
      <td rowspan="7" class="category">Agentic</td>
      <td>DeepresearchBench</td>
      <td>36.47</td>
      <td>32.73</td>
      <td>36.30</td>
      <td>34.19</td>
      <td>38.15</td>
      <td>-</td>
      <td>-</td>
      <td>33.40</td>
    </tr>
    <tr>
      <td>GAIA</td>
      <td>40</td>
      <td>30.91</td>
      <td>21.21</td>
      <td>32.12</td>
      <td>47.88</td>
      <td>65.45</td>
      <td>69.09</td>
      <td>23.03</td>
    </tr>
    <tr>
      <td>Work-Arena L1</td>
      <td>59.1</td>
      <td>51.5</td>
      <td>50.9</td>
      <td>63.9</td>
      <td>51.8</td>
      <td>65.5</td>
      <td>62.7</td>
      <td>52.4</td>
    </tr>
    <tr>
      <td>OS World Small</td>
      <td>16.70</td>
      <td>13.90</td>
      <td>16.70</td>
      <td>25</td>
      <td>19.40</td>
      <td>22.20</td>
      <td>30.60</td>
      <td>19.40</td>
    </tr>
    <tr>
      <td>SWE Bench Verified</td>
      <td>23</td>
      <td>16</td>
      <td>31</td>
      <td>29.60</td>
      <td>34.20</td>
      <td>61</td>
      <td>64.2</td>
      <td>22.60</td>
    </tr>
    <tr>
      <td>Terminal Bench</td>
      <td>14</td>
      <td>10</td>
      <td>22</td>
      <td>15</td>
      <td>13</td>
      <td>31</td>
      <td>33</td>
      <td>5.67</td>
    </tr>
    <tr>
      <td>Aider Polyglot</td>
      <td>37.68</td>
      <td>26.37</td>
      <td>42</td>
      <td>71.40</td>
      <td>40</td>
      <td>71.60</td>
      <td>78</td>
      <td>60.40</td>
    </tr>

    <!-- Knowledge -->
    <tr>
      <td class="category">Knowledge</td>
      <td>MMLU Pro</td>
      <td>79</td>
      <td>77</td>
      <td>81</td>
      <td>85</td>
      <td>83</td>
      <td>84</td>
      <td>88</td>
      <td>80</td>
    </tr>

    <!-- Creative Writing -->
    <tr>
      <td class="category">Creative Writing</td>
      <td>Creative writing v3 / EQ Bench</td>
      <td>59.73</td>
      <td>60.24</td>
      <td>53.70</td>
      <td>79.40</td>
      <td>74.25</td>
      <td>75.25</td>
      <td>80.70</td>
      <td>30.40</td>
    </tr>

    <!-- Others -->
    <tr>
      <td rowspan="2" class="category">Others</td>
      <td>GPQA Diamond</td>
      <td>73</td>
      <td>71</td>
      <td>78</td>
      <td>81</td>
      <td>79</td>
      <td>83</td>
      <td>83</td>
      <td>77</td>
    </tr>
    <tr>
      <td>HLE</td>
      <td>10</td>
      <td>12</td>
      <td>18.5</td>
      <td>14.9</td>
      <td>11.1</td>
      <td>19.7</td>
      <td>17.3</td>
      <td>12.3</td>
    </tr>

    <!-- Long Context -->
    <tr>
      <td class="category">Long Context</td>
      <td>AA LCR</td>
      <td>50*</td>
      <td>20</td>
      <td>51</td>
      <td>55</td>
      <td>62</td>
      <td>68</td>
      <td>66</td>
      <td>30***</td>
    </tr>
  </table>



\* This score is with [DCA](https://arxiv.org/pdf/2402.17463) enabled. Without this, the model scores 36.

\** The average score is calculated using all benchmarks except BFCL v3 Only and DeepResearchBench, since some models do not have scores for these two benchmarks.

\*** AA LCR score for o3-mini-high is projected score based on its AA Index score.

---

- For image benchmarks, we report evaluations obtained by https://github.com/open-compass/VLMEvalKit

<table>
  <tr>
   <td><strong>Benchmark</strong>
   </td>
   <td><strong>Apriel-1.6-15B-Thinker</strong>
   </td>
   <td><strong>Apriel-1.5-15B-Thinker</strong>
   </td>
   <td><strong>GPT-5 (high)</strong>
   </td>
   <td><strong>GLM-4.5V (Thinking)</strong>
   </td>
   <td><strong>Gemini 2.5 Flash (high)</strong>
   </td>
   <td><strong>Claude Sonnet 3.7 (Thinking)</strong>
   </td>
   <td><strong>GPT-5 (Minimal)</strong>
   </td>
   <td><strong>Grok 4 Fast (Thinking)</strong>
   </td>
  </tr>
  <tr>
   <td> MMMU (validation)
   </td>
   <td> 72
   </td>
   <td> 70.22
   </td>
   <td> 81.33
   </td>
   <td> 74.33
   </td>
   <td> 70.66
   </td>
   <td> 73.66
   </td>
   <td> 66.66
   </td>
   <td> 70.11
   </td>
  </tr>
  <tr>
   <td>MMMU-PRO (10 choice)
   </td>
   <td> 60.28
   </td>
   <td> 55.38
   </td>
   <td> 74.73
   </td>
   <td> 64.16
   </td>
   <td> 67.86
   </td>
   <td> 64.50
   </td>
   <td> 66.06
   </td>
   <td> 61.61
   </td>
  </tr>
  <tr>
   <td>MMMU-PRO (Vision Only)
   </td>
   <td> 52.89
   </td>
   <td> 48.21
   </td>
   <td> 66.93
   </td>
   <td> 61.50
   </td>
   <td> 56.76
   </td>
   <td> 60.11
   </td>
   <td> 57.68
   </td>
   <td> 22.94
   </td>
  </tr>
  <tr>
   <td>LogicVista
   </td>
   <td> 58.61
   </td>
   <td> 58.39
   </td>
   <td> 69.35
   </td>
   <td> 63.53
   </td>
   <td> 63.75
   </td>
   <td> 69.12
   </td>
   <td> 44.51
   </td>
   <td> 47.42
   </td>
  </tr>
  <tr>
   <td>MathVision
   </td>
   <td> 60.85
   </td>
   <td> 50.99
   </td>
   <td> 67.10
   </td>
   <td> 59.53
   </td>
   <td> 59.21
   </td>
   <td> 50.32
   </td>
   <td> 35.52
   </td>
   <td> 48.35
   </td>
  </tr>
  <tr>
   <td>MathVista
   </td>
   <td> 79.90
   </td>
   <td> 75.50
   </td>
   <td> 83.30
   </td>
   <td> 83.60
   </td>
   <td> 78.50
   </td>
   <td> 74.60
   </td>
   <td> 61.20
   </td>
   <td> 68.20
   </td>
  </tr>
  <tr>
   <td>MathVerse (Vision Dominant)
   </td>
   <td> 66.75
   </td>
   <td> 58.38
   </td>
   <td> 79.82
   </td>
   <td> 68.65
   </td>
   <td> 70.68
   </td>
   <td> 56.09
   </td>
   <td> 39.84
   </td>
   <td> 54.69
   </td>
  </tr>
  <tr>
   <td>MathVerse (Text Dominant)
   </td>
   <td> 79.06
   </td>
   <td> 76.40
   </td>
   <td> 84.64
   </td>
   <td> 77.41
   </td>
   <td> 78.80
   </td>
   <td> 69.28
   </td>
   <td> 43.78
   </td>
   <td> 72.20
   </td>
  </tr>
  <tr>
   <td>MMStar
   </td>
   <td> 70.66
   </td>
   <td> 67.73
   </td>
   <td> 77.74
   </td>
   <td> 74.46
   </td>
   <td> 73.86
   </td>
   <td> 70
   </td>
   <td> 63.60
   </td>
   <td> 64.80
   </td>
  </tr>
    <tr>
   <td>CharXiv (descriptive)
   </td>
   <td> 89.85
   </td>
   <td> 88.20
   </td>
   <td> 91.25
   </td>
   <td> 90.80
   </td>
   <td> 83.60
   </td>
   <td> 93.27
   </td>
   <td> 82.45
   </td>
   <td> 68.15
   </td>
  </tr>
  <tr>
   <td>CharXiv (reasoning)
   </td>
   <td> 56.00
   </td>
   <td> 50.10
   </td>
   <td> 71.50
   </td>
   <td> 63.00
   </td>
   <td> 56.50
   </td>
   <td> 70.90
   </td>
   <td> 52.80
   </td>
   <td> 33.50
   </td>
  </tr>
  <tr>
   <td>AI2D Test
   </td>
   <td> 86.04
   </td>
   <td> 82.87
   </td>
   <td> 90.05
   </td>
   <td> 87.75
   </td>
   <td> 82.09
   </td>
   <td> 84.19
   </td>
   <td> 85.16
   </td>
   <td> 81.86
   </td>
  </tr>
  <tr>
   <td>BLINK
   </td>
   <td> 63.96
   </td>
   <td> 58.71
   </td>
   <td> 70.22
   </td>
   <td> 66.59
   </td>
   <td> 65.64
   </td>
   <td> 64.49
   </td>
   <td> 64.59
   </td>
   <td> 54.39
   </td>
  </tr>
</table>

---

# Intended Use

The Apriel family of models are designed for a variety of general-purpose instruction tasks, including:

- Code assistance and generation  
- Logical reasoning and multi-step tasks  
- Question answering and information retrieval
- Function calling, complex instruction following and agent use cases

They are **not intended** for use in safety-critical applications without human oversight or in scenarios requiring guaranteed factual accuracy.

---
# How to Use

```bash
pip install transformers
```

## Running the Reasoning model


Here is a code snippet demonstrating the model's usage with the transformers library's generate function:

```python
# Tested with transformers==4.48

import re
import requests
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForImageTextToText

# Load model
model_id = "ServiceNow-AI/Apriel-1.6-15b-Thinker"
model = AutoModelForImageTextToText.from_pretrained(
    model_id, 
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)
processor = AutoProcessor.from_pretrained(model_id)

# Example 1: Text-only prompt
chat = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What is the capital for France?"},
        ],
    }
]

inputs = processor.apply_chat_template(chat, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="pt")
inputs = {k: v.to(model.device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
inputs.pop("token_type_ids", None)

with torch.no_grad():
    output_ids = model.generate(**inputs, max_new_tokens=1024, do_sample=True, temperature=0.6)

generated_ids = output_ids[:, inputs['input_ids'].shape[1]:]
output = processor.decode(generated_ids[0], skip_special_tokens=True)
response = re.findall(r"\[BEGIN FINAL RESPONSE\](.*?)(?:<\|end\|>)", output, re.DOTALL)[0].strip()

print("Text-only Response:", response)

# Example 2: Image understanding
url = "https://picsum.photos/id/237/200/300"
image = Image.open(requests.get(url, stream=True).raw).convert("RGB")

chat = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "Which animal is this?"},
            {"type": "image"},
        ],
    }
]

prompt = processor.apply_chat_template(chat, add_generation_prompt=True, tokenize=False)
inputs = processor(text=prompt, images=[image], return_tensors="pt").to(model.device)

with torch.no_grad():
    output_ids = model.generate(**inputs, max_new_tokens=1024, do_sample=True, temperature=0.6)

generated_ids = output_ids[:, inputs['input_ids'].shape[1]:]
output = processor.decode(generated_ids[0], skip_special_tokens=True)
response = re.findall(r"\[BEGIN FINAL RESPONSE\](.*?)(?:<\|end\|>)", output, re.DOTALL)[0].strip()

print("Image Response:", response)

```

## Usage Guidelines
1. Use the model’s default chat template, which already includes a system prompt.
2. We recommend setting temperature to `0.6`. 
3. We ensure the model starts with `Here are my reasoning steps:\n` during all our evaluations. This is implemented in the default chat template.
4. For multi-turn conversations, intermediate turns (historical model outputs) are expected to contain only the final response, without reasoning steps.

---

## Chat Template


```
<|begin_system|>
You are a thoughtful, systematic AI assistant from ServiceNow Language Models (SLAM) lab. Analyze each question carefully, present your reasoning step-by-step, then provide the final response after the marker [BEGIN FINAL RESPONSE].
<|begin_user|>
# user message here
<|begin_assistant|>
Here are my reasoning steps:
# thoughts here
[BEGIN FINAL RESPONSE]
# assistant response here
<|end|>
```
The model will first generate its thinking process and then generate its final response, starting with `[BEGIN FINAL RESPONSE]`. Here is a code snippet demonstrating the application of the chat template:



```python
from transformers import AutoTokenizer
model_name = "ServiceNow-AI/Apriel-1.6-15b-Thinker"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# prepare the model input
custom_system_prompt = "Answer like a pirate."
prompt = "You are an expert assistant in the implementation of customer experience management aspect of retail applications \n \nYou will be using Python as the programming language. \n \nYou will utilize a factory design pattern for the implementation and following the dependency inversion principle \n \nYou will modify the implementation based on user requirements. \n \nUpon user request, you will add, update, and remove the features & enhancements in the implementation provided by you. \n \nYou will ask whether the user wants to refactor the provided code or needs a sample implementation for reference. Upon user confirmation, I will proceed accordingly. \n \n**Guidelines:** \n 1. **User Requirements:** \n - You have to ask users about their requirements, clarify the user expectations, and suggest the best possible solution by providing examples of Python code snippets. \n - Ask users about which type of reports they need to assess the AI model's performance, accuracy, and reliability. \n - After providing the solution, you have to ask the user about the trial of the solution and modify the solution based on the user feedback. \n \n 2. **Libraries/Frameworks:** \n - You will be utilizing Python as a programming language. \n - You will be using Flask framework for REST APIS implementation \n \n 3. **Communication Gesture:** \n - Your conversation with the user should be interactive, supportive, courageous, and professional. \n - You have to break down the complex concepts into sub-concepts and try to explain them to the user. \n - You have to ask the user for the required parameters. If the user refuses to provide in 2 attempts, politely exit the conversation. \n - You have to provide your supported parameters to the user, if the user refuses to accept them then you have to put an apology note and exit the conversation. \n - You have to track the conversation about unasked questions by the user. If some/one of the questions remain then you have to remind the user about these questions and proceed to answer them based on the user's confirmation \n \n 4. **Implementation:** \n - Your code/implementations should be reliable, scaleable, modular, and reusable. \n - You will be providing unit tests for the implementation upon user request. \n - You will be following MVC architecture for the applications \n - Your implementations must be well-commented and readable \n \n \n- Today's date is 23rd August 2024. \n- The default sender email is sender-assistant@email.com.\nHi, I am conducting research on retail customer feedback systems and I need assistance with designing and implementing them. Could you kindly provide me with a list of general customer feedback system modules?"
messages = [
    {"role": "user", "content": custom_system_prompt + "\n\n" + prompt}
]
# example tools
tools = [{"type": "function", "function": {"name": "getRetailFeedbackModules", "description": "Returns the list of modules usually present in the retail industry", "parameters": {"type": "object", "properties": {"page": {"type": "integer", "description": "The current page number.", "default": 1}, "page_size": {"type": "integer", "description": "The number of items per page.", "default": 3}}}}}, {"type": "function", "function": {"name": "verifyImplementation", "description": "Returns the list of modules usually present in the retail industry", "parameters": {"type": "object", "properties": {"coding_language": {"type": "string", "description": "The supported languages for verification of implementation.", "default": "python", "enum": ["python", "java", "php"]}, "code": {"type": "string", "description": "The code which needs verification"}, "design_pattern": {"type": "string", "description": "The design pattern to verify in the implementation", "enum": ["factory", "strategy", "singleton"]}, "verify_best_practices": {"type": "boolean", "description": "The verification of the coding style based on the language selected", "default": true}}}}}]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    tools=tools
)
model_inputs = tokenizer([text], return_tensors="pt")
```

---

## Running with vLLM

As the upstream PR is not yet merged, you can use this custom image as an alternate way to run the model with tool and reasoning parsers enabled.

### Docker Image

```
docker.io/amant555/vllm_apriel:latest
```

### Start Command

```bash
python3 -m vllm.entrypoints.openai.api_server \
  --model ServiceNow-AI/Apriel-1.6-15b-Thinker \
  --served-model-name Apriel-1p6-15B-Thinker \
  --trust_remote_code \
  --max-model-len 131072 \
  --enable-auto-tool-choice \
  --tool-call-parser apriel \
  --reasoning-parser apriel
```

---
## Additional Inference Options

Apriel-1.6-15b-Thinker is available on [Together AI](https://www.together.ai/models/apriel-1-6-15b-thinker) for hosted inference and on [Ollama](https://ollama.com/ServiceNow-AI/Apriel-1.6-15b-Thinker) for local use.

---


# Training Details

**Training stack:** [Fast-LLM](https://github.com/ServiceNow/Fast-LLM), [VERL](https://github.com/volcengine/verl)

**Continual Pre-training:** Billions of tokens covering math, code, science, logical reasoning, and multimodal image-text data

**SFT:** 2.4M samples spanning math, code, instruction-following, function calling, and conversation, followed by an incremental lightweight multimodal SFT.

**RL:** Multi-stage RL with verifiable rewards and [GSPO](https://arxiv.org/abs/2507.18071) on text and vision tasks. Our RL stage optimizes reasoning efficiency: using fewer tokens by discouraging unnecessary intermediate steps, stopping earlier when confident, and giving direct answers on simple queries.

For more details on our training methodology, see our [blog post](https://huggingface.co/blog/ServiceNow-AI/apriel-1p6-15b-thinker).

---

# Limitations

- **Factual accuracy:** May produce incorrect, misleading, or outdated content. Outputs should be verified before use in critical contexts.  
- **Bias:** May reflect societal, cultural, or systemic biases present in training data.  
- **Ethics:** Do not use the model to produce harmful, unlawful, or unethical content.  
- **Language:** Strongest performance is in English. Output quality may degrade in underrepresented languages.  
- **Critical use:** Not suitable for medical, legal, financial, or other high-risk applications without safeguards.

---

# Security and Responsible Use

**Security Responsibilities:**  
Deployers and users are strongly encouraged to align their security practices with established frameworks and regulatory guidelines such as the EU AI Act and the NIST AI Risk Management Framework (RMF).

<details>
<summary>Guidelines for Deployers</summary>

- Regularly conduct robustness assessments to identify and mitigate adversarial inputs.
- Implement validation and filtering processes to prevent harmful or biased outputs.
- Continuously perform data privacy checks to guard against unintended data leaks.
- Document and communicate the model's limitations, intended usage, and known security risks to all end-users.
- Schedule periodic security reviews and updates to address emerging threats and vulnerabilities.

</details>

<details>
<summary>Guidelines for Users</summary>

- Follow established security policies and usage guidelines provided by deployers.
- Protect and manage sensitive information when interacting with the model.
- Report anomalies, suspicious behavior, or unsafe outputs to deployers or developers.
- Maintain human oversight and apply judgment to mitigate potential security or ethical risks during interactions.

</details>

**Disclaimer:**  
Users accept responsibility for securely deploying, managing, and using this open-source LLM. The model is provided "as-is," without explicit or implied warranty regarding security or fitness for any specific application or environment.

---

# License

MIT

---

# Citation

```bibtex
@misc{radhakrishna2025apriel1515bthinker,
      title={Apriel-1.5-15b-Thinker}, 
      author={Shruthan Radhakrishna and Aman Tiwari and Aanjaneya Shukla and Masoud Hashemi and Rishabh Maheshwary and Shiva Krishna Reddy Malay and Jash Mehta and Pulkit Pattnaik and Saloni Mittal and Khalil Slimi and Kelechi Ogueji and Akintunde Oladipo and Soham Parikh and Oluwanifemi Bamgbose and Toby Liang and Ahmed Masry and Khyati Mahajan and Sai Rajeswar Mudumba and Vikas Yadav and Sathwik Tejaswi Madhusudhan and Torsten Scholak and Sagar Davasam and Srinivas Sunkara and Nicholas Chapados},
      year={2025},
      eprint={2510.01141},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2510.01141}, 
}
```
