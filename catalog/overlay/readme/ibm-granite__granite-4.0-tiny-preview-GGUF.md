> [!NOTE]
> This repository contains models that have been converted to the GGUF format with various quantizations from an IBM Granite base model.
>
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-4.0-tiny-preview

# Granite-4.0-Tiny-Preview

**Model Summary:**
Granite-4-Tiny-Preview is a 7B parameter fine-grained hybrid mixture-of-experts (MoE) instruct model fine-tuned from Granite-4.0-Tiny-Base-Preview using a combination of open source instruction datasets with permissive license and internally collected synthetic datasets tailored for solving long context problems. This model is developed using a diverse set of techniques with a structured chat format, including supervised fine-tuning, and model alignment using reinforcement learning.

- **Developers:** Granite Team, IBM
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/)
- **Release Date**: May 2nd, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Languages:** 
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. However, users may fine-tune this Granite model for languages beyond these 12 languages.

**Intended Use:** 
This model is designed to handle general instruction-following tasks and can be integrated into AI assistants across various domains, including business applications.

**Capabilities**
* Thinking
* Summarization
* Text classification
* Text extraction
* Question-answering
* Retrieval Augmented Generation (RAG)
* Code related tasks
* Function-calling tasks
* Multilingual dialog use cases
* Long-context tasks including long document/meeting summarization, long document QA, etc.
