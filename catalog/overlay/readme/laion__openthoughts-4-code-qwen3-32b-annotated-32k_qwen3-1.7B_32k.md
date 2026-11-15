Test Qwen3 1.7B post-trained on laion/openthoughts-4-code-qwen3-32b-32k-annotated (Qwen3 32B 32k output length annotated, using https://huggingface.co/datasets/mlfoundations-dev/hero_run_4_code as seed for generation)

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 0.00015
- per_device_train_batch_size: 1
- seed: 42
- distributed_type: multi-GPU
- num_devices: 256
- total_train_batch_size: 256
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