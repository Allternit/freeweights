# Model Card for RLPR-Qwen2.5-7B-Base

[GitHub](https://github.com/openbmb/RLPR) | [Paper](https://arxiv.org/abs/2506.18254)

**RLPR-Qwen2.5-7B-Base** is trained from Qwen2.5-7B-Base with the [RLPR](https://github.com/openbmb/RLPR) framework, which eliminates reliance on external verifiers and is simple and generalizable for more domains.


## Model Details

### Key Features

*   💡 **Verifier-Free Reasoning Enhancement:** RLPR pioneers reinforcement learning for reasoning tasks by leveraging the LLM's intrinsic generation probability as a direct reward signal. This eliminates the need for external verifiers and specialized fine-tuning, offering broad applicability and effectively handling complex, diverse answers.
*   🛠️ **Innovative Reward & Training Framework:**
    *   Features a robust **Probability-based Reward (PR)** using average decoding probabilities of reference answers for higher quality, debiased reward signals, outperforming naive sequence likelihood.
    *   Implements an **standard deviation filtering** mechanism that dynamically filters prompts to stabilize training and significantly boost final performance.
*   🚀 **Strong Performance in General & Mathematical Reasoning:** Demonstrates substantial reasoning improvements across diverse benchmarks (e.g., 56.0 on MMLU-Pro, 55.4 on TheoremQA with Qwen2.5-7B). RLPR surpasses strong models reliant on external verifiers (like General Reasoner-7B).



![image/png](https://cdn-uploads.huggingface.co/production/uploads/64abc4aa6cadc7aca585dddf/ddgYbgYn1dH-vHc4H5pZE.png)


### Model Description
- **Trained from model:** [Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
- **Trained on data:** [RLPR-Train](https://huggingface.co/datasets/openbmb/RLPR-Train-Dataset)


## Usage

Usage adopted from [Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "openbmb/RLPR-Qwen2.5-7B-Base"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "How much energy is produced when the sun converts one kg of hydrogen into helium?."
messages = [
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
```

## Citation

If you find our model/code/paper helpful, please consider citing our papers 📝:

```bibtex
@misc{yu2025rlprextrapolatingrlvrgeneral,
      title={RLPR: Extrapolating RLVR to General Domains without Verifiers}, 
      author={Tianyu Yu and Bo Ji and Shouli Wang and Shu Yao and Zefan Wang and Ganqu Cui and Lifan Yuan and Ning Ding and Yuan Yao and Zhiyuan Liu and Maosong Sun and Tat-Seng Chua},
      year={2025},
      eprint={2506.18254},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2506.18254}, 
}
```