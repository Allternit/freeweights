# VisRAG 2.0: Evidence-Guided Multi-Image Reasoning in Visual Retrieval-Augmented Generation
[![Github](https://img.shields.io/badge/VisRAG-000000?style=for-the-badge&logo=github&logoColor=000&logoColor=white)](https://github.com/OpenBMB/VisRAG)
[![arXiv](https://img.shields.io/badge/arXiv-2510.09733-ff0000.svg?style=for-the-badge)](https://arxiv.org/abs/2510.09733)
[![Hugging Face](https://img.shields.io/badge/EvisRAG-fcd022?style=for-the-badge&logo=huggingface&logoColor=000)](https://huggingface.co/openbmb/EVisRAG-7B)

<p align="center">•
 <a href="#-introduction"> 📖 Introduction </a> •
 <a href="#-news">🎉 News</a> •
 <a href="#%EF%B8%8F-setup">⚙️ Setup</a> •
 <a href="#%EF%B8%8F-training">⚡️ Training</a> 
</p>
<p align="center">•
 <a href="#-evaluation">📃 Evaluation</a> •
 <a href="#-usage">🔧 Usage</a> •
 <a href="#-license">📄 Lisense</a> •
 <a href="#-contact">📧 Contact</a> •
</p>

# 📖 Introduction
**EVisRAG (VisRAG 2.0)** is an evidence-guided Vision Retrieval-augmented Generation framework that equips VLMs for multi-image questions by first linguistically observing retrieved images to collect per-image evidence, then reasoning over those cues to answer. **EVisRAG** trains with Reward-Scoped GRPO, applying fine-grained token-level rewards to jointly optimize visual perception and reasoning.

<p align="center"><img width=800 src="evisrag.png"/></p>

# 🎉 News

* 20251207: Updated the **EVisRAG-7B** model, added natural images from the [visual_haystacks](https://huggingface.co/datasets/tsunghanwu/visual_haystacks) dataset to the training corpus, expanding the model’s applicability across broader real-world scenarios.
* 20251001: Released **EVisRAG (VisRAG 2.0)**, an end-to-end Vision-Language Model. Released our [Paper](https://arxiv.org/html/2510.09733v1) on arXiv. Released our [Model](https://huggingface.co/openbmb/EVisRAG-7B) on Hugging Face. Released our [Code](https://github.com/OpenBMB/VisRAG) on GitHub

# ✨ EVisRAG Pipeline

**EVisRAG** is an end-to-end framework which equips VLMs with precise visual perception during reasoning in multi-image scenarios. We trained and released VLRMs with EVisRAG built on [Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct), and [Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct).

# ⚙️ Setup
```bash
git clone https://github.com/OpenBMB/VisRAG.git
conda create --name EVisRAG python==3.10
conda activate EVisRAG
cd EVisRAG
pip install -r EVisRAG_requirements.txt
```
# ⚡️ Training

***Stage1: SFT*** (based on [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory))

```bash
git clone https://github.com/hiyouga/LLaMA-Factory.git 
bash evisrag_scripts/full_sft.sh
```

***Stage2: RS-GRPO*** (based on [Easy-R1](https://github.com/hiyouga/EasyR1))

```bash
bash evisrag_scripts/run_rsgrpo.sh
```

Notes:

1. The training data is available on Hugging Face under `EVisRAG-Train`, which is referenced at the beginning of this page.
2. We adopt a two-stage training strategy. In the first stage, please clone `LLaMA-Factory` and update the model path in the full_sft.sh script. In the second stage, we built our customized algorithm `RS-GRPO` based on `Easy-R1`, specifically designed for EVisRAG, whose implementation can be found in `src/RS-GRPO`.

# 📃 Evaluation
```bash
bash evisrag_scripts/predict.sh
bash evisrag_scripts/eval.sh 
```

Notes:

1. The test data is available on Hugging Face under `EVisRAG-Test-xxx`, as referenced at the beginning of this page.
2. To run the evaluation, first execute the `predict.sh` script. The model outputs will be saved in the preds directory. Then, use the `eval.sh` script to evaluate the predictions. The metrics `EM`, `Accuracy`, and `F1` will be reported directly.

# 🔧 Usage

Model on Hugging Face: https://huggingface.co/openbmb/EVisRAG-7B

```python
from transformers import AutoProcessor
from vllm import LLM, SamplingParams
from qwen_vl_utils import process_vision_info

def evidence_promot_grpo(query):
    return f"""You are an AI Visual QA assistant. I will provide you with a question and several images. Please follow the four steps below:

Step 1: Observe the Images
First, analyze the question and consider what types of images may contain relevant information. Then, examine each image one by one, paying special attention to aspects related to the question. Identify whether each image contains any potentially relevant information.
Wrap your observations within <observe></observe> tags.

Step 2: Record Evidences from Images
After reviewing all images, record the evidence you find for each image within <evidence></evidence> tags.
If you are certain that an image contains no relevant information, record it as: [i]: no relevant information(where i denotes the index of the image).
If an image contains relevant evidence, record it as: [j]: [the evidence you find for the question](where j is the index of the image).

Step 3: Reason Based on the Question and Evidences
Based on the recorded evidences, reason about the answer to the question.
Include your step-by-step reasoning within <think></think> tags.

Step 4: Answer the Question
Provide your final answer based only on the evidences you found in the images.
Wrap your answer within <answer></answer> tags.
Avoid adding unnecessary contents in your final answer, like if the question is a yes/no question, simply answer "yes" or "no".
If none of the images contain sufficient information to answer the question, respond with <answer>insufficient to answer</answer>.

Formatting Requirements:
Use the exact tags <observe>, <evidence>, <think>, and <answer> for structured output.
It is possible that none, one, or several images contain relevant evidence.
If you find no evidence or little evidence, and insufficient to help you answer the question, follow the instructions above for insufficient information.

Question and images are provided below. Please follow the steps as instructed.
Question: {query}
"""

model_path = "xxx"
processor = AutoProcessor.from_pretrained(model_path, trust_remote_code=True, padding_side='left')

imgs, query = ["imgpath1", "imgpath2", ..., "imgpathX"], "What xxx?"
input_prompt = evidence_promot_grpo(query)

content = [{"type": "text", "text": input_prompt}]
for imgP in imgs:
    content.append({
        "type": "image",
        "image": imgP
    })
msg = [{
          "role": "user",
          "content": content,
      }]

llm = LLM(
    model=model_path,
    tensor_parallel_size=1,
    dtype="bfloat16",
    limit_mm_per_prompt={"image":5, "video":0},
)

sampling_params = SamplingParams(
    temperature=0.1,
    repetition_penalty=1.05,
    max_tokens=2048,
)

prompt = processor.apply_chat_template(
    msg,
    tokenize=False,
    add_generation_prompt=True,
)

image_inputs, _ = process_vision_info(msg)

msg_input = [{
    "prompt": prompt,
    "multi_modal_data": {"image": image_inputs},
}]

output_texts = llm.generate(msg_input,
    sampling_params=sampling_params,
)

print(output_texts[0].outputs[0].text)
```


# 📄 License

* The code in this repo is released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License. 
* The usage of **EVisRAG** model weights must strictly follow [MiniCPM Model License.md](https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md).

# 📧 Contact
## EVisRAG
- Yubo Sun: syb2000417@stu.pku.edu.cn
- Chunyi Peng: hm.cypeng@gmail.com
