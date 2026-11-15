<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/SmolVLM.png" width="800" height="auto" alt="Image description">

# SmolVLM-Instruct-DPO

SmolVLM is a compact open multimodal model that accepts arbitrary sequences of image and text inputs to produce text outputs. Designed for efficiency, SmolVLM can answer questions about images, describe visual content, create stories grounded on multiple images, or function as a pure language model without visual inputs. Its lightweight architecture makes it suitable for on-device applications while maintaining strong performance on multimodal tasks.

## Model Summary

- **Developed by:** Hugging Face 🤗
- **Model type:** Multi-modal model (image+text)
- **Language(s) (NLP):** English
- **License:** Apache 2.0
- **Architecture:** Based on [Idefics3](https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3) (see technical summary)

## Resources

- **Demo:** [SmolVLM Demo](https://huggingface.co/spaces/HuggingFaceTB/SmolVLM)
- **Blog:** [SmolVLM](https://huggingface.co/blog/smolvlm)
- **Technical Report:** [More Information Needed]
- **Repository:** [More Information Needed]

## Uses

SmolVLM can be used for inference on multimodal (image + text) tasks where the input comprises text queries along with one or more images. Text and images can be interleaved arbitrarily, enabling tasks like image captioning, visual question answering, and storytelling based on visual content. The model does not support image generation.


## How to Get Started with the Model

Use the code below to get started with the model.

```py
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForVision2Seq
from transformers.image_utils import load_image

DEVICE = "cuda" if torch.cuda.is_available() else "CPU"

# Load images
image1 = load_image("https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg")
image2 = load_image("https://huggingface.co/spaces/merve/chameleon-7b/resolve/main/bee.jpg")

# Initialize processor, model and load PEFT adapter
processor = AutoProcessor.from_pretrained("HuggingFaceTB/SmolVLM-Instruct")
model = AutoModelForVision2Seq.from_pretrained(
    "HuggingFaceTB/SmolVLM-Instruct",
    torch_dtype=torch.bfloat16,
    _attn_implementation="flash_attention_2" if DEVICE == "cuda" else "eager",
).to(DEVICE)
model.load_adapter("HuggingFaceTB/SmolVLM-Instruct-DPO")

# Create input messages
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image"},
            {"type": "image"},
            {"type": "text", "text": "Can you describe the two images?"}
        ]
    },
]

# Prepare inputs
prompt = processor.apply_chat_template(messages, add_generation_prompt=True)
inputs = processor(text=prompt, images=[image1, image2], return_tensors="pt")
inputs = inputs.to(DEVICE)

# Generate outputs
generated_ids = model.generate(**inputs, max_new_tokens=500)
generated_texts = processor.batch_decode(
    generated_ids,
    skip_special_tokens=True,
)

print(generated_texts[0])
```

## Training Details

### Training Data

[HuggingFaceH4/rlaif-v_formatted](https://huggingface.co/datasets/HuggingFaceH4/rlaif-v_formatted)

### Training Procedure

See the detailed blog on preference tuning VLLMs [here](https://huggingface.co/blog/dpo_vlm).

```bash
accelerate launch  --config_file examples/accelerate_configs/multi_gpu.yaml \
  examples/scripts/dpo_vlm.py \
  --dataset_name HuggingFaceH4/rlaif-v_formatted \
  --model_name_or_path HuggingFaceTB/SmolVLM-Instruct \
  --per_device_train_batch_size 8 \
  --gradient_accumulation_steps 32 \
  --dataset_num_proc 32 \
  --output_dir dpo_smolvlm_rlaif-v \
  --bf16 \
  --torch_dtype bfloat16 \
  --use_peft \
  --lora_target_modules=all-linear
```

### Framework versions

- PEFT 0.13.2