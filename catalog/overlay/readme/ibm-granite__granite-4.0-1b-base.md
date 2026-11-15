# Granite-4.0-1B-Base

**Model Summary:** 
Granite-4.0-1B-Base is a lightweight decoder-only language model designed for scenarios where efficiency and speed are critical. They can run on resource-constrained devices such as smartphones or IoT hardware, enabling offline and privacy-preserving applications.  It also supports Fill-in-the-Middle (FIM) code completion through the use of specialized prefix and suffix tokens. The model is trained from scratch on approximately 15 trillion tokens following a four-stage training strategy: 10 trillion tokens in the first stage, 2 trillion in the second, another 2 trillion in the third, and 0.5 trillion in the final stage.

- **Developers:** Granite Team, IBM
- **HF Collection:** [Granite 4.0 Nano Language Models HF Collection](https://huggingface.co/collections/ibm-granite/granite-40-nano-language-models-68e5775c80b60e43b72cfa16)
- **GitHub Repository:** [ibm-granite/granite-4.0-nano-language-models](https://github.com/ibm-granite/granite-4.0-nano-language-models)
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/) 
- **Release Date**: October 28, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. Users may fine-tune Granite 4.0 Nano models to support languages beyond those included in this list.

**Intended Use:**
Prominent use cases of LLMs in text-to-text generation include summarization, text classification, extraction, question-answering and code-completion (including FIM) tasks. Moreover, these lightweight models can serve as baseline to create task-specific models for different applications.

**Generation:** 
This is a simple example of how to use Granite-4.0-1B-Base model.

Install the following libraries:

```shell
pip install torch torchvision torchaudio
pip install accelerate
pip install transformers
```
Then, copy the code snippet below to run the example.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
device = "cuda"

model_path = "ibm-granite/granite-4.0-1b-base"

tokenizer = AutoTokenizer.from_pretrained(model_path)
# drop device_map if running on CPU
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=device)
model.eval()
# change input text as desired
input_text = "The capital of France is"
# tokenize the text
input_tokens = tokenizer(input_text, return_tensors="pt").to(device)
# generate output tokens
output = model.generate(**input_tokens, max_length=10)
# decode output tokens into text
output = tokenizer.batch_decode(output)
# print output
print(output[0])
```

Expected output:
```shell
The capital of France is Paris.
```

**Evaluation Results:** 

<table>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Benchmarks</th>
    <th style="text-align:left; background-color: #001d6c; color: white;">Metric</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">1B Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 1B Dense</th>
  </tr>
</thead>
  <tbody>
<tr>
  <td colspan="6" style="text-align:center; background-color:  #FFFFFF; color: #2D2D2D; font-style:italic;">
    General Tasks
  </td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MMLU</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">5-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">33.08</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">36.07</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">59.82</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">58.71</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MMLU-Pro</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">5-shot,CoT</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">11.29</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">10.08</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">29.96</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">23.45</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">BBH</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">3-shot, CoT</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">32.19</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29.96</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">57.73</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">48.45</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">AGI EVAL</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">3-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">28.97</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29.2</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">48.95</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">47.46</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">DROP</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">5-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29.77</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">28.56</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">58.18</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">57.18</td>
</tr>
<tr>
  <td colspan="6" style="text-align:center; background-color:  #FFFFFF; color: #2D2D2D; font-style:italic;">
    Math Tasks
  </td>
</tr>      
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">GSM8K</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">8-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">24.11</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">24.41</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">62.4</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">57.39</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">Minerva Math</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">4-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">9.96</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">11.5</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">30.3</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">21.3</td>
</tr>
<tr>
  <td colspan="6" style="text-align:center; background-color:  #FFFFFF; color: #2D2D2D; font-style:italic;">
    Code Tasks
  </td>
</tr> 
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">HumanEval</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">pass@1 [StarCoder Prompt]</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">34.6</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">35.61</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">68.08</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">68.26</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">HumanEval</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">pass@1</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">32</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">34</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">60</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">59</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">HumanEval+</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">pass@1</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">57</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">56</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MBPP</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">pass@1</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">45</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">17</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">72</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">65</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MBPP+</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">pass@1</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">38</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">16</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">60</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">54</td>
</tr>
<tr>
  <td colspan="10" style="text-align:center; background-color:  #FFFFFF; color: #2D2D2D; font-style:italic;">
    Multilingual Tasks
  </td>
</tr> 
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MMMLU</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">5-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">30.93</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">31.02</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">46.73</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">48.55</td>
</tr> 
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">INCLUDE</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">5-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">27.32</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">29.26</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">42.6</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">43.8</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MGSM</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">8-shot</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">13.92</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">15.12</td>
    <td style="text-align:right; background-color: #DAE8FF; color: #2D2D2D;">46.96</td>
    <td style="text-align:right; background-color: #FFFFFF; color: #2D2D2D;">41.52</td>
</tr>
</tbody></table>

<table>
  <caption><b>Multilingual Benchmarks and thr included languages:</b></caption>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Benchmarks</th>
    <th style="text-align:left; background-color: #001d6c; color: white;"># Langs</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Languages</th>
  </tr>
</thead>
<tbody>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MMMLU</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">11</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">ar, de, en, es, fr, ja, ko, pt, zh, bn, hi</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">INCLUDE</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">14</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">hi, bn, ta, te, ar, de, es, fr, it, ja, ko, nl, pt, zh</td>
</tr>
<tr>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">MGSM</td>
    <td style="text-align:center; background-color: #FFFFFF; color: #2D2D2D;">5</td>
    <td style="text-align:left; background-color: #FFFFFF; color: #2D2D2D;">en, es, fr, ja, zh</td>
</tr>
</tbody>
</table>

**Model Architecture:** 
<!-- TO DO: #DAE8FF -->
Granite-4.0-1B-Base is based on a decoder-only dense transformer architecture. Core components of this architecture are: GQA, MLP with SwiGLU, RMSNorm, and shared input/output embeddings.

<table>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Model</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">1B Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 1B Dense</th>
  </tr></thead>
<tbody>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Embedding size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">1024</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">768</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">2048</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">1536</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of layers</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">28 attention</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4 attention / 28 Mamba2</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">40 attention</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4 attention / 36 Mamba2</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Attention head size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">64</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">64</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">128</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of attention heads</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">16</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">12</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">16</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">12</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of KV heads</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">4</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Mamba2 state size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Number of Mamba2 heads</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">48</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">48</td>
  </tr>

  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">MLP / Shared expert hidden size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2048</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2048</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">4096</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">4096</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Num. Experts</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Num. active Experts</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Expert hidden size</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">-</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">-</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">MLP activation</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">SwiGLU</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">SwiGLU</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">SwiGLU</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">SwiGLU</td>
  </tr>

  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Sequence length</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">32K</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">32K</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">128K</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">128K</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">Position embedding</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">RoPE</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">NoPE</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">RoPE</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">NoPE</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;"># Parameters</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">350M</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">340M</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">1.6B</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">1.5B</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;"># Active parameters</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">350M</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">340M</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">1.6B</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">1.5B</td>
  </tr>
</tbody></table>


**Training Data:** This model is trained on a mix of open source and proprietary data following a four-stage training strategy. 

<table>
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Stage</th>
    <th style="text-align:left; background-color: #001d6c; color: white;">Characteristics</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 350M Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">1B Dense</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">H 1B Dense</th>
  </tr></thead>
<tbody>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">I</td>
      <td style="text-align:left; background-color: #FFFFFF; color: black;">General mixture of training data, warmup, and  power scheduler for learning rate.</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">10</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">10</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">10</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">10</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">II</td>
      <td style="text-align:left; background-color: #FFFFFF; color: black;">General mixture of training data with higher percentages of code and math with power scheduler for learning rate.</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">III</td>
      <td style="text-align:left; background-color: #FFFFFF; color: black;">High quality training data, exponential decay of learning rate.</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">2</td>
  </tr>
  <tr>
    <td style="text-align:left; background-color: #FFFFFF; color: black;">IV</td>
      <td style="text-align:left; background-color: #FFFFFF; color: black;">High quality training data, linear decay to zero for learning rate.</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.5</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.5</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.5</td>
    <td style="text-align:center; background-color: #FFFFFF; color: black;">0.5</td>
  </tr>
</tbody></table>

**Infrastructure:**
We trained the Granite 4.0 Nano Language Models utilizing an NVIDIA GB200 NVL72 cluster hosted in CoreWeave. Intra-rack communication occurs via the 72-GPU NVLink domain, and a non-blocking, full Fat-Tree NDR 400 Gb/s InfiniBand network provides inter-rack communication. This cluster provides a scalable and efficient infrastructure for training our models over thousands of GPUs.

**Ethical Considerations and Limitations:** 
The use of Large Language Models involves risks and ethical considerations people must be aware of, including but not limited to: bias and fairness, misinformation, and autonomous decision-making. Granite-4.0-1B-Base model is not the exception in this regard. Even though this model is suited for multiple generative AI tasks, it has not undergone any safety alignment; therefore, it may produce problematic outputs. Additionally, it remains uncertain whether smaller models might exhibit increased susceptibility to hallucination in generation scenarios by copying text verbatim from the training dataset due to their reduced sizes and memorization capacities. This aspect is currently an active area of research, and we anticipate more rigorous exploration, comprehension, and mitigations in this domain. Regarding ethics, a latent risk associated with all Large Language Models is their malicious utilization. We urge the community to use Granite-4.0-1B-Base model with ethical intentions and in a responsible way. 

**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://github.com/ibm-granite-community/