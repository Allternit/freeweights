# DeepSeek-TNG-R1T2-Chimera

<div align="center">
<img src="https://images.ctfassets.net/m0jozvmb6niy/7xCHZtQfGzp1lCmrC07vvy/81510474abada3d19ddd84a251c350a2/TNG-Logo_mitSchutzzone_160x50px.svg"
     alt="TNG Logo" 
     width="400"
     style="display: inline-block; vertical-align: middle; margin: 0;"/>
</div>
<br>
<div align="center">
  <a href="https://huggingface.co/tngtech/DeepSeek-TNG-R1T2-Chimera/blob/main/LICENSE.DeepSeek" style="margin: 2px;">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-f5de53?&color=f5de53" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>
<br>
<div align="center">
    <img alt="Intelligence Score" src="intelligence_score_vs_output_tokens.png" style="display: inline-block; vertical-align: middle;" width="750"/>
    <figcaption><a href="https://x.com/tngtech/status/1940531045432283412">Release Announcement on X</a></figcaption>
</div>


## Assembly of Experts Chimera model constructed with the DeepSeek [R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528), [R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) and [V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324) parent models

We present our new **DeepSeek-TNG R1T2 Chimera** 671B model, the first successor to our original [*DeepSeek R1T Chimera*](https://huggingface.co/tngtech/DeepSeek-R1T-Chimera) that was released on April 26th. Unlike the original Chimera, which was based on the *two parent models* V3-0324 and R1, the new Chimera is a **Tri-Mind** *with three parents*, namely additionally R1-0528. It is constructed using the Assembly of Experts-method with relatively fine-granular direct brain edits. This more refined assembly allowed, among other improvements, the fixing of the &lt;think&gt; token consistency issue, which was a weakness of R1T and is now solved for R1T2. 

**Sweet spot**

R1T2 operates at a new sweet spot in intelligence vs. output token length. It appears to be...

- about **20% faster than** the regular **R1**, and more than **twice as fast as R1-0528**
- significantly **more intelligent than** the regular **R1** in benchmarks such as **GPQA**, **AIME-24** and **Aider Polyglot**
- much **more intelligent** and also **think-token consistent** compared to the first **R1T Chimera** 0426
- and generally well-behaved and a **nice persona** to talk to, even without any system prompt.

**Recommendations for your model decision**

*R1T2* compared...
- *vs R1:* We hope that R1T2 is a very desirable, almost universally **better drop-in replacement for R1**
- *vs R1-0528:* R1T2 is a much **cheaper alternative to the full R1-0528**, if the full 0528-level intelligence is not required
- *vs R1T:* R1T2 is usually **recommended over R1T**, unless the specific personality of R1T was optimal, the think-token issue not important, or R1T's higher speed crucial
- *vs V3-0324:* V3 is so much faster that if you can live with the **lower intelligence, take V3**, however, if you **need reasoning, R1T2** is the go-to model

**Limitations**

- **R1-0528** is thinking much longer, but also is achieving **better hard benchmark results** than R1T2
- As measured by SpeechMap.ai (courtesy of xlr8harder), **R1T2** is significantly **more reserved** than R1T, but not as much as R1-0528
- When switching from R1T to R1T2 development, we changed from AIME24 and MT-Bench to AIME24, AIME25 and GPQA-Diamond for the intelligence score. With the new benchmark set, there is a larger score difference between R1 and the original R1T Chimera than published earlier.
- Function calling is supported in general, but both vLLM and SGLang currently require some specific adaptions, see the section below.

**Evaluation results**

Evaluation was performed using the evalchemy framework (pass@1 averaged over 10/5 runs for AIME/GPQAD, at a temperature of 0.6).
We report measured benchmark results for our R1T2, R1T models and published benchmark results for V3-0324, R1, R1-0528.

|                                    | R1T2 |  R1T | V3-0324 |   R1 | R1-0528 | Comment | Special source |
|:-----------------------------------|-----:|-----:|--------:|-----:|--------:|:--------|:--------|
| AIME-24                            | 82.3 | 74.7 |    59.4 | 79.8 |    91.4 |         |         |
| AIME-25                            | 70.0 | 58.3 |    49.6 | 70.0 |    87.5 |         | V3-0324 AIME-25 measured by us |
| GPQA-Diamond                       | 77.9 | 72.0 |    68.4 | 71.5 |    81.0 |         |         |
| Aider Polyglot                     | 64.4 | 48.4 |    44.9 | 52.0 |    71.6 | R1T2 beats two of its parents, V3-0324 and R1, and was measured to be about 2.2 times more token efficient, i.e. faster, than its third parent, R1-0528 | R1T2 source: Aider discord, t=0.75 |
| MMLU-Pro Computer Science          | 83.7-85.6 | 82.9-84.6 | 81.5-82.4 | 85.1-85.3 | 84.6-86.1 |         |         |
| EQ-Bench Longform Creative Writing | 76.4 |  ./. |    78.1 | 74.6 |    78.9 | EQ Bench version before August 8th, 2025 | see [EQ Bench](https://eqbench.com/creative_writing_longform.html)  |
| Vectara Hallucination Rate         |  5.5 |  ./. |     8.0 | 14.3 |     7.7 | lower hallucination rates are better, R1T2 is better than all its three parents | see [Hallucination Leaderboard](https://github.com/vectara/hallucination-leaderboard) |

## Technological background

For details on the AoE construction process, you can read our [Paper on arXiV](https://arxiv.org/abs/2506.14794).

**Runtime parameter settings**

- Most of our evaluation was done with a maximum context size of 60,000 tokens.
  With a context size of 130,000 tokens, the model proved very helpful in interpreting very long debug logs. Long-context testing was less extensive, though.
- We're running the model using vLLM on 8xH200 and MI325X nodes, additionally we've tested the model using SGLang, which is also used by [chutes.ai](https://chutes.ai/app/chute/4fa0c7f5-82f7-59d1-8996-661bb778893d).
- For SGLang, we recommend using versions >= v0.4.8 in combination with argument `--reasoning-parser qwen3` to properly handle rare cases when the model skips the `<think>` reasoning step. 


### Function calling

R1T2 does support function calling using an updated chat template (since 01 Aug 2025). However, neither vLLM nor SGLang provide an R1T2-compatible tool call parser natively but require some adaptions.

_vLLM:_

For function calling with vLLM, a new tool parser is required. While we opened [a PR to vLLM](https://github.com/vllm-project/vllm/pull/22074) to include an R1T2-compatible tool parser off-the-shelf, we also ship the tool parser file `tool_parser_vllm.py` within this repository. 
With this file, tool calling can be enabled via
```
--tool-parser-plugin <ABSOLUTE_MODEL_SNAPSHOT_PATH>/tool_parser_vllm.py  \
--tool-call-parser tng_r1t2
```

Here, put in the path to the snapshot folder such as `~/.cache/huggingface/hub/models--tngtech--DeepSeek-TNG-R1T2-Chimera/snapshots/SNAPSHOT/tool_parser_vllm.py`

_SGLang:_

Tool call support for R1T2 requires a recent SGLang version >= v0.4.10 (alternatively, you need to patch [this bugfix for the reasoning parser](https://github.com/sgl-project/sglang/pull/8606) for older versions of SGLang).

An R1T2-compatible tool call parser will be added with [this PR to SGLang](https://github.com/sgl-project/sglang/pull/8672). 
Unfortunately, and unlike vLLM, there is no simple plugin system for tool call parsers in SGLang. 
Until our PR is merged an relased with a new SGLang version, you can still install it manually by patching your SGLang source code as outlined in the PR:
The new tool call parser must be added and registered (so in total one file must be added, a second one edited, see [details here](https://github.com/sgl-project/sglang/pull/8672/files)).

Once the SGLang installation has been updated correctly, tool calling with R1T2 can be activated by starting SGLang with

```
--tool-call-parser tng_r1t2
```


## Model Details

- **Architecture**: DeepSeek-MoE transformer-based language model
- **Combination Method**: Assembly of Experts from the three DeepSeek parent models R1-0528, R1 and V3-0324
- **Release Date**: 2025-07-02
- **Design Team**: Robert Dahlke, Henrik Klagges, Benjamin Merkel, Fabian Klemm and David Reiss, Munich, Germany
- **Extra Thanks**: Big thanks to DeepSeek for their great models and open-source generosity, and to the other researchers that have published on model merging methodologies.


## Use, Out-of-scope Use, Other Limitations, Risks, Recommendations et al.
Regarding the R1T/R1T2-Chimeras, we ask you to follow the careful guidelines that Microsoft has created for their "MAI-DS-R1" DeepSeek-based model. 
These professional guidelines are available [here on Hugging Face](https://huggingface.co/microsoft/MAI-DS-R1).

## EU AI Act

Due to the strict new guidelines of the EU AI Act that take effect on August 2nd 2025, we recommend that each R1T/R1T2 user in the EU either familiarizes themselves with these requirements and assess their compliance, or ceases using the model in the EU after August 1st, 2025.

## Contact, especially for your user feedback

Please give us your feedback, especially if you find deficiencies in the model:
- Email: research@tngtech.com
- X.com: @tngtech

## Citation

```
@misc{tng_technology_consulting_gmbh_2025_07_02,
	author       = { TNG Technology Consulting GmbH },
	title        = { DeepSeek-TNG-R1T2-Chimera },
	year         = 2025,
    month        = { July },
	url          = { https://huggingface.co/tngtech/DeepSeek-TNG-R1T2-Chimera },
	doi          = { 10.57967/hf/5950 },
	publisher    = { Hugging Face }
}
```