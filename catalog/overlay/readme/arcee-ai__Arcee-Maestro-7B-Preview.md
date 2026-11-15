**Arcee-Maestro-7B-Preview (7B)** is Arcee's first reasoning model trained with reinforment learning. It is based on the Qwen2.5-7B DeepSeek-R1 distillation **DeepSeek-R1-Distill-Qwen-7B** with further GRPO training. Though this is just a preview of our upcoming work, it already shows promising improvements to mathematical and coding abilities across a range of tasks.

### Quantizations

GGUF quants available [here](https://huggingface.co/arcee-ai/Arcee-Maestro-7B-Preview-GGUF)

AWQ quants available [here](https://huggingface.co/arcee-ai/Arcee-Maestro-7B-Preview-AWQ)

### Model Details

- Architecture Base: DeepSeek-R1-Distill-Qwen-7B (Qwen2.5-7B)
- Parameter Count: 7B
- Reinforcement Learning: GRPO with 450,000 **verified** math problems with some coding examples
- License: [Apache-2.0](https://huggingface.co/arcee-ai/Arcee-Maestro-7B-Preview#license)

### Intended Use Cases

- Advanced reasoning
- Mathematics
- Coding

### Evaluations

![image/png](https://cdn-uploads.huggingface.co/production/uploads/6435718aaaef013d1aec3b8b/DlSBEmCFS7yjJi2kOGuLa.png)

Arcee Maestro 7B preview shows great gains in mathematics and coding, surpassing O1 preview in many metrics.

### How to use

Below is a sample code snippet using `transformers`:

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "arcee-ai/Arcee-Maestro-7B-Preview"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

prompt = "Provide a concise summary of quantum entanglement."
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=150)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### Training & Fine-Tuning

- **Initial Training**: Began with DeepSeek-R1-Distill-Qwen-7B
- **GRPO**:
  - Trained on 450,000 verified math problems
  - Additional bootstrapped coding examples

### Performance

Arcee-Maestro-7B-Preview shows strong performance in mathematics as well as coding, competing against even O1 preview, a model far surprassing its size.

### Limitations

- **Context Length:** 128k Tokens (may vary depending on the final tokenizer settings and system resources).
- **Knowledge Cut-off:** Training data may not reflect the latest events or developments beyond June 2024.

### Ethical Considerations
- **Content Generation Risks:** Like any language model, Arcee-Maestro-7B-Preview can generate potentially harmful or biased content if prompted in certain ways.

### License
**Arcee-Maestro-7B-Preview (7B)** is released under the [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0). You are free to use, modify, and distribute this model in both commercial and non-commercial applications, subject to the terms and conditions of the license.

If you have questions or would like to share your experiences using Arcee-Maestro-7B-Preview (7B), please connect with us on social media. We’re excited to see what you build—and how this model helps you innovate!