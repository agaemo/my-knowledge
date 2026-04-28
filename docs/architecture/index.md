# Architecture

システムの構造・責務の分け方に関するアーキテクチャパターン。

## 構造パターン

- [レイヤード](/architecture/layered) — 層ごとに責務を分けるシンプルなパターン
- [オニオン](/architecture/onion) — 依存を内向きに保つ同心円状の構造
- [ヘキサゴナル](/architecture/hexagonal) — ポートとアダプタで外部依存を切り離す

## ドメイン設計

- [DDD](/architecture/ddd) — ドメインモデルを中心に設計する手法
- [モジュラーモノリス](/architecture/modular-monolith) — 単一デプロイ単位で内部をモジュール分割

## 移行・疎結合

- [イベント駆動](/architecture/event-driven) — イベントを介してコンポーネントを疎結合にする
- [ストラングラーフィグ](/architecture/strangler-fig) — 既存システムを段階的に置き換えるパターン
