# InfLLM-V2-Long-Sparse-Base

**Project Links**: [[Paper](https://arxiv.org/abs/2509.24663)] [[InfLLM-V2 Models](https://huggingface.co/openbmb/InfLLM-V2-Long-Sparse-Base)] [[CUDA Kernel Code](https://github.com/OpenBMB/infllmv2_cuda_impl)]

---

## 🚀 Model Description

`InfLLM-V2-Long-Sparse-Base` is the final, long-context capable model in the InfLLM-V2 series, featuring a native **sparse attention** mechanism.

This model is the result of continued training on the [**InfLLM-V2-Short-Dense-Base**](https://huggingface.co/openbmb/InfLLM-V2-Short-Dense-Base) model using just **5B tokens** of high-quality long-text data from the [**InfLLM-V2-data-5B**](https://huggingface.co/datasets/openbmb/InfLLM-V2-data-5B) dataset.

Its core feature is the InfLLM-V2 architecture, which allows it to seamlessly switch between high-performance dense attention for short texts and highly efficient sparse attention for long texts. This enables the model to process extremely long sequences with significant end-to-end acceleration while preserving performance on standard tasks.

## 📌 The Training Journey

This model is the final product of the transparent and reproducible InfLLM-V2 training workflow:

-   **Step 1: Start from the base model.**
    -   The journey begins with [**InfLLM-V2-Short-Dense-Base**](https://huggingface.co/openbmb/InfLLM-V2-Short-Dense-Base), a model pre-trained on short texts.

-   **Step 2: Continue training on long-text data.**
    -   We then perform continued training using the [**InfLLM-V2-data-5B**](https://huggingface.co/datasets/openbmb/InfLLM-V2-data-5B) dataset.

-   **Step 3: Get the final long-context model.**
    -   ➡️ The result is **`InfLLM-V2-Long-Sparse-Base` (This Model)**, which has unlocked powerful long-context capabilities.

## 💻 Usage

InfLLM-V2-Long-Sparse-Base supports both dense attention inference and sparse attention inference modes, where vLLM and SGLang currently only support dense inference mode. If you want to use sparse inference mode, please use Huggingface Transformers and CPM.cu.

- Dense attention inference: vLLM, SGLang, Huggingface Transformers
- Sparse attention inference: Huggingface Transformers, CPM.cu

**To facilitate researches in sparse attention, we provide [InfLLM-V2 Kernels](https://github.com/OpenBMB/infllmv2_cuda_impl) and [CPM.cu](https://github.com/OpenBMB/CPM.cu.git).**

### Inference with Transformers
InfLLM-V2-Long-Sparse-Base requires `transformers>=4.56`.

- **Inference with Dense Attention**
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
torch.manual_seed(0)
path = 'openbmb/InfLLM-V2-Long-Sparse-Base'
device = "cuda"
tokenizer = AutoTokenizer.from_pretrained(path)
model = AutoModelForCausalLM.from_pretrained(path, torch_dtype=torch.bfloat16, device_map=device, trust_remote_code=True)
# User can directly use the chat interface
# responds, history = model.chat(tokenizer, "Write an article about Artificial Intelligence.", temperature=0.7, top_p=0.7)
# print(responds)
# User can also use the generate interface
messages = [
    {"role": "user", "content": "Write an article about Artificial Intelligence."},
]
prompt_text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)
model_inputs = tokenizer([prompt_text], return_tensors="pt").to(device)
model_outputs = model.generate(
    **model_inputs,
    max_new_tokens=32768,
    top_p=0.95,
    temperature=0.6
)
output_token_ids = [
    model_outputs[i][len(model_inputs[i]):] for i in range(len(model_inputs['input_ids']))
]
responses = tokenizer.batch_decode(output_token_ids, skip_special_tokens=True)[0]
print(responses)
```

- **Inference with Sparse Attention**
InfLLM-V2-Long-Sparse-Base supports `InfLLM v2`, a sparse attention mechanism designed for efficient long-sequence inference. It requires the [infllmv2_cuda_impl](https://github.com/OpenBMB/infllmv2_cuda_impl) library.

You can install it by running the following command:
```bash
git clone -b feature_infer https://github.com/OpenBMB/infllmv2_cuda_impl.git
cd infllmv2_cuda_impl
git submodule update --init --recursive
pip install -e . # or python setup.py install 
```

To enable InfLLM v2, you need to add the `sparse_config` field in `config.json`:
```json
{
    ...,
    "sparse_config": {
        "kernel_size": 32,
        "kernel_stride": 16,
        "init_blocks": 1,
        "block_size": 64,
        "window_size": 2048,
        "topk": 64,
        "use_nope": false,
        "dense_len": 8192
    }
}
```

These parameters control the behavior of InfLLM v2:
* `kernel_size` (default: 32): The size of semantic kernels.
* `kernel_stride` (default: 16): The stride between adjacent kernels.
* `init_blocks` (default: 1): The number of initial blocks that every query token attends to. This ensures attention to the beginning of the sequence.
* `block_size` (default: 64): The block size for key-value blocks.
* `window_size` (default: 2048): The size of the local sliding window. 
* `topk` (default: 64): The specifies that each token computes attention with only the top-k most relevant key-value blocks.
* `use_nope` (default: false): Whether to use the NOPE technique in block selection for improved performance.
* `dense_len` (default: 8192): Since Sparse Attention offers limited benefits for short sequences, the model can use standard (dense) attention for shorter texts. The model will use dense attention for sequences with a token length below `dense_len` and switch to sparse attention for sequences exceeding this length. Set this to `-1` to always use sparse attention regardless of sequence length.


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