# CORS（Cross-Origin Resource Sharing）

異なるオリジン間でのリソース共有を制御するブラウザのセキュリティ機構。サーバーが「どのオリジンからのリクエストを許可するか」をHTTPヘッダーで宣言する。

## なぜ存在するか

ブラウザには**同一オリジンポリシー**（Same-Origin Policy）というセキュリティ制約がある。これはあるオリジンのJavaScriptが別オリジンのリソースに勝手にアクセスできないようにするもの。

しかし現代のWebでは `https://app.example.com` から `https://api.example.com` へのリクエストなど、オリジンをまたぐ通信が必要になる。CORSはその許可をサーバー側が明示的に宣言する仕組み。

## オリジンとは

`プロトコル + ホスト + ポート` の組み合わせ。一つでも異なれば別オリジン。

```
https://example.com:443  ← 基準
https://example.com      ← 同一（443はデフォルト）
http://example.com       ← 別オリジン（プロトコルが違う）
https://api.example.com  ← 別オリジン（ホストが違う）
https://example.com:3000 ← 別オリジン（ポートが違う）
```

## CORSの流れ

### シンプルリクエスト
GET・POSTなど一部のリクエストはそのまま送られる。

```
ブラウザ → GET https://api.example.com/data
           Origin: https://app.example.com

サーバー ← 200 OK
           Access-Control-Allow-Origin: https://app.example.com
```

### プリフライトリクエスト
`PUT`・`DELETE`・カスタムヘッダーを含むリクエストは、本リクエストの前に `OPTIONS` リクエストで許可確認を行う。

```
ブラウザ → OPTIONS https://api.example.com/data
           Origin: https://app.example.com
           Access-Control-Request-Method: DELETE

サーバー ← 200 OK
           Access-Control-Allow-Origin: https://app.example.com
           Access-Control-Allow-Methods: GET, POST, DELETE

ブラウザ → DELETE https://api.example.com/data（本リクエスト）
```

## サーバー側の設定

```ts
// Express の例
import cors from 'cors'

app.use(cors({
  origin: ['https://app.example.com', 'https://staging.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cookie・Authorizationヘッダーを許可する場合
}))
```

## 主要なCORSヘッダー

| ヘッダー | 説明 |
|---------|------|
| `Access-Control-Allow-Origin` | 許可するオリジン。`*` で全許可（credentialsと併用不可） |
| `Access-Control-Allow-Methods` | 許可するHTTPメソッド |
| `Access-Control-Allow-Headers` | 許可するリクエストヘッダー |
| `Access-Control-Allow-Credentials` | Cookie等の認証情報を含むリクエストを許可するか |
| `Access-Control-Max-Age` | プリフライト結果のキャッシュ時間（秒） |

## よくあるミス

```
// ❌ credentials: true と * の併用はブラウザに拒否される
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

// ✅ 特定のオリジンを指定する
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

## いつ使うか

- フロントエンドとAPIが別ドメイン・別ポートで動いている
- マイクロサービスで複数のオリジンからAPIを呼び出す
- サードパーティへのAPI公開（許可するオリジンの設計が重要）
