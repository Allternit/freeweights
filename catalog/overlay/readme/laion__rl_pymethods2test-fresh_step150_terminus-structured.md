# RL Pymethods2test Fresh (Step 150) - Terminus Structured

RL-trained Qwen3-8B with terminus-structured agent on pymethods2test dataset.

- **Base model**: laion/r2egym-nl2bash-stack-bugsseq-fixthink-again (8B SFT)
- **Training**: 150 RL steps on pymethods2test (5000 tasks), fresh from SFT base
- **Agent**: terminus-structured (bash, view, edit, create, search, submit tools)
- **Algorithm**: RLOO-N, lr=1e-5
- **Training pass@8**: 100%
- **SWEBench-100 n=1**: 33%
