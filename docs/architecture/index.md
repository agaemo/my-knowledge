# Architecture

システムの構造・責務の分け方に関するアーキテクチャパターン。

- [レイヤード](/architecture/layered) — 層ごとに責務を分けるシンプルなパターン
- [モジュラーモノリス](/architecture/modular-monolith) — 単一デプロイ単位で内部をモジュール分割
- [オニオン](/architecture/onion) — 依存を内向きに保つ同心円状の構造
- [DDD](/architecture/ddd) — ドメインモデルを中心に設計する手法
- [ヘキサゴナル](/architecture/hexagonal) — ポートとアダプタで外部依存を切り離す
- [イベント駆動](/architecture/event-driven) — イベントを介してコンポーネントを疎結合にする
- [ストラングラーフィグ](/architecture/strangler-fig) — 既存システムを段階的に置き換えるパターン
