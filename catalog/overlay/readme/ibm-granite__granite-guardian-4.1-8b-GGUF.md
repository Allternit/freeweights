> [!NOTE]
> This repository contains models that have been converted to the GGUF format with various quantizations from an IBM Granite base model.
>
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-guardian-4.1-8b

# Granite Guardian 4.1 8B (GGUF)

## Model Summary

**Granite Guardian 4.1 8B** is a specialized safety model fine-tuned from [ibm-granite/granite-4.1-8b](https://huggingface.co/ibm-granite/granite-4.1-8b), designed to judge if the input prompts and the output responses of an LLM-based system meet specified criteria. The model comes pre-baked with certain criteria including but not limited to: jailbreak attempts, profanity, and hallucinations related to tool calls and retrieval augmented generation in agent-based systems. Additionally, the model also allows users to bring their own criteria and tailor the judging behavior to specific use cases.

This version of Granite Guardian is a hybrid thinking model that allows the user to operate in thinking or non-thinking mode.
In thinking mode, the model produces detailed reasoning traces through `<think> ... </think>` and `<score> ... </score>` tags.
In non-thinking mode, the model only produces the judgement score through the `<score> ... </score>` tags.

It is trained on unique data comprising human annotations and synthetic data informed by internal red-teaming.
It outperforms other open-source models in the same space on standard benchmarks.

- **Developers:** IBM Research
- **GitHub Repository:** [ibm-granite/granite-guardian](https://github.com/ibm-granite/granite-guardian)
- **Cookbook:** [Granite Guardian Recipes](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks/granite-guardian-4.1)
- **Website**: [Granite Guardian Docs](https://www.ibm.com/granite/docs/models/guardian/)
- **Paper:** [Granite Guardian](https://arxiv.org/abs/2412.07724)
- **Release Date**: April, 2026
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
