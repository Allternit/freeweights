---

# ⚠️ DEPRECATION WARNING ⚠️
# ⚠️ NOT RECOMMENDED FOR USE IN NEW PROJECTS ⚠️

New applications/projects should use the latest mainline Granite language model family, whose code capabilities supercede this model. 
This model is being made available strictly for historical/scientific purposes. 
**Please see our [Granite Collections](https://huggingface.co/ibm-granite/collections) for the latest Granite releases.**

---

![image/png](https://cdn-uploads.huggingface.co/production/uploads/62cd5057674cdb524450093d/1hzxoPwqkBJXshKVVe6_9.png)

# ibm-granite/granite-34b-code-instruct-8k-GGUF
This is the Q4_K_M converted version of the original [`ibm-granite/granite-34b-code-instruct-8k`](https://huggingface.co/ibm-granite/granite-34b-code-instruct-8k).
Refer to the [original model card](https://huggingface.co/ibm-granite/granite-34b-code-instruct-8k) for more details.

## Use with llama.cpp
```shell
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# install
make

# run generation
./main -m granite-34b-code-instruct-8k-GGUF/granite-34b-code-instruct.Q4_K_M.gguf -n 128 -p "def generate_random(x: int):" --color
```
