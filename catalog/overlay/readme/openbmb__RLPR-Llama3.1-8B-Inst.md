# Model Card for RLPR-Llama3.1-8B-Inst 

[GitHub](https://github.com/openbmb/RLPR) | [Paper](https://arxiv.org/abs/2506.18254)

**RLPR-Llama3.1-8B-Inst** is trained from Llama3.1-8B-Inst  with the [RLPR](https://github.com/openbmb/RLPR) framework, which eliminates reliance on external verifiers and is simple and generalizable for more domains.


## Model Details

### Key Features

*   💡 **Verifier-Free Reasoning Enhancement:** RLPR pioneers reinforcement learning for reasoning tasks by leveraging the LLM's intrinsic generation probability as a direct reward signal. This eliminates the need for external verifiers and specialized fine-tuning, offering broad applicability and effectively handling complex, diverse answers.
*   🛠️ **Innovative Reward & Training Framework:**
    *   Features a robust **Probability-based Reward (PR)** using average decoding probabilities of reference answers for higher quality, debiased reward signals, outperforming naive sequence likelihood.
    *   Implements an **standard deviation filtering** mechanism that dynamically filters prompts to stabilize training and significantly boost final performance.
*   🚀 **Strong Performance in General & Mathematical Reasoning:** Demonstrates substantial reasoning improvements across diverse benchmarks, surpassing the RLVR baseline for 1.4 average points across seven benchmarks.



![image/png](https://cdn-uploads.huggingface.co/production/uploads/64abc4aa6cadc7aca585dddf/ddgYbgYn1dH-vHc4H5pZE.png)


### Model Description
- **Trained from model:** [Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/tree/main)
- **Trained on data:** [RLPR-Train-Dataset](https://huggingface.co/datasets/openbmb/RLPR-Train-Dataset)


## Usage


```python
# pip install accelerate
import transformers
import torch

model_id = "openbmb/RLPR-Llama3.1-8B-Inst"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

messages = [
    {"role": "system", "content": "You are a pirate chatbot who always responds in pirate speak!"},
    {"role": "user", "content": "Who are you?"},
]

outputs = pipeline(
    messages,
    max_new_tokens=256,
)
print(outputs[0]["generated_text"][-1])
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