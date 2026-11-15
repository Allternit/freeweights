# GaussianMind

GaussianMind is an audio-language model developed based on RoboBrain and OpenMOSS Audio.

This model is the result of joint research by Hao Tang's team at the School of Computer Science, Peking University, and the Beijing Academy of Artificial Intelligence (BAAI).

## Usage

The repository includes custom Transformers code. Load the model and processor with `trust_remote_code=True`:

```python
from transformers import AutoModelForCausalLM, AutoProcessor

model_id = "BAAI/GaussianMind"
processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    device_map="auto",
)
```

## Acknowledgements

GaussianMind builds upon RoboBrain and OpenMOSS Audio. We thank their contributors for making this work possible.
