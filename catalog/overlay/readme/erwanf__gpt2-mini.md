# GPT-2 Mini

A smaller GPT-2 model with (only) 39M parameters. It was pretrained on a subset of OpenWebText, the open-source version of the pretraining dataset used by OpenAI for the original GPT-2 models.

## Uses

The purpose of this model is mainly for research and education. Its small size allows for fast experiments in resource-limited settings, while still being able of generating complex and coherent text.

## Getting Started

Use the code below to get started with the model:
```py
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load model
model = AutoModelForCausalLM.from_pretrained("erwanf/gpt2-mini")
model.eval()

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("erwanf/gpt2-mini")

# Generate text
prompt = "Hello, I'm a language model,"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

output = model.generate(input_ids, do_sample=True, max_length=50, num_return_sequences=5)
output_text = tokenizer.batch_decode(output, skip_special_tokens=True)
print(output_text)
```

Output:
```
["Hello, I'm a language model, I can't be more efficient in words.\n\nYou can use this as a point to find out the next bit in your system, and learn more about me.\n\nI think a lot of the",
 "Hello, I'm a language model, my teacher is a good teacher - a good school teacher – and one thing you have to remember:\n\nIt's not perfect. A school is not perfect; it isn't perfect at all!\n\n",
 'Hello, I\'m a language model, but if I can do something for you then go for it (for a word). Here is my blog, the language:\n\nI\'ve not used "normal" in English words, but I\'ve always',
 'Hello, I\'m a language model, I\'m talking to you the very first time I used a dictionary and it can be much better than one word in my dictionary. What would an "abnormal" English dictionary have to do with a dictionary and',
 'Hello, I\'m a language model, the most powerful representation of words and phrases in the language I\'m using."\n\nThe new rules change that makes it much harder for people to understand a language that does not have a native grammar (even with']
```

## Training Details

The architecture relies on the GPT-2 model, with smaller dimensions and less layers. It uses the same tokenizer as GPT-2. We used the first 2M rows from the OpenWebText dataset, out of which we use 1k for test and validation sets.

### Hyperparameters

| **Hyperparameter**     | **Value**        |
|------------------------|------------------|
| **Model Parameters**   |                  |
| Vocabulary Size        | 50,257           |
| Context Length         | 512              |
| Number of Layers       | 4                |
| Hidden Size            | 512              |
| Number of Attention Heads | 8             |
| Intermediate Size      | 2048             |
| Activation Function    | GELU             |
| Dropout                | No               |
| **Training Parameters**|                  |
| Learning Rate          | 5e-4             |
| Batch Size             | 256              |
| Optimizer              | AdamW            |
| beta1                  | 0.9              |
| beta2                  | 0.98             |
| Weight Decay           | 0.1              |
| Training Steps         | 100,000          |
| Warmup Steps           | 4,000            |
| Learning Rate Scheduler| Cosine           |
| Training Dataset Size  | 1M samples       |
| Validation Dataset Size| 1k samples       |
| Float Type             | bf16             |

