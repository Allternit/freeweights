# Snowball 67B-A2B SFT Stage 3: OpenCode

This is the BF16 Hugging Face/vLLM export of the OpenCode stage in Marin's ordered Chat → Thinking → OpenCode SFT campaign. It was trained on OpenCode trajectories and should be evaluated with an OpenCode harness.

`main` is the final step-1,888 checkpoint. The retained step-1,000 checkpoint is published on the `step-1000` branch.

## Training provenance

- Initialization: final Stage 2 Thinking checkpoint at step 630
- Data: `tokenized/grug-a2b-agentic-sft-eot@2026.08.05`, using the restored fixed-EOT path from [`marin-community/marin#8171`](https://github.com/marin-community/marin/pull/8171)
- Data lineage: 29 OpenCode trace datasets generated with a Qwen3.5-122B teacher
- Schedule: five token epochs, 1,888 steps, sequence length 32,768, global batch size 64
- Final loss: approximately 0.201
- Native checkpoint: `s3://marin-us-east-02a/marin/grug/snowball_step105149_sft_s3_agentic_eot_5ep/2026.08.13.1/checkpoints/step-1888/`
- Recipe source: [`marin-community/marin#8172`](https://github.com/marin-community/marin/pull/8172) at `7b1ea1dc07`
- Runtime source: the recipe above plus distributed checkpoint writing from [`marin-community/marin#8140`](https://github.com/marin-community/marin/pull/8140) and a two-hour checkpoint barrier configured for this run
- Experiment: [`marin-community/marin#8225`](https://github.com/marin-community/marin/issues/8225)

The export preserves the Marin tokenizer and Delphi special tokens. It is not the Nemotron-Terminal/Terminus-2 Stage 3 described in the successful control from [`marin-community/marin#7743`](https://github.com/marin-community/marin/issues/7743).
