# RL Nemotron Easy (Step 63) - Terminus Structured

RL-trained Qwen3-8B with terminus-structured agent on nemotron_easy_2000_tasks dataset.

- **Base model**: laion/r2egym-nl2bash-stack-bugsseq-fixthink-again (8B SFT)
- **Training**: 63 RL steps on nemotron_easy_2000_tasks (data processing / terminal tasks)
- **Agent**: terminus-structured (bash, view, edit, create, search, submit tools)
- **Algorithm**: RLOO-N, lr=1e-5
- **SWEBench-100 n=1**: 33% (partial eval)
