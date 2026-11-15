# Granite TimeSeries PatchTST-FM Model Card

## Model Description

[PatchTST](https://arxiv.org/abs/2211.14730) was originally released prior to the interest in creating pre-trained, zero-shot time series foundation models that were capable of state-of-the-art performance on out of sample datasets. PatchTST-FM (patched time-series transformer-based foundation model) essentially has the architectural simplicity of PatchTST, but differs in some crucial ways. Coupled with a revised training strategy and a significantly larger training corpus, we are able to train a model that achieves state-of-the-art results on [GiftEval](https://huggingface.co/spaces/Salesforce/GIFT-Eval) (see below for recommended filters to view this on the leaderboard).

The architecture incorporates the following changes:
 - residual blocks in the input and output projections
 - a quantile head to support probabilistic forecasting
 - enhanced training strategies incorporating contiguous patch masking, and random masking in the forecast period
 - trained with reconstruction-loss objective
 - forecast at inference time is cast as "reconstruction" of the masked forecast period while past context is not masked. If the context period has missing values, both the missing timepoints and forecast timepoints are filled in --- thus providing simultaneous imputation and forecast capability. 
 
 Additional details can be found [here](https://arxiv.org/abs/2602.06909).

The particular model here was trained on a diverse set of data (see details below) using significantly longer context length than done previously (8192). Here the context includes both the input context as well as the length of the desired forecast horizon. Shorter input series are pre-pended with the mean of the series values in the context and the padded regions are treated as masked. The d_model is set to 1024, patch_length is 16, and we train the quantile head with 99 quantiles. In total, the model has ~260M parameters, ~250M of which are in the core transformer layers.

The model architecture is based on a new implementation of a PatchTST-style architecture, which is available in the [IBM TSFM repository](https://github.com/ibm-granite/granite-tsfm/). Other implementations of PatchTST can be found here:
- [Official HuggingFace implementation](https://huggingface.co/docs/transformers/model_doc/patchtst): Contributed by members of the IBM TSFM team.
- [Original PatchTST Implementation](https://github.com/yuqinie98/PatchTST): Implemented by an IBM Research intern who was part of the IBM TSFM team, and the first author of the original PatchTST paper.

## Performance

As of March 25, 2026 Granite-TimeSeries-PatchTST-FM-r1 is among the top 5 models on the GIFT-Eval benchmark when considering replicable, zero-shot models. Results for both MASE and CRPS performance are shown below.
The GIFT-Eval benchmark compares a variety of different model types. To reproduce the ranking below, take the following steps: 1) select only "zero-shot" under "Model Types", 2) uncheck "Yes" under "Test Leak", and 3) uncheck "No" under "Replication Code". Note that Granite-PatchTST-FM-r1 results are in a pending PR submitted to the GIFT-Eval benchmark.

<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 100vh;">
  <img src="figures/mase_zero.png" alt="model ranking" style="width: 90%; height: auto;" />
  <img src="figures/crps_zero.png" alt="model ranking" style="width: 90%; height: auto;" />

  <em style="display: block; margin-top: 0.5rem; text-align: center;">
    The average MASE and CRPS scores of the top 15 replicable, zero-shot models on the <a href="https://huggingface.co/spaces/Salesforce/GIFT-Eval">GIFT-Eval</a> benchmark (results as of March 25, 2026), lower is better. Models shown in blue are released by IBM TSFM.
  </em>
</div>




## Training Data

The training data composes three separate sources:
 - Selected subset of datasets from [GiftEvalPretrain](https://huggingface.co/datasets/Salesforce/GiftEvalPretrain),
 - Custom synthesized data: Based on [KernelSynth](https://github.com/amazon-science/chronos-forecasting/blob/main/scripts/kernel-synth.py) with a different set of periodic kernels (as suggested by the Tirex paper), and a small volume of augmentations
 - A TSMixup dataset, based on the same process described in the [Chronos paper](https://arxiv.org/abs/2403.07815), but using only datasets which are not in the GIFTEval evaluation set.

## Citation

Please cite the following paper if you intend to use our model or its associated architectures/approaches in your work.

```BibTeX:
@misc{wen2026revisitingtransformer,
      title={Revisiting the Generic Transformer: Deconstructing a Strong Baseline for Time Series Foundation Models}, 
      author={Yunshi Wen and Wesley M. Gifford and Chandra Reddy and Lam M. Nguyen and Jayant Kalagnanam and Anak Agung Julius},
      year={2026},
      eprint={2602.06909},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2602.06909}, 
}
```

## Model Card Authors
Yunshi Wen, Agung Julius, Wesley M. Gifford, Chandra K. Reddy

## Acknowledgements
This work is a joint effort between Rensselaer Polytechnic Institute and IBM. The work was supported in part by IBM through the IBM Rensselaer Future of Computing Research Collaboration (FCRC). Computation resources contributing to this work were provided by the National Artificial Intelligence Research Resource (NAIRR) Pilot and Mass Open Cloud.

##  IBM Public Repository Disclosure 
All content in this repository including code has been provided by IBM under the associated open source software license and IBM is under no obligation to provide enhancements, updates, or support. IBM developers produced this code as an open source project (not as an IBM product), and IBM makes no assertions as to the level of quality nor security, and will not be maintaining this code going forward.