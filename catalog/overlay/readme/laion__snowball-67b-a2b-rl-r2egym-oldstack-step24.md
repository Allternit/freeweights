# Snowball 67B-A2B, R2E-Gym RL, old stack, step 24

RL on the pre-migration stack (2026-09-07), 728-task tt-v2-train pool, KL 0.01, 40 nodes / 1,584 seats. Held-out pass@1: .492 same-repo, .486 unseen-repo, .050 never-solved.

Base: `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888` (Snowball 67B-A2B, GrugMoe). Training: RLOO-style on-policy RL (sequence-mean loss, staleness 2, groups of 8, batch 64 prompts, lr 5e-7, bf16 stochastic rounding) on R2E-Gym tasks with the terminus-2 terminal agent, 49,152-token prompt / 16,384-token generation. Held-out numbers are pass@1 at 8 attempts on the tt-v2 val441 split (150 same-repo, 115 unseen-repo, 176 held-out), paired against the base model.

Files: HF-layout safetensors export of the policy weights (39 shards), config and tokenizer. Serve with the GrugMoe vLLM fork; the EAGLE-3 draft `laion/snowball-64k-eagle3-draft-r2egym` gives ~1.5x decode on this family.
