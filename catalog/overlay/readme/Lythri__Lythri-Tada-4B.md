<p align="center">
  <img src="https://huggingface.co/spaces/Lythri/README/resolve/main/Banner_flat.png" width="600" alt="Lythri"/>
</p>

<p align="center">
  <a href="https://huggingface.co/Lythri">Hugging Face</a> |
  <a href="https://www.modelscope.cn/profile/Spike8086">ModelScope</a> |
  <a href="https://zenodo.org/records/23179312">Technical Report</a>
</p>

## Introduction

**Lythri-Tada-4B** is part of the **Lythri 2.0** family, with **4.63B total parameters** and **2.3B activated parameters**. It answers directly without a thinking phase, while reinforce model's emotional understanding.

Compared with the previous-generation Lythri-4B-A2B, Tada brings three main upgrades:

- **Stronger instruction following.** Tada scores 39.19 on IFEval (prompt-level strict), **surpassing even the Lythri-7B-A4B (31.05)**.
- **Better multi-turn conversations.** Tada keeps track of earlier context and user requests more consistently over long chats, and carries the emotional thread from turn to turn.
- **System prompt support.** Unlike Lythri-4B-A2B, Tada follows system prompts, so you can set a persona, tone or rules for your app directly in the system message.

Long-tail knowledge, such as graduate-level science questions, is slightly weaker than Lythri-4B-A2B, while overall performance improves **substantially**.

## Writing Naturalness

<p align="center">
  <img src="https://huggingface.co/spaces/Lythri/README/resolve/main/Tada_Slop.png" width="800" alt="EQ-Bench Slop Score"/>
</p>

On the [EQ-Bench Slop Score](https://eqbench.com/slop-score.html), which measures how much a model relies on typical AI phrasing (lower is better), **Lythri-Tada-4B scores 39.0 and writes more naturally than GPT-4o (47.7) and DeepSeek-R1 (67.9)**, far ahead of Qwen3-4B (62.2) and Gemma-3-4B (85.2).

## General Benchmarks

<table width="100%" style="display: table; width: 100%; border-collapse: collapse; text-align: center;">
  <thead>
    <tr style="border-bottom: 2px solid #338f65;">
      <th width="40%" style="text-align: left; padding: 10px 16px;">Benchmark</th>
      <th width="30%" style="color: #338f65; white-space: nowrap; padding: 10px 16px;">Lythri-4B-A2B</th>
      <th width="30%" style="background: rgba(51,143,101,0.12); color: #338f65; white-space: nowrap; padding: 10px 16px;">Lythri-Tada-4B</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">Knowledge</td>
    </tr>
    <tr><td style="text-align: left;">MMLU</td><td>55.23</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">55.41</td></tr>
    <tr><td style="text-align: left;">ARC-C</td><td>52.99</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">56.57</td></tr>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">Reasoning</td>
    </tr>
    <tr><td style="text-align: left;">HellaSwag</td><td>72.80</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">74.23</td></tr>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">General</td>
    </tr>
    <tr><td style="text-align: left;">SocialIQA</td><td>49.80</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">51.43</td></tr>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">Science</td>
    </tr>
    <tr><td style="text-align: left;">GPQA Diamond</td><td>28.79</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">21.21</td></tr>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">Math</td>
    </tr>
    <tr><td style="text-align: left;">GSM8K</td><td>28.81</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">27.45</td></tr>
    <tr style="background: rgba(51,143,101,0.06);">
      <td colspan="3" style="text-align: left; color: #338f65; font-weight: bold;">Code / Instruction</td>
    </tr>
    <tr><td style="text-align: left;">HumanEval</td><td>28.66</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">24.39</td></tr>
    <tr><td style="text-align: left;">IFEval</td><td>26.43</td><td style="background: rgba(51,143,101,0.12); color: #338f65; font-weight: bold;">39.19</td></tr>
  </tbody>
</table>

All benchmarks are evaluated with their official standard settings and the chat template applied, reflecting real-world inference conditions. Lythri-4B-A2B is evaluated with thinking; Lythri-Tada-4B answers directly without thinking.

## Quickstart
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_path = "Lythri/Lythri-Tada-4B"
tok = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path, dtype=torch.bfloat16, device_map="auto"
)

messages = [{"role": "user", "content": "My friend just lost their job and seems really down. What should I say to them?"}]
chat = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tok(chat, return_tensors="pt", add_special_tokens=False).to(model.device)

with torch.inference_mode():
    out = model.generate(
        **inputs,
        max_new_tokens=1024,
        do_sample=True,
        temperature=0.8,
        top_p=0.95,
        eos_token_id=[1, 106],
    )

print(tok.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))
```

### Recommended Generation Config

```python
generation_config = {
    "temperature": 0.8,
    "top_p": 0.95,
    "top_k": 64,
    "max_new_tokens": 1024,
    "repetition_penalty": 1.05,
    "do_sample": True,
    "eos_token_id": [1, 106],
}

out = model.generate(**inputs, **generation_config)
```

### System Prompt (Optional)

Lythri-Tada-4B supports system prompts, which Lythri-4B-A2B does not. It works well without one; to set a persona or rules for your app, add a system message:

```python
messages = [
    {"role": "system", "content": "You are Lythri, a warm and caring companion. Reply in the same language as the user."},
    {"role": "user", "content": "I had a really rough day at work."},
]
```

## Compute

Lythri-Tada-4B starts from the Gemma4-E2B PT and training on SFT with CoT, followed by instant-reply SFT with multi-turn companion conversations, and online preference optimization on only writing with responses judged by Gemma2-27B.

## Limitations

- Lythri is optimized for conversation and emotional understanding, not for math, coding or complex reasoning.
- Lythri is not a substitute for professional mental health support. If you or someone you know is in crisis, please contact local emergency services or a crisis helpline.
- Like all language models, it can produce inaccurate or inappropriate content.

## License

Lythri is built on Gemma 4 and is released under the Apache License 2.0.

## Citation

```bibtex
@techreport{li2026lythri,
  title       = {Lythri Technical Report},
  author      = {Li, Jiawen},
  year        = {2026},
  institution = {Zenodo},
  doi         = {10.5281/zenodo.23179311},
  url         = {https://doi.org/10.5281/zenodo.23179311}
}
```

## Support
**The whole training process is self-funded. If you like our model, please click a free like — that means a lot to me as a student!**