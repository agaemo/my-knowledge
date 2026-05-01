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
2. ユーザー → Authorization Server で「許可」をクリック
3. Authorization Server → Client の redirect_uri に認可コードを返す
4. Client → Authorization Server にアクセストークンを要求（サーバー間通信）
5. Authorization Server → アクセストークンを返す
6. Client → Resource Server にアクセストークンを使ってリクエスト
```

認可コードを経由する理由: アクセストークンをブラウザのURLに露出させないため。
ステップ4はサーバー間通信（クライアントシークレットを使う）なのでトークンが漏れない。

## PKCE（Proof Key for Code Exchange）

SPAやモバイルアプリは `client_secret` を安全に保持できない（ソースコードに埋め込んでも解析される）。
PKCE は**シークレットなしで**認可コードフローを安全に使う拡張。

フロー開始時にランダムな検証子（code_verifier）を生成し、そのハッシュ（code_challenge）を認可リクエストに含める。
トークン取得時に元の検証子を送り、Authorization Server がハッシュ照合することで、認可コードを横取りされても悪用できないようにする。

## フローの使い分け

| フロー | 使う場面 |
|---|---|
| Authorization Code + PKCE | SPA・モバイルアプリ（現在の推奨） |
| Authorization Code（シークレットあり） | サーバーサイドWebアプリ |
| Client Credentials | サーバー間通信（ユーザーなし） |
| Device Code | TVなどキーボードが使えないデバイス |
| Implicit | **非推奨**（PKCE に移行） |

Client Credentials Flow はバッチ処理・マイクロサービス間通信など、ユーザーが介在しない場面で使う。

## scope（スコープ）

クライアントが要求するアクセス権限の範囲。ユーザーが許可画面で確認する。

最小権限の原則として、必要な scope だけを要求する。

## OAuth 2.0 と OpenID Connect の違い

| | OAuth 2.0 | OpenID Connect (OIDC) |
|---|---|---|
| 目的 | **認可**（リソースアクセス権限） | **認証**（ユーザーの同一性確認） |
| 返されるトークン | アクセストークン | アクセストークン + **ID トークン（JWT）** |
| ユーザー情報の取得 | 別途 API で取得 | ID トークンに含まれる |

「Google ログイン・GitHub ログイン」は **OIDC**（OAuth 2.0 の上に認証レイヤーを追加したもの）。

## よくある間違い

### state パラメータを省く（CSRF 脆弱性）

認可リクエストに `state` パラメータを含め、コールバック時に照合しないと CSRF 攻撃に脆弱になる。
攻撃者が用意した認可コードを被害者のセッションで使わせることができる。

### アクセストークンをフロントエンドで永続化する

アクセストークンはメモリのみに置き、ページリロード時はリフレッシュトークン（httpOnly Cookie）で再取得する。
