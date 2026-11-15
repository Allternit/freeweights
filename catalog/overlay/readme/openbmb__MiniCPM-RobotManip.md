<h1 align="center">
  MiniCPM-RobotManip
</h1>

<p align="center">
  <strong>A Smarter and Faster On-Device AI Brain for Robots</strong>
</p>

<p align="center">
    <span style="display: inline-flex; align-items: center; margin-right: 2px;">
    <img src="github_logo.png" alt="github" width="15" height="15" style="margin-right: 4px;">
    <a href="https://github.com/OpenBMB/MiniCPM-Robot" target="_blank"> Github</a> &nbsp;|
    </span>
    <span style="display: inline-flex; align-items: center; margin-right: 2px;">
    <img src="discord_logo.png" alt="Discord" width="15" height="15" style="margin-right: 4px;">
    <a href="https://huggingface.co/openbmb/MiniCPM-RobotManip/resolve/main/discord.jpeg" target="_blank"> Discord</a> &nbsp;|
    </span>
</p>

<strong>MiniCPM-RobotManip</strong> is a 1.5B vision-language-action model for embodied manipulation with the following highlights:
<ul>
  <li><b>Generalist Manipulation:</b> A unified 1.5B generalist policy that <b>uses one set of weights across all downstream tasks</b> and <b>outperforms larger models such as π₀.₅ and Qwen-VLA across representative evaluations</b>.</li>
  <li><b>Streaming Context:</b> Historical observations are continuously incorporated into the model context through streaming inference, <b>reducing per-step compute from 125 TFLOPs to 3.3 TFLOPs while retaining 60 frames of history</b> and supporting <b>up to one minute of visual memory</b>. This moves VLA beyond reactive action generation from single-frame observations toward continuous decision-making grounded in long-horizon visual context.</li>
  <li><b>Efficient Inference:</b> Inherits MiniCPM-V 4.6's visual token compression, reducing each frame from 256 to 64 visual tokens for 4× compression. With H100, BF16, and single-frame input, model-forward latency per decision step is 120 ms, compared with 234 ms for π0.5. The measurement excludes task autoregressive decoding.</li>
</ul>

<p align="center">
  <img src="manip_case_en.gif" width="800" alt="MiniCPM-RobotManip task demonstrations" />
</p>

## Benchmark Results
<p align="center">
  <img src="manip_benchmark.png" width="700" alt="manip_benchmark" />
</p>

## Inference Example

Please Ensure transformers==5.7.0

<pre><code class="language-python">from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Sequence

import numpy as np
import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor


STATE_DIM = 80
IMAGE_SIZE = (448, 448)


class MiniCPMVLAInference:
    """Processor and model wrapper for single-sample VLA inference."""

    def __init__(
        self,
        checkpoint_path: str | Path = "openbmb/MiniCPM-RobotManip",
        device: str | torch.device | None = None,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        checkpoint = str(checkpoint_path)
        self.processor = AutoProcessor.from_pretrained(checkpoint, trust_remote_code=True)
        self.model = AutoModel.from_pretrained(checkpoint, trust_remote_code=True)
        self.model.to(self.device).eval()

    @staticmethod
    def _load_images(images: Sequence[str | Path | Image.Image | np.ndarray]) -> list[np.ndarray]:
        if not images:
            raise ValueError("At least one image is required")
        loaded = []
        for image in images:
            if isinstance(image, (str, Path)):
                with Image.open(image) as pil_image:
                    array = np.asarray(pil_image.convert("RGB"))
            elif isinstance(image, Image.Image):
                array = np.asarray(image.convert("RGB"))
            elif isinstance(image, np.ndarray):
                array = image
            else:
                raise TypeError(f"Unsupported image type: {type(image)!r}")
            if array.ndim != 3 or array.shape[-1] != 3:
                raise ValueError(f"Expected an HxWx3 image, got shape {array.shape}")
            # Match the training pipeline's ResizeImage(size=(448, 448)),
            # including PIL's default resize interpolation.
            resized = Image.fromarray(array).resize(IMAGE_SIZE)
            loaded.append(np.asarray(resized).copy())
        return loaded

    def preprocess(self, images: Sequence, text: str) -> dict[str, torch.Tensor]:
        """Apply the same MiniCPM-V chat template and processor as training."""
        content = [
            {"type": "image", "image": image}
            for image in self._load_images(images)
        ]
        content.append({"type": "text", "text": text})
        messages = [{"role": "user", "content": content}]
        inputs = self.processor.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_dict=True,
            return_tensors="pt",
            processor_kwargs={"padding": False},
        )
        return {
            key: value.to(self.device)
            for key, value in inputs.items()
            if isinstance(value, torch.Tensor)
        }

    def _prepare_state(self, state: torch.Tensor | np.ndarray | Sequence[float]) -> torch.Tensor:
        state = torch.as_tensor(state, dtype=torch.float32, device=self.device)
        if state.ndim == 1:
            state = state.unsqueeze(0).unsqueeze(0)
        elif state.ndim == 2:
            state = state.unsqueeze(1)
        if state.shape != (1, 1, STATE_DIM):
            raise ValueError(f"state must have shape (80,), (1, 80), or (1, 1, 80); got {tuple(state.shape)}")
        return state

    @torch.inference_mode()
    def predict(
        self,
        images: Sequence[str | Path | Image.Image | np.ndarray],
        text: str,
        state: torch.Tensor | np.ndarray | Sequence[float] | None = None,
        embodiment_id: int = 0,
        seed: int | None = None,
    ) -> torch.Tensor:
        """Return one action chunk with shape ``(30, 80)`` on CPU."""
        if not 0 <= embodiment_id < self.model.action_head.max_num_embodiments:
            raise ValueError(
                f"embodiment_id must be in [0, {self.model.action_head.max_num_embodiments - 1}]"
            )
        if state is None:
            state = torch.zeros(STATE_DIM)
        state_tensor = self._prepare_state(state)
        embodiment = torch.tensor([embodiment_id], dtype=torch.long, device=self.device)
        if seed is not None:
            torch.manual_seed(seed)
            if self.device.type == "cuda":
                torch.cuda.manual_seed_all(seed)

        vlm_inputs = self.preprocess(images, text)
        actions = self.model.predict_action(
            state=state_tensor,
            embodiment_id=embodiment,
            **vlm_inputs,
        )
        return actions[0].float().cpu()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", action="append", required=True, help="Input image; repeat for multiple views")
    parser.add_argument("--text", required=True, help="Robot instruction/prompt")
    parser.add_argument("--device", default=None, help="Default: cuda if available, otherwise cpu")
    state_group = parser.add_mutually_exclusive_group()
    state_group.add_argument("--state-file", help="A .npy file containing 80 state values")
    state_group.add_argument("--state", nargs=STATE_DIM, type=float, metavar="VALUE")
    parser.add_argument("--embodiment-id", type=int, default=0)
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--output", help="Optional output .npy path; otherwise print JSON")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.state_file:
        state = np.load(args.state_file)
    elif args.state is not None:
        state = args.state
    else:
        state = np.zeros(STATE_DIM, dtype=np.float32)

    infer_runner = MiniCPMVLAInference(
        checkpoint_path="openbmb/MiniCPM-RobotManip",
        device=args.device,
    )
    action = infer_runner.predict(
        images=args.image,
        text=args.text,
        state=state,
        embodiment_id=args.embodiment_id,
        seed=args.seed,
    )
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        np.save(output_path, action.numpy())
        print(f"Saved action {tuple(action.shape)} to {output_path}")
    else:
        print(json.dumps(action.tolist()))

</code></pre>



## Acknowledgement

<p>
  This project builds on and references
  <a href="https://github.com/starVLA/starVLA">starVLA</a>
  and
  <a href="https://github.com/huggingface/lerobot">LeRobot</a>.
  We thank the authors for their open-source contributions.
</p>

## License

Model weights and code are open-sourced under the [Apache-2.0](./LICENSE) license.
