# Bearer 認証

## 何か

HTTP の認証スキームの一種（RFC 6750）。
「トークンをリクエストにどう乗せるか」の規約であり、認証システムそのものではない。

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Bearer とはどういう意味か

Bearer は英語で **「持参人」** を意味する。

「このトークンを持っている人（Bearer）であれば誰でもアクセスできる」という性質を表している。
パスワード認証のように「特定の誰か」に紐づくのではなく、**トークン自体に権限がある**という考え方。

現金に近いイメージ。現金は「誰が持っているか」ではなく「持っているかどうか」で価値を持つ。

::: warning トークンを落とすと誰でも使える
Bearer トークンは持っているだけで有効なため、漏洩すると第三者に悪用される。有効期限を短くする・HTTPS を必須にする・httpOnly Cookie に保存するといった対策が重要。
:::

## JWT・OAuth2 との関係

Bearer はトークンの**運び方**の規約であり、トークンの**中身**は別のしくみが決める。

```
Authorization: Bearer <token>
                       ↑ここに何を入れるかは Bearer の規約外

よくある組み合わせ：
  Bearer + JWT          → JWT をそのまま乗せる
  Bearer + OAuth2 アクセストークン → OAuth2 が発行したトークンを乗せる
```

実装でよく見る `Authorization: Bearer xxxxx` は、多くの場合 JWT か OAuth2 のアクセストークンを Bearer スキームで送っているもの。

## Basic との違い

| | Basic 認証 | Bearer 認証 |
|---|---|---|
| 送るもの | ユーザー名・パスワード | トークン |
| ヘッダー | `Authorization: Basic <base64>` | `Authorization: Bearer <token>` |
| 認証情報の発行 | サーバーが管理するアカウント | ログインや OAuth2 フローで発行 |
| 毎回パスワードを送るか | 送る | 送らない（トークンを送る） |
