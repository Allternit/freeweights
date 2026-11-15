# MRI Autoencoder v0.1

## Model
MRI autoencoder is a Variational Autoencoder (VAE) trained on the fast MRI multi-coil brain and knee datasets. The model is trained from scratch and uses the same architecture as the Stable Diffusion SDXL VAE model.

Latent Diffusion Models (LDMs) have been extremely popular in synthesizing images and videos. However, they remain relatively under-explored in the field of medical imaging. One possible reason is the lack of domain specific autoencoders that can encode and decode higher dimensional medical imaging data to their lower dimensional latent representation. MRI images, for example, are different than general domain images in that they are complex valued with magnitude and phase information. To this end, we are publishing an autoencoder that can be used to encode and decode complex valued MRI images to and from their latent representation.

## Use

```
    from diffusers.models import AutoencoderKL
    autoencoder = AutoencoderKL.from_pretrained("microsoft/mri-autoencoder-v0.1")
```

For more details please refer to the provided autoencoders_demo notebook. For details on how the fastmri data was preprocessed, please refer to data_preprocessing_recipe.py.

## Intended Use

The model is intended to be used solely for future research in medical imaging. Stakeholders would benefit by treating this model as a building block towards exploring latent space generative models applied to complex valued MRI images.

## Out-of-Scope Use

Any deployed use case of the model, commercial or otherwise, is out of scope. The model weights and code are not intended for clinical use.

## Evaluation

The PSNR and SSIM scores on randomly chosen 8000 slices from the fastMRI multicoil validation dataset are as follows:

| Autoencoder | Median PSNR | Mean PSNR | PSNR 95% CI | Median SSIM | Mean SSIM | SSIM 95% CI |
| ----------- | ----------- | --------- | ----------- | ----------- | --------- | ----------- |
| MRI-AUTOENCODER-v0.1 | 34.31 | 33.98 | (28.55. 37.79) | 0.91 | 0.88 | (0.54, 0.97) |
| SDXL-VAE | 31.45 | 31.51 | (27.85, 35.63) | 0.89 | 0.86 | (0.58, 0.94) |

## Data

This model was trained, with permission, using the NYU fastMRI Dataset (https://fastmri.med.nyu.edu/), which is a deidentified imaging dataset provided by NYU Langone comprised of raw k-space data in several sub-dataset groups.

## Limitations

A model trained on this dataset might likely overfit and not generalize well to new data. This model has not been evaluated for clinical use or across a range of scanner types.