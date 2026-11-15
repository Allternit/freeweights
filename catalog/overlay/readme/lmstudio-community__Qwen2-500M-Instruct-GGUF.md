## 💫 Community Model> Qwen2 500M Instruct by Qwen

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [Qwen](https://huggingface.co/Qwen)<br>
**Original model**: [Qwen2-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2-0.5B-Instruct)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release <a href="https://github.com/ggerganov/llama.cpp/releases/tag/b3086">b3086</a><br>

## Model Summary:

Qwen2 is a new series of language models from Qwen released in various sizes.<br>
Showing improved performance across a large range of categories, this model is great for any general purpose instruction following.<br>
At only 500M parameters, this model should be used for low power edge compute or as a draft model.

## Prompt template:

Choose the `ChatML` preset in your LM Studio.

Under the hood, the model will see a prompt that's formatted like so:

```
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
```

## Technical Details

Qwen2 offers an extremely extended 131,072 token vocabulary

For more information, visit their blog post [here](https://qwenlm.github.io/blog/qwen2/)

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) 

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) and [Dampf](https://github.com/Dampfinchen) for their work on the dataset (linked [here](https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8)) that was used for calculating the imatrix for all sizes.

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.