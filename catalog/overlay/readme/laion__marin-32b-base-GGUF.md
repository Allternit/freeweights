# marin-32b-base-GGUF

GGUF quantizations of [`marin-community/marin-32b-base`](https://huggingface.co/marin-community/marin-32b-base),
a 32B dense base model (Qwen3 architecture).

These were produced with [llama.cpp](https://github.com/ggml-org/llama.cpp)
(`convert_hf_to_gguf.py` → f16 GGUF → `llama-quantize`).

## Available quantizations

| File | Quant | Notes |
|------|-------|-------|
| `marin-32b-base-Q4_K_M.gguf` | Q4_K_M | 4-bit, medium — good size/quality balance (recommended default) |
| `marin-32b-base-Q5_K_M.gguf` | Q5_K_M | 5-bit, medium — higher quality, larger |
| `marin-32b-base-Q6_K.gguf`   | Q6_K   | 6-bit — near-lossless |
| `marin-32b-base-Q8_0.gguf`   | Q8_0   | 8-bit — effectively lossless vs f16 |

## Source

- Base model: `marin-community/marin-32b-base` (Apache-2.0)
- Architecture: Qwen3 (`Qwen3ForCausalLM`), 64 layers, hidden 5120, vocab 128256
- This is a **base** (non-instruct) model; there is no chat template.

## Usage (llama.cpp)

```bash
./llama-cli -m marin-32b-base-Q4_K_M.gguf -p "Your prompt here"
```
