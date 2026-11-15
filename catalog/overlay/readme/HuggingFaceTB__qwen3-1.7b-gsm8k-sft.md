# Qwen3-1.7B Fine-tuned for GSM8K Math Reasoning

This model is a fine-tuned version of [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B) optimized for mathematical reasoning on the GSM8K benchmark.

## Performance

| Benchmark | Accuracy | Notes |
|-----------|----------|-------|
| **GSM8K** | **77.2%** | Grade school math (1,319 test problems) |
| **MATH-500** | **55.2%** | Competition math (500 test problems) |
| Baseline GSM8K | 20% | Original Qwen3-1.7B |

### MATH-500 Breakdown by Difficulty Level

| Level | Accuracy |
|-------|----------|
| Level 1 (Easiest) | 86.0% |
| Level 2 | 68.9% |
| Level 3 | 64.8% |
| Level 4 | 54.7% |
| Level 5 (Hardest) | 29.1% |

### MATH-500 Breakdown by Subject

| Subject | Accuracy |
|---------|----------|
| Algebra | 71.8% |
| Prealgebra | 68.3% |
| Number Theory | 61.3% |
| Counting & Probability | 55.3% |
| Geometry | 43.9% |
| Precalculus | 41.1% |
| Intermediate Algebra | 32.0% |

### Baseline Comparison

| Model | GSM8K | MATH-500 | Notes |
|-------|-------|----------|-------|
| **This model (SFT)** | **77.2%** | 55.2% | Optimized for GSM8K |
| Qwen3-1.7B (base) | ~20% | 62.0% | Pre-training only |

Note: The fine-tuned model shows significant improvement on GSM8K (+57pp) but slightly lower performance on MATH-500 compared to the base model. This is expected as the training focused on GSM8K-style problems.

## GGUF Quantized Versions

For deployment with llama.cpp, Ollama, or other GGUF-compatible runtimes:

| File | Size | Description |
|------|------|-------------|
| [qwen3-1.7b-gsm8k-q8_0.gguf](https://huggingface.co/HuggingFaceTB/qwen3-1.7b-gsm8k-sft/blob/main/qwen3-1.7b-gsm8k-q8_0.gguf) | 1.8 GB | 8-bit quantized (recommended) |
| [qwen3-1.7b-gsm8k-f16.gguf](https://huggingface.co/HuggingFaceTB/qwen3-1.7b-gsm8k-sft/blob/main/qwen3-1.7b-gsm8k-f16.gguf) | 3.3 GB | Full FP16 precision |

### Usage with Ollama

```bash
# Download and run
ollama run hf.co/HuggingFaceTB/qwen3-1.7b-gsm8k-sft:q8_0
```

### Usage with llama.cpp

```bash
# Download the GGUF file
huggingface-cli download HuggingFaceTB/qwen3-1.7b-gsm8k-sft qwen3-1.7b-gsm8k-q8_0.gguf

# Run inference
./llama-cli -m qwen3-1.7b-gsm8k-q8_0.gguf -p "Solve: If a train travels 120 miles in 2 hours, what is its average speed?"
```

## Training Details

### Dataset
- **Size**: 247,467 examples
- **Sources**:
  - [GSM8K](https://huggingface.co/datasets/openai/gsm8k) train set (7,473 examples)
  - [MetaMathQA](https://huggingface.co/datasets/meta-math/MetaMathQA) GSM-related examples (239,994 examples)
- **Format**: Conversational messages with `<think>...</think>` chain-of-thought reasoning

### Training Configuration
- **Stage 1** (2 epochs): lr=2e-5, loss 0.30 → 0.17
- **Stage 2** (1 epoch): lr=5e-6, loss 0.17 → 0.167
- **Batch size**: 8 per device, gradient accumulation 4
- **Hardware**: NVIDIA H100 80GB GPU
- **Total training time**: ~7 hours

### Hyperparameters
```python
SFTConfig(
    num_train_epochs=2,  # Stage 1
    per_device_train_batch_size=8,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,  # 5e-6 for Stage 2
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    weight_decay=0.01,
    max_length=1024,
    packing=True,
    bf16=True,
    gradient_checkpointing=True,
)
```

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained(
    "HuggingFaceTB/qwen3-1.7b-gsm8k-sft",
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("HuggingFaceTB/qwen3-1.7b-gsm8k-sft")

# For math problems, the model uses chain-of-thought reasoning
messages = [
    {"role": "user", "content": "Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?"}
]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=1024, do_sample=False)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## Evaluation

### GSM8K
- **Accuracy**: 77.2% ± 1.2% (standard error)
- Test set: 1,319 grade school math word problems

### MATH-500
- **Accuracy**: 55.2%
- Test set: 500 competition-level math problems
- Best performance on Algebra (71.8%) and Prealgebra (68.3%)
- Model uses chain-of-thought reasoning enclosed in `<think>...</think>` tags

## Key Learnings

1. **Chain-of-thought format is crucial** - The `<think>...</think>` reasoning format significantly improves math performance
2. **Large diverse dataset works better** - MetaMathQA (240K examples) outperforms small task-specific data
3. **Two-stage training** - Starting with higher LR (2e-5) then refining with lower LR (5e-6) works well
4. **Diminishing returns after ~3 epochs** - Additional fine-tuning showed minimal improvement
5. **Transfer to harder problems** - GSM8K training also improves MATH-500 performance, especially on algebra

## Training Scripts

Training scripts are available in the `scripts/` directory:
- `train_improved.py` - Main training script (Stage 1)
- `train_continued.py` - Continued training script (Stage 2)
- `evaluate.py` - GSM8K evaluation script
- `evaluate_math500.py` - MATH-500 evaluation script
- `prepare_combined_data.py` - Data preparation script

## Citation

If you use this model, please cite:

```bibtex
@misc{qwen3-gsm8k-sft,
  title={Qwen3-1.7B Fine-tuned for GSM8K},
  author={HuggingFaceTB},
  year={2026},
  publisher={Hugging Face},
  url={https://huggingface.co/HuggingFaceTB/qwen3-1.7b-gsm8k-sft}
}
```

## License

This model inherits the license from the base model [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B) (Apache 2.0).
