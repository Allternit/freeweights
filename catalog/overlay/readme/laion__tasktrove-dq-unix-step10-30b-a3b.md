# tasktrove-dq-unix (step 10)

RL checkpoint from the TaskTrove data-quality sweep, trained with
[SkyRL](https://github.com/marin-community/MarinSkyRL) from `Qwen/Qwen3-Coder-30B-A3B-Instruct` using RLOO over agentic
software-engineering tasks executed by OpenCode in sandboxed environments.

- Base model: `Qwen/Qwen3-Coder-30B-A3B-Instruct` (Qwen3 MoE, 48 layers)
- Checkpoint: `global_step_10`
- Source run: `rl-tasktrove-dq-sweep-30b-qwen3-coder-30-20260727-082204-e42f1d`
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

## Provenance

Exported from a `torch.distributed.checkpoint` megatron checkpoint by re-running the trainer's own
export path (`bridge.save_hf_weights`) at the checkpoint's own step, so no offline conversion was
involved. Shard count, index `total_size` and `weight_map` completeness were verified against the
object store before upload.

## Training Traces

Training-time OpenCode/Harbor rollouts for this run are published as a companion dataset:
**[laion/terminal_bench_2_tasktrove_dq_unix_step10_30b_a3b_20260730_014756](https://huggingface.co/datasets/laion/terminal_bench_2_tasktrove_dq_unix_step10_30b_a3b_20260730_014756)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the rollouts the policy was trained on.

## Training Logs

`training_logs/` holds the parsed metric surface for this run — per-step training metrics,
vLLM engine metrics, a summary report, and the reward-vs-steps plot — alongside the raw
trainer log. Capability tokens have been redacted from the logs.
