<center>
<div style="text-align: center;">
  <img 
    src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/2b08LKpev0DNEk6DlnWkY.png" 
    alt="Liquid AI"
    style="width: 100%; max-width: 100%; height: auto; display: inline-block; margin-bottom: 0.5em; margin-top: 0.5em;"
  />
</div>
<div style="display: flex; justify-content: center; gap: 0.5em;">
  <a href="https://playground.liquid.ai/chat">
<a href="https://playground.liquid.ai/"><strong>Try LFM</strong></a> • <a href="https://docs.liquid.ai/lfm"><strong>Documentation</strong></a> • <a href="https://leap.liquid.ai/"><strong>LEAP</strong></a></a>
</div>
</center>

# LFM2‑VL-450M

LFM2‑VL is [Liquid AI](https://www.liquid.ai/)'s first series of multimodal models, designed to process text and images with variable resolutions. 
Built on the [LFM2](https://huggingface.co/collections/LiquidAI/lfm2-686d721927015b2ad73eaa38) backbone, it is optimized for low-latency and edge AI applications. 

We're releasing the weights of two post-trained checkpoints with [450M](https://huggingface.co/LiquidAI/LFM2-VL-450M) (for highly constrained devices) and [1.6B](https://huggingface.co/LiquidAI/LFM2-VL-1.6B) (more capable yet still lightweight) parameters.

* **2× faster inference speed** on GPUs compared to existing VLMs while maintaining competitive accuracy
* **Flexible architecture** with user-tunable speed-quality tradeoffs at inference time
* **Native resolution processing** up to 512×512 with intelligent patch-based handling for larger images, avoiding upscaling and distortion

Find more about our vision-language model in the [LFM2-VL post](https://www.liquid.ai/blog/lfm2-vl-efficient-vision-language-models) and its language backbone in the [LFM2 blog post](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models).

## 📄 Model details

Due to their small size, **we recommend fine-tuning LFM2-VL models on narrow use cases** to maximize performance. 
They were trained for instruction following and lightweight agentic flows. 
Not intended for safety‑critical decisions.

| Property | [**LFM2-VL-450M**](https://huggingface.co/LiquidAI/LFM2-VL-450M) | [**LFM2-VL-1.6B**](https://huggingface.co/LiquidAI/LFM2-VL-1.6B) |
|---|---:|---:|
| **Parameters (LM only)** | 350M | 1.2B |
| **Vision encoder** | SigLIP2 NaFlex base (86M) | SigLIP2 NaFlex shape‑optimized (400M) |
| **Backbone layers** | hybrid conv+attention | hybrid conv+attention |
| **Context (text)** | 32,768 tokens | 32,768 tokens |
| **Image tokens** | dynamic, user‑tunable | dynamic, user‑tunable |
| **Vocab size** | 65,536 | 65,536 |
| **Precision** | bfloat16 | bfloat16 |
| **License** | LFM Open License v1.0 | LFM Open License v1.0 |

**Supported languages:** English

**Generation parameters**: We recommend the following parameters:
- Text: `temperature=0.1`, `min_p=0.15`, `repetition_penalty=1.05`
- Vision: `min_image_tokens=64` `max_image_tokens=256`, `do_image_splitting=True`

**Chat template**: LFM2-VL uses a ChatML-like chat template as follows:  

```
<|startoftext|><|im_start|>system
You are a helpful multimodal assistant by Liquid AI.<|im_end|>
<|im_start|>user
<image>Describe this image.<|im_end|>
<|im_start|>assistant
This image shows a Caenorhabditis elegans (C. elegans) nematode.<|im_end|>
```

Images are referenced with a sentinel (`<image>`), which is automatically replaced with the image tokens by the processor.

You can apply it using the dedicated [`.apply_chat_template()`](https://huggingface.co/docs/transformers/en/chat_templating#applychattemplate) function from Hugging Face transformers.

**Architecture**
- **Hybrid backbone**: Language model tower (LFM2-1.2B or LFM2-350M) paired with SigLIP2 NaFlex vision encoders (400M shape-optimized or 86M base variant)
- **Native resolution processing**: Handles images up to 512×512 pixels without upscaling and preserves non-standard aspect ratios without distortion
- **Tiling strategy**: Splits large images into non-overlapping 512×512 patches and includes thumbnail encoding for global context (in 1.6B model)
- **Efficient token mapping**: 2-layer MLP connector with pixel unshuffle reduces image tokens (e.g., 256×384 image → 96 tokens, 1000×3000 → 1,020 tokens)
- **Inference-time flexibility**: User-tunable maximum image tokens and patch count for speed/quality tradeoff without retraining

**Training approach**
- Builds on the LFM2 base model with joint mid-training that fuses vision and language capabilities using a gradually adjusted text-to-image ratio
- Applies joint SFT with emphasis on image understanding and vision tasks
- Leverages large-scale open-source datasets combined with in-house synthetic vision data, selected for balanced task coverage
- Follows a progressive training strategy: base model → joint mid-training → supervised fine-tuning

## 🏃 How to run LFM2-VL

### ONNXRuntime

```py
from transformers import AutoConfig, AutoProcessor
from transformers.image_utils import load_image
import onnxruntime
import numpy as np
from huggingface_hub import hf_hub_download

# 1. Load config, processor, and model
model_id = "onnx-community/LFM2-VL-450M-ONNX"
config = AutoConfig.from_pretrained(model_id)
processor = AutoProcessor.from_pretrained(model_id)

local_dir = 'LFM2-VL-450M-ONNX'
vision_model_path = hf_hub_download(model_id, "vision_encoder.onnx", subfolder="onnx", local_dir=local_dir)         # Download vision graph
hf_hub_download(model_id, "vision_encoder.onnx_data", subfolder="onnx", local_dir=local_dir)                        # Download vision weights
embed_model_path = hf_hub_download(model_id, "embed_tokens.onnx", subfolder="onnx", local_dir=local_dir)            # Download embed_tokens graph
hf_hub_download(model_id, "embed_tokens.onnx_data", subfolder="onnx", local_dir=local_dir)                          # Download embed_tokens weights
decoder_model_path = hf_hub_download(model_id, "decoder_model_merged.onnx", subfolder="onnx", local_dir=local_dir)  # Download decoder graph
hf_hub_download(model_id, "decoder_model_merged.onnx_data", subfolder="onnx", local_dir=local_dir)                  # Download decoder weights

## Load sessions
providers = ['CPUExecutionProvider']
vision_session = onnxruntime.InferenceSession(vision_model_path, providers=providers)
embed_session = onnxruntime.InferenceSession(embed_model_path, providers=providers)
decoder_session = onnxruntime.InferenceSession(decoder_model_path, providers=providers)

## Set config values
text_config = config.text_config
num_key_value_heads = text_config.num_key_value_heads
head_dim = text_config.hidden_size // text_config.num_attention_heads
num_hidden_layers = text_config.num_hidden_layers
eos_token_id = text_config.eos_token_id
hidden_size = text_config.hidden_size
conv_L_cache = text_config.conv_L_cache
layer_types = text_config.layer_types
image_token_index = config.image_token_index

# 2. Prepare inputs
image_url = "https://www.ilankelman.org/stopsigns/australia.jpg"
image = load_image(image_url)
messages = [
  {
    "role": "user",
    "content": [
      {"type": "image", "image": image},
      {"type": "text", "text": "What is in this image?"},
    ],
  },
]
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
pixel_attention_mask = inputs['pixel_attention_mask'].numpy().astype(np.int64) if has_vision_inputs else None
spatial_shapes = inputs['spatial_shapes'].numpy() if has_vision_inputs else None

batch_size = input_ids.shape[0]
past_cache_values = {}
for i in range(num_hidden_layers):
  if layer_types[i] == 'full_attention':
    for kv in ('key', 'value'):
      past_cache_values[f'past_key_values.{i}.{kv}'] = np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=np.float32)
  elif layer_types[i] == 'conv':
    past_cache_values[f'past_conv.{i}'] = np.zeros([batch_size, hidden_size, conv_L_cache], dtype=np.float32)
  else:
    raise ValueError(f"Unsupported layer type: {layer_types[i]}")

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
      pixel_attention_mask=pixel_attention_mask,
      spatial_shapes=spatial_shapes,
    ))[0]

    ## Merge text and vision embeddings
    inputs_embeds[input_ids == image_token_index] = image_features.reshape(-1, image_features.shape[-1])

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
print(processor.batch_decode(generated_tokens, skip_special_tokens=False)[0])
```

## 🔧 How to fine-tune

We recommend fine-tuning LFM2-VL models on your use cases to maximize performance.

| Notebook  | Description                                                          | Link |
|-----------|----------------------------------------------------------------------|------|
| SFT (TRL) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using TRL. | <a href="https://colab.research.google.com/drive/1csXCLwJx7wI7aruudBp6ZIcnqfv8EMYN?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |


## 📈 Performance

| Model             | RealWorldQA | MM-IFEval | InfoVQA (Val) | OCRBench | BLINK | MMStar | MMMU (Val) | MathVista | SEEDBench_IMG | MMVet | MME      | MMLU  |
|-------------------|-------------|-----------|---------------|----------|-------|--------|------------|-----------|---------------|-------|----------|-------|
| InternVL3-2B      | 65.10       | 38.49     | 66.10         | 831   | 53.10 | 61.10  | 48.70      | 57.60     | 75.00          | 67.00 | 2186.40  | 64.80 |
| InternVL3-1B      | 57.00       | 31.14     | 54.94         | 798   | 43.00 | 52.30  | 43.20      | 46.90     | 71.20          | 58.70 | 1912.40  | 49.80 |
| SmolVLM2-2.2B     | 57.50       | 19.42     | 37.75         | 725   | 42.30 | 46.00  | 41.60      | 51.50     | 71.30          | 34.90 | 1792.50  | -     |
| LFM2-VL-1.6B      | 65.23       | 37.66     | 58.68         | 742   | 44.40 | 49.53  | 38.44      | 51.10     | 71.97          | 48.07 | 1753.04  | 50.99 |

| Model             | RealWorldQA | MM-IFEval | InfoVQA (Val) | OCRBench | BLINK | MMStar | MMMU (Val) | MathVista | SEEDBench_IMG | MMVet | MME      | MMLU  |
|-------------------|-------------|-----------|---------------|----------|-------|--------|------------|-----------|---------------|-------|----------|-------|
| SmolVLM2-500M     | 49.90       | 11.27     | 24.64         | 609   | 40.70 | 38.20  | 34.10      | 37.50     | 62.20          | 29.90 | 1448.30  | -     |
| LFM2-VL-450M      | 52.29       | 26.18     | 46.51         | 655   | 41.98 | 40.87  | 33.11      | 44.70     | 63.50          | 33.76 | 1239.06  | 40.16 |

We obtained MM-IFEval and InfoVQA (Val) scores for InternVL 3 and SmolVLM2 models using VLMEvalKit.

## 📬 Contact

If you are interested in custom solutions with edge deployment, please contact [our sales team](https://www.liquid.ai/contact).

## Citation

```
@article{liquidai2025lfm2,
 title={LFM2 Technical Report},
 author={Liquid AI},
 journal={arXiv preprint arXiv:2511.23404},
 year={2025}
}
```