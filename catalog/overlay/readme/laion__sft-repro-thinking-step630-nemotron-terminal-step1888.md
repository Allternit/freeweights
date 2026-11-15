# Grug 67B Nemotron Terminal SFT reproduction

This is the BF16 Hugging Face/vLLM export evaluated by the Marin experiment
`sft-repro-nemotron-terminal-on-thinking-ckpt`.

## Training

- Initialization: Marin Grug 67B stage-2 thinking checkpoint, step 630
- Data: `nvidia/Nemotron-Terminal-Corpus` at revision `a1667c4`, using Marin's
  `documents/nemotron_terminal_full@2026.06.28` selection and
  `tokenized/nemotron_terminal_full-chat-7adc64@2026.07.17`
- Steps: 1,888
- Sequence length: 32,768
- Global batch size: 64
- Peak learning rate: 5e-6, AdamH/Adam with cosine decay, 3% warmup, and 0.1
  minimum learning-rate ratio
- Training geometry: 64 H100 GPUs; replica=1, data=8, expert=8, model=1
- Marin source: `e502edd70c`

The training run completed with a final reported loss of 0.501. The export was
generated from the final step-1,888 checkpoint and preserves the model's native
32,768-token context limit.

## Evaluation

The model was evaluated on the 300-trial OpenThoughts-TBLite reproduction
campaign with the Terminus-2 harness. The experimental controls use three
attempts per task, temperature 0.6, and an agent context budget of 24,576 input
plus 8,192 output tokens. Evaluation results are tracked separately from this
weight artifact.

## Provenance

The immutable source export is:

```
s3://marin-us-east-02a/marin/grug/sft_repro_thinking_step630_nemotron_terminal_steps1888/2026.08.11.1/exports/step-1888/hf-bf16-vllm/
```
