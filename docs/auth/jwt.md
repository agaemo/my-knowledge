# JWT（JSON Web Token）

## 何か

ユーザーの認証情報をJSON形式で安全にやり取りするためのトークン仕様（RFC 7519）。
サーバーがセッションを保持しなくても認証できる（ステートレス認証）。

## 構造

3つのパーツを `.` でつないだ文字列。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6MTcxNTAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
─────────────────────────────────────── ────────────────────────────────────── ─────────────────────────────────────────────
              Header                                  Payload                              Signature
```

```ts
// Header: アルゴリズムとトークンタイプ
{ "alg": "HS256", "typ": "JWT" }

// Payload: クレーム（任意のデータ）
{
  "sub": "user-123",      // subject（誰のトークンか）
  "exp": 1715000000,      // expiration（有効期限）
  "iat": 1714990000,      // issued at（発行時刻）
  "email": "a@example.com"
}

// Signature: Header + Payload を秘密鍵で署名したもの
HMACSHA256(base64(Header) + "." + base64(Payload), SECRET_KEY)
```

**Payload は Base64 エンコードのみ（暗号化ではない）。誰でも読める。**

## 署名アルゴリズムの選択

| アルゴリズム | 鍵の種類 | 向いている場面 |
|---|---|---|
| HS256 | 共通鍵（1つの秘密鍵） | 単一サービス・シンプルな構成 |
| RS256 | 公開鍵/秘密鍵ペア | 複数サービス間・マイクロサービス |
| ES256 | 楕円曲線鍵ペア | RS256より短い鍵で同等のセキュリティ |

### RS256 を使うべき理由

HS256 は署名も検証も同じ秘密鍵を使う。マイクロサービス環境では全サービスに秘密鍵を配布する必要があり、漏洩リスクが高まる。
RS256 なら**秘密鍵は認証サーバーのみ**が持ち、他のサービスは公開鍵で検証だけできる。

## アクセストークンとリフレッシュトークン

| | アクセストークン | リフレッシュトークン |
|---|---|---|
| 有効期限 | 短い（15分〜1時間） | 長い（7〜30日） |
| 用途 | APIアクセスの認可 | 新しいアクセストークンの取得 |
| 保存場所 | メモリ（推奨） | httpOnly Cookie（推奨） |

```ts
// ログイン時
const accessToken = jwt.sign({ sub: user.id }, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

// APIリクエスト時
// Authorization: Bearer <accessToken>

// アクセストークン期限切れ時
// refreshToken で新しいアクセストークンを取得
```

## よくある間違いと対策

### localStorage に保存する（XSS脆弱性）

```ts
// Bad: localStorage はXSSで盗まれる
localStorage.setItem('token', accessToken);

// Good: httpOnly Cookie に保存（JavaScriptからアクセスできない）
res.cookie('access_token', accessToken, {
  httpOnly: true,  // JSからアクセス不可
  secure: true,    // HTTPS only
  sameSite: 'strict',
});
```

### 署名を検証しない

```ts
// Bad: デコードだけして内容を信頼する
const payload = JSON.parse(atob(token.split('.')[1]));

// Good: 必ず署名を検証する
const payload = jwt.verify(token, PUBLIC_KEY); // 失敗したら例外
```

### exp（有効期限）を入れない

```ts
// Bad: 有効期限なし = 永遠に有効なトークン
jwt.sign({ sub: userId }, SECRET);

// Good: 必ず exp を設定する
jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });
```

### Payload に機密情報を入れる

Payload は Base64 デコードで誰でも読める。パスワード・カード番号などを入れてはいけない。

## JWT のログアウト問題

JWTはステートレスなので、**サーバー側でトークンを無効化できない**。
有効期限が来るまで有効なトークンは使い続けられる。

### 対策

**ブラックリスト方式**: 無効化したいトークンのIDをRedisなどに保存し、検証時に確認する。
ステートレスの利点が薄れるが、即時無効化が必要な場面（強制ログアウト・権限変更）では現実的な解。

```ts
// ログアウト時
await redis.set(`blacklist:${tokenId}`, '1', { EX: tokenExpiry });

// 検証時
const isBlacklisted = await redis.get(`blacklist:${tokenId}`);
if (isBlacklisted) throw new Error('token revoked');
```

**アクセストークンを短命にする**: 有効期限15分なら、最悪でも15分後には無効になる。

## セッションとJWTの使い分け

| | セッション | JWT |
|---|---|---|
| 状態 | サーバーが保持 | クライアントが保持 |
| スケール | セッションDBが必要 | ステートレスでスケールしやすい |
| 即時無効化 | 簡単 | 難しい |
| 向いている | 従来のWebアプリ | API・マイクロサービス・SPAとAPI |
