# snowball-67b-a2b-sft-ota-rl-r2egym-step30

Snowball 67B-A2B (Grug MoE) after agentic SFT on OpenThoughts-Agent traces and 30 steps of GRPO on R2E-Gym.
It is the best SFT→RL checkpoint in the Snowball agentic thread on SWE-bench Verified (random-100).

Not to be confused with the Grug Datakit 09-21 SFT checkpoint: this model starts from the Stage-3 SFT checkpoint below,
and 2026-09-21 is only the date its RL ran.

Results, write-up and discussion: [marin#9225](https://github.com/marin-community/marin/issues/9225) (evaluations) and
the [SFT then RL write-up](https://gist.github.com/lukedhlee/48185da748a200d44f7fe31431054e37).

## Lineage

1. **Base:** [`laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`](https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888) (Stage-3 SFT).
2. **SFT (arm D, epoch 1, 517 steps):** 79,518 Terminus-2 rows, 1.08B tokens:
   - OpenThoughts-Agent SFT traces without the IssueTasks slice (swesmith, superuser, tezos),
   - Recursive Task Synthesis (RST) trajectories with reward 1 only,
   - a 12,484-row instruction-following slice (if-v2).

   LR 1e-4, one epoch of a two-epoch cosine, 64 × 32,768 tokens per step, 16 nodes.
3. **RL (30 steps, run 2026-09-21):** plain GRPO with sequence-mean loss on a 939-task R2E-Gym band (tasks the SFT
   checkpoint solves at least once in a learnability screen). LR 5e-7 after 3 warmup steps, staleness 2.
   64 tasks × 8 rollouts per step (about two passes over the band), prompts up to 49,152 tokens, no summarization.
   Mean training reward rose from 0.40 to 0.52.

## Scores

Marin Eval Policy v0.1 (Harbor 7b18505a, Terminus-2, 32,768 / 8,192 tokens, temperature 1.0, Daytona), three trials
pooled, 95% CIs over tasks. These predate the 2026-09-24 policy (marin #9409) and are not directly comparable to it.

| checkpoint | SWE-bench Verified random-100 | Terminal-Bench 2.0 |
|---|---|---|
| base (Stage-3 SFT) | 0.145 [0.11, 0.19] | 0.094 [0.06, 0.14] |
| + SFT (D, epoch 1) | 0.241 [0.20, 0.29] | 0.061 [0.04, 0.10] |
| **+ SFT + RL step 30 (this model)** | **0.307 [0.26, 0.36]** | 0.050 [0.03, 0.08] |

SFT and RL raise SWE-bench; Terminal-Bench 2 does not improve (the differences there are inside noise).

## Limitations

- The gains are on Python repo-fixing work (R2E-Gym, SWE-bench). On general terminal tasks (Terminal-Bench 2) this model
  is no better than its base, and it is slower on unfamiliar terminal tasks.
- All scores come from one eval policy (v0.1) and a 100-task SWE-bench subset; treat differences of a few points as noise.

## Notes

- Chat template: the Stage-3 Snowball template (Terminus-2 JSON replies, think spans `<|start_think|>…<|end_think|>`).
- Serving: vLLM with the Marin Grug MoE support; the EAGLE-3 draft
  [`laion/snowball-64k-eagle3-draft-r2egym`](https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym) works as
  a speculative draft.
- Context: trained at 32,768 tokens per sequence in SFT; RL rollouts up to 61k.
