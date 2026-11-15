## 💫 Community Model> Phi-3.1 mini 128k instruct by Microsoft

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [Microsoft](https://huggingface.co/microsoft)<br>
**Original model**: [Phi-3-mini-128k-instruct](https://huggingface.co/microsoft/Phi-3-mini-128k-instruct)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b3460](https://github.com/ggerganov/llama.cpp/releases/tag/b3460)<br>

## Model Summary:
Though the name was left as Phi-3 in Microsoft's release, this is NOT the same model as before! It features massive improvements across a range of benchmarks, so we've renamed it as Phi-3.1 for clarity.<br>
This update used additional post-training data which improved instruction following, structuring output, multi-turn conversations, explicitly support <|system|> tag, and significantly improve reasoning capability.<br>

This model is tuned with common sense, language understanding, math, code, long conteext, and logical reasoning as the primary focus.

## Prompt template:

Choose the `Phi 3` preset in your LM Studio.

Under the hood, the model will see a prompt that's formatted like so:

```
<|system|>
You are a helpful AI assistant.<|end|>
<|user|>
{prompt}<|end|>
<|assistant|>
```

## Technical Details

Phi-3.1 Mini-4K-Instruct has 3.8B parameters and is a dense decoder-only Transformer model. The model is fine-tuned with Supervised fine-tuning (SFT) and Direct Preference Optimization (DPO) to ensure alignment with human preferences and safety guidlines.

Context length: 128K tokens through Microsoft's longrope technique

This model was trained on 3.3T tokens of data and is a combination:
 - publicly available documents that were filtered rigorously for quality, selected high-quality educational data, and code
 - Newly created synthetic, “textbook-like” data for the purpose of teaching math, coding, common sense reasoning, general knowledge of the world (science, daily activities, theory of mind, etc.)
 - High quality chat format supervised data covering various topics to reflect human preferences on different aspects such as instruct-following, truthfulness, honesty and helpfulness.

Phi 3.1 features additional tuning based on customer feedback, emphasizing instruction following, structure output, multi-turn conversation quality, explicitly support <|system|> tag, and significantly improve reasoning capability.

Find more details on the arXiv report [here](https://arxiv.org/abs/2404.14219)

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

🙏 Special thanks to [Kalomaze](https://github.com/kalomaze) for his dataset (linked [here](https://github.com/ggerganov/llama.cpp/discussions/5263)) that was used for calculating the imatrix for the IQ1_M and IQ2_XS quants, which makes them usable even at their tiny size!

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.
