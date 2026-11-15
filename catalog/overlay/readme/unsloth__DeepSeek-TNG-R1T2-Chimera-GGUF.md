<div>
<p style="margin-top: 0;margin-bottom: 0;">
    <em><a href="https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf">Unsloth Dynamic 2.0</a> achieves superior accuracy & outperforms other leading quants.</em>
  </p>
  <div style="display: flex; gap: 5px; align-items: center; ">
    <a href="https://github.com/unslothai/unsloth/">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/unsloth%20new%20logo.png" width="133">
    </a>
    <a href="https://discord.gg/unsloth">
      <img src="https://github.com/unslothai/unsloth/raw/main/images/Discord%20button.png" width="173">
    </a>
    <a href="https://docs.unsloth.ai/">
      <img src="https://raw.githubusercontent.com/unslothai/unsloth/refs/heads/main/images/documentation%20green%20button.png" width="143">
    </a>
  </div>
</div>

# DeepSeek-TNG-R1T2-Chimera

<div align="center">
<img src="https://354918363417-runtime-assets.s3.eu-central-1.amazonaws.com/company_logo_light.svg"
     alt="TNG Logo" 
     width="400"
     style="display: inline-block; vertical-align: middle;"/>
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
</div>

**Assembly of Experts Chimera model constructed with the DeepSeek [R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528), [R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) and [V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324) parent models**

We present our new **DeepSeek-TNG R1T2 Chimera** 671B model, the first successor to our original [*DeepSeek R1T Chimera*](https://huggingface.co/tngtech/DeepSeek-R1T-Chimera) that was released on April 26th. Unlike the original Chimera, which was based on the *two parent models* V3-0324 and R1, the new Chimera is a **Tri-Mind** *with three parents*, namely additionally R1-0528. It is constructed using the Assembly of Experts-method with relatively fine-granular direct brain edits. This more refined assembly allowed, among other improvements, the fixing of the &lt;think&gt; token consistency issue, which was a weakness of R1T and is now solved for R1T2. 

**Sweet spot**

R1T2 operates at a new sweet spot in intelligence vs. output token length. It appears to be...

- about **20% faster than** the regular **R1**, and more than **twice as fast as R1-0528**
- significantly **more intelligent than** the regular **R1** in benchmarks such as **GPQA** and **AIME-24**
- much **more intelligent** and also **think-token consistent** compared to the first **R1T Chimera** 0426
- and generally well-behaved and a **nice persona** to talk to, even without any system prompt.

**Recommendations for your model decision**

*R1T2* compared...
- *vs R1:* We hope that R1T2 is a very desirable, almost universal **better and drop-in replacement for R1**
- *vs R1-0528:* R1T2 is a much **cheaper alternative to full R1-0528**, if the fullest 0528-level intelligence is not required
- *vs R1T:* R1T2 is usually **recommended over R1T**, unless the specific personality of R1T was optimal, the think-token issue not important, or R1T's higher speed crucial
- *vs V3-0324:* V3 is so much faster that if you can live with the **lower intelligence, take V3**, however, if you **need reasoning, R1T2** is the go-to model

**Limitations**

- **R1-0528** is thinking much longer, but also is achieving **better hard benchmark results** than R1T2
- As measured by SpeechMap.ai (courtesy of xlr8harder), **R1T2** is significantly **more reserved** than R1T, but not as much as R1-0528
- Due to the influence of its R1 parent, which does not support function calling, **R1T2 is not yet recommended for function-calling** intensive applications at this stage (this may be fixed at a later stage)
- When switching from R1T to R1T2 development, we changed from AIME24 and MT-Bench to AIME24, AIME25 and GPQA-Diamond for the intelligence score. With the new benchmark set, there is a larger score difference between R1 and the original R1T Chimera than published earlier.

**Technological background**

For details on the AoE construction process, you can read our [Paper on arXiV](https://arxiv.org/abs/2506.14794).


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
@misc{tng_technology_consulting_gmbh_2025_07_0x,
	author       = { TNG Technology Consulting GmbH },
	title        = { DeepSeek-TNG-R1T2-Chimera },
	year         = 2025,
    month        = { July },
	url          = { https://huggingface.co/tngtech/DeepSeek-TNG-R1T2-Chimera },
	doi          = { xxx },
	publisher    = { Hugging Face }
}
```