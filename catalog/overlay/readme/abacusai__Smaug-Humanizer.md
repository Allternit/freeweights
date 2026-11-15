<div align="center">
  <picture>
      <img src="https://cdn-avatars.huggingface.co/v1/production/uploads/63128dd099791aa61d180c72/dJ6uR23m09M-YEafBpmea.png" width="20%" alt="Smaug Humanizer">
  </picture>
</div>
<hr>
<div align="center" style="line-height:1">
  <a href="https://abacus.ai" target="_blank"><img alt="Homepage" src="https://img.shields.io/badge/Homepage-Abacus.AI-white?color=1783ff&logoColor=white"/></a>
  <a href="https://huggingface.co/abacusai" target="_blank"><img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Abacus.AI-ffc107?color=ffc107&logoColor=white"/></a>
</div>
<div align="center" style="line-height: 1;">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-f5de53?&color=f5de53"/></a>
</div>

## 1. Model Introduction

Smaug Humanizer rewrites AI-generated text so that it reads as if a person wrote it. It keeps the facts, numbers, names and layout of the input, and changes the wording, rhythm and voice. It is a 12B model, fine-tuned by Abacus.AI from [gemma-4-12B](https://huggingface.co/google/gemma-4-12B).


## 2. Model Summary

| | |
|:---|:---|
| **Base model** | [`google/gemma-4-12B`](https://huggingface.co/google/gemma-4-12B) (pretrained model, not instruction-tuned) |
| **Parameters** | 12B |
| **Precision** | bf16 |
| **Input / output** | AI-written text / the same text rewritten in a human voice |
| **Best input length** | up to about 500 words per call (see Limitations) |
| **Training** | SFT on 3,676 rewrite pairs, then 200 steps of GRPO |
| **Recommended sampling** | temperature 1.0, top_p 0.95, top_k 64 |
| **Blog post** | [Smaug Humanizer: An open-weight 12B humanizer](https://blog.abacus.ai/blog/2026/10/26/smaug-humanizer-an-open-weight-12b-humanizer/) |
| **GGUF** | [abacusai/Smaug-Humanizer-GGUF](https://huggingface.co/abacusai/Smaug-Humanizer-GGUF) |
| **License** | Apache 2.0 |

## 3. Training

<div align="center">
  <img src="figures/smaug_humanizer_method.png" width="100%" alt="Smaug Humanizer training pipeline">
</div>

### Stage 1: SFT

We start from human text written in 2021 or earlier, so we know a person wrote it. An LLM rewrites each passage in its own style, which gives an AI text x for every human text h. The model learns the reverse direction, from x back to h.

When asked to rewrite a passage, LLMs often change only a few words, and a model trained on such pairs learns to make the same light edits. So we keep a pair only if it passes all of our filters:

- **A real rewrite:** a deterministic check drops pairs where too many of the human sentences survive in x.
- **The same layout:** a deterministic check requires the same paragraph and line breaks in x and h.
- **The same facts:** an LLM judge checks that x keeps every fact, number, name and quote of h and adds nothing.

We ended up with 3,676 pairs, and train a LoRA (r = 64, α = 128) on gemma-4-12B for 2 epochs. Most of the gain came from this stage: cleaner pairs helped more than anything we did later. RL adds a smaller gain on top. We measured each step on a held-out set of AI-written texts that the model never saw in training. [Pangram](https://www.pangram.com), a commercial AI-text detector, scored how human each rewrite reads, and an LLM judge scored its faithfulness to the input.

### Stage 2: RL

**The reward.** Each prompt x comes with its own human text h, the passage that x was made from. A rewrite y earns reward for being close to h and far from x:

$$
r(y) = k(y, h) - k(y, x), \qquad k(a, b) = \exp\!\left(-\gamma\,\lVert e(a) - e(b) \rVert^2\right)
$$

Here e(·) is a text embedder and γ = 0.262. Because h and x carry the same content, the difference between the two terms is mostly style: the rewrite gains reward when it moves away from its AI draft and toward the way a person wrote the same thing. Our [blog post](https://blog.abacus.ai/blog/2026/10/26/smaug-humanizer-an-open-weight-12b-humanizer/) shows how this kernel similarity reward follows from an MMD objective.

**The gates.** The reward alone does not protect the facts: a rewrite that leaves out a detail is also further from its AI draft. So each sample must also pass five deterministic gates:

- **Numbers:** every number in the input is in the rewrite.
- **Layout:** the rewrite has the same paragraph and line breaks as the input.
- **Length:** the rewrite is 0.7 to 1.4 times as long as the input.
- **Script:** the rewrite does not switch to another alphabet.
- **Spelling:** the rewrite does not have more unknown or misspelled words than normal human text.

A sample that fails any gate gets the lowest raw reward in its group of 8, taken over all 8 samples:

$$
\tilde r(y_i) =
\begin{cases}
r(y_i) & \text{if } y_i \text{ passes every gate} \\
\min_j r(y_j) & \text{otherwise}
\end{cases}
$$

**Optimization.** For each prompt the policy samples a group of 8 rewrites, and GRPO uses the group-normalized advantage

$$
A_i = \frac{\tilde r(y_i) - \operatorname{mean}_j \tilde r(y_j)}{\operatorname{std}_j \tilde r(y_j)}
$$

with a KL penalty to the SFT model.

| Setting | Value |
|:---|:---|
| Start point and KL reference | the Stage 1 SFT model |
| Prompts | 2,000 AI texts with their human originals |
| Steps | 200 |
| Group size | 8 |
| Learning rate | 3e-5, linear decay |
| KL coefficient β | 0.05 |
| LoRA | r = 64, α = 128 |
| Max completion | 1,024 tokens |

<div align="center">
  <img src="figures/smaug_humanizer_reward_curve.png" width="100%" alt="The kernel similarity reward rises during GRPO">
</div>

We stop at 200 steps on purpose. When we ran the same reward for 400 steps, the reward kept climbing, but the rewrites got worse.

## 4. Generations

Each input is a chatbot answer on a fictional or general topic, the right column is a Smaug Humanizer rewrite of it

<table>
  <tr><td colspan="2"><b>A backgrounder on local election recounts (gpt-6-sol)</b></td></tr>
  <tr>
    <td align="center">Input: Pangram 100% AI<br><img src="figures/examples/recount_input_pangram.png" alt="Pangram scores the input as 100% AI"></td>
    <td align="center">Smaug Humanizer: Pangram 100% human<br><img src="figures/examples/recount_output_pangram.png" alt="Pangram scores the rewrite as 100% human"></td>
  </tr>
  <tr><td colspan="2"><b>A personal essay about baking bread (gpt-6-sol)</b></td></tr>
  <tr>
    <td align="center">Input: Pangram 100% AI<br><img src="figures/examples/bread_input_pangram.png" alt="Pangram scores the input as 100% AI"></td>
    <td align="center">Smaug Humanizer: Pangram 100% human<br><img src="figures/examples/bread_output_pangram.png" alt="Pangram scores the rewrite as 100% human"></td>
  </tr>
  <tr><td colspan="2"><b>An explainer on the phases of the Moon (gemini-3.8-flash)</b></td></tr>
  <tr>
    <td align="center">Input: Pangram 100% AI<br><img src="figures/examples/moon_input_pangram.png" alt="Pangram scores the input as 100% AI"></td>
    <td align="center">Smaug Humanizer: Pangram 100% human<br><img src="figures/examples/moon_output_pangram.png" alt="Pangram scores the rewrite as 100% human"></td>
  </tr>
</table>

## 5. Usage

The model takes one user turn with this prompt:

```python
PROMPT = """Rewrite the AI-written text below so that it reads as if a person wrote it, in a person's own voice, wording and rhythm.

Keep every fact, number, name and quote. Keep the structure and the language of the text. Output only the rewritten text.

Text:
{text}"""
```

### vLLM

```bash
vllm serve abacusai/Smaug-Humanizer --language-model-only --dtype bfloat16 --max-model-len 8192
```

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="none")

response = client.chat.completions.create(
    model="abacusai/Smaug-Humanizer",
    messages=[{"role": "user", "content": PROMPT.format(text=text)}],
    temperature=1.0,
    top_p=0.95,
    stop=["<end_of_turn>"],
    extra_body={"top_k": 64},
)
print(response.choices[0].message.content.strip())
```

### Transformers

```python
from transformers import AutoModelForImageTextToText, AutoTokenizer

model_id = "abacusai/Smaug-Humanizer"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForImageTextToText.from_pretrained(model_id, dtype="bfloat16", device_map="auto")

messages = [{"role": "user", "content": PROMPT.format(text=text)}]
input_ids = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
).to(model.device)

output_ids = model.generate(
    input_ids,
    max_new_tokens=8192,
    tokenizer=tokenizer,  # needed for the <end_of_turn> stop string in generation_config.json
)
completion = tokenizer.decode(output_ids[0][input_ids.shape[1]:], skip_special_tokens=True)
print(completion.split("<end_of_turn>")[0].strip())  # generate() stops at <end_of_turn> but keeps it in the output
```

### llama.cpp (GGUF)

GGUF files for llama.cpp, Ollama and LM Studio are in [abacusai/Smaug-Humanizer-GGUF](https://huggingface.co/abacusai/Smaug-Humanizer-GGUF). Q8_0 fits a 16 GB GPU, and Q4_K_M runs on an 8 GB GPU or a laptop.

```bash
llama-server -hf abacusai/Smaug-Humanizer-GGUF:Q4_K_M -ngl 99 -c 8192 --port 8080
```

Use the same prompt and sampling, and add `<end_of_turn>` as a stop string.

### Sampling parameters

- `temperature`: 1.0
- `top_p`: 0.95
- `top_k`: 64
- `stop`: `["<end_of_turn>"]`. Required: the model ends its turn with the text `<end_of_turn>`, not with `<eos>`.

## 6. Limitations

- **Long texts are harder.** A detector judges the whole document, so every part has to pass. Split long inputs at paragraph breaks into chunks of about 500 words, rewrite each chunk, and join them with a blank line.
- **Mostly English.** Other languages work, but less well.
- **Some rewrites are still flagged.** Smaug Humanizer turns many texts that detectors score as AI into text they score as human, but not every time. Pangram still flags some rewrites, more often for long texts. Sample a few rewrites and pick one if it matters.
- **Read the output.** The gates cover numbers and layout, but a rewrite can still change a detail. Check anything you publish.

## 7. License

Apache 2.0, the same license as the base model, [gemma-4-12B](https://huggingface.co/google/gemma-4-12B).

## 8. Citation

```bibtex
@misc{abacusai2026smaughumanizer,
  title  = {Smaug Humanizer},
  author = {Abacus.AI},
  year   = {2026},
  url    = {https://huggingface.co/abacusai/Smaug-Humanizer}
}
```

## 9. Contact Us

If you have any questions, please reach out at [Abacus.AI](https://abacus.ai).
