## AstaBrief-8B-SFT

AstaBrief-8B-SFT is the intermediate supervised fine-tuning (SFT) checkpoint of [AstaBrief-8B](https://huggingface.co/allenai/AstaBrief_8B), a model designed to turn a research question and retrieved scientific literature excerpts into a cited report.

The model is initialized from [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) and fine-tuned on [AstaBrief_SFT_Mix](https://huggingface.co/allenai/AstaBrief_SFT_Mix), a collection of real user queries paired with reports generated from the multi-step [Asta ScholarQA](https://www.google.com/url?q=https://aclanthology.org/2025.acl-demo.49.pdf) report generation pipeline, using a variety of backing models: Claude 3.5 Sonnet, Claude 3.7 Sonnet, o3, o4-mini, and GPT-4.1.

For a detailed overview of the project, see [our blog](https://allenai.org/blog/astabrief).

## Inference and Usage
>[!NOTE]
>**Recommended prompt**: This checkpoint was fine-tuned using this [SFT prompt](https://huggingface.co/datasets/allenai/AstaBrief_prompts/blob/main/sft_prompt.txt). For best results, we recommend using the same prompt format at inference time with your input query and section references. Using a different prompt or interaction format may lead to degraded or inconsistent behavior.

Following is an example inference code snippet:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from vllm import LLM, SamplingParams

model_name = "allenai/AstaBrief_8B_SFT"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

# prepare the model input by providing your query and retrieved literature excerpts in our recommended prompt format
messages = [
    {"role": "user", "content": formatted_sft_prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

# instantiate sampling parameters
llm = LLM(model=model_name)
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=4096,
    stop_token_ids=[tokenizer.eos_token_id],
)

# conduct text completion
outputs = llm(text, sampling_params)
output_text = outputs[0].outputs[0].text.strip()
output_ids = len(outputs[0].outputs[0].token_ids)

print("content:", output_text)
```

## Evaluation Results
Our SFT training procedure improves the performance of the base Qwen3-8B model on the [ScholarQA-CS2](https://openreview.net/pdf?id=M7TNf5J26u) test set, a set of 100 user-written computer science research questions.

| Model | Average | Ingredient Recall | Answer Precision | Citation Precision | Citation Recall |
|---|---:|---:|---:|---:|---:|
| Qwen3-8B | 77.3 | 77.8 | 90.6 | 76.2 | 64.6 |
| AstaBrief-8B-SFT | 83.7 | 85.2 | 90.4 | 87.7 | 71.3 |

## Intended Uses and Limitations 

This model is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt) and is based on [Qwen 3-8B](https://huggingface.co/Qwen/Qwen3-8B). It is intended for research and educational use in accordance with Ai2's [Responsible Use Guidelines](https://allenai.org/responsible-use). Please refer to the details in our [SFT dataset](https://huggingface.co/datasets/allenai/AstaBrief_SFT_Mix) for more information about the data sources used in SFT training.

## Training
SFT training was conducted in [open-instruct](https://github.com/allenai/open-instruct) on 8xH100s. Hyperparameter settings:
| Hyperparameter | Value |
|---|---:|
| #Epochs | 5 |
| LR | 5e-06 |
| LR Scheduler | Linear |
| Warmup Ratio | 0.03 | 
| Per-device Batch Size | 1 |
| Gradient Accumulation Steps | 4 |
| Max sequence length | 32768 |
| Precision | BF16 | 

Links

📝 Project blog: https://allenai.org/blog/astabrief

🤗 SFT dataset: [AstaBrief_SFT_Mix](https://huggingface.co/allenai/AstaBrief_SFT_Mix)

🤖 Base model: [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)

🤖 DPO checkpoint: [AstaBrief_8B](https://huggingface.co/allenai/AstaBrief_8B)