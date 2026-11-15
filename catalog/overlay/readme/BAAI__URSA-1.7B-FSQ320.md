# URSA-1.7B-FSQ320 Model Card 

## Model Details
- **Developed by:** BAAI
- **Model type:** Text-to-Video Generation Model
- **Model size:** 1.7B
- **Model precision:** torch.float16 (FP16)
- **Model resolution:** 512x320
- **Model paper:** [Uniform Discrete Diffusion with Metric Path for Video Generation](https://arxiv.org/abs/2510.24717)
- **Model family:** [BAAI-Vision-URSA](https://github.com/baaivision/URSA)
- **Model Tokenizer:** [Cosmos-Tokenize1-DV4x8x8-360p](https://huggingface.co/nvidia/Cosmos-Tokenize1-DV4x8x8-360p)
- **Model Description:** This is a model that can be used to generate and modify videos based on text prompts.

## Examples

Using the [🤗's Diffusers library](https://github.com/huggingface/diffusers) to run URSA in a simple and efficient manner.

```bash
pip install diffusers transformers accelerate imageio[ffmpeg]
pip install git+ssh://git@github.com/baaivision/URSA.git
```

Running the pipeline:

```python
import os, torch, numpy
from diffnext.pipelines import URSAPipeline
from diffnext.utils import export_to_video
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

model_id, height, width = "BAAI/URSA-1.7B-FSQ320", 320, 512
model_args = {"torch_dtype": torch.float16, "trust_remote_code": True}
pipe = URSAPipeline.from_pretrained(model_id, **model_args)
pipe = pipe.to(torch.device("cuda"))

text_prompt = "a lone grizzly bear walks through a misty forest at dawn, sunlight catching its fur."
negative_prompt = "worst quality, low quality, inconsistent motion, static, still, blurry, jittery, distorted, ugly"

# Text-to-Image
prompt = text_prompt
num_frames, num_inference_steps = 1, 25
image = pipe(**locals()).frames[0]
image.save("ursa.jpg")

# Image-to-Video
prompt = f"motion=9.0, {text_prompt}"
num_frames, num_inference_steps = 49, 50
video = pipe(**locals()).frames[0]
export_to_video(video, "ursa_1+48f.mp4", fps=12)

# Text-to-Video
image, video = None, None
prompt = f"motion=9.0, {text_prompt}"
num_frames, num_inference_steps = 49, 50
video = pipe(**locals()).frames[0]
export_to_video(video, "ursa_49f.mp4", fps=12)

# Video-to-Video
prompt = f"motion=5.0, {text_prompt}"
num_frames, num_inference_steps = 49, 50
num_cond_frames, cond_noise_scale = 13, 0.1
for i in range(12):
    video, start_video = video[-num_cond_frames:], video
    video = pipe(**locals()).frames[0]
    video = numpy.concatenate([start_video, video[num_cond_frames:]])
    export_to_video(video, "ursa_{}f.mp4".format(video.shape[0]), fps=12)
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
