# InfLLM-V2-Short-Dense-Base

**Project Links**: [[Paper](https://arxiv.org/abs/2509.24663)] [[InfLLM-V2 Models](https://huggingface.co/openbmb/InfLLM-V2-Long-Sparse-Base)] [[CUDA Kernel Code](https://github.com/OpenBMB/infllmv2_cuda_impl)]

---

## 🚀 Model Description

`InfLLM-V2-Short-Dense-Base` is the foundational base model for the InfLLM-V2 long-context training pipeline.

This model is pre-trained on a large corpus of **short-text data** and utilizes a standard **dense attention** mechanism. It serves as the starting checkpoint for the continued training phase, which unlocks the advanced long-context capabilities seen in the final sparse model.

It is highly performant on short-text tasks and provides a solid foundation for further fine-tuning or continued training.

## 📌 Role in the InfLLM-V2 Ecosystem

This model is the crucial first step in the InfLLM-V2 training workflow. The entire process is designed to be transparent and reproducible:

-   **Step 1: Start from this base model.**
    -   ➡️ [**InfLLM-V2-Short-Dense-Base**](https://huggingface.co/openbmb/InfLLM-V2-Short-Dense-Base) **(This Model)**: The base model pre-trained on short texts with dense attention.

-   **Step 2: Continue training on long-text data.**
    -   Use the [**InfLLM-V2-data-5B**](https://huggingface.co/datasets/openbmb/InfLLM-V2-data-5B) dataset to perform continued training.

-   **Step 3: Get the final long-context model.**
    -   The result is the [**InfLLM-V2-Long-Sparse-Base**](https://huggingface.co/openbmb/InfLLM-V2-Long-Sparse-Base), which is equipped with powerful sparse attention for long-context tasks.

## 💻 How to Use

As a standard dense-attention model, you can use it directly with the `transformers` library without any special configuration.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Set device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load model and tokenizer
model_id = "openbmb/InfLLM-V2-Short-Dense-Base"
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_id,trust_remote_code=True).to(device,dtype=torch.bfloat16)

# Create a prompt
prompt = "The capital of France is"
inputs = tokenizer(prompt, return_tensors="pt").to(device)

# Generate text
outputs = model.generate(**inputs, max_new_tokens=10)
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(generated_text)
# Expected output: The capital of France is Paris.
```

> **Note**: This model is optimized for short sequences. For long-context capabilities, please use the final [InfLLM-V2-Long-Sparse-Base](https://huggingface.co/openbmb/InfLLM-V2-Long-Sparse-Base) model.

## Citation

If you use our work in your research, please cite our paper:

```bibtex
@misc{zhao2025infllmv2densesparseswitchableattention,
      title={InfLLM-V2: Dense-Sparse Switchable Attention for Seamless Short-to-Long Adaptation}, 
      author={Weilin Zhao and Zihan Zhou and Zhou Su and Chaojun Xiao and Yuxuan Li and Yanghao Li and Yudi Zhang and Weilun Zhao and Zhen Li and Yuxiang Huang and Ao Sun and Xu Han and Zhiyuan Liu},
      year={2025},
      eprint={2509.24663},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2509.24663}, 
}
```