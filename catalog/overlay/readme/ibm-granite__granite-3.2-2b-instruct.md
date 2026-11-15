# Granite-3.2-2B-Instruct

**Model Summary:**
Granite-3.2-2B-Instruct is an 2-billion-parameter, long-context AI model fine-tuned for thinking capabilities. Built on top of [Granite-3.1-2B-Instruct](https://huggingface.co/ibm-granite/granite-3.1-2b-instruct), it has been trained using a mix of permissively licensed open-source datasets and internally generated synthetic data designed for reasoning tasks. The model allows controllability of its thinking capability, ensuring it is applied only when required.


- **Developers:** Granite Team, IBM
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Release Date**: February 26th, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. However, users may finetune this Granite model for languages beyond these 12 languages.

**Intended Use:** 
This model is designed to handle general instruction-following tasks and can be integrated into AI assistants across various domains, including business applications.

**Capabilities**
* **Thinking**
* Summarization
* Text classification
* Text extraction
* Question-answering
* Retrieval Augmented Generation (RAG)
* Code related tasks
* Function-calling tasks
* Multilingual dialog use cases
* Long-context tasks including long document/meeting summarization, long document QA, etc.



**Generation:** 
This is a simple example of how to use Granite-3.2-2B-Instruct model.

Install the following libraries:

```shell
pip install torch torchvision torchaudio
pip install accelerate
pip install transformers
```
Then, copy the snippet from the section that is relevant for your use case.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, set_seed
import torch

model_path="ibm-granite/granite-3.2-2b-instruct"
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

**Example Outputs**
- thinking=True
```md
Here is my thought process:

1. First, let's understand the composition of the initial 10 liters of 30% acid solution:
   - Acid content = 30% of 10 liters = 0.30 * 10 = 3 liters

2. We want to end up with a 50% acid solution. Let's denote the volume of the 70% acid solution to be added as 'x' liters.

3. The amount of acid in the final mixture (50% solution) should equal the initial acid content plus the acid from the added 70% solution.
   - Total acid in final mixture = 0.50 * (10 + x)

4. The equation representing the total acid content is:
   3 (from initial solution) + 0.70 * x (from added solution) = 0.50 * (10 + x)

5. Now, we solve for 'x':
   3 + 0.70x = 5 + 0.50x
   0.70x - 0.50x = 5 - 3
   0.20x = 2
   x = 2 / 0.20
   x = 10 liters

6. Therefore, 10 liters of a 70% acid solution must be added to the initial 10 liters of 30% acid solution to achieve a 50% acid mixture.

Here is my response:

To solve this problem, we need to determine how much of a 70% acid solution must be added to a 10-liter solution that is already 30% acid to create a new mixture that is 50% acid. Here's how to calculate it:

1. **Initial Acid Content**:
   - The initial 10-liter solution contains 3 liters of acid (since 30% of 10 liters).

2. **Desired Final Acid Content**:
   - We want the final mixture to be 50% acid.

3. **Equation Setup**:
   - Let 'x' be the volume (in liters) of the 70% acid solution to be added.
   - The equation representing the total acid content in the final mixture (which is 10 liters from the initial solution plus 'x' liters of the added solution) should equal 50% of the total volume (10 + x).
   - This gives us: 3 (acid from initial solution) + 0.70x (acid from added solution) = 0.50(10 + x)

4. **Solving the Equation**:
   - First, simplify the right side of the equation: 0.50(10 + x) = 5 + 0.50x
   - Now, the equation is: 3 + 0.70x = 5 + 0.50x
   - Subtract 0.50x from both sides: 0.20x = 2
   - Divide both sides by 0.20: x = 2 / 0.20
   - x = 10 liters

5. **Conclusion**:
   - To achieve a 50% acid mixture from the initial 30% solution, you need to add 10 liters of a 70% acid solution.

So, the final answer is that 10 liters of a 70% acid solution must be added to the initial 10 liters of 30% acid solution.
```
- thinking=False
```md
To solve this problem, we'll use the concept of volume and concentration. Let's denote the amount of 70% acid solution we need to add as "x" liters.

First, let's find out how much acid is in the initial 10-liter solution:

Acid in initial solution = 30% of 10 liters = 0.30 * 10 = 3 liters

Now, we want to end up with a 50% acid solution in a total volume of (10 + x) liters. Let's denote the final volume as V.

Final acid concentration = 50%
Final acid amount = 50% of V = 0.50 * V

We know the initial acid amount and the final acid amount, so we can set up an equation:

Initial acid amount + Acid from added solution = Final acid amount
3 liters + (70% of x) = 0.50 * (10 + x)

Now, let's solve for x:

0.70x + 3 = 0.50 * 10 + 0.50x
0.70x - 0.50x = 0.50 * 10 - 3
0.20x = 5 - 3
0.20x = 2
x = 2 / 0.20
x = 10 liters

So, you need to add 10 liters of a 70% acid solution to the initial 10-liter 30% acid solution to achieve a 50% acid mixture.
```

**Evaluation Results:**
<table>
  
<thead>
  <tr>
    <th style="text-align:left; background-color: #001d6c; color: white;">Models</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">ArenaHard</th>
    <th style="text-align:center; background-color: #001d6c; color: white;">Alpaca-Eval-2</th>
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
    <td style="text-align:left; background-color: #DAE8FF; color: black;">Llama-3.1-8B-Instruct</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">36.43</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">27.22</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">69.15</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">28.79</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">52.79</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">72.66</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">61.48</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">83.24</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">85.32</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">80.15</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">79.10</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">83.43</td>
  </tr>
           
  <tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;">DeepSeek-R1-Distill-Llama-8B</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">17.17</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">21.85</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">45.80</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">13.25</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">47.43</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">65.71</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">44.46</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">72.18</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">67.54</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">62.91</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">66.50</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">42.87</td>
  </tr>
      
  <tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;">Qwen-2.5-7B-Instruct</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">25.44</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">30.34</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">74.30</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">18.12</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">63.06</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">70.40</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">54.71</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">84.46</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">93.35</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">89.91</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">74.90</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">81.90</td>
  </tr>
      
  <tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;">DeepSeek-R1-Distill-Qwen-7B</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">10.36</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">15.35</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">50.72</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">9.94</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">47.14</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">65.04</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">42.76</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">78.47</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">79.89</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">78.43</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">59.10</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">42.45</td>
  </tr>

  <tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;">Granite-3.1-8B-Instruct</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">37.58</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">30.34</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">66.77</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">28.7</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">65.84</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">68.55</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">50.78</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">79.15</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">89.63</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">85.79</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">73.20</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">85.73</td>
  </tr>
      
      
<tr>
    <td style="text-align:left; background-color: #DAE8FF; color: black;">Granite-3.1-2B-Instruct</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">23.3</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">27.17</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">57.11</td> 
    <td style="text-align:center; background-color: #DAE8FF; color: black;">20.55</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">59.79</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">54.46</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">18.68</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">67.55</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">79.45</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">75.26</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">63.59</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">84.7</td>
  </tr>

<tr>
      <td style="text-align:left; background-color: #DAE8FF; color: black;">Granite-3.2-8B-Instruct</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">55.25</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">61.19</td>
   <td style="text-align:center; background-color: #DAE8FF; color: black;">66.79</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">28.04</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">66.92</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">64.77</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">50.95</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">81.65</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">89.35</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">85.72</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">74.31</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">85.42</td>
 
  </tr>
 
  <tr>
      <td style="text-align:left; background-color: #DAE8FF; color: black;"><b>Granite-3.2-2B-Instruct</b></td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">24.86</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">34.51</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">57.18</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">20.56</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">59.8</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">52.27</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">21.12</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">67.02</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">80.13</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">73.39</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">61.55</td>
    <td style="text-align:center; background-color: #DAE8FF; color: black;">83.23</td>
  </tr> 
      


     
      
</tbody></table>

**Training Data:** 
Overall, our training data is largely comprised of two key sources: (1) publicly available datasets with permissive license, (2) internal synthetically generated data targeted to enhance reasoning capabilites. 
<!-- A detailed attribution of datasets can be found in [Granite 3.2 Technical Report (coming soon)](#), and [Accompanying Author List](https://github.com/ibm-granite/granite-3.0-language-models/blob/main/author-ack.pdf). -->

**Infrastructure:**
We train Granite-3.2-2B-Instruct using IBM's super computing cluster, Blue Vela, which is outfitted with NVIDIA H100 GPUs. This cluster provides a scalable and efficient infrastructure for training our models over thousands of GPUs.

**Ethical Considerations and Limitations:** 
Granite-3.2-2B-Instruct builds upon Granite-3.1-2B-Instruct, leveraging both permissively licensed open-source and select proprietary data for enhanced performance. Since it inherits its foundation from the previous model, all ethical considerations and limitations applicable to [Granite-3.1-2B-Instruct](https://huggingface.co/ibm-granite/granite-3.1-2b-instruct) remain relevant.


**Resources**
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources

<!-- ## Citation
```
@misc{granite-models,
  author = {author 1, author2, ...},
  title = {},
  journal = {},
  volume = {},
  year = {2024},
  url = {https://arxiv.org/abs/0000.00000},
}
``` -->