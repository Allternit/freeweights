# LAR-9B

This is the official model repository for **Agentic RL Model with Process Reward with Lean 4 (LAR)**. 
## Model performance

## Main Results

![ResultPlot](./assets/ResultPlot.png)

| Model | Size | SWE-Bench-Verified | TB-2.0 | TB-2.1 |
|:------|:----:|--------------------:|---------:|---------:|
| **LAR-9B** | 9B | **64.2%** | **32.8%** | **29.5%** |
| **LAR-27B** | 27B | **84.2%** | **68.2%** | **77.3%** |


### 1. Install dependencies
#### 1.1 Install environment
```bash
# Install the corresponding environment
# (run from the repository root; needs python3.12 + venv, git, docker with compose v2 (user in the docker group), sudo,
#  an NVIDIA driver and CUDA toolkit for CUDA 13; MODEL = LAR-27B checkpoint, WORK = work dir on a fast local disk)
export MODEL=amazon/LAR-27B WORK=/path/to/local/disk/tb21
python3.12 -m venv ~/.venvs/lar-serve
~/.venvs/lar-serve/bin/pip install -r PSWF/EvaluationKit/TB-2.1/requirements/serve.txt ./PSWF/EvaluationKit/TB-2.1
python3.12 -m venv ~/.venvs/lar-eval
~/.venvs/lar-eval/bin/pip install -r PSWF/EvaluationKit/TB-2.1/requirements/eval.txt ./PSWF/Harness/Terminus-2 ./PSWF/EvaluationKit/TB-2.1
~/.venvs/lar-eval/bin/python -m pswf_harbor_patches --tokenizer-dir $MODEL
```

#### 1.2 Init TB-2.1 containers

```bash
# Initialize the TB-2.1 containers
~/.venvs/lar-eval/bin/python -m tb21_eval.prepare --work-dir $WORK
sudo ~/.venvs/lar-eval/bin/python -m tb21_eval.netguard up --work-dir $WORK
~/.venvs/lar-eval/bin/python -m tb21_eval.netguard probe --work-dir $WORK
```

### 2. Run TB-2.1 evaluation using PSWF with Terminus-2

```bash
# Run the evaluation
~/.venvs/lar-serve/bin/python -m tb21_eval.serve up --model $MODEL --work-dir $WORK
~/.venvs/lar-eval/bin/python -m tb21_eval.make_job --model $MODEL --work-dir $WORK --run-dir $WORK/runs/x5 --n-attempts 5 --n-concurrent 40
setsid nohup ~/.venvs/lar-eval/bin/harbor run -c $WORK/runs/x5/job.json --env-file $WORK/runs/x5/harbor.env > $WORK/runs/x5/harbor.log 2>&1 &
# ~16 h in the background; score at any time (if harbor was interrupted: ~/.venvs/lar-eval/bin/python -m tb21_eval.resume --run-dir $WORK/runs/x5)
~/.venvs/lar-eval/bin/python -m tb21_eval.score $WORK/runs/x5
```

## Training Data and Methodology

The released checkpoint is post-trained from `Qwen/Qwen3.5-9B` (licensed under Apache License 2.0) using Lean4AgenticRL process reward methods. This version was trained only on a filtered subset of SWE-Rebench containing software-engineering task examples from public code repositories. The underlying repository licenses were verified at the pinned base commits, and only examples meeting the license-filtering criteria were retained. 

## Responsible AI Considerations

At Amazon, we are committed to developing AI responsibly and take a people-centric approach that prioritizes education, science, and our customers, to integrate responsible AI across the end-to-end AI lifecycle. We believe the use of AI must respect the rule of law and human rights, and we encourage the safe and responsible development of AI. When downloaded or used in accordance with [AWS Responsible AI Policy](https://aws.amazon.com/ai/responsible-ai/policy/), developers should work with their internal model team to ensure this model meets requirements for the relevant industry and use case and addresses unforeseen product misuse.

Please report model quality, risk, security vulnerabilities or Amazon AI Concerns [here](https://pages.awscloud.com/global-ln-gc-400-ai-service-cards-contact-us-registration.html).

## Reference

If you find our work useful, please cite it using the BibTeX entry below. This entry currently links to the PDF hosted on GitHub and will be updated once the arXiv version is available.

```bibtex
@misc{wang2026lean4agenticrl,
      title={Lean4AgenticRL: Advancing Agentic RL with Verifiable Multi-level Process Rewards}, 
      author={Ruida Wang and Gerald Friedland and Tong Zhang and Chris Kong},
      year={2026},
      eprint={2610.22448},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2610.22448}, 
}
```
