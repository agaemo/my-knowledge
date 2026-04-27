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
| [architecture](architecture/index.md) | レイヤード・オニオン・DDD・イベント駆動など |
| [testing](testing/index.md) | TDD・テスト戦略 |
| [ai](ai/index.md) | プロンプトエンジニアリング・RAG・AIエージェント・Vibe Coding など |
| [api](api/index.md) | REST・GraphQL・gRPC・tRPC |
| [auth](auth/index.md) | JWT・OAuth2 |
| [observability](observability/index.md) | ログ・メトリクス・トレース |
| [process](process/index.md) | アジャイル・ウォーターフォール・Shape Up |
| [deployment](deployment/index.md) | カナリアリリース・ブルーグリーン・フィーチャーフラグ |
| [tools](tools/index.md) | Kubernetes・Terraform・AWS・GitHub Actions |
