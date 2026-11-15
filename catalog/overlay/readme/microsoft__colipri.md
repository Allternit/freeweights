# COLIPRI

<!-- Provide a quick summary of what the model is/does. -->

COLIPRI is a 3D vision&ndash;language transformer model trained to encode chest CT scans and radiological reports.

## Model description

<!-- Provide a longer summary of what this model is. -->

COLIPRI was trained using tens of thousands of chest CT scans and reports, without any annotations, using multiple objectives to learn strong joint representations of 3D images and text.
The procedure is described in detail in [Comprehensive language-image pre-training for 3D medical image understanding](https://link.springer.com/chapter/10.1007/978-3-032-37624-4_24) (Wald et al., ECCV 2026).

The weights shared here correspond to COLIPRI-CRM, our best-performing model in the paper.

- **Developed by:** Microsoft Research
- **Model type:** 3D vision&ndash;language encoder
- **License:** [MIT](./LICENSE)

## Uses

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

COLIPRI is shared for research purposes only.
It is **not meant to be used for clinical practice**.

The encoders be plugged to other models, or used independently or jointly for many downstream tasks, such as:

- Image classification with text prompts
- Image clustering
- Text clustering
- Text-to-image retrieval
- Image-to-image retrieval
- Image-to-text retrieval
- Text-to-text retrieval
- Image classification with a classifier
- Text classification with a classifier
- Image segmentation with a decoder
- Report generation with a language decoder

Fine-tuning COLIPRI is typically not necessary to obtain good performance in downstream tasks.

## Getting started

### Installation

```shell
pip install colipri
```

### Usage examples

Below we share some usage snippets to get started with COLIPRI.
A more complete [Jupyter notebook](./COLIPRI_demo.ipynb) is also available.

First, let's get a 3D chest CT we can use for demonstration.
The plotted slices intersect a lung nodule near the heart.

```python
>>> from colipri import load_sample_ct
>>> image = load_sample_ct()
>>> image
ScalarImage(shape: (1, 512, 512, 139); spacing: (0.76, 0.76, 2.50); orientation: LPS+; dtype: torch.IntTensor; memory: 139.0 MiB)
```

The image looks like this:

![Input CT](assets/input.png)

Now, let's instantiate the model and processor.

```python
>>> from colipri import get_model
>>> from colipri import get_processor
>>> model = get_model().cuda()
>>> processor = get_processor()
```

#### Zero-shot classification

```python
>>> from colipri import ZeroShotImageClassificationPipeline
>>> pipeline = ZeroShotImageClassificationPipeline(model, processor)
>>> pipeline(image, ["No lung nodules present", "Lung nodules present"])
[
    {'score': 0.0002, 'label': 'No lung nodules present'},
    {'score': 0.9998, 'label': 'Lung nodules present'}
]
```

#### Feature extraction

```python
>>> import torch
>>> preprocessed_images = processor.process_images(image)
>>> preprocessed_images[0]
ScalarImage(shape: (1, 192, 192, 192); spacing: (2.00, 2.00, 2.00); orientation: SAR+; dtype: torch.FloatTensor; memory: 27.0 MiB)
>>> images_batch = processor.to_images_batch(preprocessed_images)
images_batch.shape
torch.Size([1, 1, 192, 192, 192])
>>> with torch.no_grad():
...     patch_embeddings = model.encode_image(images_batch)
>>> patch_embeddings.shape
torch.Size([1, 768, 24, 24, 24])
>>> with torch.no_grad():
...     pooled_embeddings = model.encode_image(images_batch, pool=True, project=True)
>>> pooled_embeddings.shape
torch.Size([1, 768])
```

## Biases, risks, and limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->

COLIPRI was trained with data from Turkey and the USA only, therefore it might be biased towards population in the training data.
Underlying biases of the training datasets may not be well characterized.

## Environmental impact

<!-- Total emissions (in grams of CO2eq) and additional considerations, such as electricity usage, go here. Edit the suggested text below accordingly -->

- **Hardware type:** NVIDIA A100 GPUs
- **Hours used:** 72 hours × 4 GPUs = 288 GPU-hours
- **Cloud provider:** Azure
- **Compute region:** West US 2
- **Carbon emitted:** 21.6 kg CO₂ eq.

### Compute infrastructure

COLIPRI was trained on [Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning).

#### Hardware

| Stage | Node type | Num. nodes | GPU type | GPUs per node |
| --- | --- | --- | --- | --- |
| Pre-training | [`Standard_NC96ads_A100_v4`](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nca100v4-series?tabs=sizeaccelerators) | 1 | NVIDIA A100 (80 GB) | 4 |
| Evaluation | [`Standard_NC24ads_A100_v4`](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nca100v4-series?tabs=sizeaccelerators) | 1 | NVIDIA A100 (80 GB) | 1 |

#### Software

The main software libraries used in this work were [nnSSL](https://github.com/MIC-DKFZ/nnssl) for training, [TorchIO](https://torchio.org/) for preprocessing and augmentation, [`nifti-zarr-py`](https://github.com/neuroscales/nifti-zarr-py) for data loading, and [nnU-Net](https://github.com/MIC-DKFZ/nnUNet) for segmentation evaluation.

## Community

Below are some works derived from COLIPRI.

| Name | Description |
| --- | --- |
| [NV-Reason-CT](https://huggingface.co/nvidia/NV-Reason-CT) | Open 3D CT VLM for Radiologist Chain-of-Thought Reasoning |
| [ORCA-3DCT](https://github.com/renjie-liang/ORCA-3DCT) | Training-free [ORCA](https://arxiv.org/abs/2608.00345) compression of CT-RATE embeddings | 

## Citation

<!-- If there is a paper or blog post introducing the model, the APA and Bibtex information for that should go in this section. -->

### BibTeX

```bibtex
@inbook{Wald2026,
  title = {Comprehensive Language–Image Pre-training for 3D Medical Image Understanding},
  ISBN = {9783032376244},
  ISSN = {1611-3349},
  url = {http://dx.doi.org/10.1007/978-3-032-37624-4_24},
  DOI = {10.1007/978-3-032-37624-4_24},
  booktitle = {Computer Vision – ECCV 2026},
  publisher = {Springer Nature Switzerland},
  author = {Wald,  Tassilo and Hamamci,  Ibrahim Ethem and Gao,  Yuan and Bond-Taylor,  Sam and Sharma,  Harshita and Ilse,  Maximilian and Lo,  Cynthia and Melnichenko,  Olesya and Schwaighofer,  Anton and Codella,  Noel C. F. and Wetscherek,  Maria Teodora and Maier-Hein,  Klaus H. and Korfiatis,  Panagiotis and Salvatelli,  Valentina and Alvarez-Valle,  Javier and Pérez-García,  Fernando},
  year = {2026},
  pages = {388–406}
}
```

### APA

```
Wald, T., Hamamci, I. E., Gao, Y., Bond-Taylor, S., Sharma, H., Ilse, M., … Pérez-García, F. (2026). Comprehensive language–image pre-training for 3D medical image understanding. In Lecture Notes in Computer Science. Lecture Notes in Computer Science (pp. 388–406). doi:10.1007/978-3-032-37624-4_24
```

## Model card contact

Fernando Pérez-García ([`fperezgarcia@microsoft.com`](mailto:fperezgarcia@microsoft.com)).
