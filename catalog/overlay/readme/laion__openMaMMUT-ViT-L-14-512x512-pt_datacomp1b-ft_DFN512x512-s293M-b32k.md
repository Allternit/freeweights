# Model card for openMaMMUT-ViT-L-14-512x512-pt_datacomp1b-ft_DFN512x512-s293M-b32k

#  Table of Contents

1. [Model Details](#model-details)
2. [Uses](#uses)
3. [Training Details](#training-details)
4. [Evaluation](#evaluation)
5. [How To Get Started With the Model](#how-to-get-started-with-the-model)
6. [Acknowledgements](#acknowledgements) 
7. [Citation](#citation)


# Model Details

## Model Description

An openMammut ViT-L/14 model (512x512 resolution), able to perform various image recognition and image captioning tasks.
This model is based on [openMaMMUT-ViT-L-14-DataComp-1.4B](https://huggingface.co/laion/openMaMMUT-ViT-L-14-DataComp-1.4B-s12.8B-b180K) and 
is fine-tuned on the DFN-2B dataset filtered such that images are at least 512x512 resolution, a total of 293M samples.

The model achieves a **82.20%** zero-shot top-1 accuracy on ImageNet-1k, **73.63%** zero-shot on MSCOCO image@R5 retrieval, **87.30%** on MSCOCO text@R5 retrieval (5k Karpathy split test set).

Model training done by Mehdi Cherti on [JUWELS Booster](https://apps.fz-juelich.de/jsc/hps/juwels/booster-overview.html) at [Juelich Supercomputing Center](https://www.fz-juelich.de/en/ias/jsc), using automated experiment execution workflow [autoexperiment](https://github.com/SLAMPAI/autoexperiment), implemented by Mehdi Cherti.
Training performed in frame of scaling law model and dataset comparison study published in [arXiv:2506.04598](https://arxiv.org/abs/2506.04598). See also the [research repository](https://github.com/LAION-AI/scaling-laws-for-comparison) and [full thread](https://x.com/JJitsev/status/1931569060438737161).

The model weights are directly usable in [HF transformers](#quickstart-with-hf-transformers) (HF version implemented by Marianna Nezhurina) or by using [custom OpenCLIP fork](#using-openclip-codebase). 
Both image recognition (classification, retrieval, etc) and text generation (image captioning) tasks are supported.

<img src="https://cdn-uploads.huggingface.co/production/uploads/6355b485b8b79340d4630dd5/mCNQu13oNcdHasaNo3lST.png" alt="openmammut_release_logo" width="60%"/>



# Uses

This model is intended as a research output for research communities. We hope that this model will enable researchers to better understand and explore zero-shot, arbitrary image classification and retrieval, and generalization capabilities of language-vision learning in general. We also hope it can be used for interdisciplinary studies of the impact of such model, eg when used as component in VLMs or other multi-modal models. 
Details on the DFN-2B dataset can be found in [Data Filtering Networks](https://arxiv.org/abs/2309.17425) paper.

## Direct Use

Zero-shot image classification, image and text retrieval, segmentation, image captioning. Other uses are possible when employing the model as component in other systems or fine-tuning it for other downstream tasks.

ATTENTION: currently, if [using openCLIP code base](#using-openclip-codebase), [custom openCLIP fork](https://github.com/LAION-AI/open_clip_mammut) is required to work with the model.
Integrating openMaMMUT code into main [openCLIP repository](https://github.com/mlfoundations/open_clip) is work in progress. Any volunteers helping with intergration highly welcome, join [LAION discord](https://discord.gg/BZqhreFazY)

Alternatively, HF transformers can be used to [work with the model natively in HF](#quickstart-with-hf-transformers).

## Downstream Use

Image classification, retrieval and image captioning. Linear probing and full fine-tuning for various image tasks, e.g, segmentation, image classification, retrieval. Re-usage as component for guiding and conditioning of image generative models, among others.

## Out-of-Scope Use

As per the OpenAI models,

**Any** deployed use case of the model (that is, in form of an end product) - whether commercial or not - is currently out of scope. Non-deployed use cases such as image search in a constrained environment, are also not recommended unless there is thorough in-domain testing of the model with a specific, fixed class taxonomy. This is because our safety assessment demonstrated a high need for task specific testing especially given the variability of CLIP’s performance with different class taxonomies. This makes untested and unconstrained deployment of the model in any use case currently potentially error prone and thus unsafe.

Certain use cases which would fall under the domain of surveillance and facial recognition are always out-of-scope regardless of performance of the model. This is because the use of artificial intelligence for tasks such as these can be premature currently given the lack of testing norms and checks to ensure its fair use.

Since the model has not been purposefully trained in or evaluated on any languages other than English, its use should be limited to English language use cases.

Further the above notice, the DataComp-1.4B dataset used in training of these models has additional considerations, see below.

# Training Details

The model was trained on 512x512 293M samples from DFN-2B. Warmup = 100 steps, learning rate = 1e-5, cosine annealing schedule, no weight decay, Global batch size = 32768, number of GPUs = 256 (A100 40Gb), local batch size = 128


# Evaluation

Evaluation done with code in the [LAION CLIP Benchmark suite](https://github.com/LAION-AI/CLIP_benchmark), using [autoexperiment](https://github.com/SLAMPAI/autoexperiment).

## Testing Data, Factors & Metrics

### Testing Data

The testing is performed with various downstream tasks and datasets, which include ImageNet-1k, DataComp evaluation suite (35 tasks total), and MS-COCO retrieval.
**TODO** - more detail

## Results

The model achieves a **82.20%** zero-shot top-1 accuracy on ImageNet-1k, **73.63%** zero-shot on MSCOCO image@R5 retrieval, **87.30%** on MSCOCO text@R5 retrieval (5k Karpathy split test set).

**TODO** - create table for just this model's metrics.

# How to Get Started with the Model

The model weights are directly usable in [HF transformers](#quickstart-with-hf-transformers) (HF version implemented by Marianna Nezhurina) or by using [custom OpenCLIP fork](#using-openclip-codebase). 
Both image recognition (classification, retrieval, etc) and text generation (image captioning) tasks are supported.

## Quickstart with HF transformers

```python
from PIL import Image
import requests
from transformers import CLIPProcessor, AutoModel, CLIPTokenizer

model_path = "laion/openMaMMUT-ViT-L-14-512x512-pt_datacomp1b-ft_DFN512x512-s293M-b32k"
tokenizer = CLIPTokenizer.from_pretrained(model_path)

model = AutoModel.from_pretrained(model_path, trust_remote_code=True)
processor = CLIPProcessor.from_pretrained(model_path)

url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)

# Image captioning
inputs = processor(images=image, return_tensors="pt", padding=True)
outputs = model.generate(pixel_values=inputs["pixel_values"], top_p=0.1, do_sample=True).sequences
decoded_outputs = tokenizer.batch_decode(outputs)
print("HuggingFace outputs:", decoded_outputs) # prints: ['<|startoftext|>cats on couch']

# Get image-text similarity (just like CLIP)
text  = ["a photo of a cat", "a photo of a dog"]
inputs = processor(images=image, text=text, return_tensors="pt", padding=True)

outputs = model(pixel_values=inputs["pixel_values"], input_ids=inputs["input_ids"], attention_mask=inputs["attention_mask"], contrastive_only=True)

logits_per_image = outputs.logits_per_image # this is the image-text similarity score
probs = logits_per_image.softmax(dim=1) # we can take the softmax to get the label probabilities

print("Label probabilities:", probs)
print("Logits per image:", logits_per_image)

# Compute image and text embeddings separately

text_features = model.get_text_features(inputs["input_ids"], inputs["attention_mask"])
image_features = model.get_image_features(inputs["pixel_values"])

print("Text features shape:", text_features.shape)  # prints: [batch_size, feature_dim]
print("Image features shape:", image_features.shape)  # prints: [batch_size, feature_dim]
text_features /= text_features.norm(dim=-1, keepdim=True)
image_features /= image_features.norm(dim=-1, keepdim=True)
text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
print("Label probs:", text_probs)  # prints: [[1., 0.]] or similar, depending on the image and text
```

## Using OpenCLIP codebase

Research repository: https://github.com/LAION-AI/scaling-laws-for-comparison

ATTENTION: currently, [custom openCLIP fork](https://github.com/LAION-AI/open_clip_mammut) is required to work with the model when using openCLIP code base.
Integrating openMaMMUT code into main [openCLIP repository](https://github.com/mlfoundations/open_clip) is work in progress. Any volunteers helping with intergration highly welcome, join [LAION discord](https://discord.gg/BZqhreFazY).

Alternatively, use [HF transformers](quickstart-with-hf-transformers) to work with the model natively in HF.

First, you need to install OpenCLIP MaMMUT, a fork of OpenCLIP with MaMMUT support:

```bash
git clone https://github.com/LAION-AI/open_clip_mammut
cd open_clip_mammut
python -m pip install .
```

Use the code below to get started with the model.


Zero-shot classification example:

```python
import torch
from PIL import Image
import open_clip

model, _, transform = open_clip.create_model_and_transforms('hf-hub:laion/openMaMMUT-ViT-L-14-512x512-pt_datacomp1b-ft_DFN512x512-s293M-b32k')
model.eval()  # model in train mode by default, impacts some models with BatchNorm or stochastic depth active
tokenizer = open_clip.get_tokenizer('hf-hub:laion/openMaMMUT-ViT-L-14-512x512-pt_datacomp1b-ft_DFN512x512-s293M-b32k')

image = transform(Image.open("docs/CLIP.png")).unsqueeze(0)
text = tokenizer(["a diagram", "a dog", "a cat"])

with torch.no_grad(), torch.amp.autocast('cuda'):
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)
    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)

print("Label probs:", text_probs)  # prints: [[1., 0., 0.]]

```

Caption generation example:

```python
import open_clip
import torch
from PIL import Image

model, _, transform = open_clip.create_model_and_transforms('hf-hub:laion/openMaMMUT-ViT-L-14-512x512-pt_datacomp1b-ft_DFN512x512-s293M-b32k')

im = Image.open("docs/CLIP.png").convert("RGB")
im = transform(im).unsqueeze(0)

with torch.no_grad(), torch.amp.autocast('cuda'):
  generated = model.generate(im)

print(open_clip.decode(generated[0]).split("<end_of_text>")[0].replace("<start_of_text>", ""))

```


# Acknowledgements

We gratefully acknowledge the Gauss Centre for Supercomputing e.V. (www.gauss-centre.eu) for funding the work by providing computing time through the John von Neumann Institute for Computing (NIC) on the GCS Supercomputer [JUWELS Booster](https://apps.fz-juelich.de/jsc/hps/juwels/booster-overview.html) at Jülich Supercomputing Centre (JSC). 
We also acknowledge storage resources on JUST granted and operated by JSC, as well as storage and computing resources from the Helmholtz Data Federation (HDF).

We gratefully acknowledge funding by the Federal Ministry of Education and Research of Germany (BMBF) under grant no. 01IS24085C (OPENHAFM), under the grant 16HPC117K (MINERVA) and under the grant no. 01IS22094B (WestAI - AI Service Center West), as well as co-funding by EU from EuroHPC Joint Undertaking programm under grant no. 101182737 (MINERVA) and from Digital Europe Programme under grant no. 101195233 (openEuroLLM).

# Citation

**BibTeX:**

Please cite:

[Scaling laws for robust comparison of open foundation language-vision models and datasets](https://arxiv.org/abs/2506.04598)
```
@article{nezhurina2025scaling,
  title={Scaling Laws for Robust Comparison of Open Foundation Language-Vision Models and Datasets},
  author={Marianna Nezhurina, Tomer Porian, Giovanni Pucceti, Tommie Kerssies, Romain Beaumont, Mehdi Cherti, Jenia Jitsev},
  journal={arXiv:2506.04598},
  url={https://arxiv.org/abs/2506.04598},
  year={2025}
}
```

DataComp
```
@article{gadre2023datacomp,
  title={Datacomp: In search of the next generation of multimodal datasets},
  author={Gadre, Samir Yitzhak and Ilharco, Gabriel and Fang, Alex and Hayase, Jonathan and Smyrnis, Georgios and Nguyen, Thao and Marten, Ryan and Wortsman, Mitchell and Ghosh, Dhruba and Zhang, Jieyu and others},
  journal={Advances in Neural Information Processing Systems},
  volume={36},
  pages={27092--27112},
  year={2023}
}
```

MaMMUT
```
@article{
kuo2023mammut,
title={Ma{MMUT}: A Simple Architecture for Joint Learning for MultiModal Tasks},
author={Weicheng Kuo and AJ Piergiovanni and Dahun Kim and xiyang luo and Benjamin Caine and Wei Li and Abhijit Ogale and Luowei Zhou and Andrew M. Dai and Zhifeng Chen and Claire Cui and Anelia Angelova},
journal={Transactions on Machine Learning Research},
issn={2835-8856},
year={2023},
url={https://openreview.net/forum?id=FqOG4osY7C},
}
```

Reproducible scaling laws for openCLIP
```
@inproceedings{Cherti2023,
  title={Reproducible scaling laws for contrastive language-image learning},
  author={Cherti, Mehdi and Beaumont, Romain and Wightman, Ross and Wortsman, Mitchell and Ilharco, Gabriel and Gordon, Cade and Schuhmann, Christoph and Schmidt, Ludwig and Jitsev, Jenia},
  booktitle={Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition},
  pages={2818--2829},
  year={2023}
}
```

OpenCLIP software
```
@software{ilharco_gabriel_2021_5143773,
  author       = {Ilharco, Gabriel and
                  Wortsman, Mitchell and
                  Wightman, Ross and
                  Gordon, Cade and
                  Carlini, Nicholas and
                  Taori, Rohan and
                  Dave, Achal and
                  Shankar, Vaishaal and
                  Namkoong, Hongseok and
                  Miller, John and
                  Hajishirzi, Hannaneh and
                  Farhadi, Ali and
                  Schmidt, Ludwig},
  title        = {OpenCLIP},
  month        = jul,
  year         = 2021,
  note         = {If you use this software, please cite it as below.},
  publisher    = {Zenodo},
  version      = {0.1},
  doi          = {10.5281/zenodo.5143773},
  url          = {https://doi.org/10.5281/zenodo.5143773}
}
```

CLIP benchmark software
```
@software{cherti_2025_15403103,
  author       = {Cherti, Mehdi and
                  Beaumont, Romain},
  title        = {CLIP benchmark},
  month        = may,
  year         = 2025,
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.15403103},
  url          = {https://doi.org/10.5281/zenodo.15403103},
  swhid        = {swh:1:dir:8cf49a5dd06f59224844a1e767337a1d14ee56c2
                   ;origin=https://doi.org/10.5281/zenodo.15403102;vi
                   sit=swh:1:snp:dd153b26f702d614346bf814f723d59fef3d
                   77a2;anchor=swh:1:rel:cff2aeb98f42583b44fdab5374e9
                   fa71793f2cff;path=CLIP\\_benchmark-main
                  },
}
```