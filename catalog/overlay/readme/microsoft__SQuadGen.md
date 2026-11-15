# SQuadGen: Generating Simple Quad Layouts via Chart Distance Fields

<a href="https://youkang-kong.github.io/squadgen/"><img src="https://img.shields.io/badge/Project-Website-blue" alt="Project Page"></a>
<a href="https://arxiv.org/abs/2604.27329"><img src="https://img.shields.io/badge/Paper-2604.27329-red" alt="Paper"></a>
<a href="https://github.com/microsoft/SQuadGen"><img src="https://img.shields.io/badge/Github-181717?logo=github&logoColor=white" alt="github code"></a>
<a href="https://huggingface.co/microsoft/SQuadGen"><img src="https://img.shields.io/badge/Hugging%20Face-Model-yellow" alt="Hugging Face"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="License"></a>

## Introduction

**SQuadGen** is a diffusion-based generative framework for synthesizing simple quad layouts on 3D shapes. It introduces **Chart Distance Fields (CDF)**, a continuous surface-based representation that makes quad-layout generation amenable to neural learning while preserving structure useful for downstream modeling and editing.

This repository hosts the pretrained checkpoints and matching configuration files used by the official inference scripts. It is intended as the model release page; installation, data preparation, training, evaluation, and full inference instructions are maintained in the [GitHub repository](https://github.com/microsoft/SQuadGen).

## Model Details

- **Developed by:** Youkang Kong, Yang Liu, Yue Dong, Xin Tong, Heung-Yeung Shum
- **Affiliation:** Tsinghua University, Microsoft Research Asia
- **Model Type:** Latent diffusion transformer (SiT-XL) conditioned on Geometry-AE representations and decoded with SQ-VAE
- **Parameters:** Geom-AE approximately 107M; SQ-VAE approximately 112M; SQ-Diffuse approximately 802M
- **Input:** Triangle mesh
- **Output:** Per-vertex CDF / DCDF fields, from which simple quad layouts are extracted

## Files

```
ckpts/
    sqvae_geomae.pth     # Combined SQ-VAE (~112M) and Geom-AE (~107M) checkpoint
    sqvae_geomae.yaml    # matching config
    sqdiffuse.pth        # SQ-Diffuse diffusion checkpoint (~802M)
    sqdiffuse.yaml       # matching config
```

`sqvae_geomae.pth` contains both the SQ-VAE and the Geom-AE. SQ-Diffuse inference requires loading **both** `sqvae_geomae.pth` and `sqdiffuse.pth`.

## Download

Download the complete model repository, including the checkpoints and configuration files:

```bash
hf download microsoft/SQuadGen --local-dir ./ckpts_hf
```

The released files are native PyTorch checkpoints. The `sqvae_geomae.pth` checkpoint contains both the SQ-VAE and Geometry-AE components; SQ-Diffuse inference requires both this checkpoint and `sqdiffuse.pth`.

## Usage

All inference, training and evaluation scripts live in the [official GitHub repository](https://github.com/microsoft/SQuadGen). After cloning and setting up the environment as described there, point the `--ae_pth` / `--model_pth` arguments at the corresponding files downloaded from this repo, e.g.:

After installing the environment described in the [GitHub repository](https://github.com/microsoft/SQuadGen), pass `./ckpts_hf/ckpts/sqvae_geomae.pth` and `./ckpts_hf/ckpts/sqdiffuse.pth` to the corresponding inference scripts.

## Inference Speed (NVIDIA A100 GPU)

| Configuration             | 4096 points | 8192 points |
| ------------------------- | ----------: | -----------: |
| Geom-AE encoding          |        0.4s |         1.2s |
| SQ-VAE encoding*/decoding |   0.4s/0.4s |    1.3s/1.2s |
| SQ-Diffuse generation     |       65.9s |       171.7s |

*include Geom-AE encoding

## Data and Evaluation

The models were trained on publicly available 3D geometry datasets, including [Objaverse](https://huggingface.co/datasets/allenai/objaverse), [Amazon Berkeley Objects (ABO)](https://www.amazon.science/code-and-datasets/amazon-berkeley-objects-abo-dataset), and [ShapeNet](https://shapenet.org/). Dataset-specific terms, attribution requirements, and permitted uses remain applicable to users who work with those datasets or derived assets.

Performance was evaluated on academic quad-meshing and reconstruction benchmarks described in the [paper](https://arxiv.org/abs/2604.27329). Robustness coverage is limited to the tested datasets; the release does not claim a unified standardized comparison against all third-party models.

## Responsible AI Considerations

SQuadGen is a research prototype for 3D geometry encoding and quad-layout generation. It is not intended for safety-critical, high-risk, real-time, or fully autonomous use, including production CAD, engineering, simulation, or manufacturing workflows, unless additional validation and safeguards are applied.

The models are trained on publicly available 3D datasets, including Objaverse, ABO, and ShapeNet. Their performance may therefore reflect gaps in dataset coverage: results are generally stronger for common object categories and clean meshes, and may degrade for rare or highly complex shapes, noisy or non-manifold meshes, irregular topology, strict CAD constraints, or other out-of-distribution inputs. The models do not provide guarantees of geometric correctness, mesh validity, manufacturability, robustness, or consistency across datasets and mesh resolutions.

Generated layouts and intermediate representations should be treated as learned approximations. Before downstream use, developers should validate input geometry and output quality, use fallback heuristics where appropriate, and retain human review for decisions that affect design, simulation, engineering, or manufacturing. Users should also verify that input geometry is legally and appropriately sourced. These models do not process language or make decisions in sensitive domains such as healthcare or legal services.

<!-- ## Limitations

- **Scope:** The checkpoints are specialized for 3D geometry encoding and simple quad-layout generation. They do not support language understanding, mathematical reasoning, multilingual processing, or multimodal tasks.
- **Generalization:** Performance is strongest on clean, in-distribution object-level geometry and can degrade on large scenes, detailed or rare shapes, noisy scans, non-manifold meshes, irregular topology, and strict domain-specific constraints.
- **Output guarantees:** The generated layouts and decoded meshes are learned approximations. They may be topologically incorrect, unstable, or unsuitable for downstream use, and the models do not guarantee mesh validity, manufacturability, numerical accuracy, or constraint satisfaction.
- **Evaluation coverage:** Robustness evaluation is limited to the tested academic datasets. There is no unified standardized benchmark against third-party models, so results may not predict performance on other datasets or workloads.
- **Runtime and deployment:** Inference is computationally intensive and typically requires a CUDA-enabled GPU. The pipeline is intended for offline or batch workflows and has no official support for optimized runtimes, mobile or edge devices, or browser execution.
- **Pipeline dependencies:** SQuadGen is a multi-stage system. Results depend on preprocessing, Geom-AE, SQ-VAE, diffusion inference, and classical geometry post-processing; errors in one stage can propagate to later stages. -->

## Citation

```bibtex
@article{kong2026squadgen,
  author    = {Youkang Kong and Yang Liu and Yue Dong and Xin Tong and Heung-Yeung Shum},
  title     = {{SQuadGen}: Generating Simple Quad Layouts via Chart Distance Fields},
  journal   = {ACM Transactions on Graphics (SIGGRAPH)},
  volume    = {45},
  number    = {4},
  pages     = {144:1--144:15},
  year      = {2026},
  doi       = {10.1145/3811348}
}
```

## License

This model is released under the MIT License.
