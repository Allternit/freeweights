## 💫 Community Model> Mathstral 7b v0.1 by Mistral AI

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [MistralAI](https://huggingface.co/mistralai)<br>
**Original model**: [mathstral-7B-v0.1](https://huggingface.co/mistralai/mathstral-7B-v0.1)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b3389](https://github.com/ggerganov/llama.cpp/releases/tag/b3389)<br>

## Model Summary:
Mathstral is a model based on the Mistral family fine tuned specifically for advanced mathematical problems requiring complex, multi-step logical reasoning.<br>
This model achieves state of the art reasoning compared to similarly sized models across a range of industry standard benchmarks.

## Prompt template:

Choose the `Mistral Instruct` preset in your LM Studio.

Under the hood, the model will see a prompt that's formatted like so:

```
<s>[INST]  {prompt} [/INST]</s>
```

## Technical Details

Released with collaboration with [Project Numina](https://projectnumina.ai/).

This model achieves 56.6% on MATH and 63.47% on MMLU.

Context length: 32768

For more details, check out the Mistral blog post [here](https://mistral.ai/news/mathstral/)

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) for his dataset (linked [here](https://github.com/ggerganov/llama.cpp/discussions/5263)) that was used for calculating the imatrix for the IQ1_M and IQ2_XS quants, which makes them usable even at their tiny size!

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.