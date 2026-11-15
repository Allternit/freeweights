# Model Card for RLPR-Gemma2-2B-it

[GitHub](https://github.com/openbmb/RLPR) | [Paper](https://arxiv.org/abs/2506.18254)

**RLPR-Gemma2-2B-it** is trained from Gemma2-2B-it with the [RLPR](https://github.com/openbmb/RLPR) framework, which eliminates reliance on external verifiers and is simple and generalizable for more domains.


## Model Details

### Key Features

*   💡 **Verifier-Free Reasoning Enhancement:** RLPR pioneers reinforcement learning for reasoning tasks by leveraging the LLM's intrinsic generation probability as a direct reward signal. This eliminates the need for external verifiers and specialized fine-tuning, offering broad applicability and effectively handling complex, diverse answers.
*   🛠️ **Innovative Reward & Training Framework:**
    *   Features a robust **Probability-based Reward (PR)** using average decoding probabilities of reference answers for higher quality, debiased reward signals, outperforming naive sequence likelihood.
    *   Implements an **standard deviation filtering** mechanism that dynamically filters prompts to stabilize training and significantly boost final performance.
*   🚀 **Strong Performance in General & Mathematical Reasoning:** Demonstrates substantial reasoning improvements across diverse benchmarks, surpassing the RLVR baseline for 1.4 average points across seven benchmarks.



![image/png](https://cdn-uploads.huggingface.co/production/uploads/64abc4aa6cadc7aca585dddf/ddgYbgYn1dH-vHc4H5pZE.png)


### Model Description
- **Trained from model:** [Gemma2-2B-it](https://huggingface.co/google/gemma-2-2b-it)
- **Trained on data:** [RLPR-Train-Dataset](https://huggingface.co/datasets/openbmb/RLPR-Train-Dataset)


## Usage


```python
# pip install accelerate
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained("openbmb/RLPR-Gemma2-2B-it")
model = AutoModelForCausalLM.from_pretrained(
    "openbmb/RLPR-Gemma2-2B-it",
    device_map="auto",
    torch_dtype=torch.bfloat16,
)

input_text = "Write me a poem about Machine Learning."
input_ids = tokenizer(input_text, return_tensors="pt").to("cuda")

outputs = model.generate(**input_ids, max_new_tokens=32)
print(tokenizer.decode(outputs[0]))

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