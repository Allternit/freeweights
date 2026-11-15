<div align="center">
  <img
    src="https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/liquid-ai-banner.webp"
    alt="Liquid AI"
    style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0;"
  />
  <div align="center" style="display: flex; justify-content: center; align-items: center; gap: 1.25em; margin: 8px 0 1.7rem; padding: 0; line-height: 1.3;">
    <a href="https://console.liquid.ai/dashboard" style="display: inline-flex; align-items: center; gap: 6px;"><img src="https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/icons/api.svg" width="16" height="16" alt="" aria-hidden="true" style="display: block; flex: 0 0 16px; width: 16px; height: 16px; margin: 0;" /><strong>API</strong></a>
    <a href="https://playground.liquid.ai/" style="display: inline-flex; align-items: center; gap: 6px;"><img src="https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/icons/try.svg" width="16" height="16" alt="" aria-hidden="true" style="display: block; flex: 0 0 16px; width: 16px; height: 16px; margin: 0;" /><strong>Try</strong></a>
    <a href="https://docs.liquid.ai/lfm/getting-started/welcome" style="display: inline-flex; align-items: center; gap: 6px;"><img src="https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/icons/docs.svg" width="16" height="16" alt="" aria-hidden="true" style="display: block; flex: 0 0 16px; width: 16px; height: 16px; margin: 0;" /><strong>Docs</strong></a>
    <a href="https://www.liquid.ai/blog/lfm3" style="display: inline-flex; align-items: center; gap: 6px;"><img src="https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/icons/blog.svg" width="16" height="16" alt="" aria-hidden="true" style="display: block; flex: 0 0 16px; width: 16px; height: 16px; margin: 0;" /><strong>Blog</strong></a>
  </div>
</div>

# LFM3-VL-2B

LFM3-VL-2B is a **vision-language model for on-device visual understanding**. It takes text, images, and video as input, and combines the [LFM3 language model](https://huggingface.co/LiquidAI/LFM3-1.7B-Base) with a new in-house vision encoder.

New in LFM3-VL-2B:

- **Video understanding:** the first LFM vision model that takes video as input. Ask questions about a recorded lecture, a walkthrough filmed on your phone, or a clip from a camera feed.
- **Thinking:** the model reasons step by step before it answers. This helps most with harder visual questions, such as math, charts, and multi-step problems.
- **Spatial and embodied reasoning:** the model finds objects and reasons about how they are placed relative to each other, a strong foundation for robotics applications.

Find more information about the LFM3 family in [our release blog post](https://www.liquid.ai/blog/lfm3).

## Model details
<hr style="margin: -0.7em 0 1.2em 0; border: 0; border-top: 1px solid rgba(127, 127, 127, 0.3);" />

The [LFM3 family](https://huggingface.co/collections/LiquidAI/lfm3) includes base, text, vision, audio, omni, and decision models.

<table style="width: 100%; display: table; border: 0; border-radius: 0; border-collapse: collapse;">
<thead style="border: 0;">
<tr style="border: 0;">
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Property</th>
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Specification</th>
</tr>
</thead>
<tbody style="border: 0;">
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Checkpoint</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">Post-trained vision-language model</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Parameters</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">1.92B: 1.73B language model, 164M vision encoder, 25M projector</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Language model</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">LFM3, 24 layers: 13 gated short convolutions, 5 sliding-window attention, 6 global attention</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Vision encoder</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">14 layers: 8 gated depthwise 2D convolutions, 6 bidirectional attention, 16×16 patches with 2D rotary embeddings</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Inputs</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">Text, images, and video at native resolution. Each 2×2 block of patches becomes one language token. Video is sampled at 2 fps.</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Context length</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">128K tokens (input + output)</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Vocabulary</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">128,000 tokens</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>Languages</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">English, Arabic, Chinese, French, German, Italian, Japanese, Korean, Portuguese, Spanish, Vietnamese, Thai, Indonesian, Hindi, Russian, Polish</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>License</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;"><a href="LICENSE">LFM Open License v1.0</a></td>
</tr>
</tbody>
</table>

LFM3-VL-2B is designed for on-device visual tasks: questions about video, reading documents, charts, and app screens, finding objects in an image, and spatial reasoning for robots. It is not recommended for coding, multi-turn conversations, or complex reasoning.

## Inference
<hr style="margin: -0.7em 0 1.2em 0; border: 0; border-top: 1px solid rgba(127, 127, 127, 0.3);" />

Use these ONNX weights with [Transformers.js](https://huggingface.co/docs/transformers.js) **v4.3.2 or later**. The example below uses `AutoModelForImageTextToText` and `AutoProcessor` with WebGPU.

```bash
npm install @huggingface/transformers@^4.3.2
```

```javascript
import { AutoModelForImageTextToText, AutoProcessor, load_image } from "@huggingface/transformers";

const modelId = "onnx-community/LFM3-VL-2B-ONNX";
const model = await AutoModelForImageTextToText.from_pretrained(modelId, {
  device: "webgpu",
  dtype: {
    vision_encoder: "fp16",
    embed_tokens: "fp16",
    decoder_model_merged: "q4f16",
  },
});
const processor = await AutoProcessor.from_pretrained(modelId);

const image = await load_image(
  "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png",
);
const messages = [
  {
    role: "user",
    content: [
      { type: "image" },
      { type: "text", text: "What is in this image?" },
    ],
  },
];

// Format the chat and preprocess the image.
const chatPrompt = processor.apply_chat_template(messages, {
  add_generation_prompt: true,
  enable_thinking: false,
});
const inputs = await processor(image, chatPrompt, { add_special_tokens: false });

const outputs = await model.generate({
  ...inputs,
  do_sample: true,
  temperature: 0.1,
  top_k: 50,
  repetition_penalty: 1.1,
  max_new_tokens: 128,
});

// Decode only the newly generated tokens.
const inputLength = inputs.input_ids.dims.at(-1);
const generated = outputs.slice(null, [inputLength, null]);
console.log(processor.batch_decode(generated, { skip_special_tokens: true })[0]);

// Release the model when you are finished using it.
await model.dispose();
```

The processor loads the image preprocessing settings and chat template automatically. This example disables thinking with `enable_thinking: false`. Set it to `true` in `processor.apply_chat_template()` and increase `max_new_tokens` when you want to allow a longer reasoning trace.

## Fine-tuning
<hr style="margin: -0.7em 0 1.2em 0; border: 0; border-top: 1px solid rgba(127, 127, 127, 0.3);" />

LFM3-VL-2B is designed for **easy customization** for a given domain, task, or application via [TRL](https://docs.liquid.ai/lfm/fine-tuning/trl).

<table style="width: 100%; display: table; border: 0; border-radius: 0; border-collapse: collapse;">
<thead style="border: 0;">
<tr style="border: 0;">
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Training</th>
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Use case</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Notebook</th>
</tr>
</thead>
<tbody style="border: 0;">
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>SFT</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">Extract structured JSON from receipt photos</td>
<td style="text-align: center; border: 0; padding: 0.55em 0.75em;"><a href="https://colab.research.google.com/github/Liquid4All/cookbook/blob/main/finetuning/notebooks/lfm3_vl_sft_with_trl.ipynb" title="SFT with TRL"><img src="https://colab.research.google.com/assets/colab-badge.svg" width="117" height="20" alt="Open in Colab" style="display: inline-block; width: 117px; height: 20px; margin: 0; vertical-align: middle;" /></a></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;"><strong>GRPO</strong></td>
<td style="border: 0; padding: 0.55em 0.75em;">Transcribe images of equations to LaTeX</td>
<td style="text-align: center; border: 0; padding: 0.55em 0.75em;"><a href="https://colab.research.google.com/github/Liquid4All/cookbook/blob/main/finetuning/notebooks/lfm3_vl_grpo_with_trl.ipynb" title="GRPO with TRL"><img src="https://colab.research.google.com/assets/colab-badge.svg" width="117" height="20" alt="Open in Colab" style="display: inline-block; width: 117px; height: 20px; margin: 0; vertical-align: middle;" /></a></td>
</tr>
</tbody>
</table>

## Performance
<hr style="margin: -0.7em 0 1.2em 0; border: 0; border-top: 1px solid rgba(127, 127, 127, 0.3);" />

### Benchmarks

Across 62 vision benchmarks, LFM3-VL-2B scores at least 8 points ahead of all models of similar size. It matches Gemma 4 12B, is within 2 points of GPT-5.6 Luna, and scores higher than Gemini 3.5 Flash Lite.

<div role="region" aria-labelledby="benchmarks" tabindex="0" style="width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
<table style="width: 100%; min-width: 48rem; display: table; border: 0; border-radius: 0; border-collapse: collapse; font-size: calc(0.875em - 1pt);">
<thead style="border: 0;">
<tr style="border: 0;">
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Category</th>
<th scope="col" style="text-align: center; white-space: nowrap; background-color: rgba(108, 79, 224, 0.08); padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);"><strong>LFM3-VL<br>2B</strong></th>
<th scope="col" style="text-align: center; white-space: nowrap; background-color: rgba(108, 79, 224, 0.08); padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);"><strong>LFM3-VL<br>2B&nbsp;(no&nbsp;think)</strong></th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">LFM2.5-VL<br>3B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">MiniCPM-V&nbsp;4.7<br>1B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Qwen3.5<br>2B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Qwen3.5<br>4B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">InternVL3.5<br>4B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemma&nbsp;4<br>E2B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemma&nbsp;4<br>12B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">GPT-5.6<br>Luna</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemini&nbsp;3.5<br>Flash&nbsp;Lite</th>
</tr>
</thead>
<tbody style="border: 0;">
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">General</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">66.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">56.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">64.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">56.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>74.0</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>74.1</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Perception</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>75.6</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">68.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>77.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.0</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Document, OCR & Chart</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">83.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">71.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">84.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>85.7</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>84.4</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">82.3</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Math & logical reasoning</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">68.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">41.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">40.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">51.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>78.4</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">46.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">51.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>79.3</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">77.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">66.7</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Visual grounding</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><strong>77.3</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">72.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">68.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">51.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">41.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>74.1</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.5</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Embodied reasoning</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><strong>64.4</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">57.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">48.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">45.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">51.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>63.2</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">48.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">41.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">50.3</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">GUI understanding</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><strong>83.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">81.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">66.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">45.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">68.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">44.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>82.5</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.0</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Video</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">61.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">54.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">41.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">53.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">46.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">58.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>72.8</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>70.0</u></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Multilingual</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">84.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">76.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">77.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">78.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">83.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>86.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">82.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>85.8</u></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">Agentic</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">42.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">32.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">21.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">16.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">15.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">31.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">N/A</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">23.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">43.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>56.1</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>62.4</strong></td>
</tr>
</tbody>
<tbody style="border: 0;">
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);"><strong>Average</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">71.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">62.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">57.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">57.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">64.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);"><strong>73.4</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">61.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">53.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);"><u>71.7</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);"><strong>73.4</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em; border-top: 1px solid rgba(127, 127, 127, 0.25);">70.0</td>
</tr>
</tbody>
</table>
</div>

<details>
<summary><small>All 62 benchmarks</small></summary>

<div role="region" aria-labelledby="benchmarks" tabindex="0" style="width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
<table style="width: 100%; min-width: 56rem; display: table; border: 0; border-radius: 0; border-collapse: collapse; font-size: calc(0.875em - 1pt);">
<thead style="border: 0;">
<tr style="border: 0;">
<th scope="col" style="text-align: left; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Benchmark</th>
<th scope="col" style="text-align: center; white-space: nowrap; background-color: rgba(108, 79, 224, 0.08); padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);"><strong>LFM3-VL<br>2B</strong></th>
<th scope="col" style="text-align: center; white-space: nowrap; background-color: rgba(108, 79, 224, 0.08); padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);"><strong>LFM3-VL<br>2B&nbsp;(no&nbsp;think)</strong></th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">LFM2.5-VL<br>3B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">MiniCPM-V&nbsp;4.7<br>1B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Qwen3.5<br>2B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Qwen3.5<br>4B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">InternVL3.5<br>4B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemma&nbsp;4<br>E2B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemma&nbsp;4<br>12B</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">GPT-5.6<br>Luna</th>
<th scope="col" style="text-align: center; white-space: nowrap; padding: 0.55em 0.75em; border: 0; border-bottom: 1px solid rgba(127, 127, 127, 0.55);">Gemini&nbsp;3.5<br>Flash&nbsp;Lite</th>
</tr>
</thead>
<tbody style="border: 0;">
<tr style="border: 0;"><th scope="rowgroup" style="text-align: left; background-color: transparent; padding: 0.55em 0.75em; border: 0; font-weight: 600; padding-top: 1em; padding-bottom: 0.5em;">General</th><td aria-hidden="true" style="border: 0; padding: 0.55em 0.75em; background-color: rgba(108, 79, 224, 0.08);"></td><td aria-hidden="true" style="border: 0; padding: 0.55em 0.75em; background-color: rgba(108, 79, 224, 0.08);"></td><td colspan="9" aria-hidden="true" style="border: 0; padding: 0.55em 0.75em;"></td></tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MME</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">86.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">76.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">74.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">82.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">83.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>88.3</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">82.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">85.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">74.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>89.2</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MMStar</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">74.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">62.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">68.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>76.6</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>77.7</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.1</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">SimpleVQA</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">36.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">27.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">32.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">36.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">38.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">45.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">33.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">28.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">42.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>53.2</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>56.9</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">SEED-Bench (image)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">78.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">76.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">77.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">78.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">75.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>80.6</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>79.5</u></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MMBench (dev EN v1.1)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">86.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">76.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">83.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">80.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>86.5</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">70.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>88.2</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">84.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>88.2</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MMMU (val)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">55.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">48.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">47.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">51.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">58.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">74.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>76.7</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>75.2</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">72.0</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MMMU-Pro</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">45.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">35.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">33.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">37.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">50.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">38.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">42.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>69.1</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>70.9</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.2</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MM-Vet (v1)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">57.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">44.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">48.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">46.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">53.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">44.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">64.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>67.1</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>73.3</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MM-IFEval</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">72.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">54.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">60.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">58.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">62.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>83.0</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>82.0</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">73.2</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">MuirBench</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">66.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">61.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">58.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>72.8</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">54.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">47.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">66.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>72.7</u></td>
</tr>
<tr style="border: 0;"><th scope="rowgroup" style="text-align: left; background-color: transparent; padding: 0.55em 0.75em; border: 0; font-weight: 600; padding-top: 1em; padding-bottom: 0.5em;">Perception</th><td aria-hidden="true" style="border: 0; padding: 0.55em 0.75em; background-color: rgba(108, 79, 224, 0.08);"></td><td aria-hidden="true" style="border: 0; padding: 0.55em 0.75em; background-color: rgba(108, 79, 224, 0.08);"></td><td colspan="9" aria-hidden="true" style="border: 0; padding: 0.55em 0.75em;"></td></tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">BLINK</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><strong>71.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">68.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">60.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">63.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">69.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">52.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>70.9</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">68.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">68.9</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">CountBenchQA</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>93.0</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">86.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">87.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">86.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">87.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">92.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">78.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>95.9</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">91.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">90.1</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">HallusionBench</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">65.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">52.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">46.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">53.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>66.2</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">58.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">56.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>68.9</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.6</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">POPE</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">88.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">86.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>88.9</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>89.2</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">88.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">88.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">88.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">84.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">87.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">85.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>89.2</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">PerceptionBench</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">37.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">28.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">27.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">26.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">29.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">39.8</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">27.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">28.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><u>43.5</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>48.8</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">37.7</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">HR-Bench (4K)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>82.3</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">71.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.3</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">67.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">76.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>88.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">55.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">65.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">77.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">80.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.2</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">HR-Bench (8K)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>76.2</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">64.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">62.1</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">74.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>82.1</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">54.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">57.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">70.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">60.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">75.7</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">ZoomBench (full + crop average)</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>62.6</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">60.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">52.0</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">56.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">61.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">52.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">43.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.4</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">59.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>65.0</strong></td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">V*Bench</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>86.4</u></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;">80.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">81.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.7</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">85.9</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;"><strong>89.5</strong></td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">71.2</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">44.5</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">69.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">79.6</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; border: 0; padding: 0.55em 0.75em;">74.9</td>
</tr>
<tr style="border: 0;">
<td style="border: 0; padding: 0.55em 0.75em;">RealWorldQA</td>
<td style="text-align: center; font-variant-numeric: tabular-nums; background-color: rgba(108, 79, 224, 0.08); border: 0; padding: 0.55em 0.75em;"><u>79.3</u></td>

_The publisher's README is longer; it is cut here. Read the rest at the source._
