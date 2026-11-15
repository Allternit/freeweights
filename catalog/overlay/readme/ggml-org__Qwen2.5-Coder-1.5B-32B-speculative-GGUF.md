# Speculative decoding with Qwen 32B + Qwen 1.5B

Example:

```sh
llama-server \
    -m qwen2.5-coder-32b-instruct-q4_k_m.gguf \
    -md qwen2.5-coder-1.5b-instruct-q4_k_m.gguf \
    --ctx-size 65536
```
