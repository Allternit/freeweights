# Snowball 67B-A2B SFT Stage 2: Thinking

This is the BF16 Hugging Face/vLLM export of the Thinking stage in Marin's ordered Chat → Thinking → Agentic SFT campaign.

## Training provenance

- Initialization: final Stage 1 Chat checkpoint at step 257
- Data: `laion/llama-nemotron-science-reasoning-on-canonical-think-full` at revision `bae881d`
- Schedule: one packed epoch, 630 steps
- Native checkpoint: `s3://marin-us-east-02a/marin/grug/snowball_step105149_sft_s2_thinking/2026.08.13.1/checkpoints/step-630/`
- Source: [`marin-community/marin#8172`](https://github.com/marin-community/marin/pull/8172) at `7b1ea1dc07`
- Experiment: [`marin-community/marin#8225`](https://github.com/marin-community/marin/issues/8225)

The export preserves the Marin tokenizer and Delphi special tokens.
