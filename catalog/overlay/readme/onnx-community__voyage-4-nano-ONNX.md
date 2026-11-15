## Usage

### ONNXRuntime

```py
from huggingface_hub import snapshot_download
from transformers import AutoTokenizer
import onnxruntime as ort

# Download model files from Hugging Face Hub
model_id = "onnx-community/voyage-4-nano-ONNX"
model_folder = snapshot_download(model_id, local_dir="voyage-4-nano", allow_patterns=["onnx/model.onnx*"])
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Load the ONNX model
session = ort.InferenceSession("./voyage-4-nano/onnx/model.onnx")

# Run model
query = "What is the fastest route to 88 Kearny?"
prompt = "Represent the query for retrieving supporting documents: "
inputs = tokenizer(prompt + query, return_tensors="np").data
last_hidden_state, pooler_output = session.run(None, inputs)
print("Last hidden state shape:", last_hidden_state.shape) # (1, 20, 2048)
print("Pooler output shape:", pooler_output.shape) # (1, 2048)
```
