# modernbert-ai-detection-raid-mage (ONNX)


This is an ONNX version of [GeorgeDrayson/modernbert-ai-detection-raid-mage](https://huggingface.co/GeorgeDrayson/modernbert-ai-detection-raid-mage). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `text-classification`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextClassificationPipeline


---


# Machine-generated text detection prevents language model collapse

This model is part of the research presented in the paper [Machine-generated text detection prevents language model collapse](https://arxiv.org/abs/2502.15654), which proposes an approach to prevent model collapse based on importance sampling from a machine-generated text detector. The official implementation and training scripts are available in the GitHub repository: [GeorgeDrayson/model_collapse](https://github.com/GeorgeDrayson/model_collapse)

The model is trained on the [MAGE](https://aclanthology.org/2024.acl-long.3/) and [RAID](https://arxiv.org/pdf/2405.07940) datasets.

## Usage

To use the model for detecting machine-generated text:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("GeorgeDrayson/modernbert-raid-mage")
model = AutoModelForSequenceClassification.from_pretrained("GeorgeDrayson/modernbert-raid-mage")

text = "Your input text here."
inputs = tokenizer(text, return_tensors="pt")
outputs = model(**inputs)
probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
print(f"Probability of machine-generated text: {probabilities[0][1].item():.4f}")
```

## Citation

If you use this model or find the research helpful, please cite:

```bibtex
@article{drayson2025machine,
  title={Machine-generated text detection prevents language model collapse},
  author={Drayson, George and Yilmaz, Emine and Lampos, Vasileios},
  journal={arXiv preprint arXiv:2502.15654},
  year={2025}
}
```
