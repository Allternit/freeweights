## 💫 Community Model> Yi 1.5 6B Chat by 01-ai

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [01-ai](https://huggingface.co/01-ai)<br>
**Original model**: [Yi-1.5-6B-Chat](https://huggingface.co/01-ai/Yi-1.5-6B-Chat)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b2854](https://github.com/ggerganov/llama.cpp/releases/tag/b2854)<br>

## Model Summary:
Yi-1.5 is an upgraded version of Yi. It is continuously pre-trained on Yi with a high-quality corpus of 500B tokens and fine-tuned on 3M diverse fine-tuning samples.<br>
This model should perform well on a wide range of tasks, such as coding, math, reasoning, and instruction-following capability, while still maintaining excellent capabilities in language understanding, commonsense reasoning, and reading comprehension.<br>

## Prompt Template:

Choose the `ChatML` preset in your LM Studio. 

Under the hood, the model will see a prompt that's formatted like so:

```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|> 
<|im_start|>assistant
<|im_end|> 

```

## Technical Details

No technical details have been released about this model.

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) for his dataset (linked [here](https://github.com/ggerganov/llama.cpp/discussions/5263)) that was used for calculating the imatrix for the IQ1_M and IQ2_XS quants, which makes them usable even at their tiny size!

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.