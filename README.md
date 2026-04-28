# my-knowledge

個人の知識ベース。用語・概念・設計パターンなど、忘れやすいものをまとめている。

## 技術スタック

- [VitePress](https://vitepress.dev/) v1.6.x — Markdownをそのまま静的サイトとして配信
- Node.js 20
- GitHub Pages（`main` ブランチへのpushで自動デプロイ）

## ローカル起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build   # .vitepress/dist に出力
npm run preview # ビルド結果をローカルでプレビュー
```

## 設定

VitePressの設定は `.vitepress/config.ts`、カスタムテーマは `.vitepress/theme/` で管理している。

## デプロイ

`main` ブランチにpushすると GitHub Actions が自動でビルド・GitHub Pages へデプロイする。

## 注意

- コンテンツの大部分は Claude Code で生成したものであり、未精査のものを含む
- 個人の学習目的のため、正確性は保証しない

## カテゴリ

| カテゴリ | 内容 |
|---|---|
| [architecture](docs/architecture/index.md) | レイヤード・オニオン・DDD・イベント駆動など |
| [testing](docs/testing/index.md) | TDD・テスト戦略 |
| [ai](docs/ai/index.md) | プロンプトエンジニアリング・RAG・AIエージェント・Vibe Coding など |
| [frontend](docs/frontend/index.md) | CSS設計手法・レンダリング戦略 |
| [backend](docs/backend/index.md) | REST・GraphQL・gRPC・tRPC |
| [security](docs/security/index.md) | CORS・XSS・CSRF・SQLインジェクション・ブルートフォース |
| [auth](docs/auth/index.md) | JWT・OAuth2 |
| [observability](docs/observability/index.md) | ログ・メトリクス・トレース |
| [process](docs/process/index.md) | アジャイル・ウォーターフォール・Shape Up |
| [deployment](docs/deployment/index.md) | カナリアリリース・ブルーグリーン・フィーチャーフラグ・エッジコンピューティング |
| [dev tools](docs/tools/index.md) | Docker・Kubernetes・Terraform・GitHub Actions |
| [platforms](docs/tools/platforms.md) | クラウド・BaaS・分散DB（Firebase・Supabase・PlanetScale・CockroachDB・TiDB） |
