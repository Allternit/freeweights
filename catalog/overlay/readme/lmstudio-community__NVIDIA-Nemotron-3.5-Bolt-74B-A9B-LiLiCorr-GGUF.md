## 💫 Community Model> NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr by nvidia

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator**: [nvidia](https://huggingface.co/nvidia)<br>
**Original model**: [NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr)<br>
**GGUF quantization**: provided by NVIDIA ([NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF)); file name and metadata updated by [LM Studio team](https://x.com/lmstudio)<br>
**License**: [OpenMDW-1.1](https://openmdw.ai/license/1-1/), see `LICENSE`<br>

## Draft model for speculative decoding

NVIDIA's LiLiCorr draft model for NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB ([lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF](https://huggingface.co/lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF)). It isn't a standalone model: it proposes draft tokens, and Bolt verifies them. On DGX Spark this makes generation about 2× faster.

To use it in LM Studio, download it alongside Bolt. Then, in Bolt's load settings, set **Speculative Decoding** to **DFlash** and select this model. This needs LM Studio's llama.cpp engine 2.59.0 or newer.

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.
