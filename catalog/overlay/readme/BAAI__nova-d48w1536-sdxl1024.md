# NOVA (d48w1536-sdxl1024) Model Card

## Model Details
- **Developed by:** BAAI
- **Model type:** Non-quantized Autoregressive Text-to-Image Generation Model
- **Model size:** 1.4B
- **Model precision:** torch.float16 (FP16)
- **Model resolution:** 1024x1024
- **Model Description:** This is a model that can be used to generate and modify images based on text prompts. It is a [Non-quantized Video Autoregressive (NOVA)](https://arxiv.org/abs/2412.14169) diffusion model that uses a pretrained text encoder ([Phi-2](https://huggingface.co/microsoft/phi-2)) and one VAE image tokenizer ([SDXL-VAE](https://huggingface.co/stabilityai/sdxl-vae)).
- **Model License:** [Apache 2.0 License](LICENSE)
- **Resources for more information:** [GitHub Repository](https://github.com/baaivision/NOVA).

## Examples

Using the [🤗's Diffusers library](https://github.com/huggingface/diffusers) to run NOVA in a simple and efficient manner.

```bash
pip install diffusers transformers accelerate
pip install git+ssh://git@github.com/baaivision/NOVA.git
```

Running the pipeline:

```python
import torch
from diffnext.pipelines import NOVAPipeline

model_id = "BAAI/nova-d48w1536-sdxl1024"
model_args = {"torch_dtype": torch.float16, "trust_remote_code": True}
pipe = NOVAPipeline.from_pretrained(model_id, **model_args)
pipe = pipe.to("cuda")

prompt = "a shiba inu wearing a beret and black turtleneck."
image = pipe(prompt).images[0]
    
image.save("shiba_inu.jpg")
```

# Uses

## Direct Use 
The model is intended for research purposes only. Possible research areas and tasks include

- Research on generative models.
- Applications in educational or creative tools.
- Generation of artworks and use in design and other artistic processes.
- Probing and understanding the limitations and biases of generative models.
- Safe deployment of models which have the potential to generate harmful content.

Excluded uses are described below.

#### Out-of-Scope Use
The model was not trained to be factual or true representations of people or events, and therefore using the model to generate such content is out-of-scope for the abilities of this model.

#### Misuse and Malicious Use
Using the model to generate content that is cruel to individuals is a misuse of this model. This includes, but is not limited to:

- Mis- and disinformation.
- Representations of egregious violence and gore.
- Impersonating individuals without their consent.
- Sexual content without consent of the people who might see it.
- Sharing of copyrighted or licensed material in violation of its terms of use.
- Intentionally promoting or propagating discriminatory content or harmful stereotypes.
- Sharing content that is an alteration of copyrighted or licensed material in violation of its terms of use.
- Generating demeaning, dehumanizing, or otherwise harmful representations of people or their environments, cultures, religions, etc.

## Limitations and Bias

### Limitations

- The autoencoding part of the model is lossy.
- The model cannot render complex legible text.
- The model does not achieve perfect photorealism.
- The fingers, .etc in general may not be generated properly.
- The model was trained on a subset of the web datasets [LAION-5B](https://laion.ai/blog/laion-5b/) and [COYO-700M](https://github.com/kakaobrain/coyo-dataset), which contains adult, violent and sexual content.

### Bias
While the capabilities of image generation models are impressive, they can also reinforce or exacerbate social biases.
