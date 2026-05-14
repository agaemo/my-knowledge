# my-knowledge

個人の知識ベース。用語・概念・設計パターンなど、忘れやすいものをまとめている。

## 技術スタック

- [Docusaurus](https://docusaurus.io/) v3.x — Markdown / MDX を静的サイトとして配信。Mermaid 公式サポート
- Node.js 20
- GitHub Pages（`main` ブランチへのpushで自動デプロイ）

## ローカル起動

```bash
npm install
npm run start
```

## ビルド

```bash
npm run build  # build/ に出力
npm run serve  # ビルド結果をローカルでプレビュー
```

## 設定

Docusaurus の設定は `docusaurus.config.js`、サイドバーは `sidebars.js` で管理している。

## デプロイ

`main` ブランチにpushすると GitHub Actions が自動でビルド・GitHub Pages へデプロイする。

## 注意

- コンテンツの大部分は Claude Code で生成したものであり、未精査のものを含む
- 個人の学習目的のため、正確性は保証しない

## カテゴリ

| カテゴリ | 内容 |
|---|---|
| [architecture](docs/architecture/index.md) | レイヤード・オニオン・DDD・ヘキサゴナル・GoF・SOLID・MV*パターン |
| [frontend](docs/frontend/index.md) | 状態管理・リアクティブ・JSランタイム・CSS設計・レンダリング戦略 |
| [backend](docs/backend/index.md) | REST・GraphQL・gRPC・tRPC・リバースプロキシ・キャッシュ |
| [ai](docs/ai/index.md) | プロンプトエンジニアリング・RAG・AIエージェント・Evals・Vibe Coding |
| [testing](docs/testing/index.md) | TDD・テスト戦略・テストダブル・契約テスト |
| [security](docs/security/index.md) | CORS・XSS・CSRF・SQLインジェクション・暗号化・ゼロデイ |
| [auth](docs/auth/index.md) | JWT・OAuth2・OIDC・SAML・セッション認証 |
| [networking](docs/networking/index.md) | OSI・HTTP・DNS・TLS・WebSocket/SSE・VPC・ソケット |
| [observability](docs/observability/index.md) | ログ・メトリクス・トレース・OpenTelemetry |
| [sre](docs/sre/index.md) | SLO・エラーバジェット・サーキットブレーカー・ポストモーテム |
| [deployment](docs/deployment/index.md) | カナリアリリース・ブルーグリーン・フィーチャーフラグ・CDN |
| [dev-tools](docs/dev-tools/index.md) | Docker・Kubernetes・Terraform・GitHub Actions・Nix |
| [platforms](docs/platforms/index.md) | クラウド・XaaS・RDBMS・NoSQL・Kafka |
| [org](docs/org/index.md) | コンウェイの法則・エンジニアリングロール・The Model |
| [business](docs/business/index.md) | 資金調達・成長戦略・ARR・PMF・SLG/PLG |
| [process](docs/process/index.md) | アジャイル・Shape Up・ADR・技術的負債 |
