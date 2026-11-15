> This is a Transformers.js-ready ONNX conversion of the original Hugging Face model [gradium/phonon-31m-en](https://huggingface.co/gradium/phonon-31m-en).
> The original model card content follows below.

## Usage with Transformers.js

Native Phonon support (the `text-to-speech` pipeline below) comes with the
Transformers.js release that includes
[huggingface/transformers.js#1811](https://github.com/huggingface/transformers.js/pull/1811).
On Transformers.js 4.2.0, use the snippet under "Streaming without the pipeline".

```js
import { pipeline } from "@huggingface/transformers";

const tts = await pipeline("text-to-speech", "onnx-community/phonon-31m-en-ONNX", { dtype: "q4" });
// Any voice from "Available voices" below, as a URL, a Float32Array or a Tensor.
const speaker_embeddings = "https://huggingface.co/onnx-community/phonon-31m-en-ONNX/resolve/main/voices/LMDIYE0Oa377Qh6Z.bin";
const audio = await tts("Hello from Phonon!", { speaker_embeddings });
await audio.save("phonon.wav");
```

A voice URL is downloaded on every call. To speak several texts, load the voice
once and pass the `Float32Array` instead. To receive audio chunk by chunk (each chunk is
one or more whole sentences, up to about 50 tokens), call the model directly:

```js
import { AutoProcessor, GradiumPhononTTSForConditionalGeneration, Tensor } from "@huggingface/transformers";

const id = "onnx-community/phonon-31m-en-ONNX";
const processor = await AutoProcessor.from_pretrained(id);
const model = await GradiumPhononTTSForConditionalGeneration.from_pretrained(id, { dtype: "q4" });
const data = new Float32Array(await (await fetch(`https://huggingface.co/${id}/resolve/main/voices/default.bin`)).arrayBuffer());
const speaker_embeddings = new Tensor("float32", data, [1, 512, data.length / 512]);
const chunks = await processor("Hello from Phonon. This is the second sentence.");
for await (const pcm of model.generate_speech({ chunks, speaker_embeddings })) {
  console.log(pcm.length); // mono 24 kHz samples, one text chunk at a time
}
```

### How it works

Phonon runs as two graphs. `flow_lm` is a causal transformer that is
prompted with a voice and then the text, and emits one 32-dim latent per 80 ms
frame, plus an end-of-speech logit. `mimi_decoder` turns latents into
1920 samples of 24 kHz audio each. Both graphs expose all their state
(key/value caches, convolution context) as `past*` inputs and `present*`
outputs; feed every output back under its `past` name on the next call.

The decoder takes any number of latents per call. The pipeline and
`generate_speech` run the flow model to the end of a text chunk and then decode
all of its latents in one call from an empty decoder state. The streaming
snippet below decodes each latent as soon as it exists, so playback can start
after the first 80 ms frame. Both give the same number of samples and the same
audio up to rounding: above 120 dB SNR for fp32 and q4, and at least 45 dB for
q4f16.

| `dtype` | `flow_lm` | `mimi_decoder` | Download |
|---|---|---|---:|
| `fp32` | `flow_lm.onnx` | `mimi_decoder.onnx` (fp32) | 161 MB |
| `q4` | `flow_lm_q4.onnx` (4-bit weights) | `mimi_decoder_q4.onnx` (fp32) | 67 MB |
| `q4f16` | `flow_lm_q4f16.onnx` (4-bit weights, fp16) | `mimi_decoder_q4f16.onnx` (fp16) | 41 MB |

Both graphs use the same `dtype`. The decoder's file suffix names the variant it
belongs to, not its precision: the decoder is not 4-bit quantized in any variant,
because 4-bit weights audibly degrade its audio. `mimi_decoder_q4.onnx` is a copy
of the fp32 `mimi_decoder.onnx`, and `mimi_decoder_q4f16.onnx` (with
`mimi_decoder_q4f16.onnx_data`) is the fp16 decoder. `mimi_decoder_fp16.onnx` is
the same fp16 graph under its older name, kept so existing code keeps working.

All three run several times faster than real time in the browser. Seconds of
compute per second of audio on an Apple M3 Max in Chrome, decoding per chunk
(as the pipeline does) and per frame (as the streaming snippet does):

| `dtype` | WebGPU, per chunk | WebGPU, per frame | WASM, per chunk | WASM, per frame |
|---|---:|---:|---:|---:|
| `fp32` | 0.07 | 0.11 | 0.08 | 0.10 |
| `q4` | 0.05 | 0.10 | 0.17 | 0.19 |
| `q4f16` | 0.05 | 0.09 | 0.20 | 0.23 |

Use `q4f16` or `q4` on WebGPU and `fp32` on WASM (or `q4` for a smaller
download). WASM runs 4-bit matrix products slower than full precision for a
model this size. On WebGPU, keep the state that is fed back into the graphs on
the GPU, as the snippet below does (`preferredOutputLocation`); copying it to
the CPU after every frame made WebGPU about three times slower. The figures were
measured with this repository's runtime on the same graphs, not with the
Transformers.js pipeline itself. fp32 output matches the
reference Rust runtime (`ptts`) sample for sample (above 70 dB SNR at
temperature 0). The quantized variants sample slightly different but equally
intelligible speech: Whisper transcribed all of them identically to fp32 on a
12-sentence test set.

### Streaming without the pipeline

This snippet runs on Transformers.js 4.2.0 and yields audio frame by frame.

```js
import { AutoConfig, AutoTokenizer, PreTrainedModel, Tensor } from "@huggingface/transformers";

const repo = "onnx-community/phonon-31m-en-ONNX";
const device = "webgpu"; // or "wasm"
const dtype = device === "webgpu" ? "q4f16" : "fp32"; // both graphs use the same one
const config = await AutoConfig.from_pretrained(repo);
const cfg = config.phonon;

// On WebGPU, keep every output that only goes back into a graph (caches, latent) on the GPU.
const onGpu = (names) => (device === "webgpu" ? { session_options: { preferredOutputLocation: Object.fromEntries(names.map((n) => [n, "gpu-buffer"])) } } : {});
const caches = ({ num_layers }) => Array.from({ length: num_layers }, (_, i) => [`present.${i}.key`, `present.${i}.value`]).flat();
const convStates = Object.keys(cfg.mimi_decoder.conv_states).map((name) => name.replace("past_", "present_"));
const tokenizer = await AutoTokenizer.from_pretrained(repo);
const flow = await PreTrainedModel.from_pretrained(repo, { config, model_file_name: "flow_lm", dtype, device, ...onGpu(["latent_out", ...caches(cfg.flow_lm)]) });
const mimi = await PreTrainedModel.from_pretrained(repo, { config, model_file_name: "mimi_decoder", dtype, device, ...onGpu([...caches(cfg.mimi_decoder), ...convStates]) });

// The tokenizer is Unigram with byte fallback, which Transformers.js does not apply
// yet: expand pieces missing from the vocabulary into their <0xXX> byte tokens.
const unigram = tokenizer._tokenizer.model;
if (!unigram.byte_fallback) {
  const encodePieces = unigram.encode.bind(unigram);
  unigram.encode = (tokens) => encodePieces(tokens).flatMap((piece) => {
    if (unigram.tokens_to_ids.has(piece)) return [piece];
    const bytes = Array.from(new TextEncoder().encode(piece), (b) => `<0x${b.toString(16).toUpperCase().padStart(2, "0")}>`);
    return bytes.every((b) => unigram.tokens_to_ids.has(b)) ? bytes : [piece];
  });
}

const f32 = (dims, data) => new Tensor("float32", data ?? new Float32Array(dims.reduce((a, b) => a * b, 1)), dims);
const i64 = (values, dims) => new Tensor("int64", BigInt64Array.from(values, BigInt), dims);
const emptyCache = ({ num_layers, num_heads, head_dim }) => Object.fromEntries(
  Array.from({ length: num_layers }, (_, i) => ["key", "value"].map((k) => [`past_key_values.${i}.${k}`, f32([1, num_heads, 0, head_dim])])).flat());
const nextState = (outputs) => Object.fromEntries(Object.entries(outputs)
  .filter(([name]) => name.startsWith("present"))
  .map(([name, value]) => [name.replace("present.", "past_key_values.").replace("present_", "past_"), value]));
// GPU tensors are not garbage collected: free each state once the next one replaces it.
const release = (...states) => states.forEach((state) => Object.values(state).forEach((t) => t.location === "gpu-buffer" && t.dispose()));

// A voice is raw little-endian float32 data in [1, 512, frames] order. voices/ has all of
// them (see "Available voices" below); voices/default.bin is the original model's default voice.
const voiceData = new Float32Array(await (await fetch(`https://huggingface.co/${repo}/resolve/main/voices/default.bin`)).arrayBuffer());
const voice = f32([1, cfg.voice_dim, voiceData.length / cfg.voice_dim], voiceData);

const runFlow = (past, { text = [], voiceLatents = f32([1, cfg.voice_dim, 0]), latent = f32([1, 0, cfg.latent_dim]), noise = f32([1, cfg.latent_dim]) }) =>
  flow({ text_ids: i64(text, [1, text.length]), voice_latents: voiceLatents, latent, noise, num_speakers: i64([1], [1]), duration_delta: f32([1]), ...past });

// Prompt the voice once; every sentence starts from this state.
const voiceState = nextState(await runFlow(emptyCache(cfg.flow_lm), { voiceLatents: voice }));

// Yields one Float32Array of 24 kHz audio per 80 ms frame. Keep each call to about one
// sentence (at most 50 tokens) and call it per sentence for longer text.
async function* speak(sentence, temperature = cfg.temperature) {
  let text = sentence.trim().replace(/\s+/g, " ");
  text = text[0].toUpperCase() + text.slice(1) + (/[\p{L}\p{N}]$/u.test(text) ? "." : "");
  const ids = tokenizer.encode(text, { add_special_tokens: false });
  let state = nextState(await runFlow(voiceState, { text: ids }));
  let codec = { past_offset: i64([0], [1]), ...emptyCache(cfg.mimi_decoder) };
  for (const [name, dims] of Object.entries(cfg.mimi_decoder.conv_states)) codec[name] = f32(dims);
  let latent = f32([1, 1, cfg.latent_dim], new Float32Array(cfg.latent_dim).fill(NaN)); // NaN = start
  const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  let countdown = null;
  try {
    for (let frame = 0; frame < Math.ceil((ids.length / 3 + 2) * cfg.frame_rate); frame++) {
      const noise = f32([1, cfg.latent_dim], Float32Array.from({ length: cfg.latent_dim }, () => randn() * Math.sqrt(temperature)));
      const step = await runFlow(state, { latent, noise });
      release(state, { latent });
      [state, latent] = [nextState(step), step.latent_out];
      const decoded = await mimi({ latent, ...codec });
      release(codec);
      codec = nextState(decoded);
      yield decoded.audio.data;
      // Stop a few frames after the end-of-speech logit crosses the threshold.
      if (countdown === null && step.eos_logit.data[0] > cfg.eos_threshold) countdown = text.split(" ").length <= 4 ? 3 : 1;
      if (countdown !== null && countdown-- === 0) break;
    }
  } finally {
    release(state, codec, { latent });
  }
}

const chunks = [];
for await (const pcm of speak("Hello from Phonon, running in Transformers.js.")) chunks.push(pcm); // or play each chunk as it arrives
const audio = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
chunks.reduce((offset, c) => (audio.set(c, offset), offset + c.length), 0);
```

Notes:

- `temperature` (default 0.3) scales the sampling noise; 0 gives deterministic output.
- Each call to `speak` resets the codec, so successive sentences join cleanly. The
  voice prompt is computed once and reused, not recomputed per sentence.
- This model has no audio encoder, so it cannot clone a voice from a recording. It
  uses precomputed voice embeddings: the 102 voices listed under "Available voices" below.
- The tokenizer prepares text the way the Python runtime does: it collapses
  whitespace, capitalizes the first letter, adds a final period, and folds
  typographic quotes, dashes and accented letters outside the model's
  alphabet. The Rust and Python runtimes also spell out currency, e-mail
  addresses and other symbols before tokenizing; this repo does not. Digits,
  times, percentages and phone numbers are read correctly without it, but
  `€5.50` comes out in dollars and the `@` of an address is skipped. Spell such
  symbols out ("5 euros 50", "at") for best results.
- `num_speakers` (index into `["0", "1", "2"]`, default `1`, the value the
  original runtime uses) and `duration_delta` (default `0.0`) are the checkpoint's
  conditioning inputs.
- Output is raw PCM. The Python processor's trailing-silence post-processing is
  not applied.

### Export details

The graphs were exported from
[`gradium/phonon-31m-en`](https://huggingface.co/gradium/phonon-31m-en) at
revision `52433c46975bfa13144c56204c9f4ee1c5b148aa`, which `config.json` also
records under `phonon.source`. All graphs have producer `pytorch` 2.13.0, IR
version 8 and ONNX opset 18. The 4-bit flow graphs also import the
`com.microsoft` opset (version 1) for `MatMulNBits`.

| Graph | Precision | External data file |
|---|---|---|
| `flow_lm.onnx` | fp32 | none |
| `flow_lm_q4.onnx` | 4-bit weights, fp32 activations | `flow_lm_q4.onnx_data` |
| `flow_lm_q4f16.onnx` | 4-bit weights, fp16 | `flow_lm_q4f16.onnx_data` |
| `mimi_decoder.onnx` | fp32 | none |
| `mimi_decoder_q4.onnx` | fp32 (copy of `mimi_decoder.onnx`) | none |
| `mimi_decoder_q4f16.onnx` | fp16 | `mimi_decoder_q4f16.onnx_data` |
| `mimi_decoder_fp16.onnx` | fp16 (same graph, older name) | `mimi_decoder_fp16.onnx_data` |

### Validation scope

- fp32 output was compared numerically with the reference Rust runtime (above
  70 dB SNR at temperature 0). The quantized variants were checked by
  transcription, not sample for sample.
- The speed figures above are from Chrome on an Apple M3 Max, using WASM and
  WebGPU. Other browsers, devices and WebNN have not been measured.
- WebGPU fp16 needs the `shader-f16` feature. Where it is missing, use `fp32` or
  `q4`.

## Available voices

Each file in `voices/` is one voice: raw little-endian float32 data in
`[1, 512, frames]` order (here 125 frames, 256 000 bytes). Pass its URL or a
`Float32Array` of it as the voice. `voices/default.bin` is the voice the
original runtime uses by default.

All 102 voices of [gradium/phonon-voices](https://huggingface.co/gradium/phonon-voices) (Apache 2.0, revision [`0ee17205`](https://huggingface.co/gradium/phonon-voices/tree/0ee17205f254b5abc43b266c8a0f215565c352f7)), converted to the raw format above. The voice's language is the language it was designed in; this model always speaks English. Audio samples of every voice are on [gradium/phonon-voices](https://huggingface.co/gradium/phonon-voices). `voices/voices.jsonl` lists the same voices with their metadata.

### English (US)

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Zoey | `voices/NbpkqMVS3CJeq2j8.bin` | female | Adult | Playful, upbeat and Gen Z energy voice with a standard American accent. Perfect for engaging conversations! |
| Juniper | `voices/NIWIOv5vTi5eRMj8.bin` | female | Young Adult | Cheerful presence with real resonance under it, personable when the copy turns intimate and decisive on the final line. |
| Everly | `voices/vjFyp2BcCyTlUmYb.bin` | female | Middle-age | Rounded, soft-edged tone with gentle lift at the end of phrases and an easy, relaxed delivery. |
| Harper | `voices/4SZHfMpw-p46Ywgs.bin` | female | Adult | Modern, confident and friendly voice with a standard American accent. |
| Hadley | `voices/bXwrkHhURL1VFJdG.bin` | female | Middle-age | Settled, even-toned and genuinely kind, with crisp consonants that hold up over a handset. |
| Delia | `voices/nGzMHMPAWGaJFHOo.bin` | female | Middle-age | Low, grounded and quick to the point, with a sincerity that keeps an apology honest. |
| Easton | `voices/LMDIYE0Oa377Qh6Z.bin` | male | Young Adult | Punchy and close in, with crisp consonant attack that cuts through a music bed and pitch that lifts across each line. |
| Micah | `voices/40QrMVgAxFiUnP9f.bin` | male | Young Adult | Buoyant and high in energy, with a playful lift at the ends of phrases and clean attack that survives a loud mix. |
| Trevor | `voices/0zLApsZfVLLNaEGl.bin` | male | Middle-age | Buoyant energy over a resonant mid-low core, phrases landing softly and consonants cutting through a handset. |
| Russell | `voices/_6Aslh2DxfmnRLmP.bin` | male | Adult | A high-energy American adult voice that pushes and encourages with the intensity of someone who genuinely believes in you. |
| Preston | `voices/qIxlZ7Ei8KvWlyQH.bin` | male | Middle-age | Trim, focused delivery with clean edges on every consonant and a steady, low-set core that carries through phone bandwidth. |
| Miles | `voices/d9XCyhjo4JhkHF1d.bin` | male | Young Adult | Resonant and decisive, with genuine dynamic range, dropping right down for one clause then driving back up. |

### English (UK)

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Maeve | `voices/6PWnV0Nq4wu7RVBT.bin` | female | Adult | A sparky, attentive British English adult voice that gets to the point with a smile. Ideal for fast, efficient customer support and helpful voice assistants. |
| Freya | `voices/GgfEkEJtxZR7gnpy.bin` | female | Young | A young British voice, glossy and confident with fast, girly chatter and bubbly sparkle, perfect for a friendly receptionist or assistant. |
| Pippa | `voices/uem82D50GRv2Dwma.bin` | female | Adult | A confident, upbeat British English adult voice with infectious energy. Perfect for proactive assistants and motivating customer success calls. |
| Elodie-Rose | `voices/y9bQqIDnyxwqK01t.bin` | female | Young | A young British voice with sharp, enthusiastic energy and crisp articulation, sparky and to the point for customer support and care. |
| Imogen | `voices/gDT1nz7Ie36ZhL-C.bin` | female | Adult | A bubbly, friendly British English adult voice that puts callers instantly at ease. Great for onboarding assistants and warm concierge interactions. |
| Lottie | `voices/m9MxpY6IUGXtWp76.bin` | female | Young Adult | Sparky and to the point, high forward energy with clean edges on the consonants and the range to drop low for one line then climb back. |
| Alfie | `voices/X6NceqF285Gr04gb.bin` | male | Young Adult | Punchy and forward, with crisp consonant attack and a pitch that lifts across a line, sitting high over a music bed. |
| Hugh | `voices/YyKcxPG7iIgS3jsK.bin` | male | Middle-age | Soft and close, airy in texture, with lively pitch movement and an attentive, sincere delivery. |
| Edwin | `voices/zUCxzrOrugTSis03.bin` | male | Middle-age | Efficient and firm, sincere in attention, with tidy articulation that holds up at phone bandwidth. |
| Spencer | `voices/JOW0vchyswkQUMDS.bin` | male | Middle-age | Light and airy, sitting a touch higher, with crisp consonants and a slow, patient delivery. |
| Toby | `voices/dME3IWyZBvmh1n1q.bin` | male | Adult | A sparky, attentive British English adult voice that gets to the point with a smile. Ideal for fast, efficient customer support and helpful voice assistants. |
| Teddy | `voices/Zn7g6NxLqXlJb7Qi.bin` | male | Young Adult | Sparky and close in, quick off the mark, with firm consonants and the range to drop right down for a clause then come back up. |
| Bryony | `voices/gfP44RlHwr2kEwk7.bin` | female | Middle-age | Full, rich mid-range tones, softly relaxed and spoken close to the mic, moving briskly with light pitch play. |

### English characters

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Captain Silas Blackwater | `voices/xPDpsV3F592srkjA.bin` |  |  | An old British pirate captain from the West Country, around sixty. Deep, gravelly and booming, rolling his Rs, salt-cracked from decades of shouting over gales. Roguish and hearty, with a wicked chuckle under every boast. |
| Morwenna of the Deep | `voices/nOykTmcH9ydsGGIc.bin` |  |  | A sultry, seductive woman in her thirties. Low, husky alto, close to the microphone and almost whispered, slow and languid, purring, with a warm knowing smile in every word. Intimate, flirtatious and teasing, like a late-night torch singer luring someone closer, with a hint of danger underneath. |
| Old Mortlake | `voices/lX3LavMNdlIbgEHH.bin` |  |  | An elderly gravedigger in a Victorian churchyard. Low, raspy and half whispered, melancholic, with heavy pauses that let every word settle like dirt on a coffin lid. |
| Azgorath | `voices/dGyGDKo2osj7h3s7.bin` |  |  | An enormous ancient demon. A cavernous, impossibly deep bass voice that rumbles like stone grinding in a crypt, with a dry rasping edge and a faint hiss on every s. Calm, slow and amused, never shouting, every syllable set down deliberately, menace held under perfect control. |
| Fennick the Young Elf | `voices/cXoIXJ2llS8S0WOW.bin` |  |  | A curious, kind-hearted elf boy of about ten. A natural child's voice in a warm, soft middle range, never squeaky or shrill, earnest and wide-eyed, a little breathless with excitement, speaking quickly when amazed. Clean, close studio recording with no background noise or hiss. |
| The Thing Under the Stairs | `voices/GXaSqMEmOg12OIYb.bin` |  |  | A monstrous creature lurking in the dark. Gravelly, breathy and pitched near the floor, a threatening growl that stays quiet to stay frightening, with a slow mocking sneer. |
| Vyrmathrax the Ancient | `voices/xO8xQo3BrB8FuI6J.bin` |  |  | An ancient dragon, thousands of years old. Very low and resonant, deep chest weight with gravel at the bottom of the register, slow and controlled with long pauses, dry and offhand, with the flat calm of something far too old to be impressed. |
| Grub the Ogre | `voices/cYtsRSxV5q9IMehn.bin` |  |  | A big, good-natured ogre who lives under a bridge. Gruff and grainy, rumbling low end, heavy chest resonance, slow lumbering rhythm with loose rounded words, and warm humour sitting just under the grumble. |
| Master Aldric | `voices/gSgG5Tor0GPEnqzC.bin` |  |  | A wise old British wizard, around eighty. Rich and resonant with an aged grain, warm and kindly, deliberate pace with weighted pauses before the words that matter, able to rise into a ringing incantation. |
| The Snow Queen | `voices/NIWoEurJHMJjyUTe.bin` |  |  | A regal, cold-hearted queen of ice. A cool, crystalline mezzo voice, poised and elegant, precise articulation, unhurried and quietly commanding, with an enigmatic chill and a faint smile that never warms. |
| Sir Bramwell | `voices/y2eiKxtQo2B67deU.bin` |  |  | A brave but pompous English knight, middle-aged. Booming, plummy and theatrical, full of puffed-up self-importance, rolling grand phrases, with a comic wobble of nerves showing through the bravado. |
| Fairy Godmother | `voices/QXNr0SvkukLB4wPq.bin` |  |  | A kind fairy godmother, an older woman in her sixties. A low, warm, velvety alto voice, cosy and grandmotherly, unhurried and soothing, with a soft rich chuckle and a twinkle in every word. Gentle and reassuring, never high, never thin. |

### French

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Noémie | `voices/FXxJ9mANRq6BCTX5.bin` | female | Young | A young Parisian voice, warm and expressive with a quick playful pace and delicate high notes, a care specialist who stays bright and witty. |
| Coralie | `voices/ZeSg853xFACESHHI.bin` | female | Young | A young Parisian voice, sweet and airy with fast, giggly girly charm, a bubbly assistant who makes every interaction feel light. |
| Tiphaine | `voices/0fvH6XAKvA748v2v.bin` | female | Middle-age | Rounded, low-set tone with even phrasing and consonants that stay crisp through a handset. |
| Maëlys | `voices/s048cR1l2Jmu4k3B.bin` | female | Young | A young French voice, energetic and enthusiastic with a welcoming, upbeat delivery, sparky and to the point for responsive support. |
| Orianne | `voices/TUk4X11S6UytB3G6.bin` | female | Middle-age | Airy and higher-set, gently buoyant, with sincerity that holds through an apology. |
| Solène | `voices/YhIHaAfQ0cQPDV9R.bin` | female | Young | A young French voice, bright and high-pitched, warm and enthusiastic at a lively pace, a receptionist who greets everyone with delight. |
| Augustin | `voices/Tek4tJXiX6_yvXq7.bin` | male | Adult | A curious, animated French adult voice that lights up when sharing an unexpected fact. Perfect for geeky explainers and trivia-driven dialogue. |
| Arnaud | `voices/aXMVwiUhITMrwPzd.bin` | male | Middle-age | Low and firm, quick to the point, consonants holding their shape at phone bandwidth. |
| Jules | `voices/YKeBw3OV1RgpdhLh.bin` | male | Adult | A lively, expressive French adult voice that lights up around topics it loves. Great for animated recommendations and high-energy dialogue. |
| Baptiste | `voices/rqqeErpASHVQXHDd.bin` | male | Middle-age | Lively and expressive, with pitch that lifts and dips across a phrase and a playful edge to every line. |
| Lucien | `voices/LIv4NaG8ay4Mhqtd.bin` | male | Middle-age | Rounded and settled, phrases landing softly, with an apology that sounds genuinely meant and good news that sounds like good news. |
| Marius | `voices/biuhvu17TxVKOcyy.bin` | male | Adult | An energetic, well-poised French adult voice with the confident assurance of a natural closer. Ideal for sales pitches and high-conviction content. |
| Ninon | `voices/qtPlUYAZ4EJDuWMm.bin` | female | Middle-age | Pitch that moves across a sentence, a rounded mid tone and a sense of humour kept well in check. |
| Lilou | `voices/4iKxBtHBRzr1YOph.bin` | female | Young | A young Parisian voice, buoyant and tender with rippling laughter, a light-hearted support voice that smiles while it helps. |
| Hélène | `voices/Vvakv7iWZCUrBooR.bin` | female | Older Adult | Deep and resonant, carrying authority through steadiness rather than volume, with diction that survives raised playback speed. |

### German

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Nele | `voices/2A2fFf8SkDEJ8nzx.bin` | female | Middle-age | Rounded, open tone with gentle lift at the ends of phrases and an easy, flowing rhythm. |
| Jette | `voices/4Mn9VfG2wsLLEzi5.bin` | female | Young | An upbeat young German voice with a light girlish tone and warm bounce, a chipper assistant who keeps things moving with a smile. |
| Annika | `voices/p6Uutkyi3j2iNAUu.bin` | female | Adult | A sparky, attentive German adult voice that gets to the point with a smile. Ideal for fast, efficient customer support and helpful voice assistants. |
| Jule | `voices/MxhgvuHuUER7qjmL.bin` | female | Young Adult | Open and cheerful, sitting high and close over music, with an airy lift that softens where the copy turns personal. |
| Lotta | `voices/MOrDPn052KUlnKXk.bin` | female | Young Adult | High forward energy with a close, present tone and crisp consonant attack that cuts through a music bed, plus real lift on the punchline. |
| Josefine | `voices/yadpmqsHVrYC0NJp.bin` | female | Middle-age | Rounded and even in tone, sincere at the phrase ends, with consonants that hold up over a handset. |
| Anton | `voices/3ZKKapPOvuWFcw9f.bin` | male | Adult | A vibrant, engaging German adult voice that makes every explanation feel personal. Built for product guides and walk-through assistants. |
| Mirko | `voices/Xn9xDzqSSr4xGTNg.bin` | male | Young Adult | Punchy and close-miked in feel, with hard edges on the consonants and a decisive drop on the final line. |
| Mats | `voices/Kf5m22mROozoMWj3.bin` | male | Adult | A sparky, attentive German adult voice that gets to the point with a smile. Ideal for fast, efficient customer support and helpful voice assistants. |
| Henrik | `voices/yyS1KYWs6mXoEw7D.bin` | male | Adult | An easy-going, friendly German adult voice that puts callers instantly at ease. Great for onboarding assistants and warm concierge interactions. |
| Leon | `voices/20zdyYrQPzKlCwkk.bin` | male | Adult | A bright, welcoming German adult voice with the warmth of a great receptionist. Perfect for greeting customers and friendly front-line support. |
| Mika | `voices/R3uU1GTAZJotUhUs.bin` | male | Young Adult | Punchy and to the point, with a firm, resonant core, clean word endings and real snap between loud and quiet. |
| Svea | `voices/Adoh4wA9tp5QXJi9.bin` | female | Young Adult | Sparky and to the point, with clean consonant edges, brisk rhythm and a decisive drop on the final line. |

### Spanish (Spain)

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Noa | `voices/b6FvJAiokjdqIti4.bin` | female | Young | A glossy, confident young Castilian Spanish voice with fast, girly charm and warmth, a bubbly assistant that makes every chat sparkle. |
| Lucía-Sol | `voices/3p0eIGbkmny71GlA.bin` | female | Young | A bouncy, chipper young Castilian Spanish voice with a cute upward lilt, bringing playful energy to friendly reception and support. |
| Candela | `voices/c9wqBDmQiBie5q6Y.bin` | female | Young | An enthusiastic, bubbly young Castilian Spanish voice, animated like a beauty guru mid-tutorial, adding fun energy to customer care. |
| Celia | `voices/rmLBOdHrfkFym9MM.bin` | female | Young Adult | Sparky and forward, light on the air but firm on every consonant, landing the final line without pushing. |
| Alba | `voices/u2UscyAnHilpiwmf.bin` | female | Young | A sweet, expressive young Castilian Spanish voice, soft and girly with lively emphasis, sparky and to the point for efficient support. |
| Alicia | `voices/4701YgRXjkBcg6sL.bin` | female | Middle-age | Rounded and softly resonant, settling low in the range, with phrases that land gently and an apology that sounds genuinely meant. |
| Marcos | `voices/jvPx8j8zLGQ3utZz.bin` | male | Adult | A confident, upbeat Peninsular Spanish adult voice with infectious energy. Perfect for proactive assistants and motivating customer success calls. |
| Borja | `voices/tIjCgP8v3RY8UpgM.bin` | male | Young Adult | Resonant and punchy, driving a rhythmic read that cuts over a loud music bed and lands squarely on the brand name. |
| Iker | `voices/t-_TS1e-0GzDAX02.bin` | male | Adult | An easy-going, friendly Peninsular Spanish adult voice that puts callers instantly at ease. Great for onboarding assistants and warm concierge interactions. |
| Nuno | `voices/fghJGlv90qu8OJ36.bin` | male | Middle-age | Resonant and easy-going, with a relaxed mid-range delivery and a hint of playful lift at the end of phrases. |
| Izan | `voices/Ejb29qHnSOK0cIHY.bin` | male | Young Adult | Crisp consonant attack, forward energy and a punchy delivery that sits on top of a music bed. |
| Guillermo | `voices/FaLVVqpFQcDOtq45.bin` | male | Middle-age | Low and resonant, settled in tone, with phrases that land softly and an apology that sounds genuinely meant. |
| Nerea | `voices/EQcQFGkYfMn5YJgx.bin` | female | Middle-age | Rounded, lightly resonant tone with gentle lift at the end of phrases and an even, relaxed delivery. |

### Spanish (Mexico)

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Rebeca | `voices/Sx8m6WdXBG06zwZT.bin` | female | Young Adult | Fuller and grounded in the low end, with hard consonant edges and a decisive punch saved for the brand name. |
| Regina | `voices/s58clrg2fe0MO7Y-.bin` | female | Adult | A confident, upbeat Mexican Spanish adult voice with the natural assurance of a closer. Ideal for proactive assistants and sales-led customer interactions. |
| Danae | `voices/evfxKSxpDIhmsNoq.bin` | female | Young Adult | Sparky and punchy, with a light, airy top end, clean attack on every word and a brisk rhythm that lands the brand name. |
| Azucena | `voices/KJpIQlbYrZPA4aLq.bin` | female | Older Adult | Weighted lower register with steady authority that comes from calm rather than volume, and diction that survives raised playback speed. |
| Jimena | `voices/qG5BXOJYrKEnXLIX.bin` | female | Young Adult | Crisp consonant attack and a forward, sparky delivery that sits over a music bed, with pitch that lifts and drops inside a single line. |
| Ximena | `voices/VDwnGxAo68C8U8vC.bin` | female | Adult | A playful, expressive Mexican Spanish adult voice that turns everyday moments into stories. Great for engaging assistants and personable conversational AI. |
| Lalo | `voices/F05gqkzX7WhKVpSL.bin` | male | Young Adult | Fuller and rounder low end, concise phrasing and a decisive drop on the last line, with range to pull back for one clause and push again. |
| Aldo | `voices/ax7dW1XB0eiMfHgO.bin` | male | Young Adult | Forward, close-miked energy with crisp consonant attack and pitch that climbs and drops across a line. |
| Yael | `voices/ALczEazoF4n6PmGl.bin` | male | Young Adult | Close, ringing tone with a grin in it, dropping right down for one clause then climbing into the payoff. |
| Ulises | `voices/G5HLUsQd659UtRe7.bin` | male | Middle-age | Low and resonant, with a settled delivery and consonants that survive a handset. |
| Leonel | `voices/BkuASiOJRrJEB5qA.bin` | male | Middle-age | Velvety and even tempered, sincere when an apology is due and genuinely pleased when the news is good. |
| Nico | `voices/PwgPEaweQILZdGc4.bin` | male | Young Adult | Sparky and to the point, with clean articulation that cuts through a loud music bed and a brisk rhythm that follows the copy's beats. |

### Portuguese (Brazil)

| Voice | File | Gender | Age | Description |
|---|---|---|---|---|
| Manuela-Lu | `voices/KgC2Nqnjj48NUiyV.bin` | female | Young | A bright, sweet, chirpy young voice with breathless excitement and a constant smile, a warm receptionist who greets everyone like a friend. |
| Isadora | `voices/CtNvKUUMrx1h56ih.bin` | female | Young | An upbeat young voice with a light girlish tone and warm bounce, quick and to the point, ideal for efficient, caring customer service. |
| Débora | `voices/K8mj96kYHMy8q3Hb.bin` | female | Middle-age | Low-set and resonant, with firm even phrasing and short decisive sentences. |
| Rafaela | `voices/6k6cRt7QJfm5ChrH.bin` | female | Young | A spirited young voice with bell-like clarity and joyful bounce, narrating like the best sleepover ever, a light, fun personal assistant. |
| Clarice | `voices/sGCMzFIA53ppIngM.bin` | female | Older Adult | Quiet authority in a deep, resonant lower range, even in dynamics and firm at the end of every sentence. |
| Flávia | `voices/gOc90Rjmv5CobHCj.bin` | female | Middle-age | Compact, resonant timbre with crisp consonants and focused, forward phrasing. |
| Davi | `voices/NuUr_x5V90hSHzCJ.bin` | male | Adult | A confident, upbeat Brazilian Portuguese adult voice with infectious energy. Perfect for proactive assistants and motivating customer success calls. |
| Igor | `voices/l7520SIXi14iEamd.bin` | male | Middle-age | Lifted and lively, pitch moving across a phrase, articulation quick and tidy. |
| Kauã | `voices/6HftnVU1XqVBJS8t.bin` | male | Young Adult | Sparky and close, with clean attack, brisk rhythm and a decisive push on the final clause that cuts over a loud music bed. |
| Vitor | `voices/mWgyMRkFED70QxQv.bin` | male | Middle-age | Lean and focused, with light pitch movement and a tidy rhythm that stays on point. |
| Otávio | `voices/JYtmeaysoaR0Wybf.bin` | male | Older Adult | Low, chest-resonant and settled, with even dynamics and real pauses that hold a paragraph together. |
| Marcelo | `voices/qDeAnE4L4bk0BRz1.bin` | male | Middle-age | Low and grounded, consonants firm, phrases short and sure of themselves. |

---

## Original model card

# phonon-31m English

**High-quality Text-to-Speech, on your device.**

phonon-31m is a text-to-speech model from the Phonon family.
It turns text into natural 24 kHz speech in English.
It streams audio while it is still generating, and it is small enough to run
in a browser tab, on a phone, or on a laptop CPU.

Phonon builds on [Pocket TTS](https://github.com/kyutai-labs/pocket-tts) and
the Mimi codec, developed by Kyutai.

[Try it in your browser](https://huggingface.co/spaces/gradium/phonon) · [All Phonon models](https://huggingface.co/collections/gradium/phonon) · [Runtime on GitHub](https://github.com/gradium-ai/xn-ptts) · [Python](https://pypi.org/project/ptts/) · [Browser](https://www.npmjs.com/package/phonon-tts) · [Discord](https://discord.gg/T85yt8kD33)


## Model details

- **Model type:** text-to-speech. A flow-matching transformer predicts audio latents from the text one 80 ms frame at a time, and the Mimi codec's decoder turns them into audio.
- **Parameters:** 31M (excluding the audio tokenizer)
- **Weights file:** `model.q8.gguf`, 64.5 MB (8-bit quantized)
- **Languages:** English
- **Output:** mono, 24 kHz
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## The Phonon family

| Model | Parameters | q8 weights | Languages | License |
|---|---|---:|---|---|
| [phonon-31m-en](https://huggingface.co/gradium/phonon-31m-en) | 31m | 64.5 MB | English | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| [phonon-40m-en](https://huggingface.co/gradium/phonon-40m-en) | 40m | 74.6 MB | English | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [phonon-40m-fr](https://huggingface.co/gradium/phonon-40m-fr) | 40m | 74.6 MB | French | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [phonon-40m-de](https://huggingface.co/gradium/phonon-40m-de) | 40m | 74.6 MB | German | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [phonon-40m-es](https://huggingface.co/gradium/phonon-40m-es) | 40m | 74.6 MB | Spanish | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [phonon-40m-pt](https://huggingface.co/gradium/phonon-40m-pt) | 40m | 74.6 MB | Portuguese | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [phonon-40m-multilingual](https://huggingface.co/gradium/phonon-40m-multilingual) | 40m | 74.6 MB | All 5 languages | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |

All of them run on the same runtime and use the same file layout, so switching models means changing the repo ID.

## Quickstart

Every runtime names this model as `hf://gradium/phonon-31m-en`, and takes `lang`, which selects how text is normalized (numbers, symbols, dates). This model speaks English, so use `en`.

### Command line

```sh
uvx ptts --lang en --quant q8 \
  --voice en_us_Easton "Hello from Phonon." -o speech.wav
```

`uvx` runs the Python package's command without installing it. The standalone `ptts` binary from [GitHub Releases](https://github.com/gradium-ai/xn-ptts/releases) or Homebrew (`brew install gradium-ai/tap/ptts`) takes the same flags.

### Python

```sh
pip install ptts
```

```python
import ptts

tts = ptts.TTS("hf://gradium/phonon-31m-en", lang="en", quant="q8")
tts.save("speech.wav", "Hello from Phonon.", voice="en_us_Easton")

# Or stream: chunks arrive while the rest is still being generated.
with tts.stream("Speech can start playing right away.", voice="en_us_Easton") as audio:
    for pcm in audio:
        ...  # float32 chunks at audio.sample_rate
```


### Other platforms

| Platform | Guide |
|---|---|
| Python scripts and backends | [`ptts` on PyPI](https://pypi.org/project/ptts/) · [Python guide](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-pyo3/README.md) |
| Web apps, in the browser | [`phonon-tts` on npm](https://www.npmjs.com/package/phonon-tts) · [Browser guide](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md) |
| iPhone, iPad and Mac apps (Core ML) | [Swift guide](https://github.com/gradium-ai/xn-ptts/blob/main/ios/PhononTTS/README.md) |
| Android apps | [Android guide](https://github.com/gradium-ai/xn-ptts/blob/main/android/README.md) · [Snapdragon NPU preview](https://github.com/gradium-ai/xn-ptts/blob/main/qnn/android/README.md) |
| Android system voice, for TalkBack and every app that uses `TextToSpeech` | [Android TTS engine](https://github.com/gradium-ai/xn-ptts/blob/main/android/tts-engine/README.md) |
| Server with an OpenAI-compatible API (Docker) | [Server guide](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-openai-server/README.md) |
| Home Assistant | [Home Assistant setup](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-openai-server/README.md#home-assistant) |
| Streaming over WebSocket | [WebSocket server](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-ws-server/README.md) |
| Rust | [`ptts` on crates.io](https://crates.io/crates/ptts) · [Rust guide](https://github.com/gradium-ai/xn-ptts/blob/main/ptts/README.md) |
| C and C++ | [`ptts.h`](https://github.com/gradium-ai/xn-ptts/blob/main/ptts-ffi/include/ptts.h) |

## Voices

Phonon comes with a catalog of ~100 voices available in the [gradium/phonon-voices](https://huggingface.co/gradium/phonon-voices) repo.
Instant voice cloning and voice design are available through the [Gradium studio](https://studio.gradium.ai).

## Benchmarks

Phonon was compared with other open text-to-speech models on three measures, per language:

- **Elo**: human preference from blind pairwise listening tests (higher is better).
- **Hard set LLM WER**: word error rate on hard sentences full of structured data (numbers, dates, codes, units), scored with an LLM-assisted ASR comparison (lower is better).
- **Seed-TTS LLM WER**: the same metric on the Seed-TTS evaluation sentences (lower is better).

In every language, a Phonon model is first on all three measures.

**English (US)** (Elo from 468 raters, 8,290 votes)

| Model | Elo | Hard set LLM WER | Seed-TTS LLM WER |
|---|---:|---:|---:|
| **phonon-31m-en** | 2098 | **1.5%** | 0.51% |
| **phonon-40m-en** | **2117** | 2.3% | **0.45%** |
| **phonon-40m-multilingual** | 2097 | 2.0% | 0.48% |
| Kokoro | 2043 | 3.5% | **0.45%** |
| Magpie | 1939 | 28% | 0.46% |
| NeuTTS | 2034 | 8.7% | 0.62% |

**French** (Elo from 172 raters, 2,270 votes)

| Model | Elo | Hard set LLM WER | Seed-TTS LLM WER |
|---|---:|---:|---:|
| **phonon-40m-fr** | **2072** | **2.4%** | **1.3%** |
| **phonon-40m-multilingual** | 2016 | 2.7% | 1.5% |
| Kokoro | 1578 | 5.5% | 1.8% |
| Magpie | 1608 | 30% | 2.0% |
| NeuTTS | 1853 | 9.9% | 2.7% |

**German** (Elo from 168 raters, 2,220 votes)

| Model | Elo | Hard set LLM WER | Seed-TTS LLM WER |
|---|---:|---:|---:|
| **phonon-40m-de** | **2097** | **2.2%** | **0.83%** |
| **phonon-40m-multilingual** | 2046 | 2.9% | 0.90% |
| Magpie | 1640 | 29% | 1.6% |
| NeuTTS | 1768 | 9.3% | 2.6% |

**Spanish (Spain)** (Elo from 201 raters, 2,290 votes)

| Model | Elo | Hard set LLM WER | Seed-TTS LLM WER |
|---|---:|---:|---:|
| **phonon-40m-es** | **2103** | **2.1%** | **0.85%** |
| **phonon-40m-multilingual** | 2076 | 2.6% | 1.0% |
| Kokoro | 1629 | 3.8% | 0.93% |
| Magpie | 1870 | 25% | 0.92% |
| NeuTTS | 1778 | 16% | 5.1% |

**Portuguese (Brazil)** (Elo from 171 raters, 2,000 votes)

| Model | Elo | Hard set LLM WER | Seed-TTS LLM WER |
|---|---:|---:|---:|
| **phonon-40m-pt** | **2144** | **2.9%** | **1.1%** |
| **phonon-40m-multilingual** | 2048 | 3.2% | **1.1%** |
| Kokoro | 1633 | 4.1% | 1.3% |

## Intended use

Phonon is made for applications that speak on the user's device: offline and private
assistants, screen readers and other accessibility tools, games, and interactive apps that
cannot wait for a cloud round trip. It also runs as a local server with an OpenAI-compatible
API and as a voice for Home Assistant.

### Limitations

- The model speaks only the languages above. Text in other languages is read with the wrong
  pronunciation.
- Text is normalized before synthesis (numbers, currency, dates, emails and so on), and that
  step needs the right language. Choose `lang` to match the text.
- Very long inputs are split into sentences and spoken one after the other, so prosody does not
  carry across the whole text.

### Responsible use

Do not use Phonon to impersonate a real person, to deceive listeners about who is speaking, or
to clone a voice without the speaker's consent. Tell listeners when speech is synthetic where
that matters to them.

## License

The weights, tokenizer and voices in this repository are released under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0), which allows commercial use. The runtime is a separate project, licensed MIT OR Apache-2.0.
