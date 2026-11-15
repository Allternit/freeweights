<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# r2egym-nl2bash-stack-bugsseq-fixthink

This model is a fine-tuned version of [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) on the /data/cat/ws/befe330h-befe330h-otagent/huggingface/hub/datasets--penfever--glm-4.6-r2egym-32ep-32k/snapshots/1b98f51e65d71b6dc9702529884355b93b8b8685_thinking_preprocessed, the /data/cat/ws/befe330h-befe330h-otagent/huggingface/hub/datasets--penfever--GLM-4.6-nl2bash-verified-32eps-32k/snapshots/61e17458d760f1419c4447abbab4fc93118563dd_thinking_preprocessed, the /data/cat/ws/befe330h-befe330h-otagent/huggingface/hub/datasets--penfever--GLM-4.6-stackexchange-overflow-sandboxes-32eps-65k/snapshots/1c13e68d92fc88775a6a593c5ca93a4a4bae0a38_thinking_preprocessed and the /data/cat/ws/befe330h-befe330h-otagent/huggingface/hub/datasets--penfever--GLM-4.6-inferredbugs-32eps-65k/snapshots/60d83f48605156a6b9182f9b54c6da2d4dffc061_thinking_preprocessed datasets.

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

- Transformers 4.57.6
- Pytorch 2.9.0+cu128
- Datasets 4.4.1
- Tokenizers 0.22.2
