<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# Qwen3-8B_exp_tas_tmux_large_traces_save-strategy_steps

This model is a fine-tuned version of [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) on the DCAgent/exp_tas_tmux_large_traces dataset.

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 0.0001
- train_batch_size: 1
- eval_batch_size: 8
- seed: 42
- distributed_type: multi-GPU
- num_devices: 32
- total_train_batch_size: 32
- total_eval_batch_size: 256
- optimizer: Use OptimizerNames.ADAMW_TORCH_FUSED with betas=(0.87,0.99) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: cosine
- lr_scheduler_warmup_ratio: 0.005
- num_epochs: 8.0

### Training results



### Framework versions

- Transformers 4.55.0
- Pytorch 2.7.1+cu128
- Datasets 3.6.0
- Tokenizers 0.21.1
