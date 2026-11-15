ONNX flavor of https://huggingface.co/openai/gpt-oss-20b.

The ONNX model using int4 quantization.

When pinning embeddings to CPU it will run well on 12GB gpus.


## Usage


### ONNXRuntime

```py
from transformers import AutoConfig, AutoTokenizer, GenerationConfig
import onnxruntime
import numpy as np

# 1. Load config, processor, and model
model_id = "onnx-community/gpt-oss-20b-ONNX"
config = AutoConfig.from_pretrained(model_id)
generation_config = GenerationConfig.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)
model_path = "/path/to/onnx/model_q4f16.onnx" # NB: Add .onnx_data* files to the same directory as the model file
decoder_session = onnxruntime.InferenceSession(model_path, providers=['WebGpuExecutionProvider'])

## Set config values
num_key_value_heads = config.num_key_value_heads
head_dim = config.head_dim
num_hidden_layers = config.num_hidden_layers
eos_token_id = generation_config.eos_token_id

# 2. Prepare inputs
messages = [
  { "role": "user", "content": "Write me a poem about Machine Learning." },
]
inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="np")
input_ids = inputs['input_ids']
attention_mask = inputs['attention_mask']
batch_size = input_ids.shape[0]
past_key_values = {
    f'past_key_values.{layer}.{kv}': np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=np.float16)
    for layer in range(num_hidden_layers)
    for kv in ('key', 'value')
}

# 3. Generation loop
max_new_tokens = 1024
generated_tokens = np.array([[]], dtype=np.int64)
for i in range(max_new_tokens):
  logits, *present_key_values = decoder_session.run(None, dict(
      input_ids=input_ids,
      attention_mask=attention_mask,
      **past_key_values,
  ))

  ## Update values for next generation loop
  input_ids = logits[:, -1].argmax(-1, keepdims=True)
  attention_mask = np.concatenate([attention_mask, np.ones_like(input_ids, dtype=np.int64)], axis=-1)
  for j, key in enumerate(past_key_values):
    past_key_values[key] = present_key_values[j]

  generated_tokens = np.concatenate([generated_tokens, input_ids], axis=-1)
  if np.isin(input_ids, eos_token_id).any():
    break

  ## (Optional) Streaming
  print(tokenizer.decode(input_ids[0]), end='', flush=True)
print()

# 4. Output result
print(tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0])
```
