### Granite-20B-FunctionCalling
#### Model Summary
Granite-20B-FunctionCalling is a finetuned model based on IBM's [granite-20b-code-instruct](https://huggingface.co/ibm-granite/granite-20b-code-instruct) model to introduce function calling abilities into Granite model family. The model is trained using a multi-task training approach on seven fundamental tasks encompassed in function calling, those being Nested Function Calling, Function Chaining, Parallel Functions, Function Name Detection, Parameter-Value Pair Detection, Next-Best Function, and Response Generation.

- **Developers**: IBM Research
- **Paper**: [Granite-Function Calling Model: Introducing Function Calling Abilities via Multi-task Learning of Granular Tasks](https://arxiv.org/pdf/2407.00121v1)
- **Release Date**: July 9th, 2024
- **License**: [Apache 2.0.](https://www.apache.org/licenses/LICENSE-2.0)

### Usage
### Intended use
The model is designed to respond to function calling related instructions.

### Generation
This is a simple example of how to use Granite-20B-Code-FunctionCalling model.
```python
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

device = "cuda" # or "cpu"
model_path = "ibm-granite/granite-20b-functioncalling"
tokenizer = AutoTokenizer.from_pretrained(model_path)
# drop device_map if running on CPU
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=device)
model.eval()

# define the user query and list of available functions
query = "What's the current weather in New York?"
functions = [
    {
        "name": "get_current_weather",
        "description": "Get the current weather",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "get_stock_price",
        "description": "Retrieves the current stock price for a given ticker symbol. The ticker symbol must be a valid symbol for a publicly traded company on a major US stock exchange like NYSE or NASDAQ. The tool will return the latest trade price in USD. It should be used when the user asks about the current or most recent price of a specific stock. It will not provide any other information about the stock or company.",
        "parameters": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "The stock ticker symbol, e.g. AAPL for Apple Inc."
                }
            },
            "required": ["ticker"]
        }
    }
]


# serialize functions and define a payload to generate the input template
payload = {
    "functions_str": [json.dumps(x) for x in functions],
    "query": query,
}

instruction = tokenizer.apply_chat_template(payload, tokenize=False, add_generation_prompt=True)

# tokenize the text
input_tokens = tokenizer(instruction, return_tensors="pt").to(device)

# generate output tokens
outputs = model.generate(**input_tokens, max_new_tokens=100)

# decode output tokens into text
outputs = tokenizer.batch_decode(outputs)

# loop over the batch to print, in this example the batch size is 1
for output in outputs:
    # Each function call in the output will be preceded by the token "<function_call>" followed by a 
    # json serialized function call of the format {"name": $function_name$, "arguments" {$arg_name$: $arg_val$}}
    # In this specific case, the output will be: <function_call> {"name": "get_current_weather", "arguments": {"location": "New York"}}
    print(output)
```
