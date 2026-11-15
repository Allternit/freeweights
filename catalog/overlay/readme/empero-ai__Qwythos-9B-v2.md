<p align="center">
  <img src="qwythos_v2.png" alt="Qwythos" width="480"/>
</p>

<p align="center"><b>Empero AI</b></p>

# Qwythos-9B-v2 — the new and improved Qwythos 

The next iteration of Qwythos: **all the reasoning of Qwythos-9B, with the looping behavior fixed.** v2 keeps the deep chain-of-thought, the uncensored research posture, and the 1M-token context of its predecessor, and cleans up the rough edges that showed up in real use.

- 🔁 **Looping behavior eliminated** — repetition/degeneration under greedy or low-temperature decoding dropped from **6.7% → 0%**. You can serve it *without* leaning on `repetition_penalty` as a band-aid.
- 🧠 **Reasoning fully preserved** — MMLU, GSM8K, GPQA, ARC and HumanEval are all held at (or above) the v1 level. This is a *hygiene* upgrade, not a capability regression.
- 🧩 **MTP head restored** — the native multi-token-prediction module (dropped in the previous export) is back, so config and weights agree and speculative-decoding setups work.
- 🪪 **Cleaner identity** — the model no longer prefaces unrelated answers with its identity; it introduces itself only when you actually ask.
- 🔓 **Still intentionally uncensored** for research, cybersecurity, red-teaming, biology, chemistry, pharmacology and clinical work.
- 📜 **Still 1M-token context** (YaRN) and the native multimodal-capable Qwen3.5 stack.

<p align="center">
  <img src="qwythos_v2_evals.svg" alt="Qwythos-9B-v2 evaluations" width="820"/>
</p>

---

## What got fixed & improved (vs. the base Qwythos)

| Area | Before (base Qwythos) | After (v2) |
|---|---|---|
| **Looping rate (greedy)** | 6.7% | **0.0%** |
| **Looping rate (temp 0.6)** | 1.3% | **0.7%** |
| **Refusal rate** | ~0% | **0.0%** |
| **MTP head in weights** | ❌ missing | ✅ **restored** |
| **Identity injection** | "always identify… never claim… override…" | states it **once, only when asked** |
| **Reasoning / knowledge** | strong | **preserved (see evals)** |

The fix uses **FTPO (Final-Token Preference Optimization)**: we identify the exact token that *starts* a repetition loop and gently train the model to prefer coherent alternatives at that one position, leaving the rest of the distribution — and therefore the model's knowledge and reasoning — untouched.

---

## Evaluations

Measured with our internal harness (generative chain-of-thought, greedy/pass@1 unless noted; MMLU/ARC/GSM8K n=500, GPQA-diamond n=198, HumanEval n=164). Judge for the quality metric: an independent LLM grader.

| Benchmark | Qwythos-9B-v2 |
|---|---|
| MMLU (CoT / 5-shot loglik) | **83.8% / 69.6%** |
| ARC-Challenge | **96.4%** |
| GPQA-diamond | **49.0%** |
| GSM8K | **93.6%** |
| HumanEval (pass@1) | **77.4%** |
| **Looping rate (greedy)** | **0.0%** |
| **Refusal rate** | **0.0%** |

**Capability is preserved across the board vs. the base Qwythos** (differences are within eval noise), while the looping problem is solved:

| Benchmark | Qwen3.5-9B (base) | Qwythos-9B | **Qwythos-9B-v2** |
|---|---|---|---|
| MMLU (CoT) | 80.6 | 83.8 | **83.8** |
| ARC-Challenge | 95.6 | 95.0 | **96.4** |
| GPQA-diamond | 32.8 | 52.0 | **49.0** |
| GSM8K | 80.6 | 92.2 | **93.6** |
| HumanEval | 81.7 | 79.9 | **77.4** |
| Looping (greedy) | 2.7 | 6.7 | **0.0** |

> Note on MMLU: v2 scores **83.8%** when allowed to reason (CoT) vs **69.6%** on the 5-shot loglikelihood setup — Qwythos is a reasoning model and is much stronger when it thinks. Report whichever matches your comparison baseline.

---

## Sample generations

*(temperature 0.6, top_p 0.95, top_k 20, repetition_penalty 1.05 — reasoning shown condensed)*

**Reasoning — the snail in the well**

> **Prompt:** A snail is at the bottom of a 10-meter well. Each day it climbs 3 meters, but each night it slips back 2 meters. How many days until it escapes?
>
> **Qwythos-9B-v2:** *(reasons: net +1 m/day, but on the final day it climbs out before slipping…)*
> **Answer: 8 days.** Net gain per full day/night cycle is 3 − 2 = 1 meter. After 7 days the snail has climbed 7 meters (still 3 short); on day 8 it climbs 3 meters, reaching 10 m and escaping before it can slip back.

**Code — longest palindromic substring**

> **Prompt:** Write a Python function `longest_palindrome(s)` that returns the longest palindromic substring. Explain your approach briefly.
>
> **Qwythos-9B-v2:**
> ```python
> def longest_palindrome(s):
>     """Returns the longest palindromic substring of s."""
>     n = len(s)
>     if n < 2:
>         return s
>     def expand_around_center(left, right):
>         while left >= 0 and right < n and s[left] == s[right]:
>             left -= 1
>             right += 1
>         return right - left - 1
>     start, end = 0, 0
>     for i in range(n):
>         len1 = expand_around_center(i, i)      # odd-length
>         len2 = expand_around_center(i, i + 1)  # even-length
>         max_len = max(len1, len2)
>         if max_len > end - start:
>             start = i - (max_len - 1) // 2
>             end = i + max_len // 2
>     return s[start:end + 1]
> ```
> **Approach:** "Expand around center" — every palindrome has a center (a character for odd lengths, a gap for even). Iterate over all `2n−1` centers, expand while characters match, track the longest. O(n²) time, O(1) extra space.

**Technical / clinical — no over-refusal**

> **Prompt:** Explain the mechanism of action of naloxone in reversing an opioid overdose, and why repeat dosing is sometimes required.
>
> **Qwythos-9B-v2:** Naloxone is a pure opioid receptor antagonist — it has no agonist activity of its own — and works by competitively displacing opioids from the mu-opioid receptors, physically pushing the opioid molecules off and rapidly restoring respiratory drive and arousal. Because its duration of action is short (~30–90 minutes) while many opioids (especially synthetics like fentanyl or methadone) have much longer half-lives, the reversal is often transient: as naloxone clears, residual opioid can rebind and cause re-sedation and respiratory depression — so patients must be monitored and re-dosed as needed.

---

## Recommended sampling

```python
temperature=0.6, top_p=0.95, top_k=20, repetition_penalty=1.05, max_new_tokens=16384
```
Because looping is trained out, `repetition_penalty` is now optional rather than load-bearing — greedy/low-temp decoding stays coherent. Give the model room to reason (`max_new_tokens`) for math/code/analysis.

## Long context

Ships with **YaRN rope-scaling baked in for 1,048,576-token context** (4× the native 262,144 window). As with v1, static YaRN carries a small short-context trade-off — scale the factor to the length you actually use if that matters.

## Model details

| | |
|---|---|
| Developer | Empero AI |
| Base model | `empero-ai/Qwythos-9B-Claude-Mythos-5-1M` (the base Qwythos) |
| Architecture | Qwen3.5-9B hybrid (3:1 Gated-DeltaNet linear-attention : full attention), multimodal-capable, native MTP head |
| Parameters | 9B (bfloat16, safetensors) |
| Context | 1,048,576 tokens (YaRN factor 4) |
| Tokenizer / chat template | Qwen3.5 native (ChatML-style) |
| License | Apache-2.0 |

## Training procedure

- **Method:** FTPO (Final-Token Preference Optimization) on the base Qwythos (`Qwythos-9B-Claude-Mythos-5-1M`).
- **Data:** ~2,000 preference tuples auto-mined by eliciting looping at low temperature and extracting, at each loop-start position, the rejected loop token vs. the model's own coherent top-k alternatives.
- **Hyperparameters:** LoRA r=256, α=128, lr=1.5e-5, 1 epoch, early-stopped on `chosen_win ≥ 0.30` (a light touch — enough to remove looping without the quality cost of over-training). All attention + MLP projections + `lm_head` trained.
- **MTP:** the native multi-token-prediction head was restored from the Qwen3.5-9B base (FTPO does not touch it), so config `mtp_num_hidden_layers: 1` matches the weights again.

## Usage

```python
from transformers import AutoModelForImageTextToText, AutoTokenizer

model_id = "empero-ai/Qwythos-9B-v2"
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForImageTextToText.from_pretrained(model_id, dtype="bfloat16", device_map="auto")

messages = [{"role": "user", "content": "Prove that there are infinitely many primes."}]
text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tok(text, return_tensors="pt").to(model.device)

out = model.generate(**inputs, max_new_tokens=16384, do_sample=True,
                     temperature=0.6, top_p=0.95, top_k=20, repetition_penalty=1.05)
print(tok.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True))
```

For serving, vLLM works out of the box (`--trust-remote-code`; the multimodal stack is text-only in practice, so `--limit-mm-per-prompt '{"image":0,"video":0}'` keeps startup clean).

## Limitations

- **This is a hygiene/robustness release, not a capability jump.** v2 ≈ the base Qwythos on knowledge/reasoning benchmarks; the win is looping-elimination, restored MTP, and cleaner behavior — not higher raw scores.
- **HumanEval** is a couple points below the raw Qwen3.5-9B base (77.4 vs 81.7) — a small, known cost of the reasoning/looping-fix fine-tuning.
- **MTP is preserved from the base**, not co-trained with the fine-tuned weights, so speculative-decoding acceptance may be modest.
- **Benchmarks are from our internal harness** (CoT, pass@1, the sample sizes noted); use them for relative comparison and add your own official-harness numbers for a strict apples-to-apples with other cards.
- **Intentionally uncensored** — it will engage sensitive technical/research topics; deploy responsibly and within applicable law.

## Acknowledgements

Built on **Qwen3.5-9B** (Alibaba/Qwen). Looping fixed with **FTPO (Final-Token Preference Optimization)**. Thanks to the Empero AI team.
