MAI-DS-R1 is a DeepSeek-R1 reasoning model that has been post-trained by the Microsoft AI team to improve its responsiveness on blocked topics and its risk profile, while maintaining its reasoning capabilities and competitive performance. 

## Model Details

### Model Description
MAI-DS-R1 is a DeepSeek-R1 reasoning model that has been post-trained by Microsoft AI team to fill in information gaps in the previous version of the model and to improve its risk profile, while maintaining R1 reasoning capabilities. The model was trained using 110k Safety and Non-Compliance examples from [Tulu](https://huggingface.co/datasets/allenai/tulu-3-sft-mixture) 3 SFT dataset, in addition to a dataset of ~350k multilingual examples internally developed capturing various topics with reported biases.  

MAI-DS-R1 has successfully unblocked the majority of previously blocked queries from the original R1 model while outperforming the recently published R1-1776 model (post-trained by Perplexity) in relevant safety benchmarks.  These results were achieved while preserving the general reasoning capabilities of the original DeepSeek-R1.  

*Please note: Microsoft has post-trained this model to address certain limitations relevant to its outputs, but previous limitations and considerations for the model remain, including security considerations.*

## Uses

### Direct Use
MAI-DS-R1 preserves the general reasoning capabilities of DeepSeek-R1 and can be used for broad language understanding and generation tasks, especially in complex reasoning and problem-solving. Primary direct use incudes:  

- **General text generation and understanding** – Producing coherent, contextually relevant text for a wide range of prompts. This includes engaging in dialogue, writing essays, or continuing a story based on a given prompt. 

- **General knowledge tasks** – Answering open-domain questions requiring factual knowledge. 

- **Reasoning and problem solving** – Handling multi-step reasoning tasks, such as math word problems or logic puzzles, by employing chain-of-thought strategies. 

- **Code generation and comprehension** – Assisting with programming tasks by generating code snippets or explaining code. 

- **Scientific and academic applications** – Assisting with structured problem-solving in STEM and research domains. 

### Downstream Use *(Optional)*

The model can serve as a foundation for further fine-tuning in domain-specific reasoning tasks, such as automated tutoring systems for mathematics, coding assistants, and research tools in scientific or technical fields. 

### Out-of-Scope Use
Certain application domains are out-of-scope either due to ethical/safety concerns or because the model lacks the necessary reliability in those areas. The following usage is out of scope: 

- **Medical or health advice** – The model is not a medical device and has no guarantee of providing accurate medical diagnoses or safe treatment recommendations. 

- **Legal advice** – The model is not a lawyer and should not be entrusted with giving definitive legal counsel, interpreting laws, or making legal decisions on its own. 

- **Safety-critical systems** – The model is not suited for autonomous systems where failures could cause injury, loss of life, or significant property damage. This includes use in self-driving vehicles, aircraft control, medical life-support systems, or industrial control without human oversight.  

- **High-stakes decision support** – The model should not be relied on for decisions affecting finances, security, or personal well-being, such as financial planning or investment advice. 

- **Malicious or unethical Use** – The model must not be used to produce harmful, illegal, deceptive, or unethical content, including hate speech, violence, harassment, or violations of privacy or IP rights. 

## Bias, Risks, and Limitations

- **Biases**: The model may retain biases present in the training data and in the original DeepSeek‑R1, particularly around cultural and demographic aspects. 

- **Risks**: The model may still hallucinate facts, be vulnerable to adversarial prompts, or generate unsafe, biased, or harmful content under certain conditions. Developers should implement content moderation and usage monitoring to mitigate misuse. 

- **Limitations**: MAI-DS-R1 shares DeepSeek-R1’s knowledge cutoff and may lack awareness of recent events or domain-specific facts.  

## Recommendations
To ensure responsible use, we recommend the following: 

- **Transparency on Limitations**: It is recommended that users are made explicitly aware of the model’s potential biases and limitations. 

- **Human Oversight and Verification**: Both direct and downstream users should implement human review or automated validation of outputs when deploying the model in sensitive or high-stakes scenarios. 

- **Usage Safeguards**: Developers should integrate content filtering, prompt engineering best practices, and continuous monitoring to mitigate risks and ensure the model’s outputs meet the intended safety and quality standards. 

- **Legal and Regulatory Compliance**: The model may output politically sensitive content (e.g., Chinese governance, historical events) that could conflict with local laws or platform policies. Operators must ensure compliance with regional regulations. 

## Evaluation

### Testing Data, Factors & Metrics

#### Testing Data

The model was evaluated on a variety of benchmarks, covering different tasks and addressing both performance and harm mitigation concerns. Key benchmarks include: 

1. **Public Benchmarks**: These cover a wide range of tasks, such as natural language inference, question answering, mathematical reasoning, commonsense reasoning, code generation, and code completion. It evaluates the model’s general knowledge and reasoning capabilities.  

2. **Blocking Test Set**: This set consists of 3.3k prompts on various blocked topics from R1, covering 11 languages. It evaluates the model’s ability to unblock previously blocked content across different languages. 

3. **Harm Mitigation Test Set**: This set is a [split](https://github.com/nouhadziri/safety-eval-fork/blob/main/evaluation/tasks/generation/harmbench/harmbench_behaviors_text_test.csv) from the [HarmBench](https://www.harmbench.org/) dataset and includes 320 queries, categorized into three functional categories: standard, contextual, and copyright. The queries cover eight semantic categories, such as misinformation/disinformation, chemical/biological threats, illegal activities, harmful content, copyright violations, cybercrime, and harassment. It evaluates the model's leakage rate of harmful or unsafe content. 

#### Factors

The following factors can influence MAI-DS-R1's behavior and performance: 

1. **Input topic and Sensitivity**: The model is explicitly tuned to freely discuss topics that were previously blocked. On such topics it will now provide information about where the base model might have demurred. However, for truly harmful or explicitly disallowed content (e.g. instructions for violence), the model remains restrictive due to fine-tuning. 

2. **Language**: Although MAI-DS-R1 was post-trained on multilingual data, it may inherit limitations from the original DeepSeek-R1 model, with performance likely strongest in English and Chinese. 

3. **Prompt Complexity and Reasoning Required**: The model performs well on complex queries requiring reasoning, while very long or complex prompts could still pose a challenge.  

4. **User Instructions and Role Prompts**: As a chat-oriented LLM, MAI-DS-R1’s responses can be shaped by system or developer-provided instructions (e.g. a system prompt defining its role and style) and the user's phrasing. Developers should provide clear instructions to guide model’s behavior. 

#### Metrics

1. Public benchmarks: 
    - Accuracy: the percentage of problems for which the model’s output matches the correct answer. 
    - Pass@1: the percentage of problems for which the model generates a correct solution which passes all test cases in the first attempt. 

2. Blocking evaluation: 
    - Satisfaction (internal metric to measuring relevance with the question on [0,4] scale): The intent is to measure whether the unblocked answers do answer the question and not generate content which is unrelated.  
    - % Responses: The proportion of previously blocked samples successfully unblocked. 

3. Harm mitigation evaluation: 
    - Attack Success Rate: the percentage of test cases that elicit the behavior from the model. This is evaluated per functional or semantic category. 
    - Micro Attack Success Rate: the total average of attack success rate over all categories. 

### Results  

#### Evaluation on General Knowledge and Reasoning
<p align="center">
  <img src="figures/reasoning.png" alt="Benchmark Chart">
</p>

<p align="center">
  <img src="figures/math.png" alt="Benchmark Chart">
</p>

<p align="center">
  <img src="figures/coding.png" alt="Benchmark Chart">
</p>

#### Evaluation on Responsiveness
<p align="center">
    <table>
    <tr>
        <td><img src="figures/responsiveness.png" width="500"/></td>
        <td><img src="figures/satisfaction.png" width="500"/></td>
    </tr>
    </table>
</p>

#### Evaluation on Harm Mitigation
<p align="center">
  <img src="figures/harm_mitigation_answer_only.png" alt="Benchmark Chart">
</p>

<p align="center">
  <img src="figures/harm_mitigation_thinking_only.png" alt="Benchmark Chart">
</p>

#### Summary 
- **General Knowledge & Reasoning**: MAI-DS-R1 performs on par with DeepSeek-R1 and slightly better than R1-1776, especially excelling in mgsm_chain_of_thought_zh, where R1-1776 had a significant regression. 

- **Blocked Topics**: MAI-DS-R1 unblocked 99.3% of samples, matching R1-1776, and achieved a higher Satisfaction score, likely due to more relevant responses. 

- **Harm Mitigation**: MAI-DS-R1 outperforms both R1-1776 and the original R1 model in minimizing harmful content. 
### Model Architecture and Objective 
- **Model Name**: MAI-DS-R1 
- **Architecture**: Based on DeepSeek-R1, a transformer-based autoregressive language model utilizing multi-head self-attention and Mixture-of-Experts (MoE) for scalable and efficient inference. 
- **Objective**: Post-trained to reduce CCP-aligned restrictions and enhance harm protection, while preserving the original model’s strong chain-of-thought reasoning and general-purpose language understanding capabilities. 
- **Pre-trained Model Base**: DeepSeek-R1 (671B)
### Data Summary
https://huggingface.co/microsoft/MAI-DS-R1/blob/main/data_summary_card.md
