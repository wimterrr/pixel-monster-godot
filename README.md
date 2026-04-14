# Pixel Monster Godot

Minimal Godot bootstrap for the engine-first pixel monster proof.

Current scope:

- one Route01 scene
- one Battle scene
- one save anchor contract
- no content expansion before the cold-reload receipt exists

Immediate next build order:

1. Wire `scenes/Route01.tscn` as the main scene.
2. Add a save anchor node with checkpoint, roster delta, and spent item state.
3. Use `scenes/Battle.tscn` for one explicit first-capture battle payload.
4. Prove a cold reload from the saved first capture back into Route01.

Current local proof contract:

- `scenes/Route01.tscn` must expose `SaveAnchor` and `BattleEntry`.
- `scenes/Battle.tscn` must expose one `EnemySpawn`.
- `scripts/proof_contract.json` freezes the first capture payload and save receipt.
- `scripts/save_anchor_contract.md` is the human-readable save receipt contract and must stay aligned with the script.
- `node scripts/verify-proof-contract.mjs` is the local receipt gate for this repo and writes `outputs/latest-proof-receipt.json`, including SHA-256 provenance for the workspace config, README, scenes, scripts, and save-anchor contract note.
