<div align="center">
  <picture>
    <img
      src="https://cdn-uploads.huggingface.co/production/uploads/6435718aaaef013d1aec3b8b/i-v1KyAMOW_mgVGeic9WJ.png"
      alt="Arcee Trinity Mini"
      style="max-width: 100%; height: auto;"
    >
  </picture>
</div>

# Trinity Nano Preview

Trinity Nano Preview is a preview of Arcee AI's 6B MoE model with 1B active parameters. It is the small-sized model in our new Trinity family, a series of open-weight models for enterprise and tinkerers alike.

This is a chat tuned model, with a delightful personality and charm we think users will love. We note that this model is pushing the limits of sparsity in small language models with only 800M non-embedding parameters active per token, and as such **may be unstable** in certain use cases, especially in this preview.

This is an *experimental* release, it's fun to talk to but will not be hosted anywhere, so download it and try it out yourself!

***

Trinity Nano Preview is trained on 10T tokens gathered and curated through a key partnership with [Datology](https://www.datologyai.com/), building upon the excellent dataset we used on [AFM-4.5B](https://huggingface.co/arcee-ai/AFM-4.5B) with additional math and code.

Training was performed on a cluster of 512 H200 GPUs powered by [Prime Intellect](https://www.primeintellect.ai/) using HSDP parallelism.

More details, including key architecture decisions, can be found on our blog [here](https://www.arcee.ai/blog/the-trinity-manifesto)

***

## Model Details

* **Model Architecture:** AfmoeForCausalLM
* **Parameters:** 6B, 1B active
* **Experts:** 128 total, 8 active, 1 shared
* **Context length:** 128k
* **Training Tokens:** 10T
* **License:** [Apache 2.0](https://huggingface.co/arcee-ai/Trinity-Mini#license)

***

<div align="center">
  <picture>
      <img src="https://cdn-uploads.huggingface.co/production/uploads/6435718aaaef013d1aec3b8b/sSVjGNHfrJKmQ6w8I18ek.png" style="background-color:ghostwhite;padding:5px;" width="17%" alt="Powered by Datology">
  </picture>
</div>

### Running our model

- [Transformers](https://huggingface.co/arcee-ai/Trinity-Mini#transformers)
- [VLLM](https://huggingface.co/arcee-ai/Trinity-Mini#vllm)
- [llama.cpp](https://huggingface.co/arcee-ai/Trinity-Mini#llamacpp)
- [LM Studio](https://huggingface.co/arcee-ai/Trinity-Mini#lm-studio)

## Transformers.js

Use the `v4` transformers preview version

```
npm i @huggingface/transformers@next
```

You can then run the model as follows:

```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Trinity-Nano-Preview-ONNX",
  { device: "webgpu", dtype: "q4f16" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Write me a poem about Machine Learning." },
];

// Generate a response
const output = await generator(messages, {
  max_new_tokens: 512,
  do_sample: false,
  streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true }),
});
console.log(output[0].generated_text.at(-1).content);
```

## License

Trinity-Nano-Preview is released under the Apache-2.0 license.