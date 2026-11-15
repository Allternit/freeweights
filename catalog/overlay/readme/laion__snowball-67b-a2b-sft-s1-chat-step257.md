# Snowball 67B-A2B SFT Stage 1: Chat

This is the BF16 Hugging Face/vLLM export of the Chat stage in Marin's ordered Chat → Thinking → Agentic SFT campaign.

## Training provenance

- Initialization: [`laion/snowball-67b-a2b-cooldown-step105149`](https://huggingface.co/laion/snowball-67b-a2b-cooldown-step105149)
- Data: `nyu-dice-lab/wildchat50m-rewild-sft-385700` at revision `46a5bb5`
- Schedule: one packed epoch, 257 steps
- Native checkpoint: `s3://marin-us-east-02a/marin/grug/snowball_step105149_sft_s1_chat/2026.08.13.1/checkpoints/step-257/`
- Source: [`marin-community/marin#8172`](https://github.com/marin-community/marin/pull/8172) at `7b1ea1dc07`
- Experiment: [`marin-community/marin#8225`](https://github.com/marin-community/marin/issues/8225)

The export preserves the Marin tokenizer and Delphi special tokens.
