## 💫 Community Model> Qwen2 Math 1.5B Instruct by Qwen

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [Qwen](https://huggingface.co/Qwen)<br>
**Original model**: [Qwen2-Math-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2-Math-1.5B-Instruct)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b3509](https://github.com/ggerganov/llama.cpp/releases/tag/b3509)<br>

## Model Summary:
Qwen2-Math is a brand new release from the Qwen team, iterating on their previous incredible success of Qwen 2 models!<br>These models are state of the art for their size in math and reasoning, and should be great for solving complex multi-step logic problems.<br>At 1.5B parameters, this model even outperforms the latest Llama 3.1 8B, and other math tunes all the way up to 20B!

## Prompt Template:

Choose the `ChatML` preset in your LM Studio.
Under the hood, the model will see a prompt that's formatted like so:

```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
```

## Technical Details
These models are trained on a meticulously designed math specific corpus containing "large-scale high-quality" mathematical web texts, books, codes, exam questions, and additional data synthesized by Qwen2.

The instruct is then created using a math-specific reward model based on the Qwen2-Math-72B base model, and tuned through SFT, and Group Relative Policy Optimization (GRPO).

For more details, check their blog post [here](https://qwenlm.github.io/blog/qwen2-math/)

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) and [Dampf](https://github.com/Dampfinchen) for their work on the dataset (linked [here](https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8)) that was used for calculating the imatrix for all sizes.

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.
