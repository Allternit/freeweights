# MLX-LM-LoRA Model

This model was fine-tuned using [mlx-lm-lora](https://github.com/Goekdeniz-Guelmez/mlx-lm-lora) version 2.1.0.

## Model Details

- Base model: allenai/Olmo-3-7B-Instruct
- Model type: olmo3
- Training method: QAT + LoRA fine-tuning with MLX
- Fusion date: 2026-04-22 23:46:40

## Usage

This model can be loaded and used with the MLX framework.

## Command to recreate

```shell
python -m mlx_lm_lora.train \
--model allenai/Olmo-3-7B-Instruct \
--train-type lora \
--optimizer adamw \
--steps-per-report 1 \
--iters 100 \
--max-seq-length 4096 \
--adapter-path ./Olmo-3-7B-Instruct-mxfp4-QAT \
--data mlx-community/Dolci-Instruct-SFT-No-Tools-400K \
--train \
--qat-enable \
--qat-bits 4 \
--qat-group-size 64 \
--qat-mode mxfp4 \
--qat-start-step 1 \
--qat-interval 1
```