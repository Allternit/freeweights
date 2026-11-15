> [!NOTE]
> This repository contains models that have been converted to the GGUF format with various quantizations from an IBM Granite base model.
>
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-4.0-tiny-base-preview

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


