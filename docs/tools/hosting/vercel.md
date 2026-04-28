# Vercel

フロントエンド特化のホスティング・サーバーレスプラットフォーム。Next.js の開発元が提供しており、ゼロコンフィグのデプロイとエッジ配信を特徴とする。

## なぜ存在するか

従来のサーバーホスティングはインフラ管理が必要で、フロントエンド開発者がアプリを素早く本番に出すには障壁が高かった。Vercelはgit pushだけでビルド・デプロイ・CDN配信を自動化し、インフラを意識せずに配信できるようにした。

## 主要機能

### ゼロコンフィグデプロイ
GitHubリポジトリを連携するだけで、pushのたびに自動ビルド・デプロイが走る。フレームワークを自動検出して最適なビルド設定を適用する。

```bash
# CLIからのデプロイ
npm i -g vercel
vercel        # 初回セットアップ
vercel --prod # 本番デプロイ
```

### Preview Deployments
PRごとに専用のプレビューURLが自動生成される。本番に影響なくレビューできる。

### Edge Functions
エッジネットワーク上で動作するサーバーレス関数。レイテンシが低く、リクエストに応じた動的処理をユーザーに近い場所で実行できる。

```ts
// app/api/hello/route.ts（Next.js App Router）
export const runtime = 'edge'

export function GET(request: Request) {
  return new Response('Hello from the edge!')
}
```

### Serverless Functions
従来のサーバーレス関数（Node.js ランタイム）。Edge Functionsより機能が豊富で、DBアクセスなどに使う。

### Image Optimization
`next/image` などを通じた画像の自動最適化・リサイズ・WebP変換。

### Analytics / Speed Insights
Core Web Vitals などのパフォーマンス指標をダッシュボードで確認できる。

## 設定ファイル

```json
// vercel.json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Frame-Options", "value": "DENY" }]
    }
  ],
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
  ]
}
```

## 環境変数

ダッシュボードまたはCLIで設定し、本番・プレビュー・開発ごとに値を分けられる。

```bash
vercel env add DATABASE_URL production
vercel env pull .env.local  # ローカルに取得
```

## いつ使うか

- Next.js・Nuxt・SvelteKit などのモダンフレームワークをデプロイしたい
- PRごとにプレビュー環境が欲しい
- インフラ管理なしで素早く本番に出したい
- エッジでの動的レスポンスが必要

## Cloudflare との比較

| 観点 | Vercel | Cloudflare Pages/Workers |
|------|--------|--------------------------|
| Next.js との相性 | 最高（開発元） | 対応（一部制限あり） |
| エッジ拠点数 | 数十拠点 | 300以上の拠点 |
| 無料枠 | 関数実行回数に制限 | 寛大 |
| ストレージ | なし（外部DB必要） | R2・D1・KVあり |
| 価格 | やや高め | 安価 |
