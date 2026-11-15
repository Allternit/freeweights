# Model card for eva02_base_patch16_224.mim_in22k

Downloaded checkpoint from [here](https://huggingface.co/Yuxin-CV/EVA-02/blob/main/eva02/pt/eva02_B_pt_in21k_p14to16.pt)

Then did 
```python
import torch
import timm
from timm.models.eva import checkpoint_filter_fn
from timm.models import push_to_hf_hub

state_dict = torch.load("eva02/pt/eva02_B_pt_in21k_p14to16.pt")["model"]
model = timm.create_model("eva02_base_patch14_224", patch_size=16, ref_feat_shape=(14, 14))

filtered = checkpoint_filter_fn(state_dict, model)
push_to_hf_hub(t, "nomic-ai/eva02_base_patch16_224.mim_in22k", private=True, safe_serialization=True)
```

