# Granite Switch 4.1 30B Preview

**Model Summary:** Granite Switch 4.1 30B Preview is a modular LLM built on [IBM Granite 4.1 30B](https://huggingface.co/ibm-granite/granite-4.1-30b) with embedded adapters from the [Granite Libraries](https://huggingface.co/collections/ibm-granite/granite-libraries) collection. A single checkpoint supports multiple specialized capabilities — RAG, safety, explainability, and more — that are activated on demand via control tokens in the chat template.

For full details on model composition and adapter configuration, see [BUILD.md](BUILD.md).

- **Base Model:** `ibm-granite/granite-4.1-30b` (30B params, 128K context)
- **Adapters:** 12 adapters from 3 granitelib-rag-r1.0, granitelib-core-r1.0, and granitelib-guardian-r1.0 
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **Release Date:** May 5th, 2026
- **Backends:** HuggingFace Transformers, vLLM
- **Automatically Composed with:** [granite-switch](https://github.com/generative-computing/granite-switch)

Granite Switch is also available in [granite-switch-4.1-3b-preview](https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview) and [granite-switch-4.1-8b-preview](https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview).

**Motivation:**
Traditional multi-task LLM deployments require either separate model copies per capability (multiplying memory and compute) or weight merging that permanently blends adapters and destroys task specialization. Granite Switch takes a different approach: independently trained activated LoRA adapters are embedded in a single checkpoint and dynamically selected at inference time via control tokens. KV cache normalization ensures adapters share no internal KV cache state as each adapter sees prior tokens only through the base model's representation. That way, adapters can build on each other's outputs, but never through another adapter's cached activations. This allows adapters to be developed independently and composed without accuracy loss. This makes it possible to implement LLM capabilities very efficiently and very accurately.

## Included Adapters

Granite Switch is best used with [Mellea](https://mellea.ai/).

### Core Library (`ibm-granite/granitelib-core-r1.0`)

Adapters for context attribution, requirements validation, and uncertainty estimation.

| Adapter | Description |
|---|---|
| [**Requirement Check**](https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/main/requirement-check) | Binary yes/no evaluation of whether a response satisfies user-specified constraints (formatting, content, quality) |
| [**Context Attribution**](https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/main/context-attribution) | Identifies which context sentences influenced the response — contributive attribution ranked by importance |
| [**Uncertainty**](https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/main/uncertainty) | Calibrated confidence scores — an answer marked X% certain is approximately X% correct |

### RAG Library (`ibm-granite/granitelib-rag-r1.0`)

Adapters for retrieval-augmented generation pipelines.

| Adapter | Stage | Description |
|---|---|---|
| [**Query Rewrite**](https://huggingface.co/ibm-granite/granitelib-rag-r1.0/tree/main/query_rewrite) | Pre-retrieval | Decontextualizes multi-turn queries into standalone, retriever-friendly versions |
| [**Query Clarification**](https://huggingface.co/ibm-granite/granitelib-rag-r1.0/tree/main/query_clarification) | Pre-retrieval | Detects underspecified or ambiguous queries and formulates clarification requests |
| [**Answerability**](https://huggingface.co/ibm-granite/granitelib-rag-r1.0/tree/main/answerability) | Pre-generation | Determines if a query is answerable from available passages; prevents hallucinations |
| [**Hallucination Detection**](https://huggingface.co/ibm-granite/granitelib-rag-r1.0/tree/main/hallucination_detection) | Post-generation | Outputs hallucination risk ranges for each sentence in a response |
| [**Citation Generation**](https://huggingface.co/ibm-granite/granitelib-rag-r1.0/tree/main/citations) | Post-generation | Generates passage-level citations for model responses |

### Guardian Library (`ibm-granite/granitelib-guardian-r1.0`)

Adapters for safety, factuality, and policy compliance.

| Adapter | Description |
|---|---|
| [**Guardian Core**](https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/guardian-core) | Detects safety risks: harm, jailbreaking, profanity, violence, sexual content, social bias, unethical behavior |
| [**Factuality Detection**](https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/factuality-detection) | Assesses factual correctness of responses against provided context sources |
| [**Factuality Correction**](https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/factuality-correction) | Corrects factual inaccuracies in long-form responses while preserving reasoning quality |
| [**Policy Guardrails**](https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/policy-guardrails) | Checks compliance against user-defined policies (compliant / non-compliant / ambiguous) |

---

### Generation

```bash
git clone https://github.com/generative-computing/granite-switch.git
cd granite-switch

# Pick what you need:
pip install -e ".[compose]"   # Compose models with adapters
pip install -e ".[hf]"        # HuggingFace inference
pip install -e ".[vllm]"      # vLLM inference
pip install -e ".[dev]"       # Everything
```

### Using with Mellea

[Mellea](https://github.com/generative-computing/mellea) is the preferred way to run Granite Switch adapters in applications. It standardizes the interface for building with adapters like answerability checking, hallucination detection, requirement checker and harmful language detection easily and reliably. Constrained decoding and input/output pre-processing are handled automatically, improving accuracy and reliability. When running Granite Switch models through Mellea, embedded adapters function as high-level API calls. This allows you to use direct operations instead of raw prompt engineering.

```bash
pip install mellea
```

#### Answerability check

```python
from mellea.backends.openai import OpenAIBackend
from mellea.formatters import TemplateFormatter
from mellea.stdlib.components import Document, Message
from mellea.stdlib.components.intrinsic import rag
from mellea.stdlib.context import ChatContext

SWITCH_MODEL_ID = "ibm-granite/granite-switch-4.1-30b-preview"

backend = OpenAIBackend(
    model_id=SWITCH_MODEL_ID,
    formatter=TemplateFormatter(model_id=SWITCH_MODEL_ID),
    base_url="http://localhost:8000/v1",
    api_key="EMPTY",
    load_embedded_adapters=True,
)

context = ChatContext().add(Message("assistant", "Hello there, how can I help you?"))
question = "What is the square root of 4?"
documents = [Document("The square root of 4 is 2.")]

result = rag.check_answerability(question, documents, context, backend)
print(f"Answerability: {result}")
```

#### Requirement check

```python
from mellea.stdlib.components.intrinsic import core

context = ChatContext().add(
    Message("user", "Invite for an IBM office party.")
).add(
    Message("assistant", "Dear Team, you are cordially invited to a team social...")
)

result = core.requirement_check(context, backend, requirement="Use a professional tone.")
print(f"Requirements Satisfied: {result}")  # float between 0.0 and 1.0
```

#### Guardian core (safety detection)

```python
from mellea.stdlib.components.intrinsic import guardian

context = ChatContext().add(
    Message("user", "How can I hack my friend's email?")
)

score = guardian.guardian_check(context, backend, criteria="harm", target_role="user")
verdict = "Risk detected" if score >= 0.5 else "Safe"
print(f"Score: {score:.4f}  ({verdict})")
```

See the [`mellea examples/`](https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics) directory for more examples, including manual adapter loading.

The following examples demonstrate low-level adapter invocation via the HuggingFace and vLLM backends directly. Check Granite Switch For additional [tutorials](https://github.com/generative-computing/granite-switch/tree/main/tutorials).

### HuggingFace Inference

```python
import granite_switch.hf  # Register the model architecture

from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("ibm-granite/granite-switch-4.1-30b-preview", device_map="auto")
tokenizer = AutoTokenizer.from_pretrained("ibm-granite/granite-switch-4.1-30b-preview")
```

#### Activate an adapter via the chat template

```python
messages = [
    {"role": "assistant", "content": "Hello there, how can I help you?"},
    {"role": "user", "content": "What is the square root of 4?"},
]
documents = [{"doc_id": "1", "text": "The square root of 4 is 2."}]

prompt = tokenizer.apply_chat_template(
    messages,
    documents=documents,
    adapter_name="answerability",   # activate the answerability adapter
    add_generation_prompt=True,
    tokenize=False,
)

outputs = model.generate(**tokenizer(prompt, return_tensors="pt").to(model.device))
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
# => "answerable"
```

#### No adapter (base model behavior)

```python
prompt = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=False,
)
```

### vLLM Inference

Start the OpenAI-compatible server:

```bash
pip install -e ".[vllm]"

python -m vllm.entrypoints.openai.api_server \
  --model ibm-granite/granite-switch-4.1-30b-preview \
  --port 8000
```

Call adapters via the API:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="unused")

response = client.chat.completions.create(
    model="ibm-granite/granite-switch-4.1-30b-preview",
    messages=[
        {"role": "assistant", "content": "Hello there, how can I help you?"},
        {"role": "user", "content": "What is the square root of 4?"},
    ],
    extra_body={
        "documents": [{"doc_id": "1", "text": "The square root of 4 is 2."}],
        "chat_template_kwargs": {"adapter_name": "answerability"},
    },
    max_completion_tokens=6,
)
print(response.choices[0].message.content)
# => "answerable"
```

Or with `curl`:

```bash
curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ibm-granite/granite-switch-4.1-30b-preview",
    "messages": [
      {"role": "assistant", "content": "Hello there, how can I help you?"},
      {"role": "user", "content": "What is the square root of 4?"}
    ],
    "documents": [{"doc_id": "1", "text": "The square root of 4 is 2."}],
    "chat_template_kwargs": {"adapter_name": "answerability"},
    "max_completion_tokens": 6
  }'
```

---

**Model Artifacts:**

| File | Description |
|---|---|
| `model.safetensors` | Full model with embedded adapters |
| `config.json` | GraniteSwitchConfig |
| `tokenizer.json` / `tokenizer_config.json` | Tokenizer with control tokens |
| `adapter_index.json` | Adapter-to-control-token mapping |
| `io_configs/` | Original `io.yaml` for each adapter |
| `chat_template.jinja` | Jinja template with adapter activation logic |
| `BUILD.md` | Composed model details and adapter configuration |

**Requirements:**

| Dependency | Version |
|---|---|
| Python | >= 3.9 |
| PyTorch | >= 2.0.0 |
| Transformers | >=5.5.1 |
| vLLM (optional) | >= 0.19.1, < 0.21.0 |

---

### How It Works

Granite Switch uses **coarse-grained expert switching** — one adapter is active across all layers for a contiguous span of tokens. A lightweight switch layer (standard attention) detects control tokens in the input and produces per-position adapter indices that tell every decoder layer which LoRA weights to apply.

```
Input Tokens: ["Tell", "me", "about", "<|answerability|>", ...]
                           │
           ┌───────────────▼───────────────┐
           │       SWITCH LAYER            │
           │    Detects control            │
           │    tokens → indices           │
           └───────────────┬───────────────┘
                           │
          adapter_indices: [0, 0, 0, 4, 4, ...]
                           │
           ┌───────────────▼───────────────┐
           │      DECODER LAYERS           │
           │      Base weights +           │
           │      LoRA[index]              │
           └───────────────┬───────────────┘
                           │
           ┌───────────────▼───────────────┐
           │         LM HEAD               │
           └───────────────────────────────┘
```

Key properties:

- **KV cache normalization** — each adapter sees only the base model's KV cache, never another adapter's internal state
- **No joint training** — adapters are developed, tested, and published independently
- **Single checkpoint** — one file works with both HuggingFace and vLLM, no conversion needed
- **Zero code changes** — adapter selection happens entirely through the chat template

### Model Architecture

**Base Model**

| | |
|---|---|
| **Model** | [Granite 4.1 30B](https://huggingface.co/ibm-granite/granite-4.1-30b) |
| **Parameters** | 30 billion |
| **Context Length** | 131,072 tokens |
| **Architecture** | Dense decoder-only transformer (GQA, RoPE, SwiGLU, RMSNorm) |
| **Languages** | English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, Chinese |

**Adapter Activation**

Each adapter is activated by passing its name to the chat template using an argument. The template inserts the appropriate control token automatically — callers just pass `adapter_name`.

---

### Ethical Considerations and Limitations

This model inherits the safety profile of the base Granite 4.1 model. The Guardian Library adapters (guardian core, factuality detection/correction, policy guardrails) provide additional safety layers but are not a substitute for application-level safety testing. Deployers should:

- Test adapter behavior on their specific use cases before production deployment
- Apply appropriate content filtering for their domain
- Monitor adapter outputs, especially for safety-critical applications
- Use the uncertainty adapter to assess model confidence on important decisions


### Model Signing

The `model.sig` file contains a signature over all model artifacts to ensure integrity and provenance.

To verify the integrity of a downloaded adapter, use the [model-signing](https://github.com/sigstore/model-transparency) tool:

```bash
# First obrain the model weights
hf download ibm-granite/granite-switch-4.1-30b-preview --local-dir granite-switch-4.1-30b-preview

# Install the model signing verification tool
pip install 'model-signing==v1.1.1'

# Verify all artifacts in an adapter's lora/ directory
model_signing verify sigstore \
  --signature granite-switch-4.1-30b-preview/model.sig \
  --ignore-git-paths \
  --ignore-paths granite-switch-4.1-30b-preview/README.md \
  --identity Granite-sign@ibm.com \
  --identity_provider https://sigstore.verify.ibm.com/oauth2 \
  granite-switch-4.1-30b-preview
```

The "Verification succeeded" message confirms that the model has not been tampered with after release.


### License

Granite Switch has an Apache-2.0 license, as found in the [LICENSE](https://github.com/generative-computing/granite-switch/blob/main/LICENSE) file.

---

### Citation

```bibtex
@software{granite_switch,
  title  = {Granite Switch: Coarse-Grained Expert Switching for LLMs},
  author = {IBM Research},
  year   = {2026},
  url    = {https://github.com/generative-computing/granite-switch}
}
```

See also: [Activated LoRA: Fine-tuned LLMs for Intrinsics](https://neurips.cc/virtual/2025/loc/san-diego/poster/117964) (NeurIPS 2025).
