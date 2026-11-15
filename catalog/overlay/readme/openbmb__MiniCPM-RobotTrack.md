<h1 align="center">
  MiniCPM-RobotTrack
</h1>

<p align="center">
  <strong>A Compact Vision-Language-Action Policy for Embodied target Tracking</strong>
</p>

<p align="center">
    <span style="display: inline-flex; align-items: center; margin-right: 2px;">
    <img src="assets/github.png" alt="github" width="15" height="15" style="margin-right: 4px;">
    <a href="https://github.com/OpenBMB/MiniCPM-Robot" target="_blank"> Github</a> &nbsp;|
    </span>
    <span style="display: inline-flex; align-items: center; margin-right: 2px;">
    <img src="assets/x.jpg" alt="X" width="15" height="15" style="margin-right: 4px;">
    <a href="https://huggingface.co/openbmb/MiniCPM-RobotTrack/resolve/main/assets/x.png" target="_blank"> X</a> &nbsp;|
    </span>
    <span style="display: inline-flex; align-items: center; margin-right: 2px;">
    <img src="assets/discord.png" alt="Discord" width="15" height="15" style="margin-right: 4px;">
    <a href="https://huggingface.co/openbmb/MiniCPM-RobotTrack/resolve/main/assets/discord.jpg" target="_blank"> Discord</a> &nbsp;|
    </span>
</p>

<strong>MiniCPM-RobotTrack</strong> is a compact vision-language-action model built on MiniCPM4-0.5B for target tracking with the following highlights:
<ul>
  <li><b>Language-conditioned target tracking:</b> The model combines natural-language instructions with fused DINOv3 and SigLIP visual features, then directly predicts eight future <code>[x, y, yaw]</code> waypoints for embodied person following.</li>
  <li><b>Quality-driven Self-evolving Data:</b> Automated checks and manual review remove abnormal trajectories, incorrect actions, and invalid interactions. DAgger-style model-environment interaction continually adds difficult samples involving target crossings, rapid turns, short occlusions, and multi-person intersections.</li>
  <li><b>Efficient On-device Inference:</b> Joint optimization of visual capture, input encoding, model inference, action generation, command transmission, and execution delivers a stable <b>5+ FPS</b> with approximately <b>180 ms</b> end-to-end latency on the Unitree Go2's native onboard compute.</li>
</ul>

<table align="center">
  <tr>
    <td align="center" width="33%">
      <img src="assets/track1.gif" width="100%" alt="Outdoor obstacle-aware person-tracking demo" />
    </td>
    <td align="center" width="33%">
      <img src="assets/track2.gif" width="100%" alt="Elevator person-tracking demo" />
    </td>
    <td align="center" width="33%">
      <img src="assets/track3.gif" width="100%" alt="Underground parking person-tracking demo" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>Outdoor Obstacle-aware Tracking</b></td>
    <td align="center"><b>Elevator Tracking</b></td>
    <td align="center"><b>Underground Parking Tracking</b></td>
  </tr>
</table>

## Benchmark Results
<p align="center">
  <img src="assets/metric.png" width="700" alt="MiniCPM-RobotTrack benchmark results" />
</p>

## Inference Example

Please ensure `transformers>=4.56,<5`.

<pre><code class="language-python">from __future__ import annotations

from pathlib import Path

import torch
from transformers import AutoModel, AutoTokenizer


VISION_FEATURE_DIM = 1536
HISTORY_FRAMES = 31
COARSE_TOKENS_PER_FRAME = 4
FINE_TOKENS_CURRENT_FRAME = 64


class MiniCPMRobotTrackInference:
    """Tokenizer and model wrapper for MiniCPM-RobotTrack inference."""

    def __init__(
        self,
        checkpoint_path: str | Path = "openbmb/MiniCPM-RobotTrack",
        device: str | torch.device | None = None,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        checkpoint = str(checkpoint_path)

        self.tokenizer = AutoTokenizer.from_pretrained(checkpoint)
        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        self.model = AutoModel.from_pretrained(
            checkpoint,
            trust_remote_code=True,
        )
        self.model.to(self.device).eval()

    @staticmethod
    def _prepare_visual_tokens(
        tokens: torch.Tensor,
        time_indices: torch.Tensor,
        name: str,
    ) -> tuple[torch.Tensor, torch.Tensor]:
        tokens = torch.as_tensor(tokens, dtype=torch.float32)
        time_indices = torch.as_tensor(time_indices, dtype=torch.long)

        if tokens.ndim == 2:
            tokens = tokens.unsqueeze(0)
        if time_indices.ndim == 1:
            time_indices = time_indices.unsqueeze(0)
        if tokens.ndim != 3 or tokens.shape[-1] != VISION_FEATURE_DIM:
            raise ValueError(
                f"{name}_tokens must have shape [B, N, {VISION_FEATURE_DIM}]"
            )
        if time_indices.shape != tokens.shape[:2]:
            raise ValueError(
                f"{name}_time_indices must match the first two dimensions of "
                f"{name}_tokens"
            )
        return tokens, time_indices

    @torch.inference_mode()
    def predict(
        self,
        instruction: str,
        coarse_tokens: torch.Tensor,
        coarse_time_indices: torch.Tensor,
        fine_tokens: torch.Tensor,
        fine_time_indices: torch.Tensor,
    ) -> torch.Tensor:
        """Return eight ``[x, y, yaw]`` waypoints for each batch item."""
        coarse_tokens, coarse_time_indices = self._prepare_visual_tokens(
            coarse_tokens,
            coarse_time_indices,
            "coarse",
        )
        fine_tokens, fine_time_indices = self._prepare_visual_tokens(
            fine_tokens,
            fine_time_indices,
            "fine",
        )

        batch_size = coarse_tokens.shape[0]
        if fine_tokens.shape[0] != batch_size:
            raise ValueError("coarse and fine feature batch sizes must match")

        text = self.tokenizer(
            [instruction] * batch_size,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=self.model.config.max_text_tokens,
        )
        outputs = self.model(
            input_ids=text.input_ids.to(self.device),
            attention_mask=text.attention_mask.to(self.device),
            coarse_tokens=coarse_tokens.to(self.device),
            coarse_time_indices=coarse_time_indices.to(self.device),
            fine_tokens=fine_tokens.to(self.device),
            fine_time_indices=fine_time_indices.to(self.device),
        )
        return outputs.trajectories.float().cpu()


if __name__ == "__main__":
    infer_runner = MiniCPMRobotTrackInference()

    # Replace these placeholders with fused DINOv3 + SigLIP features produced
    # by the project preprocessing pipeline.
    coarse_tokens = torch.zeros(
        HISTORY_FRAMES * COARSE_TOKENS_PER_FRAME,
        VISION_FEATURE_DIM,
    )
    coarse_time_indices = torch.arange(HISTORY_FRAMES).repeat_interleave(
        COARSE_TOKENS_PER_FRAME
    )
    fine_tokens = torch.zeros(
        FINE_TOKENS_CURRENT_FRAME,
        VISION_FEATURE_DIM,
    )
    fine_time_indices = torch.full(
        (FINE_TOKENS_CURRENT_FRAME,),
        HISTORY_FRAMES,
        dtype=torch.long,
    )

    trajectory = infer_runner.predict(
        instruction="Follow the person in the red shirt.",
        coarse_tokens=coarse_tokens,
        coarse_time_indices=coarse_time_indices,
        fine_tokens=fine_tokens,
        fine_time_indices=fine_time_indices,
    )
    print(trajectory)  # [1, 8, 3]

</code></pre>



## Acknowledgement

<p>
  This project builds on and references
  <a href="https://github.com/OpenBMB/MiniCPM">MiniCPM</a>,
  <a href="https://github.com/facebookresearch/dinov3">DINOv3</a>,
  <a href="https://huggingface.co/google/siglip-so400m-patch14-384">SigLIP</a>,
  <a href="https://github.com/facebookresearch/habitat-lab">Habitat-Lab</a>,
  <a href="https://github.com/facebookresearch/habitat-sim">Habitat-Sim</a>,
  EVT-Bench,
  and
  <a href="https://github.com/wsakobe/TrackVLA">TrackVLA</a>.
  We thank the authors for their open-source contributions.
</p>

## License

Model weights and code are open-sourced under the [Apache-2.0](./LICENSE) license.
