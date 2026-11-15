## 💫 Community Model> Yi Coder 9B Chat by 01-Ai

*👾 [LM Studio](https://lmstudio.ai) Community models highlights program. Highlighting new & noteworthy models by the community. Join the conversation on [Discord](https://discord.gg/aPQfnNkxGC)*.

**Model creator:** [01-ai](https://huggingface.co/01-ai)<br>
**Original model**: [Yi-Coder-9B-Chat](https://huggingface.co/01-ai/Yi-Coder-9B-Chat)<br>
**GGUF quantization:** provided by [bartowski](https://huggingface.co/bartowski) based on `llama.cpp` release [b3658](https://github.com/ggerganov/llama.cpp/releases/tag/b3658)<br>

## Model Summary:
Yi Coder 9B Chat is a new coding model from Yi, supporting a staggering 52 programming language, and featuring a max context length of 128k, making it great for ingesting large codebases.<br>This model is tuned for chatting, not auto completion, so should be chatted with for programming questions.<br>It is the first model under 10B parameters to pass 20% on LiveCodeBench.

## Prompt Template:

Choose the `ChatML` preset in your LM Studio.
Under the hood, the model will see a prompt that's formatted like so

```
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant

```

## Technical Details

Trained on an extensive set of languages:
```bash
  'java', 'markdown', 'python', 'php', 'javascript', 'c++', 'c#', 'c', 'typescript', 'html', 'go', 'java_server_pages', 'dart', 'objective-c', 'kotlin', 'tex', 'swift', 'ruby', 'sql', 'rust', 'css', 'yaml', 'matlab', 'lua', 'json', 'shell', 'visual_basic', 'scala', 'rmarkdown', 'pascal', 'fortran', 'haskell', 'assembly', 'perl', 'julia', 'cmake', 'groovy', 'ocaml', 'powershell', 'elixir', 'clojure', 'makefile', 'coffeescript', 'erlang', 'lisp', 'toml', 'batchfile', 'cobol', 'dockerfile', 'r', 'prolog', 'verilog'
```

128k context length, achieves 23% pass rate on LiveCodeBench, surpassing even some SOTA 15-33B models.

## Special thanks

🙏 Special thanks to [Georgi Gerganov](https://github.com/ggerganov) and the whole team working on [llama.cpp](https://github.com/ggerganov/llama.cpp/) for making all of this possible.

## Disclaimers

LM Studio is not the creator, originator, or owner of any Model featured in the Community Model Program. Each Community Model is created and provided by third parties. LM Studio does not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Community Model.  You understand that Community Models can produce content that might be offensive, harmful, inaccurate or otherwise inappropriate, or deceptive. Each Community Model is the sole responsibility of the person or entity who originated such Model. LM Studio may not monitor or control the Community Models and cannot, and does not, take responsibility for any such Model. LM Studio disclaims all warranties or guarantees about the accuracy, reliability or benefits of the Community Models.  LM Studio further disclaims any warranty that the Community Model will meet your requirements, be secure, uninterrupted or available at any time or location, or error-free, viruses-free, or that any errors will be corrected, or otherwise. You will be solely responsible for any damage resulting from your use of or access to the Community Models, your downloading of any Community Model, or use of any other Community Model provided by or through LM Studio.
