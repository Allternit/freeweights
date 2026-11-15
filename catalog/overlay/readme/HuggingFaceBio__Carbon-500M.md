![](figures/carbon-500m-banner.png)

<p align="center">
  <a href="https://www.biorxiv.org/content/10.64898/2026.05.22.727119v1"><b>Technical Report</b> 🧬</a>
</p>

# Carbon-500M

A small generative DNA model from the **Carbon** family.

**Carbon-500M is intended primarily as a draft model for speculative decoding** — it shares the tokenizer and DNA template format of [Carbon-3B](https://huggingface.co/HuggingFaceBio/Carbon-3B) and [Carbon-8B](https://huggingface.co/HuggingFaceBio/Carbon-8B), so it can be paired with either as the target model to reduce wall-clock generation cost at no quality loss. It is not designed to be competitive with the 3B/8B Carbon models on downstream benchmarks.

For the full design rationale, tokenizer specification, evaluation protocol, and usage notes (DNA tag wrapping, 6-mer constraints, scoring helpers), please refer to the **[Carbon-3B model card](https://huggingface.co/HuggingFaceBio/Carbon-3B)** — this card focuses only on facts specific to Carbon-500M.

## Facts

- **500M-parameter decoder-only autoregressive DNA model** (Llama-style architecture).
- **Hybrid tokenizer** shared with the rest of the Carbon family (6-mer for DNA + Qwen3 BPE for English text; each DNA token ≈ 6 bp).
- **Pre-training tokens:** 600B 6-mer tokens (≈ 3.6 T DNA base pairs).
- **Sequence length:** 8,192 tokens (≈ 49 kbp).
- **Loss schedule:** cross-entropy 0 → 300 B tokens, then switch to the hybrid Factorised Nucleotide Supervision (FNS) loss from 300 B → 600 B tokens. The switch happens later than for Carbon-3B because Carbon-500M's training was very stable and tolerated the later transition.
- **Data mixture:** identical to the **decay-phase mixture used by Carbon-3B** — 50 % Generator-style eukaryotic genes / 25 % mature mRNA / 10 % splice-enriched mRNA / 15 % GTDB bacterial genomes. Same weights across the whole 600 B run.
- **Precision:** bfloat16. **Optimizer:** AdamW. **Positional embedding:** RoPE.
- **No long-context training stage** — the model stays at its 8,192-token native context (≈ 49 kbp).
- Released as a standard Hugging Face causal LM (`LlamaForCausalLM`).

## How to use

Wrap DNA in `<dna>...</dna>` exactly as for the larger models. See the [Carbon-3B card](https://huggingface.co/HuggingFaceBio/Carbon-3B#tokenizer-working-with-dna-inputs) for tokenizer details.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

repo = "HuggingFaceBio/Carbon-500M"
tok = AutoTokenizer.from_pretrained(repo, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    repo, dtype=torch.bfloat16,
).cuda().eval()

prompt = "<dna>ATGCGCTAGCTACGATCGATCGTAGCTAGCTAGCTAGCTACG"
inputs = tok(prompt, return_tensors="pt", add_special_tokens=False).to("cuda")
out = model.generate(**inputs, max_new_tokens=64, do_sample=False)
print(tok.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))
```

### Recommended use: speculative decoding with Carbon-3B / Carbon-8B

Carbon-500M is most useful when paired with a larger Carbon model as the verifier. Hugging Face Transformers supports this natively through the `assistant_model` argument:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tok    = AutoTokenizer.from_pretrained("HuggingFaceBio/Carbon-3B", trust_remote_code=True)
draft  = AutoModelForCausalLM.from_pretrained(
    "HuggingFaceBio/Carbon-500M", dtype=torch.bfloat16
).cuda().eval()
target = AutoModelForCausalLM.from_pretrained(
    "HuggingFaceBio/Carbon-3B",   dtype=torch.bfloat16
).cuda().eval()

prompt = "<dna>ATGCGCTAGCTACGATCGATCGTAGCTAGCTAGCTAGCTACG"
inputs = tok(prompt, return_tensors="pt", add_special_tokens=False).to("cuda")
out = target.generate(
    **inputs, max_new_tokens=256, do_sample=False,
    assistant_model=draft,
)
print(tok.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))
```

Output is guaranteed identical to greedy decoding with the target model alone; only wall-clock latency is reduced.

### Base-pair-level generation and scoring

The `fns` branch loads custom modeling code for Factorized Nucleotide Supervision (FNS). Carbon still uses its efficient 6-mer tokenizer, but during generation each selected 6-mer is assembled from six per-position nucleotide distributions, giving base-pair-level control over decoded DNA. Use this branch when you need exact base-pair counts, per-position masks, or temperature/top-p behavior applied at the nucleotide level rather than over the 4,096-way 6-mer distribution:

```py
import math
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "HuggingFaceBio/Carbon-500M"
revision = "fns"
device = "cuda"

tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    revision=revision,
    trust_remote_code=True,
    dtype=torch.bfloat16,
).to(device).eval()

context = "ATGCGCTAGCTACGATCGATCGTAGCTAGCTAGCTAGCTACG"
n_bp = 60

inputs = tokenizer(f"<dna>{context}", return_tensors="pt", add_special_tokens=False).to(device)

with torch.no_grad():
    output_ids = model.generate(
        **inputs,
        max_new_tokens=math.ceil(n_bp / tokenizer.k),
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
    )

generated_ids = output_ids[0, inputs.input_ids.shape[1]:]
generated_dna = tokenizer.decode(generated_ids, skip_special_tokens=True)[:n_bp]

print(generated_dna)
```

The same per-base marginals are exposed through `score_sequence()`, which returns the probability assigned to the observed base at each position. Taking the mean log probability gives a base-pair-level sequence score, where higher values indicate higher model likelihood:

```py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "HuggingFaceBio/Carbon-500M"
revision = "fns"
device = "cuda"

tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    revision=revision,
    trust_remote_code=True,
    dtype=torch.bfloat16,
).to(device).eval()

reference = "GGGCTATAAAGGCCATCGATCGATCGATCGATCGATCGATCG"
perturbed = "GGGCGCGCGCGGCCATCGATCGATCGATCGATCGATCGATCG"

with torch.no_grad():
    bp_probs, actual_probs = model.score_sequence([reference, perturbed])

scores = [torch.log(p.clamp_min(1e-12)).mean().item() for p in actual_probs]

print(f"reference mean bp logp: {scores[0]:.4f}")
print(f"perturbed mean bp logp: {scores[1]:.4f}")
print(f"reference preferred: {scores[0] > scores[1]}")
```


## Evaluation

Carbon-500M is benchmarked against ≈ 1B-parameter DNA models on the standard Carbon evaluation suite. See the [Carbon-3B card](https://huggingface.co/HuggingFaceBio/Carbon-3B#evaluation) for the task definitions and methodology.

## Limitations
⚠️ Genetic data is highly sensitive. Depending on how this model is used (local download, inference API/endpoints, third-party inference providers, Spaces demos or others), input and output data may be processed or handled differently by different providers or space owners. Please make sure you understand and agree with how your data is handled before using the model.

This is a small model intended for speculative decoding so the performance on DNA tasks is limited.

## License

Apache 2.0.

## Acknowledgements

Carbon is a joint collaboration between the research teams at Hugging Face, Zhongguancun Academy, and TIGEM/University of Naples “Federico II”.

## Citation

```
@article{allal2026carbon,
  title={Carbon: Decoding the Language of Life},
  author={Allal, Loubna Ben and Li, Qiuyi and Fiusco, Maurizio and Tunstall, Lewis and Rasul, Kashif and Beeching, Ed and Aubakirova, Dana and Pati{\~n}o, Carlos and Frere, Thibaud and Lozhkov, Anton and others},
  journal={bioRxiv},
  pages={2026--05},
  year={2026},
  publisher={Cold Spring Harbor Laboratory}
}
```
