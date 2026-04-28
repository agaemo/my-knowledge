# my-knowledge

個人の知識ベース。

## ディレクトリ構成

```
my-knowledge/
└── docs/                    # コンテンツルート（VitePress の srcDir）
    ├── architecture/        # アーキテクチャパターン
    ├── testing/             # テスト手法
    ├── ai/                  # AI・LLMエンジニアリング（プロンプト・RAG・Embeddings・エージェント・Fine-tuning・Evals・MCP・LLMOps など）
    ├── api/                 # API設計
    ├── auth/                # 認証・認可
    ├── observability/       # オブザーバビリティ
    ├── process/             # 開発プロセス
    ├── deployment/          # デプロイ・リリース戦略（カナリア・ブルーグリーン・フィーチャーフラグ）
    └── tools/               # Dev Tools（infra/・ci-cd/・local/）と Platforms（cloud/・database/・baas/・hosting/）に分類
```

## 方針

- 「なぜそのパターンが存在するか」「いつ使うか」を重視した構成
- 1概念1ファイル

## ファイル作成ルール

- トピック単位のサブディレクトリを作る
- 新しいトピックを追加するときはこのファイルのディレクトリ構成も更新する

## デプロイフロー

見た目の変更（CSS・レイアウト・テンプレート等）をする場合は、commit・push の前に必ずローカルで確認する。

1. `npm run dev` を起動するよう案内する（ターミナルで `! npm run dev`）
2. ユーザーが `http://localhost:5173` で確認・OKを出したら commit・push する
