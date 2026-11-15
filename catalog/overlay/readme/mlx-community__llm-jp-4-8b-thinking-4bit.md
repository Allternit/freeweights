# mlx-community/llm-jp-4-8b-thinking-4bit

This model [mlx-community/llm-jp-4-8b-thinking-4bit](https://huggingface.co/mlx-community/llm-jp-4-8b-thinking-4bit) was
converted to MLX format from [llm-jp/llm-jp-4-8b-thinking](https://huggingface.co/llm-jp/llm-jp-4-8b-thinking)
using mlx-lm version **0.31.1**.

## Use with mlx (not support harmony format)

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/llm-jp-4-8b-thinking-4bit")

prompt = "こんにちは"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```

## Use with vllm-mlx (support harmony format)

```bash
pip install git+https://github.com/waybarrios/vllm-mlx.git
vllm-mlx serve mlx-community/llm-jp-4-8b-thinking-4bit --reasoning-parser gpt_oss --port 8000
vllm-mlx-chat --server-url http://localhost:8000
```
or,

```python
from openai import OpenAI

# Without API key (local development)
client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")

response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "こんにちは"}],
)
print(response.choices[0].message.content)
```