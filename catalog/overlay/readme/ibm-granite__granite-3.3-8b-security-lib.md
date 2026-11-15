# Granite 3.3 Security Library

The LLM Intrinsics Security Library includes six intrinsics implemented as LoRA adapters for `ibm-granite/granite-3.3-8b-instruct`, 
each of which expects a conversation between a user and an AI assistant as input.
Each intrinsic has been developed for a specific task that is likely to be useful for LLM security, privacy or robustness. 
We give a brief overview of the functionality of each intrinsic, as the details can be found in each individual intrinsic readme.


## Intrinsics implemented as LoRA adapters

The six intrinsics that have been implemented as LoRA adapters for `ibm-granite/granite-3.3-8b-instruct` and made available in this HF repository are:

**Adversarial Scoping:** This experimental LoRA module is designed to constrain the model to a specific task (summarization), while maintaining safety with respect to harmful prompts. The model was trained to perform summarization tasks using datasets such as CNN/Daily Mail, Amazon food reviews, and abstract summarization corpora. In parallel, the LoRA was also trained to reject harmful requests. As a result, the model, although scoped to summarization, is expected to refuse to summarize content that is harmful or inappropriate, thereby preserving alignment and safety within its operational boundaries.

**Function Calling Scanner:** This LoRA intrinsic is finetuned for detecting incorrect function calls from an LLM agent. Given a user prompt, tool options, and underlying model response, this intrinsic acts as a safeguard blocking LLM agent tool errors. These errors can be from simple LLM mistakes, or due to tool hijacking from jailbreak and prompt injection attacks.

**Jailbreak Detector:** This is an experimental LoRA designed for detecting jailbreak and prompt injection risks in user inputs.
Jailbreaks attempt to bypass safeguards in AI systems for malicious purposes, using a variety of attack techniques. This model helps filter such prompts to protect against adversarial threats. In particular, it focuses on social engineering based manipulation like role-playing or use of hypothetical scenarios.

**PII Detector:** This is an experimental LoRA that is designed for detecting PII in model outputs. Models with access to personal information via RAG or similar may present additional data protection risks that can be mitigated by using this LoRA to check model outputs.

**RAG Data Leakage:** This experimental safeguard is designed to detect and mitigate the risk of sensitive data leakage from RAG documents into model outputs. RAG systems enhance AI responses by retrieving relevant documents from external databases, but this introduces the potential for unintended disclosure of private, proprietary, or sensitive information. This model monitors generated responses to prevent such leaks, especially in scenarios where retrieved content may be sensitive or confidential.

**System Prompt Leakage:** This is an experimental LoRA-based model designed to detect risks of system prompt leakage in user inputs.
System prompt leakage occurs when adversaries attempt to extract or infer hidden instructions or configurations that guide AI behavior.
This model helps identify and filter such attempts, enhancing the security and integrity of AI systems.
It is particularly focused on detecting subtle probing techniques, indirect questioning, and prompt engineering strategies that aim to reveal internal system behavior or constraints.

## Quickstart Example

To invoke the LoRA adapters, you can follow the following process.

1. Select the LoRA adapter that you want to experiment with from [here](https://huggingface.co/ibm-granite/granite-3.3-8b-security-lib/tree/main).
2. Download the LoRA adapter to a local directory. Following example shows how to download the "granite-3.3-8b-instruct-lora-jailbreak-detector" intrinsic to the local directory `intrinsics/jailbreak_detection`

```
from huggingface_hub import HfApi, hf_hub_download
import os
from tqdm import tqdm

def download_intrinsic(
    repo_id: str,
    intrinsic: str,
    local_dir: str,
    token: str = None,
):
    api = HfApi(token=token)
    files = api.list_repo_files(repo_id=repo_id, token=token)

    # Keep only files under your desired subfolder
    files = [f for f in files if f.startswith(intrinsic.rstrip("/") + "/")]

    os.makedirs(local_dir, exist_ok=True)

    for file_path in tqdm(files, desc="Downloading files"):
        rel_path = os.path.relpath(file_path, intrinsic)
        dest_path = os.path.join(local_dir, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)

        hf_hub_download(
            repo_id=repo_id,
            filename=file_path,
            local_dir=local_dir,
            token=token,
        )


download_intrinsic(
    repo_id="ibm-granite/granite-3.3-8b-security-lib",
    intrinsic="granite-3.3-8b-instruct-lora-jailbreak-detector",
    local_dir="intrinsics",
    token="YOUR_HF_TOKEN",  # omit if not needed
)
```

3. Load the LoRA adapter from the downloaded local directory and run the intrinsic model. Each intrinsic contains a README file inside the LoRA adapter directory which explains how to run the model. Here is an [example](https://huggingface.co/ibm-granite/granite-3.3-8b-security-lib/blob/main/granite-3.3-8b-instruct-lora-jailbreak-detector/README.md#quickstart-example). 