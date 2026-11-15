> [!Note]
> At Mistral, we don't yet have too much experience with providing GGUF-quantized checkpoints
> to the community, but want to help improving the ecosystem going forward.
> If you encounter any problems with the provided checkpoints here, please open a discussion or pull request


# Devstral-Small-2505 (gguf)

Devstral is an agentic LLM for software engineering tasks built under a collaboration between [Mistral AI](https://mistral.ai/) and [All Hands AI](https://www.all-hands.dev/) 🙌. Devstral excels at using tools to explore codebases, editing multiple files and power software engineering agents. The model achieves remarkable performance on SWE-bench which positionates it as the #1 open source model on this [benchmark](https://huggingface.co/mistralai/Devstral-Small-2505#benchmark-results).

This is the GGUF version of the [Devstral-Small-2505](https://huggingface.co/mistralai/Devstral-Small-2505) model. We released the BF16 weights as well as the following quantized format:
- Q8_0 (recommended)
- Q5_K_M (recommended)
- Q4_K_M (recommended)
- Q4_0

It is finetuned from [Mistral-Small-3.1](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503), therefore it has a long context window of up to 128k tokens. As a coding agent, Devstral is text-only and before fine-tuning from `Mistral-Small-3.1` the vision encoder was removed.

For enterprises requiring specialized capabilities (increased context, domain-specific knowledge, etc.), we will release commercial models beyond what Mistral AI contributes to the community.

Learn more about Devstral in our [blog post](https://mistral.ai/news/devstral).


## Key Features:
- **Agentic coding**: Devstral is designed to excel at agentic coding tasks, making it a great choice for software engineering agents.
- **lightweight**: with its compact size of just 24 billion parameters, Devstral is light enough to run on a single RTX 4090 or a Mac with 32GB RAM, making it an appropriate model for local deployment and on-device use.
- **Apache 2.0 License**: Open license allowing usage and modification for both commercial and non-commercial purposes.
- **Context Window**: A 128k context window.
- **Tokenizer**: Utilizes a Tekken tokenizer with a 131k vocabulary size.

## Usage

We recommend to use Devstral with the [OpenHands](https://github.com/All-Hands-AI/OpenHands/tree/main) scaffold as explained [here](https://huggingface.co/mistralai/Devstral-Small-2505#usage).
To use it local with a GGUF-quantized checkpoint, see the following section.

### Local inference (GGUF)

Download the weights from huggingface:

```
pip install -U "huggingface_hub[cli]"
huggingface-cli download \
"mistralai/Devstral-Small-2505_gguf" \
--include "devstralQ4_K_M.gguf" \
--local-dir "mistralai/Devstral-Small-2505_gguf/"
```

You can serve the model locally with [LMStudio](https://lmstudio.ai/).
* Download [LM Studio](https://lmstudio.ai/) and install it
* Install `lms cli ~/.lmstudio/bin/lms bootstrap`
* In a bash terminal, run `lms import devstralQ4_K_M.ggu` in the directory where you've downloaded the model checkpoint (e.g. `mistralai/Devstral-Small-2505_gguf`)
* Open the LMStudio application, click the terminal icon to get into the developer tab. Click select a model to load and select Devstral Q4 K M. Toggle the status button to start the model, in setting oggle Serve on Local Network to be on.
* On the right tab, you will see an API identifier which should be devstralq4_k_m and an api address under API Usage. Keep note of this address, we will use it in the next step.

You can now interact with the model served from LM Studio with openhands. Start the openhands server with the docker

```bash
docker pull docker.all-hands.dev/all-hands-ai/runtime:0.38-nikolaik
docker run -it --rm --pull=always \
	-e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.38-nikolaik \
	-e LOG_ALL_EVENTS=true \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-v ~/.openhands-state:/.openhands-state \
	-p 3000:3000 \
	--add-host host.docker.internal:host-gateway \
	--name openhands-app \
	docker.all-hands.dev/all-hands-ai/openhands:0.38
```

The server will start at http://0.0.0.0:3000. Open it in your browser and you will see a tab `AI Provider Configuration`. Click “see advanced setting” on the second line. In the new tab, toggle `advanced` to on. Set the custom model to be `mistral/devstralq4_k_m` and Base URL the **api address** we get from the last step in LM Studio. Set API Key to `dummy`. Click save changes.