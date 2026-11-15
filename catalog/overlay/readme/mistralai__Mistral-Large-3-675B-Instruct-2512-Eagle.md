# Mistral Large 3 675B Instruct 2512 Eagle

This model is the Eagle speculator for [Mistral Large 3 Instruct](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512).

Depending on the task, you can expect noticeable speed-ups on your generations.

## Mistral Large 3 675B Instruct 2512

From our family of large models, **Mistral Large 3** is a state-of-the-art general-purpose **Multimodal granular Mixture-of-Experts** model with **41B active parameters** and **675B total parameters** trained from the ground up with 3000 H200s

This model is the instruct post-trained version in **FP8**, fine-tuned for instruction tasks, making it ideal for chat, agentic and instruction based use cases.  
Designed for reliability and long-context comprehension - It is engineered for production-grade assistants, retrieval-augmented systems, scientific workloads, and complex enterprise workflows.

Mistral Large 3 is deployable on-premises in:
- [FP8](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512) on a single node of B200s or H200s.
- [NVFP4](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4) on a single node of H100s or A100s.

We provide a [BF16](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-BF16) version if needed.

### Key Features
Mistral Large 3 consists of two main architectural components:
- **A Granular MoE Language Model with 673B params and 39B active**
- **A 2.5B Vision Encoder**

The Mistral Large 3 Instruct model offers the following capabilities:
- **Vision**: Enables the model to analyze images and provide insights based on visual content, in addition to text.
- **Multilingual**: Supports dozens of languages, including English, French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese, Korean, Arabic.
- **System Prompt**: Maintains strong adherence and support for system prompts.
- **Agentic**: Offers best-in-class agentic capabilities with native function calling and JSON outputting.
- **Frontier**: Delivers best-in-class performance.
- **Apache 2.0 License**: Open-source license allowing usage and modification for both commercial and non-commercial purposes.
- **Large Context Window**: Supports a 256k context window.

### Recommended Settings

We recommend deploying Large 3 in a client-server configuration with the following best practices:

- **System Prompt**: Define a clear environment and use case, including guidance on how to effectively leverage tools in agentic systems.
- **Sampling Parameters**: Use a temperature below 0.1 for daily-driver and production environments ; Higher temperatures may be explored for creative use cases - developers are encouraged to experiment with alternative settings.
- **Tools**: Keep the set of tools well-defined and limit their number to the minimum required for the use case - Avoiding overloading the model with an excessive number of tools.
- **Vision**: When deploying with vision capabilities, we recommend maintaining an aspect ratio close to 1:1 (width-to-height) for images. Avoiding the use of overly thin or wide images - crop them as needed to ensure optimal performance.

## Usage

The model can be used with the following frameworks;
- [`vllm`](https://github.com/vllm-project/vllm): See [here](#vllm)

### vLLM

We recommend using this model with [vLLM](https://github.com/vllm-project/vllm).

#### Installation

Make sure to install **vllm >= 1.12.0**:

```
pip install vllm --upgrade
```

Doing so should automatically install [`mistral_common >= 1.8.6`](https://github.com/mistralai/mistral-common/releases/tag/v1.8.6).

To check:
```
python -c "import mistral_common; print(mistral_common.__version__)"
```

You can also make use of a ready-to-go [docker image](https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile) or on the [docker hub](https://hub.docker.com/layers/vllm/vllm-openai/latest).

#### Serve

We recommend that you use Mistral Large 3 in a server/client setting. 

1. Spin up a server:

```bash
vllm serve mistralai/Mistral-Large-3-675B-Instruct-2512 \
  --tensor-parallel-size 8 \
  --load-format mistral \
  --tokenizer-mode mistral \
  --config-format mistral \
  --enable-auto-tool-choice \
  --tool-call-parser mistral \
  --limit-mm-per-prompt '{"image": 10}' \
  --speculative_config '{
    "model": "mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle",
    "num_speculative_tokens": 3,
    "method": "eagle",
    "max_model_len": "16384"
  }'
```

**Note:** Running mistralai/Mistral-Large-3-675B-Instruct-2512 on GPU requires a node of B200s or H200s.

2. To ping the client you can use a simple Python snippet. You can find an example below.

```py
from datetime import datetime, timedelta

from openai import OpenAI
from huggingface_hub import hf_hub_download

# Modify OpenAI's API key and API base to use vLLM's API server.
openai_api_key = "EMPTY"
openai_api_base = "http://localhost:8000/v1"

TEMP = 0.15
MAX_TOK = 262144

client = OpenAI(
    api_key=openai_api_key,
    base_url=openai_api_base,
)

models = client.models.list()
model = models.data[0].id


def load_system_prompt(repo_id: str, filename: str) -> str:
    file_path = hf_hub_download(repo_id=repo_id, filename=filename)
    with open(file_path, "r") as file:
        system_prompt = file.read()
    today = datetime.today().strftime("%Y-%m-%d")
    yesterday = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    model_name = repo_id.split("/")[-1]
    return system_prompt.format(name=model_name, today=today, yesterday=yesterday)


SYSTEM_PROMPT = load_system_prompt(model, "SYSTEM_PROMPT.txt")
image_url = "https://static.wikia.nocookie.net/essentialsdocs/images/7/70/Battle.png/revision/latest?cb=20220523172438"

messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "What action do you think I should take in this situation? List all the possible actions and explain why you think they are good or bad.",
            },
            {"type": "image_url", "image_url": {"url": image_url}},
        ],
    },
]


response = client.chat.completions.create(
    model=model,
    messages=messages,
    temperature=TEMP,
    max_tokens=MAX_TOK,
)

print(response.choices[0].message.content)
```

## License

This model is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0.txt).

*You must not use this model in a manner that infringes, misappropriates, or otherwise violates any third party’s rights, including intellectual property rights.*