# Cloudflare

CDN・DNS・セキュリティを起点に、エッジコンピューティング・ストレージ・データベースまで展開するエッジプラットフォーム。世界300以上の拠点でユーザーに近い場所でコードを実行できる。

## なぜ存在するか

従来のサーバーはリージョンに固定されており、遠いユーザーへのレイテンシが課題だった。CloudflareはCDNで培ったグローバルネットワークを活かし、エッジでコードを実行することで低レイテンシを実現する。

## 主要サービス

### Workers
JavaScriptをエッジで実行するサーバーレス環境。コールドスタートがほぼなく、グローバルに低レイテンシで動作する。

```ts
// worker.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from the edge!' })
    }

    return new Response('Not Found', { status: 404 })
  },
}
```

### Pages
静的サイトとフルスタックアプリのホスティング。GitHubと連携してPRごとにプレビューURLを生成する。Pages FunctionsでWorkers相当のサーバーレス処理もできる。

### KV（Key-Value Store）
グローバルに分散したKey-Valueストア。低レイテンシな読み取りが必要なセッション・設定値のキャッシュに向く。書き込みの一貫性はEventual。

```ts
// 書き込み
await env.MY_KV.put('user:123', JSON.stringify({ name: 'Alice' }), {
  expirationTtl: 3600,
})

// 読み取り
const value = await env.MY_KV.get('user:123', 'json')
```

### R2
S3互換のオブジェクトストレージ。AWS S3と異なりエグレス料金が無料なので、大容量データの配信コストを抑えられる。

```ts
// ファイルのアップロード
await env.MY_BUCKET.put('images/photo.jpg', request.body, {
  httpMetadata: { contentType: 'image/jpeg' },
})

// ファイルの取得
const object = await env.MY_BUCKET.get('images/photo.jpg')
return new Response(object?.body)
```

### D1
WorkersからアクセスできるSQLiteベースのサーバーレスDB。エッジに近い場所でSQLを実行できる。

```ts
const { results } = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).all()
```

### Durable Objects
状態を持つエッジオブジェクト。WebSocketのセッション管理やリアルタイムコラボレーションに使う。

### CDN・DNS・セキュリティ
DDoS対策・WAF・Bot管理など、元来の中核機能。既存サービスの前段に置いてセキュリティと高速化を行う。

## ローカル開発

```bash
npm install -g wrangler

wrangler dev          # ローカルでWorkerを起動
wrangler deploy       # 本番デプロイ

# KV・R2・D1はローカルシミュレーターで動作
wrangler kv:key put --binding=MY_KV key value --local
```

## wrangler.toml

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxxxxx"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xxxxxx"
```

## いつ使うか

- グローバルに低レイテンシなAPIやサイトを配信したい
- エグレス料金を抑えたいファイル配信（R2）
- エッジで動くサーバーレス処理が必要（Workers）
- 既存サービスへのCDN・セキュリティ層を追加したい
- 低コストで静的サイトをホストしたい（Pages）

## Vercel との比較

| 観点 | Cloudflare | Vercel |
|------|------------|--------|
| エッジ拠点数 | 300以上 | 数十拠点 |
| Next.js との相性 | 対応（一部制限あり） | 最高（開発元） |
| ストレージ | R2・D1・KVあり | なし（外部DB必要） |
| 無料枠 | 寛大 | 関数実行回数に制限 |
| 価格 | 安価 | やや高め |
