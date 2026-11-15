## Usage

### Transformers.js

```js
import {
  AutoProcessor,
  AutoModelForVision2Seq,
  load_image,
  TextStreamer,
} from "@huggingface/transformers";

// Initialize processor and model
const model_id = "onnx-community/granite-docling-258M-ONNX";
const processor = await AutoProcessor.from_pretrained(model_id);
const model = await AutoModelForVision2Seq.from_pretrained(model_id, {
  dtype: "fp32",
  // device: "webgpu",
});

// Load images
const image1 = await load_image("https://huggingface.co/ibm-granite/granite-docling-258M/resolve/main/assets/new_arxiv.png");

// Create input messages
const messages = [
  {
    role: "user",
    content: [
      { type: "image" },
      { type: "text", text: "Convert this page to docling." },
    ],
  },
];

// Prepare inputs
const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
const inputs = await processor(text, [image1], {
  // Set `do_image_splitting: true` to split images into multiple patches.
  // NOTE: This uses more memory, but can provide more accurate results.
  do_image_splitting: true,
});

// Generate outputs
const generated_ids = await model.generate({
  ...inputs,
  max_new_tokens: 4096,
  streamer: new TextStreamer(processor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: false,
  }),
});
const generated_texts = processor.batch_decode(
  generated_ids.slice(null, [inputs.input_ids.dims.at(-1), null]),
  { skip_special_tokens: true },
);
console.log(generated_texts[0]);
```

### ONNXRuntime

```py
from transformers import AutoConfig, AutoProcessor
from transformers.image_utils import load_image
from huggingface_hub import hf_hub_download
import onnxruntime
import numpy as np


# 1. Load models
## Load config and processor
model_id = "onnx-community/granite-docling-258M-ONNX"
config = AutoConfig.from_pretrained(model_id)
processor = AutoProcessor.from_pretrained(model_id)

## Download models from the Hugging Face Hub
vision_model_path = hf_hub_download(model_id, subfolder="onnx", filename="vision_encoder.onnx")         # graph
hf_hub_download(model_id, subfolder="onnx", filename="vision_encoder.onnx_data")                        # weights
embed_model_path = hf_hub_download(model_id, subfolder="onnx", filename="embed_tokens.onnx")            # graph
hf_hub_download(model_id, subfolder="onnx", filename="embed_tokens.onnx_data")                          # weights
decoder_model_path = hf_hub_download(model_id, subfolder="onnx", filename="decoder_model_merged.onnx")  # graph
hf_hub_download(model_id, subfolder="onnx", filename="decoder_model_merged.onnx_data")                  # weights

## Load sessions
vision_session = onnxruntime.InferenceSession(vision_model_path)
embed_session = onnxruntime.InferenceSession(embed_model_path)
decoder_session = onnxruntime.InferenceSession(decoder_model_path)

## Set config values
num_key_value_heads = config.text_config.num_key_value_heads
head_dim = config.text_config.head_dim
num_hidden_layers = config.text_config.num_hidden_layers
eos_token_id = config.text_config.eos_token_id
image_token_id = config.image_token_id


# 2. Prepare inputs
## Create input messages
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image"},
            {"type": "text", "text": "Convert this page to docling."}
        ]
    },
]

## Load image and apply processor
image = load_image("https://huggingface.co/ibm-granite/granite-docling-258M/resolve/main/assets/new_arxiv.png")
prompt = processor.apply_chat_template(messages, add_generation_prompt=True)
inputs = processor(text=prompt, images=[image], return_tensors="np")

## Prepare decoder inputs
batch_size = inputs['input_ids'].shape[0]
past_key_values = {
    f'past_key_values.{layer}.{kv}': np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=np.float32)
    for layer in range(num_hidden_layers)
    for kv in ('key', 'value')
}
image_features = None
input_ids = inputs['input_ids']
attention_mask = inputs['attention_mask']


# 3. Generation loop
max_new_tokens = 4096
generated_tokens = np.array([[]], dtype=np.int64)
for i in range(max_new_tokens):
  inputs_embeds = embed_session.run(None, {'input_ids': input_ids})[0]

  if image_features is None:
    ## Only compute vision features if not already computed
    image_features = vision_session.run(None, dict(
        pixel_values=inputs['pixel_values'],
        pixel_attention_mask=inputs['pixel_attention_mask'].astype(np.bool_)
    ))[0]

    ## Merge text and vision embeddings
    inputs_embeds[inputs['input_ids'] == image_token_id] = image_features.reshape(-1, image_features.shape[-1])

  logits, *present_key_values = decoder_session.run(None, dict(
      inputs_embeds=inputs_embeds,
      attention_mask=attention_mask,
      **past_key_values,
  ))

  ## Update values for next generation loop
  input_ids = logits[:, -1].argmax(-1, keepdims=True)
  attention_mask = np.concatenate([attention_mask, np.ones((batch_size, 1), dtype=attention_mask.dtype)], axis=-1)
  for j, key in enumerate(past_key_values):
    past_key_values[key] = present_key_values[j]

  generated_tokens = np.concatenate([generated_tokens, input_ids], axis=-1)
  if (input_ids == eos_token_id).all():
    break

  ## (Optional) Streaming
  print(processor.decode(input_ids[0]), end='')
print()


# 4. Do something with the final output
print(processor.batch_decode(generated_tokens, skip_special_tokens=False)[0])
```

<details>
  
<summary>See example output</summary>

```
<doctag><page_header><loc_115><loc_27><loc_385><loc_34>Energy Budget of WASP-121 b from JWST/NIRISS Phase Curve</page_header>
<page_header><loc_454><loc_28><loc_459><loc_34>9</page_header>
<text><loc_41><loc_42><loc_239><loc_88>while the kernel weights are structured as ( N$_{slice}$ , N$_{time}$ ). This precomputation significantly accelerates our calculations, which is essential since the longitudinal slices are at least partially degenerate with one another. Consequently, the fits require more steps and walkers to ensure proper convergence.</text>
<text><loc_41><loc_89><loc_239><loc_206>To address this, we follow a similar approach to our sinusoidal fits using emcee , but we increase the total number of steps to 100,000 and use 100 walkers. Na¨ıvely, the fit would include 2 N$_{slice}$ + 1 parameters: N$_{slice}$ for the albedo values, N$_{slice}$ for the emission parameters, and one additional scatter parameter, σ . However, since night-side slices do not contribute to the reflected light component, we exclude these albedo values from the fit. In any case, our choice of 100 walkers ensures a sufficient number of walkers per free parameter. Following Coulombe et al. (2025) we set an upper prior limit of 3 / 2 on all albedo slices as a fully Lambertian sphere ( A$_{i}$ = 1 ) corresponds to a geometric albedo of A$_{g}$ = 2 / 3. For thermal emission we impose a uniform prior between 0 and 500 ppm for each slice.</text>
<text><loc_41><loc_207><loc_239><loc_269>We choose to fit our detrended lightcurves considering 4, 6 and 8 longitudinal slices ( N$_{slice}$ = 4 , 6 , 8). However, we show the results of the simplest 4 slice model. As in our previous fits, we conduct an initial run with 25,000 steps (25% of the total run) and use the maximumprobability parameters from this preliminary fit as the starting positions for the final 75,000-step run. We then discard the first 60% of the final run as burn-in.</text>
<section_header_level_1><loc_73><loc_276><loc_207><loc_283>2.5. Planetary Effective Temperature</section_header_level_1>
<text><loc_41><loc_286><loc_239><loc_348>Phase curves are the only way to probe thermal emission from the day and nightside of an exoplanet and hence determine its global energy budget (Partier & Crossfield 2018). The wavelength range of NIRISS/SOSS covers a large portion of the emitted flux of WASP-121 b ( ∼ 50-83%; see Figure 2), enabling a precise and robust constraint of the planet's energy budget.</text>
<text><loc_41><loc_349><loc_239><loc_364>We convert the fitted F$_{p}$ / F$_{∗}$ emission spectra to brightness temperature by wavelength,</text>
<formula><loc_60><loc_368><loc_238><loc_387>T _ { b r i g h t } = \frac { h c } { k \lambda } \cdot \left [ \ln \left ( \frac { 2 b c ^ { 2 } } { \lambda ^ { 5 } B _ { \lambda , p l a n e t } } + 1 \right ) \right ] ^ { - 1 } ,</formula>
<text><loc_41><loc_391><loc_178><loc_398>where the planet's thermal emission is</text>
<formula><loc_84><loc_403><loc_238><loc_419>B _ { \lambda , \text {planet} } = \frac { F _ { p } / F _ { * } } { ( R _ { p } / R _ { * } ) ^ { 2 } } \cdot B _ { \lambda , \text {star} } \, .</formula>
<text><loc_41><loc_425><loc_239><loc_455>There are many ways of converting brightness temperatures to effective temperature, including the ErrorWeighted Mean (EWM), Power-Weighted mean (PWM) and with a Gaussian Process (Schwartz & Cowan 2015;</text>
<chart><loc_273><loc_49><loc_454><loc_134><line_chart><caption><loc_261><loc_141><loc_459><loc_264>Figure 2. Estimated captured flux of the planet assuming the planet radiates as a blackbody. The captured flux is calculated as the ratio of the integrated blackbody emission within the instrument's band pass to the total emission over all wavelengths, i.e., γ = ∫ λ$_{max}$ λ$_{min}$ B ( λ, T ) dλ/ ∫ ∞ 0 B ( λ, T ) dλ . The captured flux fraction is shown for NIRISS SOSS [0.6-2.85 µ m] (red line); Hubble WFC3 [1.12-1.64 µ m] (dashed green line); NIRSpec G395H [2.7-5.15 µ m] (dash dotted blue line). The red-shaded region shows the temperature range on WASP-121 b based on our T$_{eff}$ estimates. Red dashed lines indicate the boundaries of the planet's temperature range within the NIRISS SOSS captured flux fraction. From this we estimate that these observations capture between 55% and 82% of the planet's bolometric flux, depending on orbital phase. Using the minimum temperature from the NAMELESS fit, this estimate decreases to 50%. In either case, the wavelength coverage of NIRISS exceeds that of any other instrument.</caption></chart>
<text><loc_261><loc_273><loc_459><loc_359>Pass et al. 2019). In this work, we elect to compute our effective temperature estimates with a novel method that is essentially a combination of the PWM and EWM. We create the effective temperature by using a simple Monte Carlo process. First, we perturb our F$_{p}$ / F$_{s}$ emission spectra at each point in the orbit by a Gaussian based on the measurement uncertainty. Our new emission spectrum is then used to create an estimate of the brightness temperature spectrum. This process is repeated at each orbital phase. We then estimate the effective temperature, T$_{eff}$ for a given orbital phase as</text>
<formula><loc_317><loc_362><loc_459><loc_382>T _ { \text {eff} } = \frac { \sum _ { i = 1 } ^ { N } w _ { i } T _ { \text {bright} , i } } { \sum _ { i = 1 } ^ { N } w _ { i } } ,</formula>
<text><loc_261><loc_384><loc_459><loc_414>where w$_{i}$ is the weight for the i -th wavelength given by the fraction of the planet's bolometric flux that falls within that wavelength bin scaled by the inverse variance of the measurement,</text>
<formula><loc_305><loc_417><loc_459><loc_437>w _ { i } = \frac { \int _ { \lambda _ { i } } ^ { \lambda _ { i } + 1 } B ( \lambda _ { i } , T _ { \text {est} } ) \, d \lambda } { \int _ { 0 } ^ { \infty } B ( \lambda _ { i } , T _ { \text {est} } ) \, d \lambda } \cdot \frac { 1 } { \sigma _ { i } ^ { 2 } } ,</formula>
<text><loc_261><loc_440><loc_459><loc_454>with T$_{est}$ representing an estimated effective temperature at the orbital phase of interest. When computing</text>
</doctag><|end_of_text|>
```

</details>