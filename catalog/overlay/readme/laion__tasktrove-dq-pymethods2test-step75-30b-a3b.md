# tasktrove-dq-pymethods2test (step 75)

RL checkpoint from the TaskTrove data-quality sweep, trained with
[SkyRL](https://github.com/marin-community/MarinSkyRL) from `Qwen/Qwen3-Coder-30B-A3B-Instruct` using RLOO over agentic
software-engineering tasks executed by OpenCode in sandboxed environments.

- Base model: `Qwen/Qwen3-Coder-30B-A3B-Instruct` (Qwen3 MoE, 48 layers)
- Checkpoint: `global_step_75`
- Source run: `rl-tasktrove-dq-sweep-30b-terminus2-qwen-20260725-231748-4fe0b4`
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
**[laion/terminal_bench_2_tasktrove_dq_pymethods2test_step75_30b_a3b_20260730_054052](https://huggingface.co/datasets/laion/terminal_bench_2_tasktrove_dq_pymethods2test_step75_30b_a3b_20260730_054052)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the rollouts the policy was trained on.

## Training Logs

`training_logs/` holds the retained trainer log for this run, and **it is partial**. The Iris log
server retains only the run's first attempt (2026-07-25 23:20 to 07-26 09:48 UTC), during which the
run resumed at `global_step_29` and completed one optimizer step before stalling in generation. The
job was preempted four times; the attempts that trained steps 30 through 75 left no retrievable log,
on the log server or in the object store's archived Ray sessions.

Read `training_logs/COVERAGE.md` before using anything in that directory. `metrics.csv` has a single
row and is not a learning curve. No metric trajectory exists for the span that produced these weights.
