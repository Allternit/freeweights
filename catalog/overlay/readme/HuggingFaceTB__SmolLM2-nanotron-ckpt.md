# SmolLM2 nanotron checkpoints

## Description
Here you can find the [nanotron](https://github.com/huggingface/nanotron/) checkpoints of [SmolLM2](https://github.com/huggingface/smollm/) 1.7B, 360M and 135M models, with their optimizer states. The goal is to facilitate continual-pre-training of these models with nanotron.

For each model size, we release both the final checkpoint and the pre-decay checkpoint. The models were trained using the Warmup-Stable-Decay (WSD) scheduler, so one can take the pre-decay checkpoint and continue training using the same stable learning rate value before performing the decay. For more details on this scheduler, you can check this [paper](https://arxiv.org/abs/2405.18392).

Below is the repo structure:
```
├── 135M
│   ├── final
│   └── pre-decay
├── 1700M
│   ├── final
│   └── pre-decay
└── 360M
    ├── final
    └── pre-decay
        ├── lr_scheduler 📁
        ├── model 📁
        ├── optimizer 📁
        └── random 📁
        ├── checkpoint_metadata.json 📄
        ├── config.yaml 📄
        └── model_config.json 📄
```

## Download and training
To download only one folder, e.g the final checkpoint of the 135M model, you can use `huggingface-cli`

```bash
# pip install -U "huggingface_hub[cli]" 
huggingface-cli download HuggingFaceTB/SmolLM2-nanotron-ckpt --include "135M/final/*" --local-dir ./
```

For details on launching SmolLM trainings with nanotron, refer to: https://github.com/huggingface/smollm/tree/main/pre-training 


