## Usage

### ONNXRuntime
```py
from transformers import AutoConfig, AutoProcessor, GenerationConfig
import onnxruntime as ort
import numpy as np
from huggingface_hub import snapshot_download

# 1. Load config, processor, and model
model_id = "onnx-community/LightOnOCR-2-1B-ONNX"
config = AutoConfig.from_pretrained(model_id)
processor = AutoProcessor.from_pretrained(model_id)
generation_config = GenerationConfig.from_pretrained(model_id)

vision_model = "onnx/vision_encoder_q4.onnx"
embed_model = "onnx/embed_tokens_q4.onnx"
decoder_model = "onnx/decoder_model_merged_q4.onnx"

folder_path = snapshot_download(
    repo_id=model_id,
    allow_patterns=[f"{vision_model}*", f"{embed_model}*", f"{decoder_model}*"],
)
vision_model_path = f"{folder_path}/{vision_model}"
embed_model_path = f"{folder_path}/{embed_model}"
decoder_model_path = f"{folder_path}/{decoder_model}"

## Load sessions
providers = ['CPUExecutionProvider']
vision_session = ort.InferenceSession(vision_model_path, providers=providers)
embed_session = ort.InferenceSession(embed_model_path, providers=providers)
decoder_session = ort.InferenceSession(decoder_model_path, providers=providers)

## Set config values
text_config = config.text_config
hidden_size = text_config.hidden_size

num_key_value_heads = text_config.num_key_value_heads
head_dim = text_config.head_dim
num_hidden_layers = text_config.num_hidden_layers
eos_token_id = generation_config.eos_token_id
image_token_id = config.image_token_id

# 2. Prepare inputs
url = "https://huggingface.co/datasets/hf-internal-testing/fixtures_ocr/resolve/main/SROIE-receipt.jpeg"
messages = [{"role": "user", "content": [{"type": "image", "url": url}]}]
inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
    return_dict=True,
    tokenize=True,
)

input_ids = inputs['input_ids'].numpy()
attention_mask = inputs['attention_mask'].numpy()
has_vision_inputs = 'pixel_values' in inputs
pixel_values = inputs['pixel_values'].numpy() if has_vision_inputs else None

batch_size = input_ids.shape[0]
past_cache_values = {}
for i in range(num_hidden_layers):
  for kv in ('key', 'value'):
    past_cache_values[f'past_key_values.{i}.{kv}'] = np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=np.float32)

# 3. Generation loop
max_new_tokens = 1024
generated_tokens = np.array([[]], dtype=np.int64)
image_features = None
for i in range(max_new_tokens):
  inputs_embeds = embed_session.run(None, {'input_ids': input_ids})[0]

  if has_vision_inputs and image_features is None:
    ## Only compute vision features if not already computed
    image_features = vision_session.run(None, dict(
        pixel_values=pixel_values,
    ))[0]

    ## Merge text and vision embeddings
    inputs_embeds[input_ids == image_token_id] = image_features.reshape(-1, image_features.shape[-1])

  logits, *present_cache_values = decoder_session.run(None, dict(
      inputs_embeds=inputs_embeds,
      attention_mask=attention_mask,
      **past_cache_values,
  ))

  ## Update values for next generation loop
  input_ids = logits[:, -1].argmax(-1, keepdims=True)
  attention_mask = np.concatenate([attention_mask, np.ones((batch_size, 1), dtype=attention_mask.dtype)], axis=-1)
  for j, key in enumerate(past_cache_values):
    past_cache_values[key] = present_cache_values[j]

  generated_tokens = np.concatenate([generated_tokens, input_ids], axis=-1)
  if np.isin(input_ids, eos_token_id).any():
    break

  ## (Optional) Streaming
  print(processor.decode(input_ids[0], skip_special_tokens=False), end='', flush=True)
print()

# 4. Output result
print(processor.batch_decode(generated_tokens, skip_special_tokens=True)[0])
```

<details>

<summary>See example output</summary>

```
Document No : TD01167104  
Date : 25/12/2018 8:13:39 PM  
Cashier : MANIS  
Member :  

# CASH BILL

<table>
  <thead>
    <tr>
      <th>CODE/DESC</th>
      <th>PRICE</th>
      <th>Disc</th>
      <th>AMOUNT</th>
    </tr>
    <tr>
      <th>QTY</th>
      <th>RM</th>
      <th></th>
      <th>RM</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>9556939040118</td>
      <td>KF MODELLING CLAY KIDDY FISH</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>1 PC *</td>
      <td>9.000</td>
      <td>0.00</td>
      <td>9.00</td>
    </tr>
    <tr>
      <td colspan="3">Total :</td>
      <td>9.00</td>
    </tr>
    <tr>
      <td colspan="3">Rounding Adjustment :</td>
      <td>0.00</td>
    </tr>
    <tr>
      <td colspan="3">Rounded Total (RM):</td>
      <td>9.00</td>
    </tr>
  </tbody>
</table>
```

</details>
