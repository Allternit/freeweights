# Snowball 67B-A2B Nemotron-Terminal SFT

This repository contains BF16 Hugging Face/vLLM exports from the Nemotron-Terminal branch of Marin's ordered Chat → Thinking → Agentic SFT campaign. The model was initialized from the final Thinking checkpoint and trained for 1,888 steps on the Nemotron Terminal corpus used by the successful control in [marin-community/marin#7743](https://github.com/marin-community/marin/issues/7743).

`main` is the final step-1,888 checkpoint. Retained intermediate checkpoints are published as `step-N` branches.

## Provenance

Native checkpoint collection:

```
s3://marin-us-east-02a/marin/grug/snowball_step105149_sft_s3_nemotron_terminal_steps1888/2026.08.14.1/checkpoints/
```

The export preserves the Marin tokenizer, Delphi special tokens, and the trained FP32 query-bias state. This lineage should be evaluated with Terminus-2.
