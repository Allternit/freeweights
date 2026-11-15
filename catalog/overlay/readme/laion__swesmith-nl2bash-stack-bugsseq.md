<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# swesmith-nl2bash-stack-bugsseq

This model is a fine-tuned version of [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) on the open-athena/GLM-4.6-swesmith-32ep-131k-nosumm-reasoning, the penfever/GLM-4.6-nl2bash-verified-32ep-32k-reasoning, the open-athena/GLM-4.6-stackexchange-overflow-sandboxes-32eps-65k-reasoning and the open-athena/GLM-4.6-inferredbugs-32ep-65k-reasoning datasets.

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 4e-05
- train_batch_size: 1
- eval_batch_size: 8
- seed: 42
- distributed_type: multi-GPU
- num_devices: 8
- gradient_accumulation_steps: 2
- total_train_batch_size: 16
- total_eval_batch_size: 64
- optimizer: Use OptimizerNames.ADAMW_TORCH_FUSED with betas=(0.9,0.98) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: cosine
- lr_scheduler_warmup_ratio: 0.1
- num_epochs: 7.0

### Training results



### Framework versions

- Transformers 4.57.3
- Pytorch 2.9.0+cu128
- Datasets 4.4.1
- Tokenizers 0.22.1
