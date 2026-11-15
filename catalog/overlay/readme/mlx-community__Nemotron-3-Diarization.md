# Nemotron 3 Diarization (MLX)

Converted from [nvidia/Nemotron-3-Diarization](https://huggingface.co/nvidia/Nemotron-3-Diarization) for use with [mlx-audio](https://github.com/Blaizzy/mlx-audio).

It predicts up to eight speakers at 10 ms resolution from 16 kHz mono audio.

```python
from mlx_audio.vad import load

model = load("mlx-community/Nemotron-3-Diarization", strict=True)
result = model.generate("meeting.wav")
print(result.text)

# Incremental results retain speaker identities through the AOSC and FIFO.
for result in model.generate_stream("meeting.wav"):
    for segment in result.segments:
        print(segment.start, segment.end, segment.speaker)
```

For live PCM input, call `model.feed(chunk, state)` with a state from
`model.init_streaming_state()` and 16 kHz mono chunks. Flush the final partial
chunk and lookahead with `model.feed([], state, final=True)`. Timestamps are
absolute within the recording. Labels are generic arrival-order speaker IDs;
the model does not identify people. Overlapping speakers may be active together.

Consult the [upstream model card](https://huggingface.co/nvidia/Nemotron-3-Diarization)
for training data, evaluation and license information.
