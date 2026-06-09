# HTTP セキュリティヘッダー

サーバーがレスポンスに付与することで、ブラウザ側の挙動を制限・強制するHTTPヘッダー群。アプリケーションコードを変えずに防御層を追加できる。

## なぜ存在するか

XSS・クリックジャッキング・MIME スニッフィングなどの攻撃は、ブラウザが「許可してしまっている」ことで成立する。セキュリティヘッダーはブラウザの動作ポリシーを明示的に制限し、攻撃の前提条件を崩す。

---

## Content-Security-Policy（CSP）

**目的：** スクリプト・スタイル・画像などのリソース読み込み元をホワイトリストで制限し、XSS の影響を無効化する。

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com; img-src *
```

| ディレクティブ | 制限対象 |
|---|---|
| `default-src` | 他のディレクティブのフォールバック |
| `script-src` | JavaScript の読み込み元 |
| `style-src` | CSS の読み込み元 |
| `img-src` | 画像の読み込み元 |
| `connect-src` | fetch・XHR・WebSocket の接続先 |
| `frame-ancestors` | このページを iframe に埋め込める親ページ |

**`'self'`** は同一オリジンのみ許可。**`'none'`** は完全禁止。

インラインスクリプト（`<script>...</script>`）はデフォルトでブロックされる。許可するには `nonce` または `hash` を使う。

```html
<!-- サーバー側でランダムなnonceを生成し、ヘッダーとHTMLに同じ値を設定 -->
Content-Security-Policy: script-src 'nonce-abc123'
<script nonce="abc123">...</script>
```

**Report-Only モード：** 実際にブロックせず違反レポートだけ送信するモード。CSP 導入前の影響調査に使う。

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

---

## HTTP Strict Transport Security（HSTS）

**目的：** ブラウザに「このサイトは HTTPS でのみアクセスする」と記憶させ、HTTP へのダウングレード攻撃を防ぐ。

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| パラメータ | 意味 |
|---|---|
| `max-age` | 記憶する秒数（1年 = 31536000） |
| `includeSubDomains` | サブドメインにも適用 |
| `preload` | ブラウザの HSTS プリロードリストへの掲載申請を示す |

**なぜ重要か：** HTTPS サイトでも最初の HTTP リクエストが中間者攻撃に脆弱。HSTS を有効にするとブラウザが最初から HTTPS に書き換えてリクエストする。

HTTPS を廃止する予定がある場合は先に `max-age=0` を返して記憶を削除してから行う。

---

## X-Frame-Options

**目的：** このページを iframe に埋め込めるオリジンを制限し、クリックジャッキングを防ぐ。

```
X-Frame-Options: DENY          # 埋め込み完全禁止
X-Frame-Options: SAMEORIGIN    # 同一オリジンのみ許可
```

CSP の `frame-ancestors` ディレクティブで代替できる（より柔軟）。両方設定した場合は CSP が優先される。

---

## X-Content-Type-Options

**目的：** ブラウザが Content-Type を無視してコンテンツを推測（MIME スニッフィング）することを禁止する。

```
X-Content-Type-Options: nosniff
```

**なぜ危険か：** サーバーが `Content-Type: text/plain` で返したファイルをブラウザが JavaScript と判断して実行してしまう場合がある。`nosniff` を設定すると宣言された Content-Type 以外では実行されない。

---

## Referrer-Policy

**目的：** `Referer` ヘッダーに含まれるURL情報をどこまで送信するかを制御する。

```
Referrer-Policy: strict-origin-when-cross-origin
```

| 値 | 動作 |
|---|---|
| `no-referrer` | Referer ヘッダーを送信しない |
| `same-origin` | 同一オリジンへのリクエストのみ送信 |
| `strict-origin` | HTTPS→HTTP のダウングレード時は送信しない |
| `strict-origin-when-cross-origin` | クロスオリジンにはオリジンのみ送信（推奨デフォルト） |
| `unsafe-url` | 常に完全な URL を送信（非推奨） |

認証トークンや個人情報が URL に含まれる場合、外部サービスへの Referer 漏洩を防ぐ。

---

## Permissions-Policy

**目的：** カメラ・マイク・位置情報などのブラウザ API をページや iframe で使えるかを制御する。

```
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

`()` は完全無効化。`(self)` は同一オリジンのみ許可。マルウェア広告などが埋め込まれた場合にデバイス機能へのアクセスを制限できる。

---

## 設定の優先度

すべてのセキュリティヘッダーは「デフォルト無効、必要なものを明示的に許可」の思想に基づく。設定漏れが脆弱性になるため、レスポンスヘッダーを一元管理するミドルウェアで設定するのが安全。

```
# 最低限すべき設定セット
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

## 関連

- [XSS](/security/web-attacks/xss) — CSP が直接防御する攻撃
- [クリックジャッキング](/security/web-attacks/clickjacking) — X-Frame-Options / CSP frame-ancestors が防御する攻撃
- [WAF](/security/waf) — HTTPトラフィックレベルの防御層（ヘッダーとは別の層）
