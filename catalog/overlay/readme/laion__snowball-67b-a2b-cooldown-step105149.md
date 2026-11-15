# Snowball 67B-A2B second cooldown, step 105149

This is the BF16 Hugging Face/vLLM export of the second Snowball cooldown used as the base for Marin's three-stage Chat, Thinking, and Agentic SFT campaign.

## Provenance

Native checkpoint:

```
s3://marin-us-east-02a/marin/grug/moe_67b_a2b_d2560_ep1_rep8_bs1024_seq65536_sw2k_v4_2048_muon_cooldown_step102k-3dac46/checkpoints/step-105149/
```

The model has 67.08B total parameters, approximately 2.01B active parameters, 256 routed experts, and four active experts per token. The export preserves the Marin tokenizer, Delphi special tokens, and the trained FP32 query-bias state.

This checkpoint initialized the August fixed-EOT and Nemotron Terminal SFT experiments documented in [marin-community/marin#7743](https://github.com/marin-community/marin/issues/7743#issuecomment-5258160073).
