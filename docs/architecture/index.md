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

## コードレベルの設計パターン

- [GoF デザインパターン](/architecture/design-patterns/) — 生成・構造・振る舞いの23パターンと現代言語での扱い
- [SOLID 原則](/architecture/design-patterns/solid) — OOP 設計の5原則。変更耐性とテスタビリティの根拠
- [プログラミング原則](/architecture/design-patterns/principles) — DRY・KISS・YAGNI・LoD・合成優先・SoC
- [関数型パターン](/architecture/functional-patterns/) — 純粋関数・Functor・Monad・代数的データ型など
- [MV* パターン](/architecture/mv-patterns/) — MVC・MVP・MVVM・MVI の使い分け

