# Granite Guardian Library

The Guardian Library includes four families of LoRA adapters, each developed for a specific task related to safety, factuality, and policy compliance in LLM-based systems. We provide adapters for: 
 * [ibm-granite/granite-4.0-micro](https://huggingface.co/ibm-granite/granite-4.0-micro)
 * [ibm-granite/granite-4.1-3b](https://huggingface.co/ibm-granite/granite-4.1-3b)
 * [ibm-granite/granite-4.1-8b](https://huggingface.co/ibm-granite/granite-4.1-8b)
 * [ibm-granite/granite-4.1-30b](https://huggingface.co/ibm-granite/granite-4.1-30b)

We give a brief overview of the functionality of each capability below; details can be found in each individual adapter readme.


## Capabilities implemented as LoRA adapters

The four capabilities that have been implemented as LoRA adapters and made available in this HF repository are:

**Guardian Core:** A LoRA adapter trained to judge whether the input prompts and output responses of an LLM-based system meet specified criteria, including safety risks (harm, jailbreaking, profanity, violence, sexual content, social bias, unethical behavior), hallucinations related to tool/function calls, and retrieval-augmented generation (RAG) in agent-based systems. The model outputs a JSON object with a `score` field indicating `"yes"` (criteria met / risk detected) or `"no"` (criteria not met / no risk). Details can be found in the [guardian-core readme](guardian-core/README.md).

**Factuality Detection:** A LoRA adapter specifically designed to assess factual correctness by explicitly taking into account contextual passages that may contain contradicting or conflicting information. Rather than assuming contextual consistency, the adapter evaluates LLM-generated responses against one or more context sources and identifies cases where the response conflicts with, misrepresents, or selectively ignores evidence present in those contexts. Details can be found in the [factuality-detection readme](factuality-detection/README.md).

**Factuality Correction:** A LoRA adapter specifically designed to correct factually incorrect LLM-generated responses by explicitly taking into account contextual passages that may contain contradicting or conflicting information. The adapter is capable of correcting factual inaccuracies in long-form responses composed of multiple atomic units—such as individual facts or claims—while preserving the full generative and reasoning capabilities of the base model. Details can be found in the [factuality-correction readme](factuality-correction/README.md).

**Policy Guardrails:** A LoRA adapter that provides policy compliance checking. Given a policy and a scenario, it enables the base model to accurately decide whether the scenario complies with, or violates, the given policy. It provides a third response ('Ambiguous') if it is not possible to decide compliance/non-compliance with a high level of certainty. Details can be found in the [policy-guardrails readme](policy-guardrails/README.md).


## Recommended Use

The recommended way to call all adapters is through the [Mellea](https://mellea.ai) framework. For code snippets demonstrating how to use them please refer to the [Mellea adapter examples](https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics) (note: within Mellea, adapters are referred to as "intrinsics").


## Model Signing

All adapter artifacts in this repository are signed to ensure integrity and provenance. Each adapter includes a `model.sig` signature file in its `lora/` directory that covers all artifacts in that directory (`adapter_config.json`, `adapter_model.safetensors`, `io.yaml`).

| Adapter | Signature File Path (example) | Signing Identity |
|-----------|-------------------------------|-----------------|
| Guardian Core | `guardian-core/granite-4.1-3b/lora/model.sig` | `Granite-sign@ibm.com` |
| Factuality Detection | `factuality-detection/granite-4.1-3b/lora/model.sig` | `Granite-sign@ibm.com` |
| Factuality Correction | `factuality-correction/granite-4.1-3b/lora/model.sig` | `Granite-sign@ibm.com` |
| Policy Guardrails | `policy-guardrails/granite-4.1-3b/lora/model.sig` | `Granite-sign@ibm.com` |

The same pattern applies to all model variants (`granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b`, `granite-4.1-30b`).

### Verifying Model Signatures

To verify the integrity of a downloaded adapter, use the [model-signing](https://github.com/sigstore/model-transparency) tool:

```bash
# Install the model signing verification tool
pip install model-signing

# Verify all artifacts in an adapter's lora/ directory
model_signing verify sigstore \
  --signature <adapter>/<model-variant>/lora/model.sig \
  --identity Granite-sign@ibm.com \
  --identity_provider https://sigstore.verify.ibm.com/oauth2 \
  <adapter>/<model-variant>/lora/
```

For example, to verify the guardian-core adapter for granite-4.1-3b:

```bash
model_signing verify sigstore \
  --signature guardian-core/granite-4.1-3b/lora/model.sig \
  --identity Granite-sign@ibm.com \
  --identity_provider https://sigstore.verify.ibm.com/oauth2 \
  guardian-core/granite-4.1-3b/lora/
```

Each `model.sig` file contains a signature over all adapter artifacts in the corresponding `lora/` directory, signed with the identity `Granite-sign@ibm.com`. This allows users to confirm that the adapter has not been tampered with after release.


## Resources

- Learn about the latest updates with Granite: https://www.ibm.com/granite
- Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- Learn about the latest Granite learning resources: https://research.ibm.com/blog/granite-4-1-ai-foundation-models