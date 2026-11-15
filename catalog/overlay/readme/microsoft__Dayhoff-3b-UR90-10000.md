# Model Card for Dayhoff

Dayhoff is an Atlas of both protein sequence data and generative language models — a centralized resource that brings together 3.34 billion protein sequences across 1.7 billion clusters of metagenomic and natural protein sequences (GigaRef), 46 million structure-derived synthetic sequences (BackboneRef), and 16 million multiple sequence alignments (OpenProteinSet). These models can natively predict zero-shot mutation effects on fitness, scaffold structural motifs by conditioning on evolutionary or structural context, and perform guided generation of novel proteins within specified families. Learning from metagenomic and structure-based synthetic data from the Dayhoff Atlas increased the cellular expression rates of generated proteins, highlighting the real-world value of expanding the scale, diversity, and novelty of protein sequence data. 

The Dayhoff architecture is a hybrid of state-space Mamba layers and Transformer self-attention, interleaved with Mixture-of-Experts modules to maximize capacity while preserving efficiency. It natively handles long contexts, allowing both single sequences and unrolled MSAs to be modeled. Trained with an autoregressive objective in both N→C and C→N directions, Dayhoff supports order-agnostic infilling and scales to billions of parameters.

## Model Details

### Model Description

- **Developed by:** Kevin K. Yang, Sarah Alamdari, Alex J. Lee, Kaeli Kaymak-Loveless, Samir Char, Garyk Brixi, Carles Domingo-Enrich, Chentong Wang, Suyue Lyu, Nicolo Fusi, Neil Tenenholtz, Ava P. Amini
- **Model type:** Hybrid state-space-model transformer architecture with mixture-of-experts
- **License:** MIT

### Model Sources

- **Repository:** https://github.com/microsoft/dayhoff

## Uses

### Downstream Use

Dayhoff is intended for broad research use on protein language modeling. The model has been used and assessed on the following capabilities:

1. Unconditional design of protein sequences
2. Zero-shot mutation effect prediction on [ProteinGym](https://proteingym.org/)
3. Designing scaffolds for structural motifs in sequence space on [RFDiffusion](https://www.nature.com/articles/s41586-023-06415-8) and [MotifBench](https://arxiv.org/abs/2502.12479)
4. Homolog conditioning with Dayhoff-3b-GR-HM and Dayhoff-3b-GR-HM-c


## Bias, Risks, and Limitations

This model should not be used to generate anything that is not a protein sequence or a set of homologuous protein sequences. It is not meant for natural language or other biological sequences, such as DNA sequences. Not all sequences are guaranteed to be realistic. It remains difficult to generate high-quality sequences with no sequence homology to any natural sequence.

## How to Get Started with the Model

The simplest way to use these models and datasets is via the HuggingFace interface. You will need PyTorch, mamba=ssm, causal-conv1d, and flash-attn.

**Requirements**: 
* PyTorch: 2.7.1
* CUDA 12.8 and above

We recommend using [uv](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer) and creating a clean environment.  


```bash
uv venv dayhoff 
source dayhoff/bin/activate
```

In that new environment, install PyTorch 2.7.1. 
```bash
uv pip install torch==2.7.1 torchvision==0.22.1 torchaudio==2.7.1 --index-url https://download.pytorch.org/whl/cu128
```

Now, we need to install mamba-ssm, flash-attn, causal-conv1d, and their prerequisites.

```bash
uv pip install wheel packaging
uv pip install --no-build-isolation flash-attn causal-conv1d mamba-ssm
```

To import from HuggingFace, you will need to install these versions:

```bash
uv pip install datasets==3.2.0 #for HF datasets
uv pip install transformers==4.51.3
uv pip install huggingface_hub~=0.34.4
 ```

**Sample protein generation code:**
 

```py

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, set_seed

set_seed(0)
torch.set_default_device("cuda")

model = AutoModelForCausalLM.from_pretrained("microsoft/Dayhoff-3b-UR90-10000").to("cuda")
tokenizer = AutoTokenizer.from_pretrained("microsoft/Dayhoff-3b-UR90-10000", trust_remote_code=True)


inputs = tokenizer(tokenizer.bos_token, return_tensors="pt", return_token_type_ids=False)

outputs = model.generate(inputs['input_ids'],max_length=50,do_sample=True)
sequence = tokenizer.batch_decode(outputs,skip_special_tokens=True)
print(sequence)
```

For detailed instructions on package usage, please refer to the README in model repo.

## Evaluation

### Results

See the [preprint](https://aka.ms/dayhoff/preprint) for the latest benchmark results and evaluations.

**Model perplexity on held-out test sequences for Dayhoff models.**

| Model            | UniRef50 | GigaRef | Aligned homologs | Unaligned homologs |
|------------------|---------:|--------:|-----------------:|-------------------:|
| 170m-UR50        | 11.62    | 11.88   |                  |                    |
| 170m-UR90        | 11.52    | 11.85   |                  |                    |
| 170m-GR          | 13.67    |  9.36   |                  |                    |
| 170m-UR50-BRn    | 11.78    | 12.03   |                  |                    |
| 170m-UR50-BRq    | 11.67    | 11.91   |                  |                    |
| 170m-UR50-BRu    | 11.66    | 11.87   |                  |                    |
| 3b-UR90          |  8.95    |  9.64   |                  |                    |
| 3b-GR-HM         | 11.95    |  6.68   |  4.34            |  4.60              |
| 3b-GR-HM-c       | 10.11    |  9.21   |  3.57            |  3.56              |


**Quality of generated sequences** as measured by ESMFold pLDDT and scPerplexity. Dataset statistics are for 1024 randomly-sampled sequences. Model statistics are for 1024 generations at T=1 in the N-to-C direction.

| Model or dataset        | pLDDT (mean ± s.d.) | scPerplexity (mean ± s.d.) |
|-------------------------|---------------------|----------------------------|
| **Natural sequences**   |                     |                            |
| UniRef50                | 0.653 ± 0.196       | 9.45 ± 2.89                |
| GigaRef-clusters        | 0.619 ± 0.199       | 9.69 ± 2.83                |
| GigaRef-singletons      | 0.561 ± 0.201       | 10.07 ± 2.88               |
| **Generated sequences** |                     |                            |
| 170m-UR50               | 0.421 ± 0.132       | 11.97 ± 2.14               |
| 170m-UR90               | 0.407 ± 0.125       | 12.12 ± 2.14               |
| 170m-GR                 | 0.422 ± 0.129       | 11.83 ± 2.12               |
| 170m-UR50-BRu           | 0.441 ± 0.157       | 11.71 ± 2.18               |
| 170m-UR50-BRq           | 0.434 ± 0.152       | 11.72 ± 2.24               |
| 170m-UR50-BRn           | 0.432 ± 0.131       | 11.77 ± 2.24               |
| 3b-UR90                 | 0.454 ± 0.150       | 11.79 ± 2.38               |
| 3b-GR-HM                | 0.406 ± 0.126       | 11.50 ± 2.16               |
| 3b-GR-HM-c              | 0.423 ± 0.132       | 11.91 ± 2.18               |



**ProteinGym zero-shot performance** Spearman’s correlation coefficient on ProteinGym substitutions and indels.

| Input                  | Model          | Parameters | Substitutions | Indels |
|------------------------|----------------|-----------:|--------------:|-------:|
| **Single sequence**    | 170m-UR50      | 170M       | 0.353         | 0.479  |
|                        | 170m-UR90      | 170M       | 0.354         | 0.483  |
|                        | 170m-GR        | 170M       | 0.199         | 0.292  |
|                        | 170m-UR50-BRu  | 170M       | 0.341         | 0.476  |
|                        | 170m-UR50-BRq  | 170M       | 0.356         | 0.477  |
|                        | 170m-UR50-BRn  | 170M       | 0.341         | 0.478  |
|                        | 3b-UR90        | 3B         | 0.394         | 0.497  |
|                        | 3b-GR-HM       | 3B         | 0.328         | 0.423  |
|                        | 3b-GR-HM-c     | 3B         | 0.417         | 0.466  |
| **Aligned homologs**   | 3b-GR-HM-c     | 3B         | 0.368         | NA     |
| **Unaligned homologs** | 3b-GR-HM-c     | 3B         | 0.372         | 0.401  |


**RFDiffusion Benchmark Performance** Motif scaffolding performance, problems solved, successes out of 100, and MotifBench score.

| Problem            | 170m-UR50 | 170m-UR90 | 170m-GR | 170m-UR50-BRn | 170m-UR50-BRq | 170m-UR50-BRu | 3b-UR90 | 3b-GR-HM | 3b-GR-HM-c | EvoDiff-Seq |
|--------------------|---------:|---------:|--------:|-------------:|-------------:|-------------:|-------:|--------:|----------:|-----------:|
| 1PRW               |       62 |       72 |      81 |           95 |           91 |           90 |     94 |      81 |        79 |         82 |
| 1BCF               |        0 |        0 |       5 |            0 |            0 |            0 |     10 |       8 |         0 |          7 |
| 5TPN               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 5IUS               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 3IXT               |       12 |       17 |      12 |           14 |           18 |           12 |     18 |      11 |        14 |         20 |
| 5YUI               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 1QJG               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 1YCR               |        2 |        5 |       0 |            6 |            7 |            6 |      2 |       3 |         4 |          2 |
| 2KL8               |        0 |        1 |       0 |            1 |            0 |            1 |      1 |       1 |         1 |          1 |
| 7MRX_60            |        1 |        0 |       0 |            0 |            0 |            2 |     42 |       0 |         9 |          0 |
| 7MRX_85            |        0 |        0 |       0 |            0 |            0 |            0 |     19 |       1 |         1 |          0 |
| 7MRX_128           |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 4JHW               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 4ZYP               |        0 |        0 |       0 |            0 |            0 |            1 |      0 |       0 |         0 |          0 |
| 5WN9               |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 6VW1               |        1 |        1 |       1 |            0 |            0 |            1 |      0 |       0 |         0 |          0 |
| 5TRV_short         |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 5TRV_med           |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 5TRV_long          |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 6E6R_short         |        2 |        2 |       1 |            3 |            3 |            2 |     14 |       7 |         8 |          6 |
| 6E6R_med           |        0 |        1 |       2 |            0 |            0 |            2 |      4 |       0 |         2 |          0 |
| 6E6R_long          |        0 |        1 |       0 |            0 |            0 |            1 |      3 |       0 |         1 |          0 |
| 6EXZ_short         |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 6EXZ_med           |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| 6EXZ_long          |        0 |        0 |       0 |            0 |            0 |            0 |      0 |       0 |         0 |          0 |
| **Problems solved** |     **6** |     **8** |    **6** |        **5** |        **4** |       **10** |   **10** |    **7** |      **9** |       **6** |
| **Successes**       |    **80** |   **100** |  **102** |      **119** |      **119** |     **118** |   **207** |   **112** |    **119** |     **118** |
| **Score**           |   **9.65** |  **12.25** |  **6.10** |      **7.26** |     **10.62** |    **14.36** |  **16.32** |  **11.90** |   **14.14** |    **7.67** |

**MotifBench Benchmark Performance** Motif scaffolding performance, problems solved, successes out of 100, and MotifBench score.

| Problem    | 170m-UR50 | 170m-UR90 | 170m-GR | 170m-UR50-BRn | 170m-UR50-BRq | 170m-UR50-BRu | 3b-UR90 | 3b-GR-HM | 3b-GR-HM-c | EvoDiff-Seq |
|------------|----------:|----------:|--------:|-------------:|-------------:|-------------:|--------:|---------:|-----------:|------------:|
| 01_1LDB    |         1 |         1 |       3 |            0 |            0 |            1 |      20 |        2 |         12 |           0 |
| 02_1ITU    |         4 |        33 |       4 |            1 |            1 |            4 |      37 |       57 |         48 |           0 |
| 03_2CGA    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 04_5WN9    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 05_5ZE9    |         0 |         1 |      21 |            0 |            0 |            0 |      16 |       40 |          9 |           0 |
| 06_6E6R    |         1 |         1 |       1 |            1 |            2 |            1 |       6 |        3 |          1 |           2 |
| 07_6E6R    |         0 |         0 |       0 |            2 |            0 |            0 |       2 |        0 |          0 |           0 |
| 08_7AD5    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 09_7CG5    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 10_7WRK    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 11_3TQB    |         4 |        11 |       3 |            4 |            3 |            7 |      40 |        8 |         26 |           0 |
| 12_4JHW    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 13_4JHW    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 14_5IUS    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 15_7A8S    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 16_7BNY    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 17_7DGW    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 18_7MQQ    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 19_7MQQ    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 20_7UWL    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 21_1B73    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 22_1BCF    |         0 |         0 |       3 |            0 |            0 |            0 |      20 |        9 |          0 |          19 |
| 23_1MPY    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 24_1QY3    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 35_2RKX    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 36_3B5V    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 37_4XOJ    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 28_5YUI    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 29_6CPA    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| 30_7UWL    |         0 |         0 |       0 |            0 |            0 |            0 |       0 |        0 |          0 |           0 |
| **Problems**|       **4**|       **5**|      **6**|         **4**|         **3**|         **4**|      **7**|       **6**|         **5**|        **2** |
| **Successes**|     **10**|     **47**|     **35**|        **8**|        **6**|       **13**|    **141**|     **119**|      **96**|      **21** |
| **Score**   |     **2.33**|     **2.92**|     **4.33**|       **2.75**|       **2.17**|       **2.75**|   **8.36**|    **4.96**|    **4.48**|    **1.58** |

## Technical Specifications 

### Compute Infrastructure

* 170M-parameter models: trained on 8 NVIDIA A100 or 8 NVIDIA H100 GPUs using Distributed Data Parallel.
* 3B-parameter models: trained on 176 NVIDIA H100 GPUs using Fully Sharded Data Parallel in hybrid-shard mode.


## Responsible AI Considerations

The intended use of this model is to generate high-quality, realistic, protein sequences or sets of homologous protein sequences. Generations can be designed from scratch or conditioned on partial sequences in both N→C and C→N directions.

The code and datasets released in this repository are provided for research and development use only. They are not intended for use in clinical decision-making or for any other clinical use, and the performance of these models for clinical use has not been established. You bear sole responsibility for any use of these models, data and software, including incorporation into any product intended for clinical use.


## Citation

If you use the code, data, models, or results. please cite our [preprint](https://aka.ms/dayhoff/preprint).

## Data Summary
https://huggingface.co/microsoft/Dayhoff-3b-UR90-10000/blob/main/data_summary_card.md
