## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model like this:
```js
import { UltravoxProcessor, UltravoxModel, read_audio } from "@huggingface/transformers";

const processor = await UltravoxProcessor.from_pretrained(
  "onnx-community/ultravox-v0_5-llama-3_2-1b-ONNX",
);
const model = await UltravoxModel.from_pretrained(
  "onnx-community/ultravox-v0_5-llama-3_2-1b-ONNX",
  {
    dtype: {
      embed_tokens: "q8", // "fp32", "fp16", "q8"
      audio_encoder: "q4", // "fp32", "fp16", "q8", "q4", "q4f16"
      decoder_model_merged: "q4", // "q8", "q4", "q4f16"
    },
  },
);

const audio = await read_audio("http://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/mlk.wav", 16000);
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  { role: "user", content: "Transcribe this audio:<|audio|>" },
];
const text = processor.tokenizer.apply_chat_template(messages, {
  add_generation_prompt: true,
  tokenize: false,
});

const inputs = await processor(text, audio);
const generated_ids = await model.generate({
  ...inputs,
  max_new_tokens: 128,
});

const generated_texts = processor.batch_decode(
  generated_ids.slice(null, [inputs.input_ids.dims.at(-1), null]),
  { skip_special_tokens: true },
);
console.log(generated_texts[0]);
// "I can transcribe the audio for you. Here's the transcription:\n\n\"I have a dream that one day this nation will rise up and live out the true meaning of its creed.\"\n\n- Martin Luther King Jr.\n\nWould you like me to provide the transcription in a specific format (e.g., word-for-word, character-for-character, or a specific font)?"
```
