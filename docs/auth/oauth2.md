# OAuth 2.0

## 何か

**認可（Authorization）のフレームワーク**。
「AというアプリがBというサービスのリソースにアクセスすることをユーザーが許可する」仕組み。

よく誤解されるが、**OAuth 2.0 は認証ではなく認可**。
「このユーザーが誰か」ではなく「このアプリにどのアクセスを許可するか」を扱う。

## 登場人物

| 用語 | 役割 | 例 |
|---|---|---|
| Resource Owner | リソースの所有者（ユーザー） | GitHubアカウントのオーナー |
| Client | アクセスしたいアプリ | GitHub連携したいWebアプリ |
| Authorization Server | 認可を行うサーバー | GitHub の OAuth サーバー |
| Resource Server | リソースを持つサーバー | GitHub API |

## 認可コードフロー（Authorization Code Flow）

最も一般的で安全なフロー。Webアプリに使う。

```
1. Client → ユーザーを Authorization Server にリダイレクト
           GET /authorize?client_id=xxx&redirect_uri=xxx&scope=repo&state=yyy

2. ユーザー → Authorization Server で「許可」をクリック

3. Authorization Server → Client の redirect_uri に認可コードを返す
           GET /callback?code=AUTH_CODE&state=yyy

4. Client → Authorization Server にアクセストークンを要求（サーバー間通信）
           POST /token
           { code: AUTH_CODE, client_id, client_secret, redirect_uri }

5. Authorization Server → アクセストークンを返す
           { access_token, token_type, expires_in, refresh_token }

6. Client → Resource Server にアクセストークンを使ってリクエスト
           GET /user/repos
           Authorization: Bearer ACCESS_TOKEN
```

**認可コードを経由する理由**: アクセストークンをブラウザのURLに露出させないため。
ステップ4はサーバー間通信（クライアントシークレットを使う）なのでトークンが漏れない。

## PKCE（Proof Key for Code Exchange）

SPAやモバイルアプリは `client_secret` を安全に保持できない。
PKCE は**シークレットなしで**認可コードフローを安全に使う拡張。

```ts
// 1. code_verifier（ランダムな文字列）を生成
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// 2. code_challenge = SHA256(code_verifier) を認可リクエストに含める
const codeChallenge = crypto.createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// 3. 認可リクエスト
GET /authorize?code_challenge=xxx&code_challenge_method=S256&...

// 4. トークンリクエストに code_verifier を含める
POST /token
{ code, code_verifier, ... }
// Authorization Server が SHA256(code_verifier) === code_challenge を検証する
```

## フローの使い分け

| フロー | 使う場面 |
|---|---|
| Authorization Code + PKCE | SPA・モバイルアプリ（現在の推奨） |
| Authorization Code（シークレットあり） | サーバーサイドWebアプリ |
| Client Credentials | サーバー間通信（ユーザーなし） |
| Device Code | TVなどキーボードが使えないデバイス |
| Implicit | **非推奨**（PKCE に移行） |

### Client Credentials Flow

バッチ処理・マイクロサービス間通信など、ユーザーが介在しない場面で使う。

```
POST /token
{ grant_type: 'client_credentials', client_id, client_secret, scope }

→ { access_token, expires_in }
```

## OAuth 2.0 と OpenID Connect の違い

| | OAuth 2.0 | OpenID Connect (OIDC) |
|---|---|---|
| 目的 | **認可**（リソースアクセス権限） | **認証**（ユーザーの同一性確認） |
| トークン | アクセストークン | アクセストークン + **ID トークン（JWT）** |
| ユーザー情報 | 別途 API で取得 | ID トークンに含まれる |

「Google ログイン・GitHub ログイン」は **OIDC**（OAuth 2.0 の上に認証レイヤーを追加したもの）。

```ts
// OIDC の ID トークン（JWT）に含まれる情報
{
  "sub": "user-google-123",   // ユーザーID
  "email": "alice@gmail.com",
  "name": "Alice",
  "iss": "https://accounts.google.com",  // 発行者
  "aud": "my-client-id",                 // 対象アプリ
  "exp": 1715000000,
}
```

## scope（スコープ）

クライアントが要求するアクセス権限の範囲。ユーザーが許可画面で確認する。

```
scope=repo                # GitHubのリポジトリへの読み書き
scope=read:user           # GitHubのユーザー情報の読み取りのみ
scope=email profile       # Googleのメールアドレスとプロフィール
```

**最小権限の原則**: 必要な scope だけを要求する。

## よくある間違い

### state パラメータを省く（CSRF 脆弱性）

```ts
// Bad: state なし
GET /authorize?client_id=xxx&redirect_uri=xxx

// Good: state でリクエストを紐付ける
const state = crypto.randomUUID();
session.oauthState = state;
GET /authorize?client_id=xxx&redirect_uri=xxx&state={state}

// コールバックで検証
if (req.query.state !== session.oauthState) throw new Error('CSRF detected');
```

### アクセストークンをフロントエンドで永続化する

アクセストークンはメモリのみに置き、ページリロード時はリフレッシュトークン（httpOnly Cookie）で再取得する。
