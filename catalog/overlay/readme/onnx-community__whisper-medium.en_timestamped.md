# whisper-medium.en_timestamped

This is the ONNX version of [openai/whisper-medium.en](https://huggingface.co/openai/whisper-medium.en) with **word-level timestamp support** for use with [Transformers.js](https://github.com/huggingface/transformers.js).

## Features

- ✅ Word-level timestamps via cross-attention (alignment_heads configured)
- ✅ Multiple quantization variants (fp32, int8, uint8)
- ✅ Compatible with Transformers.js for browser-based inference
- ✅ Merged decoder model for efficient inference

## Usage with Transformers.js

```javascript
import { pipeline } from '@huggingface/transformers';

const transcriber = await pipeline(
  'automatic-speech-recognition',
  'neonwatty/whisper-medium.en_timestamped'
);

const result = await transcriber(audioUrl, {
  return_timestamps: 'word',
  chunk_length_s: 30,
  stride_length_s: 5,
});

console.log(result);
// { text: "Hello world", chunks: [{ text: "Hello", timestamp: [0.0, 0.5] }, ...] }
```

## Model Files

The model includes the following ONNX files in the `onnx/` directory:

| File | Description |
|------|-------------|
| encoder_model.onnx | Audio encoder (fp32) |
| decoder_model.onnx | Text decoder (fp32) |
| decoder_with_past_model.onnx | Decoder with KV cache |
| decoder_model_merged.onnx | Merged decoder for efficient inference |
| *_int8.onnx | INT8 quantized versions |
| *_uint8.onnx | UINT8 quantized versions |

## Acknowledgments

- Original model by [OpenAI](https://github.com/openai/whisper)
- ONNX conversion via [Hugging Face Optimum](https://github.com/huggingface/optimum)
- Inspired by [onnx-community](https://huggingface.co/onnx-community)
