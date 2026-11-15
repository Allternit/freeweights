# Model Card

<p align="center">
  <img src="./icon.png" alt="Logo" width="350">
</p>

📖 [Technical report](https://arxiv.org/abs/2402.11530) | 🏠 [Code](https://github.com/BAAI-DCAI/Bunny) | 🐰 [Demo](http://bunny.baai.ac.cn)

This is **GGUF** format of [Bunny-Llama-3-8B-V](https://huggingface.co/BAAI/Bunny-Llama-3-8B-V).

Bunny is a family of lightweight but powerful multimodal models. It offers multiple plug-and-play vision encoders, like EVA-CLIP, SigLIP and language backbones, including Llama-3-8B, Phi-1.5, StableLM-2, Qwen1.5, MiniCPM and Phi-2. To compensate for the decrease in model size, we construct more informative training data by curated selection from a broader data source.

We provide Bunny-Llama-3-8B-V, which is built upon [SigLIP](https://huggingface.co/google/siglip-so400m-patch14-384) and [Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct). More details about this model can be found in [GitHub](https://github.com/BAAI-DCAI/Bunny).

![comparison](comparison.png)


# Quickstart

## Chat by [`llama.cpp`](https://github.com/ggerganov/llama.cpp)

```shell
# sample images can be found in images folder

# fp16
./llava-cli -m ggml-model-f16.gguf --mmproj mmproj-model-f16.gguf --image example_2.png -c 4096 -e \
    -p "A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions. USER: <image>\nWhy is the image funny? ASSISTANT:" \
    --temp 0.0

# int4
./llava-cli -m ggml-model-Q4_K_M.gguf --mmproj mmproj-model-f16.gguf --image example_2.png -c 4096 -e \
    -p "A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions. USER: <image>\nWhy is the image funny? ASSISTANT:" \
    --temp 0.0
```

## Chat by [ollama](https://ollama.com/)

```shell
# sample images can be found in images folder

# fp16
ollama create Bunny-Llama-3-8B-V-fp16 -f ./ollama-f16
ollama run Bunny-Llama-3-8B-V-fp16 'example_2.png
Why is the image funny?'

# int4
ollama create Bunny-Llama-3-8B-V-int4 -f ./ollama-Q4_K_M
ollama run Bunny-Llama-3-8B-V-int4 'example_2.png
Why is the image funny?'
```

