## 💫 Community Model> AlchemistCoder L 7B by InternLM

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [InternLM](https://huggingface.co/internlm)<br>
**Original model**: [AlchemistCoder-L-7B](https://huggingface.co/internlm/AlchemistCoder-L-7B)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b3024](https://github.com/ggerganov/llama.cpp/releases/tag/b3024)<br>

## Model Summary:

AlchemistCoder is a series of coding models by InternLM.<br>
This model is tuned from Llama 2, and should excel at all coding related tasks.

## Prompt template:

Choose the `MetaAI Llama 2 Chat` preset in your LM Studio.

Under the hood, the model will see a prompt that's formatted like so:

```
[INST]<<SYS>>
{System}
<</SYS>>[/INST]
[INST]
{User}
[/INST]
{Assistant}
```

## Technical Details

Training details:

- **AlchemistPrompts**: Designed as data-specific prompts for harmonizing inherent conflicts in multi-source data and mitigating the instruction/response misalignment at a fined-grained level.
- **Code Comprehenstion Tasks**: Sourced from the process of data construction, consisting of instruction evolution, data filtering, and code review.
- **Harmonized Multi-source Data**: Instruction tuned on 200M tokens, including 6 types of high-quality data.
- **Superior Model Performance**: Surpassing all the open-source models of the same size (6.7/7B), and rivaling or even beating larger models (15B/33B/70B/ChatGPT) on 6 code benchmarks.
- **Advanced generic capabilities**: Demonstrated by the significant improvements on MMLU, BBH, and GSM8K.

For more information, check out their paper here: https://arxiv.org/abs/2405.19265

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) 

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) and [Dampf](https://github.com/Dampfinchen) for their work on the dataset (linked [here](https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8)) that was used for calculating the imatrix for all sizes.

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.