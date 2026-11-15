# tasktrove-dq-taco (step 15)

RL checkpoint from the TaskTrove data-quality sweep, trained with
[SkyRL](https://github.com/marin-community/MarinSkyRL) from `Qwen/Qwen3-Coder-30B-A3B-Instruct` using RLOO over agentic
software-engineering tasks executed by OpenCode in sandboxed environments.

- Base model: `Qwen/Qwen3-Coder-30B-A3B-Instruct` (Qwen3 MoE, 48 layers)
- Checkpoint: `global_step_15`
- Source run: `rl-tasktrove-dq-sweep-30b-qwen3-coder-30-20260726-235656-574ba8`
- Weights: 16 safetensors shards, 61.1 GB

## What this is for

The sweep measures **dataset quality**, not model quality. Each arm trains the same base model on a
different TaskTrove source so the sources can be compared. These checkpoints are research artifacts
for that comparison. None has been evaluated as a general-purpose model, and no benchmark numbers
are claimed here.

## Training configuration

RLOO (`advantage_estimator: rloo_n`) with megatron backend, tensor-parallel 4, pipeline-parallel 2,
expert-parallel 4, across 32 H100s. The objective is deliberately unregularized: `use_kl_loss:
false`, `use_entropy_loss: false`, and `policy_update_steps: 1`, which leaves the PPO clip ratio
inert at 0.0. That choice makes entropy dynamics the primary failure mode across the sweep, and it
is why several arms ended early.

## Known issues with this checkpoint

**This checkpoint is salvaged from a run that failed.** The arm ended early at step 38 with an entropy runaway: policy entropy rose to roughly 30x its step-1 value while reward collapsed to 0.000. The objective carries no anchor term — `use_kl_loss: false`, `use_entropy_loss: false`, and `policy_update_steps: 1` leaves the PPO clip inert at ratio 0.0 — so nothing held the policy in place. Step 15 was selected by trailing-EMA reward as the last checkpoint before the collapse began. Treat it as a pre-collapse snapshot of a diverging run, not as a converged model.

## Provenance

Exported from a `torch.distributed.checkpoint` megatron checkpoint by re-running the trainer's own
export path (`bridge.save_hf_weights`) at the checkpoint's own step, so no offline conversion was
involved. Shard count, index `total_size` and `weight_map` completeness were verified against the
object store before upload.

## Training Traces

Training-time OpenCode/Harbor rollouts for this run are published as a companion dataset:
**[laion/terminal_bench_2_tasktrove_dq_taco_step15_30b_a3b_20260729_222705](https://huggingface.co/datasets/laion/terminal_bench_2_tasktrove_dq_taco_step15_30b_a3b_20260729_222705)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the rollouts the policy was trained on.

## Training Logs

`training_logs/` holds the parsed metric surface for this run — per-step training metrics,
vLLM engine metrics, a summary report, and the reward-vs-steps plot — alongside the raw
trainer log. Capability tokens have been redacted from the logs.
