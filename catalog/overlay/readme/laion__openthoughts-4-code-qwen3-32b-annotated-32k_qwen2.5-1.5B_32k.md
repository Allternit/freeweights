<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# Openthoughts-4-code-qwen3-32b-annotated-32k_qwen2.5-1.5B_32k

This model is a fine-tuned version of [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) on the laion/Qwen3-32B_hero_run_4_code_32k-sharegpt dataset.

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 0.00015
- train_batch_size: 1
- eval_batch_size: 8
- seed: 42
- distributed_type: multi-GPU
- num_devices: 256
- total_train_batch_size: 256
- total_eval_batch_size: 2048
- optimizer: Use OptimizerNames.ADAMW_TORCH_FUSED with betas=(0.9,0.99) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: cosine
- lr_scheduler_warmup_ratio: 0.1
- num_epochs: 2.0

### Training results


### Framework versions

- Transformers 4.55.0
- Pytorch 2.7.1+cu128
- Datasets 3.6.0
- Tokenizers 0.21.1