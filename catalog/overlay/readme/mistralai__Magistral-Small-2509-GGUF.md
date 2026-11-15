> [!Note]
> To make our models more accesible to everyone, this repo provides a basic GGUF checkpoint compatible with llama.cpp
> and mistral-common.
>
> In addition to using this GGUF checkpoint, we encourage the community to use other GGUF variants, *e.g.*
> from [Unsloth](https://huggingface.co/unsloth/Magistral-Small-2509-GGUF), [LM Studio](https://lmstudio.ai/models/mistralai/magistral-small-2509), ...
> 
> If you encounter any problems with the provided checkpoints here, please open a discussion or pull request.


# Magistral Small 1.2 (GGUF)

Building upon [Mistral Small 3.2 (2506)](https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506), **with added reasoning capabilities**, undergoing SFT from Magistral Medium traces and RL on top, it's a small, efficient reasoning model with 24B parameters.

Magistral Small can be deployed locally, fitting within a single RTX 4090 or a 32GB RAM MacBook once quantized.

This is the GGUF version of the [Magistral-Small-2509](https://huggingface.co/mistralai/Magistral-Small-2509) model. We released the BF16 weights as well as the
following quantized format:
- Q8_0
- Q5_K_M
- Q4_K_M

We do **not** release alongside our GGUF files:
- An **official chat template**. Instead, we recommend using [`mistral-common`](#usage), which serves as our source of truth for tokenization and detokenization. Llama.cpp automatically loads a chat template, but it is in most likelihood **incorrect** for Magistral.
- The **vision encoder**, since our recommended usage does not involve multimodality.


## Updates compared with [Magistral Small 1.1](https://huggingface.co/mistralai/Magistral-Small-2507)

- **Multimodality**: The model now has a vision encoder and can take multimodal inputs, extending its reasoning capabilities to vision.
- **Performance upgrade**: Magistral Small 1.2 should give you significatively better performance than Magistral Small 1.1 as seen in the [benchmark results](#benchmark-results).
- **Better tone and persona**: You should experiment better LaTeX and Markdown formatting, and shorter answers on easy general prompts.
- **Finite generation**: The model is less likely to enter infinite generation loops.
- **Special think tokens**: [THINK] and [/THINK] special tokens encapsulate the reasoning content in a thinking chunk. This makes it easier to parse the reasoning trace and prevents confusion when the '[THINK]' token is given as a string in the prompt.
- **Reasoning prompt**: The reasoning prompt is given in the system prompt.

## Key Features
- **Reasoning:** Capable of long chains of reasoning traces before providing an answer.
- **Multilingual:** Supports dozens of languages, including English, French, German, Greek, Hindi, Indonesian, Italian, Japanese, Korean, Malay, Nepali, Polish, Portuguese, Romanian, Russian, Serbian, Spanish, Turkish, Ukrainian, Vietnamese, Arabic, Bengali, Chinese, and Farsi.
- **Vision**: Vision capabilities enable the model to analyze images and reason based on visual content in addition to text available with our main model [Magistral-Small-2509](https://huggingface.co/mistralai/Magistral-Small-2509).
- **Apache 2.0 License:** Open license allowing usage and modification for both commercial and non-commercial purposes.
- **Context Window:** A 128k context window. Performance might degrade past **40k** but Magistral should still give good results. Hence we recommend to leave the maximum model length to 128k and only lower if you encounter low performance.

## Usage

We recommend to use Magistral Small 1.2 GGUF with **[llama.cpp](https://github.com/ggml-org/llama.cpp/tree/master)** along with **[mistral-common >= 1.8.5](https://mistralai.github.io/mistral-common/) server**. See [here](https://mistralai.github.io/mistral-common/usage/experimental/) for the documentation of `mistral-common` server.

This recommended usage does **not support vision**.

> [!Note]
> We do **not** believe we can guarantee correct behavior using the integrated, stringified chat template hence
> mistral-common should be used as a reference. **However**, we strongly encourage the community members to use this GGUF checkpoint
> and mistral_common as a reference implementation to build a correct integrated, stringified chat template.

### Install

1. Install `llama.cpp` following their [guidelines](https://github.com/ggml-org/llama.cpp/blob/master/README.md#quick-start).

2. Install `mistral-common >= 1.8.5` with its dependencies.

```sh
pip install --upgrade mistral-common[server,hf-hub]
```

3. Download the weights from huggingface.

```sh
pip install -U "huggingface_hub[cli]"

huggingface-cli download \
"mistralai/Magistral-Small-2509-GGUF" \
--include "Magistral-Small-2509-Q4_K_M.gguf" \
--local-dir "mistralai/Magistral-Small-2509-GGUF/"
```

### Launch the servers

1. Launch the `llama.cpp` server

```sh
llama-server -m mistralai/Magistral-Small-2509-GGUF/Magistral-Small-2509-Q4_K_M.gguf -c 0
```

2. Launch the `mistral-common` server and pass the url of the `llama.cpp` server.

This is the server that will handle tokenization and detokenization and call the `llama.cpp` server for generations.

```sh
mistral_common serve mistralai/Magistral-Small-2509 \
--host localhost --port 6000 \
--engine-url http://localhost:8080 --engine-backend llama_cpp \
--timeout 300
```

### Use the model

1. let's define the function to call the servers:

**generate**: call `mistral-common` that will tokenizer, call the `llama.cpp` server to generate new tokens and detokenize the output to an [`AssistantMessage`](https://mistralai.github.io/mistral-common/code_reference/mistral_common/protocol/instruct/messages/#mistral_common.protocol.instruct.messages.AssistantMessage) with think chunk and tool calls parsed.

```python
from mistral_common.protocol.instruct.messages import AssistantMessage
from mistral_common.protocol.instruct.request import ChatCompletionRequest
from mistral_common.experimental.app.models import OpenAIChatCompletionRequest
from fastapi.encoders import jsonable_encoder
import requests

mistral_common_url = "http://127.0.0.1:6000"

def generate(
    request: dict | ChatCompletionRequest | OpenAIChatCompletionRequest, url: str
) -> AssistantMessage:
    response = requests.post(
        f"{url}/v1/chat/completions", json=jsonable_encoder(request)
    )
    if response.status_code != 200:
        raise ValueError(f"Error: {response.status_code} - {response.text}")
    return AssistantMessage(**response.json())
```

2. Tokenize the input, call the model and detokenize

```python
from typing import Any
from huggingface_hub import hf_hub_download


TEMP = 0.7
TOP_P = 0.95
MAX_TOK = 131072

def load_system_prompt(repo_id: str, filename: str) -> dict[str, Any]:
    file_path = hf_hub_download(repo_id=repo_id, filename=filename)
    with open(file_path, "r") as file:
        system_prompt = file.read()

    index_begin_think = system_prompt.find("[THINK]")
    index_end_think = system_prompt.find("[/THINK]")

    return {
        "role": "system",
        "content": [
            {"type": "text", "text": system_prompt[:index_begin_think]},
            {
                "type": "thinking",
                "thinking": system_prompt[
                    index_begin_think + len("[THINK]") : index_end_think
                ],
                "closed": True,
            },
            {
                "type": "text",
                "text": system_prompt[index_end_think + len("[/THINK]") :],
            },
        ],
    }

SYSTEM_PROMPT = load_system_prompt("mistralai/Magistral-Small-2509", "SYSTEM_PROMPT.txt")

query = "Use each number in 2,5,6,3 exactly once, along with any combination of +, -, ×, ÷ (and parentheses for grouping), to make the number 24."

messages = [SYSTEM_PROMPT, {"role": "user", "content": [{"type": "text", "text": query}]}]

request = {"messages": messages, "temperature": TEMP, "top_p": TOP_P, "max_tokens": MAX_TOK}

generated_message = generate(request, mistral_common_url)
print(generated_message)
```

