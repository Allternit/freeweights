# mlx-community/humanizer-12b-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant of [jialinyyzz/humanizer](https://huggingface.co/jialinyyzz/humanizer), a 12B Gemma-4-12B fine-tune that rewrites AI-written drafts in English and Chinese so they read like a person wrote them. Layers sensitive to quantization are kept at 8-bit, and robust layers are stored at 4-bit. The 24 GB of bf16 weights shrink to **8.4 GB**, which fits on a 16 GB Mac.

## It is a completion model, not a chat model

Humanizer takes a single, specific prompt: the instruction from `prompt_format.json`, a blank line, the draft, then the separator. Don't add a system prompt, and don't wrap the text in chat turns. The original authors recommend temperature 1.0 and top_p 0.95 and leaving every other sampling setting off. If an English draft comes back rewritten in Chinese, sample again.

`prompt_format.json` is included in this repo.

## Usage

`gemma4_unified` needs OptiQ's model registration, so load it through `mlx-optiq`:

```bash
pip install mlx-optiq
```

```python
import json
import optiq  # registers the gemma4_unified architecture with mlx-lm
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler
from huggingface_hub import hf_hub_download

repo = "mlx-community/humanizer-12b-OptiQ-4bit"
pf = json.load(open(hf_hub_download(repo, "prompt_format.json")))
draft = "It is important to note that the deadline has been extended to Friday, June 12."
prompt = pf["instr"] + "\n\n" + draft.strip() + pf["sep"]

model, tokenizer = load(repo)
print(generate(model, tokenizer, prompt=prompt, max_tokens=512,
               sampler=make_sampler(temp=1.0, top_p=0.95)))
```

The authors' [AGENTS.md](https://huggingface.co/jialinyyzz/humanizer/blob/main/AGENTS.md) has the full prompt contract, including a hash to check the prompt is built byte for byte.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit (sensitive) | 157 |
| Layers at 4-bit (robust) | 172 |
| Total quantized layers | 329 |
| Group size | 64 |
| Multimodal embedder | bf16, in `optiq/optiq_vision.safetensors` |
| Size on disk | 8.4 GB, from a 24 GB bf16 base |

We follow the naming convention `llama.cpp` uses for Q4_K_M and similar mixed-precision quants: the "4-bit" label is the predominant precision, not the weighted average.

### How the bit-widths were chosen

The per-layer bit allocation comes from [mlx-community/gemma-4-12B-it-OptiQ-4bit](https://huggingface.co/mlx-community/gemma-4-12B-it-OptiQ-4bit). There it was set by measuring, for each layer, how much quantizing it shifts the bf16 model's output distribution, and giving 8 bits to the most sensitive layers. Humanizer is a fine-tune with the same architecture, and all 329 quantized layers matched the base allocation by name. The allocation was measured on the base model, not on this fine-tune, so the sensitivities may be slightly different.

Only the language model is quantized. The multimodal embedder stays at bf16, as in every OptiQ Gemma-4 quant.

### What we checked

We ran the quantized model and the bf16 original with greedy decoding on the same 4 drafts (3 English, 1 Chinese), using the authors' prompt. One rewrite was exactly the same. Three had slightly different word choices. All dates, numbers and names in the drafts were kept by both models. We didn't re-run the authors' evaluation, so their detection and fact-check results describe the original weights, not this quantization.

## License

Apache 2.0, the same as the original model. `LICENSE` and `NOTICE` are carried over from [jialinyyzz/humanizer](https://huggingface.co/jialinyyzz/humanizer). All credit for the model goes to its authors.
