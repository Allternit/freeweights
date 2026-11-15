![Comparison Panel](./comparison_panel.jpeg)

`FLUX.2 Small Decoder` is a distilled VAE decoder that serves as a **drop-in replacement** for the standard FLUX.2 decoder. It delivers faster decoding and lower VRAM usage with minimal to zero quality loss. The encoder remains unchanged.

# **Key Features**

  1. **~1.4x faster decoding** compared to the full decoder.
  2. **~1.4x less VRAM** at decode time, enabling higher resolutions without running out of memory.
  3. **~28M decoder parameters** (vs ~50M in the full decoder) thanks to narrower channel widths (`[96, 192, 384, 384]` vs `[128, 256, 512, 512]`).
  4. **Minimal quality loss** — images are almost identical.
  5. Available under the Apache 2.0 license.

Compatible with all open FLUX.2 models:
- [FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- [FLUX.2-klein-9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-9B)
- [FLUX.2-klein-9b-kv](https://huggingface.co/black-forest-labs/FLUX.2-klein-9b-kv)
- [FLUX.2-dev](https://huggingface.co/black-forest-labs/FLUX.2-dev)

# **Comparison**

| Full Decoder | Small Decoder |
|:---:|:---:|
| ![Full Decoder](./compare_full_decoder.png) | ![Small Decoder](./compare_small_decoder.png) |

# **Usage**

```shell
pip install git+https://github.com/huggingface/diffusers.git
```

```python
import torch
from diffusers import Flux2KleinPipeline, AutoencoderKLFlux2

device = "cuda"
dtype = torch.bfloat16

vae = AutoencoderKLFlux2.from_pretrained("black-forest-labs/FLUX.2-small-decoder", torch_dtype=dtype)
pipe = Flux2KleinPipeline.from_pretrained("black-forest-labs/FLUX.2-klein-4B", vae=vae, torch_dtype=dtype)
pipe.enable_model_cpu_offload()

prompt = "A black cat holding a sign that says 'hello world' in typewriter font"
image = pipe(
    prompt=prompt,
    height=1024,
    width=1024,
    guidance_scale=1.0,
    num_inference_steps=4,
    generator=torch.Generator(device=device).manual_seed(0)
).images[0]
image.save("flux-klein-small-decoder.png")
```


---
# Limitations

- This model is not intended or able to provide factual information.
- While the model can output text, text rendered may be inaccurate or subject to distortion.
- As a statistical model, this checkpoint may represent or amplify biases observed in the training data.
- The model may fail to generate output that matches the prompts.
- Prompt following is heavily influenced by the prompting style.

# Out-of-Scope Use

This model and its derivatives may not be used outside the scope of the license, including for unlawful, fraudulent, defamatory, abusive, or otherwise violative purposes as further explained in our Usage Policies.

---
# Responsible AI Development

Black Forest Labs is committed to responsible model development and deployment. Prior to releasing FLUX.2 [klein] 9B-KV, we evaluated and mitigated a number of risks, including child sexual abuse material (CSAM) and nonconsensual intimate imagery (NCII). For detailed information about our mitigations, evaluation processes, content provenance features, and policies, please see our post: [Capable, Open, and Safe: Combating AI
Misuse](https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse).

To report safety concerns, contact safety@blackforestlabs.ai.

---

# License

This model is licensed under the https://www.apache.org/licenses/LICENSE-2.0.

# Trademarks & IP

This project may contain trademarks or logos for projects, products, or services. Use of Black Forest Labs and FLUX trademarks or logos in modified versions of this project must not cause confusion or imply sponsorship or endorsement. Any use of third-party trademarks, intellectual property or logos are subject to those third-party's policies.
