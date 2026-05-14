# my-knowledge

個人の知識ベース。

## ディレクトリ構成

```
my-knowledge/
├── docs/                    # コンテンツルート（Docusaurus の docs ディレクトリ）
│   ├── architecture/        # アーキテクチャパターン（design-patterns/・functional-patterns/・mv-patterns/ を含む）
│   ├── testing/             # テスト手法
│   ├── ai/                  # AI・LLMエンジニアリング（プロンプト・RAG・Embeddings・エージェント・Fine-tuning・Evals・MCP・LLMOps など）
│   ├── frontend/            # フロントエンド設計（CSS設計・レンダリング戦略など）
│   ├── backend/             # バックエンド設計（api/ サブディレクトリで分類）
│   ├── security/            # セキュリティ（CORS・Web攻撃手法など）
│   ├── auth/                # 認証・認可
│   ├── observability/       # オブザーバビリティ
│   ├── process/             # 開発プロセス
│   ├── deployment/          # デプロイ・リリース戦略（カナリア・ブルーグリーン・フィーチャーフラグ）
│   ├── dev-tools/           # 開発・インフラツール（infra/・ci-cd/・env-management/）
│   ├── platforms/           # マネージドサービス・プラットフォーム（cloud・database/・baas）
│   ├── networking/          # ネットワーク（OSI・HTTP・DNS・TLS・WebSocket/SSE・VPC・NAT）
│   ├── sre/                 # SRE（信頼性設計・障害パターン・ポストモーテムなど）
│   ├── org/                 # 組織（コンウェイの法則・ロール・チーム設計・The Model）
│   └── business/            # ビジネス（資金調達・指標・成長戦略・SLG/PLG）
├── src/
│   ├── css/custom.css       # グローバルスタイル（ブランドカラー）
│   └── pages/index.js       # カスタムホームページ
├── static/                  # 静的ファイル（logo.svg など）
├── docusaurus.config.js     # Docusaurus 設定
└── sidebars.js              # サイドバー設定
```

## 方針

- 「なぜそのパターンが存在するか」「いつ使うか」を重視した構成
- 1概念1ファイル
- 使い方リファレンスや操作マニュアルは対象外。概念・設計パターン・アーキテクチャの知識を対象とする

## ファイル作成ルール

- トピック単位のサブディレクトリを作る
- 新しいトピックを追加するときはこのファイルのディレクトリ構成も更新する
- 追加の判断基準：「なぜ存在するか」「いつ使うか」が説明できるものに限る。単なるツールの紹介・操作手順は追加しない

## ページ追加後のチェックリスト

ページを追加・削除したら、以下3箇所の整合性を必ず確認・更新する。

1. **ホームパネル** (`src/pages/index.js`) — `features` 配列に追加したトピックが反映されているか
2. **サイドメニュー** (`sidebars.js`) — 該当セクションの `items` に新ページが追加されているか
3. **セクションのindex.md** (`docs/<section>/index.md`) — ページ一覧に新ページへのリンクが追加されているか

## デプロイフロー

### コミット後の確認

commit したら必ずユーザーに「コミットしました。push しますか？」と確認する。
確認なしに push しない。

### 見た目の変更がある場合

CSS・レイアウト・テンプレート等の変更は、commit・push の前に必ずローカルで確認する。

1. `npm run start` を起動するよう案内する（ターミナルで `! npm run start`）
2. ユーザーが `http://localhost:3000` で確認・OKを出したら commit する
3. commit 後にユーザーへ push するか確認する
