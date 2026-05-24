# Pixel Monster Godot

Godot 4 기반 픽셀 몬스터 RPG 부트스트랩입니다. [pixel-monster-no-engine](https://github.com/wimterrr/pixel-monster-no-engine)의 엔진 버전으로, 첫 캡처 → 세이브/로드 루프를 증명합니다.

## Tech Stack

- Godot 4.x (Forward+ 렌더러, GDScript)
- Node.js (proof contract 검증 스크립트)

## Current Scope

- `scenes/Route01.tscn` — 오버월드 (SaveAnchor + BattleEntry)
- `scenes/Battle.tscn` — 전투 씬 (EnemySpawn)
- `scripts/proof_contract.json` — 첫 캡처 페이로드와 세이브 영수증을 동결
- `scripts/save_anchor_contract.md` — 세이브 영수증 계약 (사람이 읽을 수 있는 형태)

## Proof Contract

JSON 계약이 예상 전투/세이브 영수증을 고정하고, 검증 스크립트가 SHA-256 해시로 구조적 정합성을 확인합니다.

```bash
node scripts/verify-proof-contract.mjs
```

## Getting Started

1. Godot 4.x로 프로젝트 열기
2. F5로 실행

## License

MIT
