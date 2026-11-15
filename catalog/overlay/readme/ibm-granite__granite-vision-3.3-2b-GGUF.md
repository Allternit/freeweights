> [!NOTE]
> This repository contains models that have been converted to the GGUF format with various quantizations from an IBM Granite base model.
> 
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-vision-3.3-2b

**Model Summary**: Granite-vision-3.3-2b is a compact and efficient vision-language model, specifically designed for visual document understanding, enabling automated content extraction from tables, charts, infographics, plots, diagrams, and more. Granite-vision-3.3-2b introduces several novel experimental features such as *image segmentation*, *doctags generation*, and *multi-page support* (see **Experimental Capabilities** for more details) and offers enhanced safety when compared to earlier Granite vision models. The model was trained on a meticulously curated instruction-following data, comprising diverse public and synthetic datasets tailored to support a wide range of document understanding and general image tasks. Granite-vision-3.3-2b was trained by fine-tuning a Granite large language model with both image and text modalities.

- **Paper:** [Granite Vision: a lightweight, open-source multimodal model for enterprise Intelligence](https://arxiv.org/abs/2502.09927). Note that the paper describes Granite Vision 3.2. Granite Vision 3.3 shares most of the technical underpinnings with Granite 3.2. However, there are several enhancements in terms of new and improved vision encoder, many new high quality datasets for training, and several new experimental capabilities.
- **Release Date**: Jun 11th, 2025 
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

**Supported Input Format:** Currently the model supports English instructions and images (png, jpeg) as input format. 

**Intended Use:**  The model is intended to be used in enterprise applications that involve processing visual and text data. In particular, the model is well-suited for a range of visual document understanding tasks, such as analyzing tables and charts, performing optical character recognition (OCR), and answering questions based on document content. Additionally, its capabilities extend to general image understanding, enabling it to be applied to a broader range of business applications. For tasks that exclusively involve text-based input, we suggest using our Granite large language models, which are optimized for text-only processing and offer superior performance compared to this model.
