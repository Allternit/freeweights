# Ministral 3 8B Reasoning 2512 GGUF

A balanced model in the Ministral 3 family, **Ministral 3 8B** is a powerful, efficient tiny language model with vision capabilities.

This model includes different quantization levels of the reasoning post-trained version in **GGUF**, trained for reasoning tasks, making it ideal for math, coding and stem related use cases.

The Ministral 3 family is designed for edge deployment, capable of running on a wide range of hardware. Ministral 3 8B can even be deployed locally, capable of fitting in 24GB of VRAM in BF16, and less than 12GB of RAM/VRAM when quantized.

Learn more in our [blog post](https://mistral.ai/news/mistral-3) and [paper](https://arxiv.org/abs/2601.08584).

## Key Features
Ministral 3 8B consists of two main architectural components:
- **8.4B Language Model**
- **0.4B Vision Encoder**

The Ministral 3 8B Reasoning model offers the following capabilities:
- **Vision**: Enables the model to analyze images and provide insights based on visual content, in addition to text.
- **Multilingual**: Supports dozens of languages, including English, French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese, Korean, Arabic.
- **System Prompt**: Maintains strong adherence and support for system prompts.
- **Agentic**: Offers best-in-class agentic capabilities with native function calling and JSON outputting.
- **Reasoning**: Excels at complex, multi-step reasoning and dynamic problem-solving.
- **Edge-Optimized**: Delivers best-in-class performance at a small scale, deployable anywhere.
- **Apache 2.0 License**: Open-source license allowing usage and modification for both commercial and non-commercial purposes.
- **Large Context Window**: Supports a 256k context window.

### Recommended Settings

We recommend deploying with the following best practices:
- System Prompt: Use our provided [system prompt](https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt), and append it to your custom system prompt to define a clear environment and use case, including guidance on how to effectively leverage tools in agentic systems.
- Multi-turn Traces: We highly recommend keeping the reasoning traces in context.
- Sampling Parameters: Use a **temperature of 0.7** for most environments ; Different temperatures may be explored for different use cases - developers are encouraged to experiment with alternative settings.
- Tools: Keep the set of tools well-defined and limit their number to the minimum required for the use case - Avoiding overloading the model with an excessive number of tools.
- Vision: When deploying with vision capabilities, we recommend maintaining an aspect ratio close to 1:1 (width-to-height) for images. Avoiding the use of overly thin or wide images - crop them as needed to ensure optimal performance.

## License

This model is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0.txt).

*You must not use this model in a manner that infringes, misappropriates, or otherwise violates any third party’s rights, including intellectual property rights.*