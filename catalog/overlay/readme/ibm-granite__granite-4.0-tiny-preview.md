[![mof-class3-qualified](https://mot.isitopen.ai/modules/mof/assets/badge_class3_qualified.png)](https://mot.isitopen.ai/model/1168)

# Granite-4.0-Tiny-Preview

**Model Summary:**
Granite-4-Tiny-Preview is a 7B parameter fine-grained hybrid mixture-of-experts (MoE) instruct model fine-tuned from Granite-4.0-Tiny-Base-Preview using a combination of open source instruction datasets with permissive license and internally collected synthetic datasets tailored for solving long context problems. This model is developed using a diverse set of techniques with a structured chat format, including supervised fine-tuning, and model alignment using reinforcement learning.

- **Developers:** Granite Team, IBM
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Release Date**: May 2nd, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. However, users may fine-tune this Granite model for languages beyond these 12 languages.

**Intended Use:** 
This model is designed to handle general instruction-following tasks and can be integrated into AI assistants across various domains, including business applications.

**Capabilities**
* Thinking
* Summarization
* Text classification
* Text extraction
* Question-answering
* Retrieval Augmented Generation (RAG)
* Code related tasks
* Function-calling tasks
* Multilingual dialog use cases
* Long-context tasks including long document/meeting summarization, long document QA, etc.

**Installation:** 
You need to install transformer from source to use this checkpoint.
<!-- This is a simple example of how to use Granite-4.0-Tiny-Base-Preview model. -->

<!-- Usage: Install transformer from source or use transformer version v4.45 to use this checkpoint. -->

HuggingFace PR: https://github.com/huggingface/transformers/pull/37658

Install transformer from source: https://huggingface.co/docs/transformers/en/installation#install-from-source
<!-- While the native support of this model in Hugging Face Transformers is pending ([PR](https://github.com/huggingface/transformers/pull/37658)), you need to install transformers from the following source to use this model:
```shell
git clone https://github.com/Ssukriti/transformers.git
cd transformers
git checkout granitemoe_hybrid_external_cleanup
pip install -e .
``` -->
<!-- Install the following libraries:

```shell
pip install torch torchvision torchaudio
pip install accelerate
pip install transformers
``` -->
**Generation:**
After installation, copy the code snippet below to run the example.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, set_seed
import torch

model_path="ibm-granite/granite-4.0-tiny-preview"
device="cuda"
model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map=device,
        torch_dtype=torch.bfloat16,
    )
tokenizer = AutoTokenizer.from_pretrained(
        model_path
)

conv = [{"role": "user", "content":"You have 10 liters of a 30% acid solution. How many liters of a 70% acid solution must be added to achieve a 50% acid mixture?"}]

input_ids = tokenizer.apply_chat_template(conv, return_tensors="pt", thinking=True, return_dict=True, add_generation_prompt=True).to(device)

set_seed(42)
output = model.generate(
    **input_ids,
    max_new_tokens=8192,
)

prediction = tokenizer.decode(output[0, input_ids["input_ids"].shape[1]:], skip_special_tokens=True)
print(prediction)
```

**Evaluation Results:**

<table>
<thead>
    <caption style="text-align:center"><b>Comparison with previous granite models<sup id="fnref1"><a href="#fn1">1</a></sup>. Scores of AlpacaEval-2.0 and Arena-Hard are calculated with thinking=True</b></caption>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Models</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Arena-Hard</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">AlpacaEval-2.0</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">MMLU</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">PopQA</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">TruthfulQA</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">BigBenchHard</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">DROP</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">GSM8K</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">HumanEval</th>
   <th style="text-align:center; background-color: #001d6c; color: white;">HumanEval+</th>
  <th style="text-align:center; background-color: #001d6c; color: white;">IFEval</th>
  <th style="text-align:center; background-color: #001d6c; color: white;">AttaQ</th>
  </tr></thead>
<tbody>
 
  <tr>
      <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;"><b>Granite-3.3-2B-Instruct</b></td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 28.86 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 43.45 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 55.88 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 18.4 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 58.97 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 52.51 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 35.98 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 72.48 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 80.51 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 75.68 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 65.8 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">87.47</td>
      </tr>
  <tr>
      <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Granite-3.3-8B-Instruct</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 57.56 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 62.68 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 65.54 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 26.17 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 66.86 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 59.01 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 41.53 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 80.89 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 89.73 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 86.09 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 74.82 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">88.5</td>
      </tr>
  <tr>
      <td style="text-align:left; background-color: #DAE8FF; color: black;"><b>Granite-4.0-Tiny-Preview</b></td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 26.70 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 35.16 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 60.40 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 22.93 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 58.07 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 55.71 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 46.22 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 70.05  </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 82.41 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 78.33 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 63.03 </td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 86.10 </td>
      </tr> 
</tbody></table>

**Training Data:** 
Overall, our training data is largely comprised of two key sources: (1) publicly available datasets with permissive license, (2) internal synthetically generated data targeted to enhance reasoning capabilities. 


**Infrastructure:**
We train Granite-4.0-Tiny-Preview using IBM's super computing cluster, Blue Vela, which is outfitted with NVIDIA H100 GPUs. This cluster provides a scalable and efficient infrastructure for training our models over thousands of GPUs.

**Ethical Considerations and Limitations:** 
Granite-4.0-Tiny-Preview, leverages both permissively licensed open-source and select proprietary data for enhanced performance. Since it inherits its foundation from the previous model, all ethical considerations and limitations applicable to [Granite-4.0-Tiny-Preview](https://huggingface.co/ibm-granite/granite-4.0-tiny-preview) remain relevant.

**Signature verification:**
Model signing is an experimental feature with ongoing development, which might include breaking changes. We are releasing these capabilities to improve the integrity of our models for our security-conscious users and to facilitate feedback from the community.

Before trying to verify the signature, ensure that the tensor files have been downloaded with git-lfs and that no files have been added, removed, or modified in your local git checkout:

```bash
  git lfs fetch --all
  git lfs pull
  git lfs checkout
```

Install the model_signing (v1.0.1) library with the following command:

```bash
   pip install 'model-signing==v1.1.1'
```



Then verify the signature with the following command ensuring that the IBM identity 'granite.preview@ibm.com' was used for signing this model:

```bash
   python -m model_signing verify sigstore \
     --signature model.sig \
     --ignore-paths .git \
     --ignore-paths .gitattributes \
     --identity Granite.Preview@ibm.com \
     --identity_provider https://sigstore.verify.ibm.com/oauth2 \
     .
```

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources
