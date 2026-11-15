# Qwen3.6-35B-A3B-DFlash2

[Blog](https://inco.ai/blog/dflash2/) | [GitHub](https://github.com/z-lab/dflash)

This repository contains the DFlash 2 draft model for
[`Qwen/Qwen3.6-35B-A3B`](https://huggingface.co/Qwen/Qwen3.6-35B-A3B).
It is not a standalone language model: it runs inside a speculative
decoding server and drafts tokens for the target model to verify.

DFlash 2 is a block-diffusion drafter for speculative decoding. It predicts
a whole block of tokens in a single pass and keeps the top candidates at
every position. A lightweight selector then traces one coherent path through them.
Two-tap dynamic convolutions in the backbone keep the draft from decaying
toward the end of the block. Decoding is lossless: greedy output
matches the target model exactly, and sampling preserves its distribution.

<div align="center">
  <img src="assets/dflash2-figure.png" alt="DFlash 2: parallel block drafting with a candidate path selector" width="100%">
</div>

## Quick Start

Serve with [SGLang](https://github.com/sgl-project/sglang):

```bash
pip install "sglang[all] @ git+https://github.com/sgl-project/sglang.git#subdirectory=python"

python -m sglang.launch_server \
  --model-path Qwen/Qwen3.6-35B-A3B \
  --speculative-algorithm DFLASH \
  --speculative-draft-model-path incoai/Qwen3.6-35B-A3B-DFlash2 \
  --speculative-num-draft-tokens 8 \
  --attention-backend flashinfer \
  --speculative-draft-attention-backend fa4
```

Or with [vLLM](https://github.com/vllm-project/vllm):

```bash
pip install -U "vllm @ git+https://github.com/vllm-project/vllm.git@refs/pull/52816/head"

vllm serve Qwen/Qwen3.6-35B-A3B \
  --speculative-config '{
    "method": "dflash",
    "model": "incoai/Qwen3.6-35B-A3B-DFlash2",
    "num_speculative_tokens": 7
  }'
```

See the [blog post](https://inco.ai/blog/dflash2/) for other engines and more details.

## Evaluation

- Runtime: SGLang on one NVIDIA GB300, with FlashInfer for target attention and FlashAttention 4 for draft attention
- Speculation block size: 8 (7 draft tokens per verification step)
- Sampling: temperature 1.0, top-p 0.95, top-k 20, presence penalty 0.0, repetition penalty 1.0, with thinking enabled
- Maximum new tokens: 4096
- Requests: 32 per dataset and concurrency, with seed 42 for prompt selection
- Prompts: benchmark formatting from [`z-lab/dflash`](https://github.com/z-lab/dflash); MT-Bench uses the first turn

We compare autoregressive decoding, Qwen3.6's built-in MTP with seven speculative steps,
and DFlash 2. Both speculative methods propose seven draft tokens per
verification step.

### Acceptance Length

Acceptance length is the per-request mean of completion tokens divided by verification steps at concurrency 1.
Higher is better.

| Task | MTP | DFlash 2 |
| :--- | ---: | ---: |
| GSM8K | 4.92 | **5.21** |
| MATH-500 | 5.02 | **5.34** |
| HumanEval | 4.44 | **4.90** |
| MBPP | 4.36 | **4.76** |
| MT-Bench | 4.26 | **4.41** |

### Throughput

Throughput is total output tokens divided by end-to-end wall time.
Each cell shows `output tok/s (speedup vs. autoregressive)`.

#### Concurrency 1

| Task | Autoregressive | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 358.6 | 505.1 (1.41×) | **670.0 (1.87×)** |
| MATH-500 | 358.8 | 542.1 (1.51×) | **749.4 (2.09×)** |
| HumanEval | 358.7 | 480.1 (1.34×) | **680.3 (1.90×)** |
| MBPP | 361.0 | 474.2 (1.31×) | **660.1 (1.83×)** |
| MT-Bench | 360.5 | 425.4 (1.18×) | **550.0 (1.53×)** |

#### Concurrency 8

| Task | Autoregressive | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 1,524.0 | 1,850.0 (1.21×) | **2,323.7 (1.52×)** |
| MATH-500 | 1,600.0 | 2,391.2 (1.49×) | **3,018.2 (1.89×)** |
| HumanEval | 1,595.9 | 2,126.1 (1.33×) | **2,814.4 (1.76×)** |
| MBPP | 1,503.4 | 2,024.6 (1.35×) | **2,532.5 (1.68×)** |
| MT-Bench | 1,460.6 | 1,727.4 (1.18×) | **2,146.2 (1.47×)** |

#### Concurrency 32

| Task | Autoregressive | MTP | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 2,499.4 | 2,957.5 (1.18×) | **3,971.2 (1.59×)** |
| MATH-500 | 3,432.0 | 5,201.4 (1.52×) | **6,483.1 (1.89×)** |
| HumanEval | 3,060.7 | 4,361.9 (1.43×) | **5,621.9 (1.84×)** |
| MBPP | 2,777.0 | 3,700.0 (1.33×) | **5,025.9 (1.81×)** |
| MT-Bench | 2,535.3 | 3,082.5 (1.22×) | **3,705.5 (1.46×)** |

## License

This model is released under the [Apache License 2.0](LICENSE).

## Citation

If you find DFlash 2 useful, please cite:

```bibtex
@misc{inco2026dflash2,
  title  = {{DFlash 2: Keep Drafting Parallel}},
  author = {{Inco AI}},
  year   = {2026},
  month  = {August},
  url    = {https://inco.ai/blog/dflash2/}
}
```

Please also cite the original DFlash paper:

```bibtex
@inproceedings{chen2026dflash,
  title     = {{DFlash: Block Diffusion for Flash Speculative Decoding}},
  author    = {Chen, Jian and Liang, Yesheng and Liu, Zhijian},
  booktitle = {International Conference on Machine Learning (ICML)},
  year      = {2026}
}
```
