<p align="center">
  <img src="https://raw.githubusercontent.com/allenai/ToyBlocks/main/ToyBlocksLogo_latest.svg" alt="ToyBlocks" width="720">
</p>

# ManiFlow-tb

ManiFlow-tb is the low-level action model for [ToyBlocks](https://allenai.org/blog/toyblocks), a robot block-stacking
project. It is trained on simulated Franka arm data for manipulating blocks on a table
(pick-and-place and in-place rotation of three blocks).
It is trained with the ManiFlow training code at [allenai/maniflow-tb](https://github.com/allenai/maniflow-tb) and
evaluated through ToyBlocks' policy server.

Quick links:

* 📝 [ToyBlocks blog post](https://allenai.org/blog/toyblocks)
* 💻 [ToyBlocks code](https://github.com/allenai/toyblocks)
* 🛠️ [ManiFlow training code](https://github.com/allenai/maniflow-tb)
* 📊 [ToyBlocks data](https://huggingface.co/datasets/allenai/toyblocks-data)

## Model

- Architecture: ManiFlowMultiModal with a DiTX action head (12 layers, 8 heads, width 768), 322.5M parameters,
  stored in bf16 (`safetensors`).
- Inputs: front and gripper RGB images (224 x 224, CLIP ViT-B/16 encoder), a 9-dim robot state, the task name
  (T5-small, `language_mode: action_only`) and a target heatmap token from the high-level policy
  (`target_injection_mode: token`, encoded by the shared RGB encoder, `heatmap_encoder_type: shared_rgb`).
- Outputs: a chunk of 25 executed actions (prediction horizon 50) of 9-dim absolute actions
  (`action_mode: abs`). The last dimension is the play mode (1 play, 0 pause, -1 skill done), because the model was trained
  with `pause_on_attempt: true`. The play mode needs to be fed back to the model when 1 or 0.
- Flow matching with consistency training, 12 integration steps at inference.

## Training

- Data: three ToyBlocks-generated LeRobot datasets of tabletop block manipulation.
- 200,000 steps on 8 GPUs, per-device batch 128, AdamW (lr 1e-4, betas 0.9/0.95, weight decay 1e-3), cosine schedule
  with 500 warmup steps, bf16 mixed precision. Full settings are in `config.yaml`.
- The weights are the online (non-EMA) weights of the final step (200,000).

## Files

The repository mirrors a training run directory, which is the layout ToyBlocks expects:

| file | content |
|---|---|
| `checkpoints/steps_200000_model.safetensors` | model weights |
| `config.yaml` | training config (ToyBlocks reads the model and action settings from it) |
| `stats.json` | normalization statistics of the training data |

## Usage

Download the repository:

```bash
hf download allenai/maniflow-tb --local-dir maniflow-tb
```

Evaluate it with ToyBlocks (the server finds `config.yaml` next to the `checkpoints/` directory):

```bash
python scripts/launch_eval.py --policy maniflow \
  --model-path maniflow-tb/checkpoints/steps_200000_model.safetensors \
  --dataset-path <ToyBlocks eval dataset> --expert-timeout-scale 3.0 ...
```

Training code: [allenai/maniflow-tb](https://github.com/allenai/maniflow-tb) (`scripts/train_maniflow.py`). ToyBlocks
also uses this code as its `baselines/hvla` package to load the model.

## Evaluation

Closed-loop evaluation in ToyBlocks simulation with its own eval pipeline (`scripts/launch_eval.py --policy maniflow`):

- 128 episodes from a held-out validation set of three-block tabletop tasks, each started from the initial state of a
  recorded episode.
- Oracle high-level policy: the high-level plan comes from the recorded task, so the numbers measure this low-level
  action model alone.
- Success: all goal predicates hold with the blocks settled and the gripper open. An episode ends when the
  high-level plan is complete, on a collision, or at the time limit.
- Time limit: 3x the longest expert demonstration (`--expert-timeout-scale 3.0`, 194 s here). With the default 30 s,
  most episodes time out before the task is finished (26 to 28 of 128 succeed), which measures the limit rather than
  the model.

| run | success | success at episode end | collision |
|---|---|---|---|
| 1 | 73/128 (57%) | 64 | 32 |
| 2 | 75/128 (59%) | 67 | 32 |
| 3 | 76/128 (59%) | 66 | 30 |
| 4 | 69/128 (54%) | 63 | 38 |

The four runs use the same episodes and settings; runs 1, 2 and 4 spread the episodes over 7 eval GPUs, run 3 over 1.
They differ because the simulation and batched inference are not
bitwise deterministic. The same episode can flip between success and failure from run to run: two runs agree on
82 to 97 of the 128 episodes.

## Model card safety disclosure
This AI model has not undergone safety benchmarking and must be used exclusively in accordance with the provided research protocol.

## License

The model weights and the training code are released under the [Apache License 2.0](LICENSE).
