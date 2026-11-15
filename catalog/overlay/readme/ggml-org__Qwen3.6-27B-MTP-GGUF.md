# Qwen3.6-27B-MTP GGUF

Recommended way to run this model:

```sh
# max MTP draft of 2 tokens
llama-server -hf ggml-org/Qwen3.6-27B-MTP-GGUF --spec-type draft-mtp --spec-draft-n-max 2

# max MTP draft of 3 tokens
llama-server -hf ggml-org/Qwen3.6-27B-MTP-GGUF --spec-type draft-mtp --spec-draft-n-max 3
```

Then, access http://localhost:8080

Requires the changes from: https://github.com/ggml-org/llama.cpp/pull/22673