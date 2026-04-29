# Cookie

## なぜ存在するか

HTTPはステートレスなプロトコルのため、リクエストをまたいで状態を保持できない。
Cookieはサーバーがブラウザに小さなデータを保存させ、以降のリクエストに自動で付与させる仕組み。セッション管理・認証トークンの保存・ユーザー設定の保持などに使われる。

```
1. サーバーがSet-Cookieヘッダーでブラウザに保存を指示
   Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax

2. 以降のリクエストでブラウザが自動的にCookieを送信
   Cookie: session=abc123
```

## セキュリティ属性

Cookieの属性設定ミスは、XSS・CSRFなどの攻撃に直結する。

### HttpOnly

JavaScriptから `document.cookie` でCookieを読めなくする。
XSSでCookieを盗まれるリスクを防ぐために必須。

```
Set-Cookie: session=abc123; HttpOnly
```

```js
// HttpOnlyが設定されたCookieはJSから見えない
document.cookie  // → "" （session は含まれない）
```

### Secure

HTTPS接続のときのみCookieを送信する。
HTTP通信での盗聴（中間者攻撃）を防ぐ。本番環境では必須。

```
Set-Cookie: session=abc123; Secure
```

### SameSite

別オリジンからのリクエストにCookieを付けるかを制御する。CSRFの主要な対策。

| 値 | 挙動 |
|---|---|
| `Strict` | 同一サイトからのリクエストのみCookieを送信 |
| `Lax` | 同一サイト＋トップレベルナビゲーション（リンク遷移）のみ送信。デフォルト値 |
| `None` | 全てのクロスサイトリクエストに送信（`Secure` と併用必須） |

```
# 外部サービス（決済・SNS連携）でクロスサイト送信が必要な場合のみ None を使う
Set-Cookie: session=abc123; SameSite=None; Secure
```

### Expires / Max-Age

Cookieの有効期限。

```
Set-Cookie: session=abc123; Max-Age=3600           # 3600秒後に失効
Set-Cookie: session=abc123; Expires=Thu, 01 Jan 2026 00:00:00 GMT

# 指定なしはセッションCookie（ブラウザを閉じると消える）
Set-Cookie: session=abc123
```

### Path / Domain

Cookieを送信するパス・ドメインを制限する。

```
Set-Cookie: pref=dark; Path=/app         # /app 以下のリクエストにのみ送信
Set-Cookie: session=abc123; Domain=.example.com  # サブドメインも含む
```

`Domain` を指定するとサブドメインにも送信されるため、不要な場合は省略する。

## ベストプラクティス

認証セッションCookieの推奨設定。

```
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/
```

- `HttpOnly`: JS窃取を防ぐ
- `Secure`: HTTP通信での送信を防ぐ
- `SameSite=Lax`: CSRF対策（クロスサイトリクエストへの自動付与を防ぐ）
- `Max-Age`: セッションの有効期限を明示する

## LocalStorage との比較

| | Cookie | LocalStorage |
|---|---|---|
| サーバーへの自動送信 | あり | なし（JS で明示的に送る必要あり） |
| HTTPOnly による JS 隔離 | 可能 | 不可（常に JS からアクセス可能） |
| 有効期限の設定 | 可能 | なし（手動管理が必要） |
| 容量 | 約4KB | 約5MB |
| 用途 | セッション・認証トークン | UIの状態・キャッシュ |

認証トークンは `HttpOnly` Cookie に保存するのが安全。LocalStorageはXSSで即座に窃取されるリスクがある。
