[![mof-class3-qualified](https://mot.isitopen.ai/modules/mof/assets/badge_class3_qualified.png)](https://mot.isitopen.ai/model/1169)

# Granite-4.0-Tiny-Base-Preview

**Model Summary:** 

Granite-4.0-Tiny-Base-Preview is a 7B-parameter hybrid mixture-of-experts (MoE) language model featuring a 128k token context window. The architecture leverages Mamba-2, superimposed with a softmax attention for enhanced expressiveness, with no positional encoding for better length generalization.
 



- **Developers:** Granite Team, IBM
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/) 
- **Release Date**: May 2nd, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. Users may finetune Granite 4.0 models for languages beyond these 12 languages.

**Intended Use:**
Prominent use cases of LLMs in text-to-text generation include summarization, text classification, extraction, question-answering, and other long-context tasks. All Granite Base models are able to handle these tasks as they were trained on a large amount of data from various domains. Moreover, they can serve as baseline to create specialized models for specific application scenarios.

**Installation:** 
You need to  install transformer from source to use this checkpoint.
<!-- This is a simple example of how to use Granite-4.0-Tiny-Base-Preview model. -->

<!-- Usage: Install transformer from source or use transformer version v4.45 to use this checkpoint. -->
<!-- We have a huggingface PR which is yet to be merged. -->
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
from transformers import AutoModelForCausalLM, AutoTokenizer
device = "auto"
model_path = "ibm-granite/granite-4.0-tiny-base-preview"
tokenizer = AutoTokenizer.from_pretrained(model_path)
# drop device_map if running on CPU
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=device)
model.eval()
# change input text as desired
input_text = "Where is the Thomas J. Watson Research Center located?"
# tokenize the text
input_tokens = tokenizer(input_text, return_tensors="pt").to(device)
# generate output tokens
output = model.generate(**input_tokens,
                        max_length=4000)
# decode output tokens into text
output = tokenizer.batch_decode(output)
# print output
print(output)
```

**Evaluation Results:** 

<table>
  <caption><b>Comparison with 3.3 Base models</b><sup id="fnref1"><a href="#fn1">1</a></caption>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Models</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">ARC-Challenge</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Hellaswag</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">MMLU</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">TruthfulQA</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Winogrande</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">GSM8K</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">DROP</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">NQ</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">AGIEval</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">TriviaQA</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Avg</th>
  </tr></thead>
  <tbody>
<!--   <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Granite-3.1-2B-Base</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">46.83</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">74.9</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">54.87</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">38.93</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">71.8</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">53.0</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">30.08</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">24.46</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">38.24</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">63.18</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">49.63</td>
  </tr> -->
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Granite-3.3-2B-Base</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 47.49 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 73.2 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 54.33 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 40.83 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 70.4 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 50.0 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;"> 32.552 </td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">24.36</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">38.78</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">63.22</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">49.52</td>
  </tr>
<!--   <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Granite-3.1-8B-Base</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">53.51</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">81.4</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">64.28</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">51.27</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">76.2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">70.5</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">45.87</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">35.97</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">48.99</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">78.33</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">60.63</td>
  </tr> -->

  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Granite-3.3-8B-Base</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">50.84</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">80.1</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">63.89</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">52.15</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">74.4</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">59.0</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">36.14</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">36.5</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">49.3</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">78.18</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">58.05</td>
  </tr>
      
  <tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;"><b>Granite-4.0-Tiny-Base-Preview</b></td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">54.52</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">75.80</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">57.86</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">44.57</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">71.1</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">49.0</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">41.74</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">28.48</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">42.61</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">67.85</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">53.35</td>
  </tr>
</tbody></table>


**Model Architecture:** 
Granite-4.0-Tiny-Base-Preview is based on a decoder-only dense transformer architecture. Core components of this architecture are: GQA and NoPE, MLP with SwiGLU, RMSNorm, and shared input/output embeddings.
<table>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Model</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">2B Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">8B Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Granite-4.0-Tiny-Base-Preview</th>
  </tr></thead>
<tbody>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Embedding size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2048</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4096</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;"> 1536 </td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of layers</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">40</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">40</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">40</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Attention head size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;;">64</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128</td>
   <td style="text-align:center; background-color: #DAE8FF; color: black;">128</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of attention heads</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">32</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">32</td>
 <td style="text-align:center; background-color: #DAE8FF; color: black;">12</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of KV heads</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">8</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">8</td>
 <td style="text-align:center; background-color: #DAE8FF; color: black;">4</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">MLP hidden size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">8192</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">12800</td>
 <td style="text-align:center; background-color: #DAE8FF; color: black;">512</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">MLP activation</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">SwiGLU</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">SwiGLU</td>
   <td style="text-align:center; background-color: #DAE8FF; color: black;">SwiGLU</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Initialization std</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.1</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.1</td>
  <td style="text-align:center; background-color: #DAE8FF; color: black;"> 0.1 </td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Sequence length</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128K</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128K</td>
<td style="text-align:center; background-color: #DAE8FF; color: black;">128K</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Position embedding</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">RoPE</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">RoPE</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">None</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;"># Parameters</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2.5B</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">8.1B</td>
<td style="text-align:center; background-color: #DAE8FF; color: black;">6.7B</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;"># Active parameters</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2.5B</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">8.1B</td>
  <td style="text-align:center; background-color: #DAE8FF; color: black;"> 1B </td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;"># Training tokens</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">12T</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">12T</td>
   <td style="text-align:center; background-color: #DAE8FF; color: black;">2.5T</td>
  </tr>
</tbody></table>

**Training Data:** 
This model is trained on a mix of open source and proprietary data following a two-stage training strategy.
* Stage 1 data: The data for stage 1 is sourced from diverse domains, such as: web, code, academic sources, books, and math data.
* Stage 2 data: The data for stage 2 comprises a curated mix of high-quality data from the same domains, plus multilingual and instruction data. The goal of this second training phase is to enhance the model’s performance on specific tasks. 
contains a recitation of the related paragraph before the answer.

**Infrastructure:**
We train Granite 4.0 Language Models using IBM's super computing cluster, Blue Vela, which is outfitted with NVIDIA H100 GPUs. This cluster provides a scalable and efficient infrastructure for training our models over thousands of GPUs.

**Ethical Considerations and Limitations:** 
The use of Large Language Models involves risks and ethical considerations people must be aware of, including but not limited to: bias and fairness, misinformation, and autonomous decision-making. Granite-4.0-Tiny-Base-Preview model is not the exception in this regard. Even though this model is suited for multiple generative AI tasks, it has not undergone any safety alignment, there it may produce problematic outputs. Additionally, it remains uncertain whether smaller models might exhibit increased susceptibility to hallucination in generation scenarios by copying text verbatim from the training dataset due to their reduced sizes and memorization capacities. This aspect is currently an active area of research, and we anticipate more rigorous exploration, comprehension, and mitigations in this domain. Regarding ethics, a latent risk associated with all Large Language Models is their malicious utilization. We urge the community to use Granite-4.0-Tiny-Base-Preview model with ethical intentions and in a responsible way. 

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

<p><a href="#fnref1" title="Jump back to reference">[1]</a> Evaluated using <a href="https://github.com/allenai/olmes">OLMES</a></p>