# License audit summary (Phase 0.1)

Source: `catalog/_audit/source-inventory.json` (75 rows). Verdicts in `catalog/_audit/licenses.csv` (one row per inventory row, same order). Each row has the upstream URL, the pinned commit, and either a quoted clause or the note "MIT/Apache standard grant". Audit date: 2026-11-14. Metadata from the public Hugging Face API; license texts read from each repo's pinned commit, or from the upstream page where the repo has none.

## Counts per verdict

| Verdict | Rows |
|---|---|
| yes | 63 |
| no | 7 (6 unique repos; MiniMax-M3.1-Flash appears as rows 5 and 74) |
| unclear | 4 |
| click-through | 1 |
| **total** | **75** |

Gated: 1 row (Idavidrein/gpqa, gated = auto). Inventory said gated=False for it; corrected to yes.

## "no" rows

| Repo | Why |
|---|---|
| MiniMaxAI/MiniMax-M3.1-Flash (rows 5 and 74) | MiniMax Community License grants distribution "for non-commercial purposes" only. Commercial Use includes offering to third parties for a fee. Needs written authorization from api@minimax.io. |
| unsloth/MiniMax-M3.1-Flash-GGUF (row 11) | Same MiniMax text, inherited. The README links a LICENSE file that is not in the repo. |
| Qwen/Qwen-Image-2.1 (row 55) | Qwen RESEARCH LICENSE AGREEMENT: "FOR NON-COMMERCIAL PURPOSES ONLY". Redistribution is granted only subject to that. |
| Qwen/Qwen-Image-2.1-Turbo (row 56) | Same as row 55. |
| MiniMaxAI/MiniMax-H3-Image (row 58) | Applicable Territory is worldwide excluding the EU, UK, South Korea and the United States. Distribution from a US host is outside the grant. |
| MiniMaxAI/MiniMax-H3 (row 59) | Same territorial exclusion as row 58. |

## "unclear" rows

| Repo | Why |
|---|---|
| allenai/tulu-3-sft-mixture (row 60) | Compilation is ODC-BY, but the card says some subsets are non-commercial and some outputs carry third-party terms. Check per subset. |
| teknium/OpenHermes-2.5 (row 62) | No license in metadata, no LICENSE file, no license section in the README. |
| princeton-nlp/SWE-bench_Verified (row 68) | No license in metadata, no LICENSE file, no license section in the README. Confirm upstream. |
| livecodebench/code_generation_lite (row 69) | License tag is "cc", not a valid SPDX id. Cannot tell CC0 from CC-BY or NC variants. |

## "click-through" row

| Repo | Why |
|---|---|
| Idavidrein/gpqa (row 67) | CC-BY-4.0 plus a gate: users agree not to reveal examples in plain text or images online. Consistent with the plan's link-only treatment. |

## Surprises

1. **Gemma 4 is Apache-2.0.** The HF tag and Google's license page (which shows the Apache License 2.0 text) agree. This closes the plan's "confirm license" note for rows 18 to 22 and 47. Google also publishes a separate Prohibited Use policy, which is not a redistribution restriction.
2. **Qwen-Image-2.1 is not a day-one "yes."** The plan lists it under the Qwen license for day-one hosting. The text is a research, non-commercial license, so it cannot be hosted as planned without a commercial license from Qwen.
3. **Qwen3.8-Flash-Next is under Qwen Community License 1.0, which is permissive.** It is not the research license. Conditions are a model-name display above 100M MAU or USD 20M monthly revenue, and a separate license for MaaS businesses.
4. **MiniMax H3 and H3-Image exclude the United States.** Both are video or image models, and neither is in the plan's section C table. Vendor family was used for the section (`alt.freeweights.minimax`); Allternit should decide whether they belong in the catalog at all.
5. **Kimi K3.1-Pro and GLM-5.3 permit redistribution with thresholds.** Kimi requires its name shown in the UI above 100M MAU or USD 20M monthly revenue. GLM-5.3 requires a Z.AI security review above USD 10B aggregate MaaS revenue. Both keep the copyright notice requirement.
6. **Several MIT and Apache rows have no LICENSE file in the repo.** The verdict rests on the HF tag and README (for example rows 3, 7 to 10, 12, 18 to 22, 35, 61, 70, 71). Each is marked in notes.
7. **Inventory gaps.** Rows 73 (zai-org/GLM-5.3) and 74 (MiniMax-M3.1-Flash) had no sha in the inventory. Both were pinned to the current upstream HEAD (ba32f8c1 and ce7f4df8). Row 74 duplicates row 5's repo.
8. **Tulu 3 and fineweb-edu** both carry ODC-BY, but tulu's subsets vary and fineweb-edu also carries CommonCrawl's terms. Only tulu is "unclear."
9. **Base-model inheritance was not checked** for distilled or derived repos (for example row 35, MiMo Distill-Qwen-9B, and the GGUF quants). Their verdicts come from their own tags.

## Addendum 2026-11-14: rows 76 to 90 (community download list)

Added on Allternit's request after comparing a public "download these 24 open models" list against the catalog: 9 were already listed, and these 15 were not. Each repo was confirmed live on the HF API and pinned to its HEAD commit that day. The custom licenses were read from the pinned files (Hunyuan, Fish, FLUX) or the linked upstream file (LTX `LICENSE-2_x`).

| Repo | Section | Verdict | Listing |
|---|---|---|---|
| unsloth/Qwen3.8-Flash-Next-GGUF | qwen | yes (Qwen Community 1.0) | manifest, click-through |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | deepseek | yes (MIT) | manifest |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | abliterated | yes (Apache-2.0) | manifest; some series come from community fine-tunes whose own licenses were not re-read |
| alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF | abliterated | yes (Qwen Community 1.0) | manifest, click-through |
| alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF | abliterated | yes (MIT) | manifest |
| huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | abliterated | yes (MIT) | manifest |
| OpenMOSS-Team/MOSS-Image-Base | image | yes (Apache-2.0) | manifest |
| black-forest-labs/flux-3-image-klein-comfy | image | click-through, gated | link only. FLUX Kommunity License: non-commercial, or commercial for a Qualifying User under 5M USD revenue |
| Wan-AI/Wan2.2-T2V-A14B | video | yes (Apache-2.0) | manifest; the VAE is a .pth pickle, listed with its checksum |
| Wan-AI/Wan2.2-I2V-A14B | video | yes (Apache-2.0) | manifest; the VAE is a .pth pickle, listed with its checksum |
| tencent/HunyuanVideo-1.5 | video | no | link only. Territory excludes the EU, UK and South Korea (s.5c), and a worldwide hub cannot limit who downloads |
| Lightricks/LTX-2.5 | video | click-through, gated | link only. Commercial use needs an agreement at 10M USD annual revenue or more |
| fishaudio/s2-pro | speech | no | link only. Fish Audio Research License: non-commercial |
| ACE-Step/Ace-Step1.5 | music | yes (MIT) | manifest; some .pt pickle files, listed with checksums |
| Comfy-Org/YuE2 | music | no | link only. CC-BY-NC-4.0 |

New sections: `alt.freeweights.video` and `alt.freeweights.music`. Abliterated rows go in `alt.freeweights.abliterated` with the base model's family and a `what_changed` line taken from each model card. Gated models are now link-only rows with size and formats from the public file listing (before this, only gated datasets had that path). Catalog after the addendum: 83 listed, 7 refused, about 19.5 TB listed.
