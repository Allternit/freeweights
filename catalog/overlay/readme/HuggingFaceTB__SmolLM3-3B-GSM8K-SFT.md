# SmolLM3-3B-GSM8K-SFT

Fine-tuned version of [HuggingFaceTB/SmolLM3-3B-Base](https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base) optimized for grade school math (GSM8K benchmark).

## Performance

| Metric | Score |
|--------|-------|
| **GSM8K Accuracy** | **65.8%** |
| Baseline (SmolLM3-3B-Base) | 23.3% |
| **Improvement** | **+42.5 pp (2.8x)** |

## Quick Start

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "HuggingFaceTB/SmolLM3-3B-GSM8K-SFT"
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype="auto", device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Solve a math problem
messages = [{"role": "user", "content": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?"}]

inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", add_generation_prompt=True).to(model.device)
outputs = model.generate(inputs, max_new_tokens=512, do_sample=False)
print(tokenizer.decode(outputs[0], skip_special_tokens=False))
```

**Expected output:**
```
Janet's ducks lay 16 eggs per day.
She eats 3 for breakfast, so 16 - 3 = 13 eggs remain.
She bakes muffins with 4 eggs, so 13 - 4 = 9 eggs remain.
She sells the remaining 9 eggs at $2 each.
9 × $2 = $18

#### 18
```

## Using with vLLM (Recommended for Speed)

```python
from vllm import LLM, SamplingParams

llm = LLM(model="HuggingFaceTB/SmolLM3-3B-GSM8K-SFT")
tokenizer = llm.get_tokenizer()

messages = [{"role": "user", "content": "What is 15 * 23 + 47?"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

outputs = llm.generate([prompt], SamplingParams(max_tokens=256, temperature=0))
print(outputs[0].outputs[0].text)
```

## Training Details

| Parameter | Value |
|-----------|-------|
| **Base Model** | HuggingFaceTB/SmolLM3-3B-Base |
| **Training Data** | [MetaMathQA](https://huggingface.co/datasets/meta-math/MetaMathQA) (100k samples) |
| **Method** | Supervised Fine-Tuning (SFT) with TRL 1.0.0 |
| **Hardware** | NVIDIA H100 80GB |
| **Training Time** | ~3h 16min |
| **Epochs** | 1 |
| **Batch Size** | 2 (effective 16 with gradient accumulation) |
| **Learning Rate** | 1e-5 |
| **Max Sequence Length** | 2048 |
| **Optimizer** | AdamW |

## Chat Template

This model uses the ChatML format:

```
<|im_start|>system
You are a helpful AI assistant.<|im_end|>
<|im_start|>user
What is 2 + 2?<|im_end|>
<|im_start|>assistant
2 + 2 = 4

#### 4<|im_end|>
```

## Training History

We tried multiple approaches to improve math reasoning:

| Stage | GSM8K Accuracy | Method | Notes |
|-------|----------------|--------|-------|
| Baseline | 23.3% | - | SmolLM3-3B-Base with no training |
| SFT V1 | 59.6% | SFT 2 epochs | MetaMathQA 50k samples |
| GRPO | 58% | GRPO | GSM8K train set - ineffective |
| **SFT V2** | **65.8%** | SFT 1 epoch | MetaMathQA 100k samples ✓ |

**Key finding:** More diverse training data (100k vs 50k samples) was more effective than more epochs or GRPO reinforcement learning.

## Reproduction

Training and evaluation scripts are available in the `training/` folder:

```bash
# Train from scratch
python training/train_sft.py

# Evaluate on GSM8K
python training/evaluate_gsm8k.py --model HuggingFaceTB/SmolLM3-3B-GSM8K-SFT --samples 1319
```

## Limitations

- Optimized specifically for grade school math; may not generalize to advanced mathematics
- Best performance with step-by-step reasoning format ending with `#### answer`
- Context window limited to 2048 tokens during training

## Citation

```bibtex
@misc{smollm3-gsm8k-sft,
  title={SmolLM3-3B-GSM8K-SFT: Fine-tuned SmolLM3 for Math Reasoning},
  author={Hugging Face},
  year={2026},
  publisher={Hugging Face},
  url={https://huggingface.co/HuggingFaceTB/SmolLM3-3B-GSM8K-SFT}
}
```

## License

Apache 2.0
