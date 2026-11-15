# RL Pymethods2test + NL2Bash (Step 50) - Terminus Structured

RL-trained Qwen3-8B with terminus-structured agent on pymethods2test + nl2bash mixed dataset.

- **Base model**: laion/r2egym-nl2bash-stack-bugsseq-fixthink-again (8B SFT)
- **Training**: 50 RL steps on pymethods2test (5000) + nl2bash (1570) mixed dataset
- **Agent**: terminus-structured (bash, view, edit, create, search, submit tools)
- **Algorithm**: RLOO-N, lr=1e-5
- **Training pass@8**: 96.9%
- **SWEBench-100 n=1**: 21%
