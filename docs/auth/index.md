# 認証

認証・認可の仕組みとプロトコル。

- [使い分けガイド](/auth/overview) — 方式の比較・場面別の選び方

## 基礎認証方式

- [Basic 認証](/auth/basic-auth) — HTTP標準の最もシンプルな認証方式
- [セッション認証](/auth/session-auth) — サーバーがセッション状態を保持する従来型の認証
- [APIキー認証](/auth/api-key) — 事前発行したトークン文字列による認証

## トークンベース

- [JWT](/auth/jwt) — JSON形式のステートレスな認証トークン
- [Bearer 認証](/auth/bearer) — トークンをHTTPヘッダーに乗せるHTTPの規約

## 認可・SSO プロトコル

- [OAuth2](/auth/oauth2) — 認可の委譲を標準化したプロトコル
- [OpenID Connect（OIDC）](/auth/oidc) — OAuth2の上に認証レイヤーを追加したプロトコル
- [SAML](/auth/saml) — エンタープライズSSOのXMLベース標準プロトコル
