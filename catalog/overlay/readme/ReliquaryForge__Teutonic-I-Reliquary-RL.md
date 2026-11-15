# Teutonic-I Reliquary RL (live checkpoint)

Latest checkpoint of the live asynchronous RL run **`teutonic-rl-async-v1`** on Bittensor subnet 81 (Reliquary):
Teutonic-I 9B trained with RL from **`ReliquaryForge/Teutonic-I-Reliquary-SFT@18dfb97d`**, on rollouts generated and verified by the subnet's miners.

This repository is a mirror maintained automatically: each new checkpoint version published by the validator
is rebuilt (anchor + deltas from R2), checked against the signed index and pushed here.

| | |
|---|---|
| Checkpoint version | **157** |
| Weights sha256 (`index.latest.sha256`, Reliquary tensor digest) | `595512c5fc1b7c2132ceecce9e9e9dea16dfee464205e29aa138115230380928` |
| Signed index payload sha256 | `ccbe60deb93a8c18b7da88a81a86a67679f7c1a50a776cfeb92de83b39ba2fd5` |
| Index published at | 2026-11-02 09:35:11 UTC |
| Mirrored at | 2026-11-02 09:35:44 UTC |
| Validator hotkey (signer) | `5H47sFL6bGi3xPLzKpHxFqjBnmRZkQh4gk5jzkCeNXn4wdDa` |

## How it maps to `/rl/checkpoint`

The validator serves `GET /rl/checkpoint` (signed index + presigned R2 URLs). `index.latest.version` /
`index.latest.sha256` are the version and hash above. `reliquary_checkpoint.json` holds them, plus the signed index itself
(`index`, `signature`, `validator_hotkey`, without URLs), so the weights here can be checked with
`reliquary.shared.ckpt_delta.checkpoint_sha256` and `reliquary.shared.ckpt_index.verify_index_signature`.

Miners: `huggingface-cli download ReliquaryForge/Teutonic-I-Reliquary-RL` gives you the latest weights directly (no token needed). The subnet's
miner keeps using `/rl/checkpoint` (anchor + deltas) to follow new versions; if the version above is older
than `index.latest.version`, the mirror is catching up (it polls every few minutes; a push takes ~10-20 min).

## Storage policy

Only the latest checkpoint is kept: after each push the history is squashed into a single commit on `main`,
tagged `ckpt-157`. Older versions are not available here.

## License

Apache-2.0, as the base model.
