<div>
<p style="margin-top: 0;margin-bottom: 0;">
    <em><a href="https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf">Unsloth Dynamic 2.0</a> achieves superior accuracy & outperforms other leading quants.</em>
  </p>
  <div style="display: flex; gap: 5px; align-items: center; ">
    <a href="https://github.com/unslothai/unsloth/">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/unsloth%20new%20logo.png" width="133">
    </a>
    <a href="https://discord.gg/unsloth">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/Discord%20button.png" width="173">
    </a>
    <a href="https://docs.unsloth.ai/">
      <img src="https://raw.githubusercontent.com/unslothai/unsloth/refs/heads/main/images/documentation%20green%20button.png" width="143">
    </a>
  </div>
</div>


## Model Details
<img alt="OLMo Logo" src="https://cdn-uploads.huggingface.co/production/uploads/65316953791d5a2611426c20/nC44-uxMD6J6H3OHxRtVU.png" width="242px" style="margin-left:'auto' margin-right:'auto' display:'block'">


# Model Card for Olmo 3 Think

We introduce Olmo 3, a new family of 7B and 32B models both Instruct and Think variants. Long chain-of-thought thinking improves reasoning tasks like math and coding.

Olmo is a series of **O**pen **l**anguage **mo**dels designed to enable the science of language models. 
These models are pre-trained on the Dolma 3 dataset and post-trained on the Dolci datasets. We are releasing all code, checkpoints, logs (coming soon), and associated training details. 



The core models released in this batch include the following:

| **Stage**               | **Olmo 3 7B Think** | **Olmo 3 32B Think** | **Olmo 3 7B Instruct** |
|--------------------------|-----------------------|------------------------|---------------------------|
| **Base Model**           | [Olmo-3-7B](https://huggingface.co/allenai/Olmo-3-1025-7B) | [Olmo-3-32B](https://huggingface.co/allenai/Olmo-3-1125-32B) | [Olmo-3-7B](https://huggingface.co/allenai/Olmo-3-1025-7B) |
| **SFT**                  | [Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT) | [Olmo-3-32B-Think-SFT](https://huggingface.co/allenai/Olmo-3-32B-Think-SFT) | [Olmo-3-7B-Instruct-SFT](https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT) |
| **DPO**                  | [Olmo-3-7B-Think-DPO](https://huggingface.co/allenai/Olmo-3-7B-Think-DPO) | [Olmo-3-32B-Think-DPO](https://huggingface.co/allenai/Olmo-3-32B-Think-DPO) | [Olmo-3-7B-Instruct-DPO](https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO) |
| **Final Models (RLVR)**  | [Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think) | [Olmo-3-32B-Think](https://huggingface.co/allenai/Olmo-3-32B-Think) | [Olmo-3-7B-Instruct](https://huggingface.co/allenai/Olmo-3-7B-Instruct) |            
             

## Installation

Olmo 3 is supported in transformers 4.57.0 or higher:
```bash
pip install transformers>=4.57.0
```

## Inference

You can use OLMo with the standard HuggingFace transformers library:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo = AutoModelForCausalLM.from_pretrained("allenai/Olmo-3-7B-Think")
tokenizer = AutoTokenizer.from_pretrained("allenai/Olmo-3-7B-Think")
message = ["Who would win in a fight - a dinosaur or a cow named Moo Moo?"]
inputs = tokenizer(message, return_tensors='pt', return_token_type_ids=False)
# optional verifying cuda
# inputs = {k: v.to('cuda') for k,v in inputs.items()}
# olmo = olmo.to('cuda')
response = olmo.generate(**inputs, max_new_tokens=100, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])
>> '<think>Okay, so the question is who would win in a fight...'
```

For faster performance, you can quantize the model using the following method:
```python
AutoModelForCausalLM.from_pretrained("allenai/Olmo-3-7B-Think", 
    torch_dtype=torch.float16, 
    load_in_8bit=True)  # Requires bitsandbytes
```
The quantized model is more sensitive to data types and CUDA operations. To avoid potential issues, it's recommended to pass the inputs directly to CUDA using:
```python
inputs.input_ids.to('cuda')
```

We have released checkpoints for these models. For post-training, the naming convention is `step_XXXX`. 


To load a specific model revision with HuggingFace, simply add the argument `revision`:
```bash
olmo = AutoModelForCausalLM.from_pretrained("allenai/Olmo-3-7B-Think", revision="step_1375")
```

Or, you can access all the revisions for the models via the following code snippet:
```python
from huggingface_hub import list_repo_refs
out = list_repo_refs("allenai/Olmo-3-7B-Think")
branches = [b.name for b in out.branches]
```

### Chat template

## Default System Message
The default system prompt for this model is:
```
<|im_start|>system
You are Olmo, a helpful AI assistant built by Ai2. Your date cutoff is December 2024, and your model weights are available at https://huggingface.co/allenai.
<|im_end|>
```

## Chat Format

The chat template for this model is formatted as:
```
<|im_start|>system
You are Olmo, a helpful AI assistant built by Ai2. Your date cutoff is December 2024, and your model weights are available at https://huggingface.co/allenai.
<|im_start|>user
Who would win in a fight - a dinosaur or a cow named Moo Moo?<|im_end|>
<|im_start|>assistant
<think>Okay, so the question is who would win in a fight between a dinosaur and a cow named Moo Moo.
Hmm, first I need to break this down. Let me think about the different factors involved here..... </think>
Moo Moo the cow would certinaly win.
<|endoftext|>
```

### Model Description

- **Developed by:** Allen Institute for AI (Ai2)
- **Model type:** a Transformer style autoregressive language model.
- **Language(s) (NLP):** English
- **License:** This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2's [Responsible Use Guidelines](https://allenai.org/responsible-use).
- **Contact:** Technical inquiries: `olmo@allenai.org`. Press: `press@allenai.org`
- **Date cutoff:** Dec. 2024.


### Model Sources

- **Project Page:** https://allenai.org/olmo
- **Repositories:**
    - Open-Instruct for DPO and RLVR: https://github.com/allenai/open-instruct
    - OLMo-Core for pre-training and SFT: https://github.com/allenai/OLMo-core
    - OLMo-Eval for evaluation: https://github.com/allenai/OLMo-Eval
- **Paper:** [TBD]
<!-- - **Technical blog post:** (URL)  -->
<!-- - **W&B Logs:** [SFT](()), [DPO](()), [RLVR](()) -->


## Evaluation

| Skill | Benchmark | Olmo 3 Think 7B SFT | Olmo 3 Think 7B DPO | Olmo 3 Think 7B | OpenThinker3-7B | Nemotron-Nano-9B-v2 | DeepSeek-R1-Distill-Qwen-7B | Qwen 3 8B (reasoning) | Qwen 3 VL 8B Thinker | OpenReasoning Nemotron 7B |
|-------|-----------|------------------|------------------|--------------|------------------|-----------------------|------------------------------|-------------------------|---------------------------|-----------------------------|
| **Math** | MATH | 94.4 | 92.4 | 95.1 | 94.5 | 94.4 | 87.9 | 95.1 | 95.2 | 94.6 |
|  | AIME 2024 | 69.6 | 74.6 | 71.6 | 67.7 | 72.1 | 54.9 | 74.0 | 70.9 | 77.0 |
|  | AIME 2025 | 57.6 | 62.7 | 64.6 | 57.2 | 58.9 | 40.2 | 67.8 | 61.5 | 73.1 |
|  | OMEGA | 45.0 | 40.5 | 37.8 | 38.4 | 42.4 | 28.5 | 43.4 | 38.1 | 43.2 |
| **Reasoning** | BBH | 84.1 | 83.7 | 86.6 | 77.1 | 86.2 | 73.5 | 84.4 | 86.8 | 81.3 |
|  | ZebraLogic | 57.9 | 60.6 | 66.5 | 34.9 | 60.8 | 26.1 | 85.2 | 91.2 | 22.4 |
|  | AGI Eval | 77.2 | 79.1 | 81.5 | 78.6 | 83.1 | 69.5 | 87.0 | 90.1 | 81.4 |
| **Coding** | HumanEval+ | 88.2 | 91.4 | 89.9 | 87.4 | 89.7 | 83.0 | 80.2 | 83.7 | 89.7 |
|  | MBPP+ | 63.2 | 63.0 | 64.7 | 61.4 | 66.1 | 63.5 | 69.1 | 63.0 | 61.2 |
|  | LCB v3 | 67.8 | 75.1 | 75.2 | 68.0 | 83.4 | 58.8 | 86.2 | 85.5 | 82.3 |
| **IF** | IFEval | 77.9 | 75.9 | 88.2 | 51.7 | 86.0 | 59.6 | 87.4 | 85.5 | 42.5 |
|  | IFBench | 30.0 | 28.3 | 41.6 | 23.0 | 34.6 | 16.7 | 37.1 | 40.4 | 23.4 |
| **Knowledge** | MMLU | 74.9 | 74.8 | 77.8 | 77.4 | 84.3 | 67.9 | 85.4 | 86.5 | 80.7 |
| **QA** | PopQA | 20.8 | 24.7 | 23.7 | 18.0 | 17.9 | 12.8 | 24.3 | 29.3 | 14.5 |
|  | GPQA | 45.8 | 48.6 | 46.2 | 47.6 | 56.2 | 54.4 | 57.7 | 61.5 | 56.6 |
| **Chat** | AE 2 | 43.9 | 50.6 | 52.1 | 24.0 | 58.0 | 7.7 | 60.5 | 73.5 | 8.6 |
| **Safety** |  | 65.8 | 67.7 | 70.7 | 31.3 | 72.1 | 54.0 | 68.3 | 82.9 | 30.3 |

## Model Details

#### Stage 1: SFT
- supervised fine-tuning on the Dolci-Think-SFT-7B dataset. This dataset consits of math, code, chat, and general knowledge queries.
- Datasets: [Dolci-Think-SFT-7B](https://huggingface.co/datasets/allenai/dolci-thinking-sft), [Dolci-Instruct-SFT-7B](https://huggingface.co/datasets/allenai/dolci-instruct-sft)

#### Stage 2:DPO
- direct preference optimization on the Dolci-Think-DPO-7B dataset. This dataset consits of math, code, chat, and general knowledge queries.
- Datasets: [Dolci-Think-DPO-7B](https://huggingface.co/datasets/allenai/dolci-thinking-dpo), [Dolci-Instruct-DPO-7B](https://huggingface.co/datasets/allenai/dolci-3-instruct-dpo-with-metadata)

#### Stage 3: RLVR
- reinforcement learning from verifiable rewards on the Dolci-Think-RL-7B dataset. This dataset consits of math, code, instruction-following, and general chat queries.
- Datasets: [Dolci-Think-RL-7B](https://huggingface.co/datasets/allenai/Dolci-Think-RL-7B), [Dolci-Instruct-RL-7B](https://huggingface.co/datasets/allenai/Dolci-Instruct-RL-7B)


## Bias, Risks, and Limitations
Like any base language model or fine-tuned model without safety filtering, these models can easily be prompted by users to generate harmful and sensitive content. Such content may also be produced unintentionally, especially in cases involving bias, so we recommend that users consider the risks when applying this technology. Additionally, many statements from OLMo or any LLM are often inaccurate, so facts should be verified.


## Citation
A technical manuscript is forthcoming!

## Model Card Contact
For errors in this model card, contact `olmo@allenai.org`.