# Content-Type ヘッダー操作

HTTPリクエストの `Content-Type` ヘッダーはクライアントが自由に設定できる。サーバーがこの値を信頼して処理を分岐させていると、攻撃者が意図しない処理経路に誘導できる。

## なぜ問題になるか

`Content-Type` はあくまでクライアントからの申告にすぎない。ブラウザが自動設定する場合でも、Burp Suite・curl・カスタムスクリプトを使えば任意の値に書き換えられる。

```http
POST /upload HTTP/1.1
Content-Type: image/jpeg   ← この値はクライアントが自由に変更できる

（実際の中身はPHPスクリプト）
```

## 攻撃パターン

### ファイルアップロードの検証回避

サーバーが `Content-Type: image/jpeg` を確認して許可している場合、PHPファイルをアップロードする際にこのヘッダーを付けることで検証を通過できる。実際のファイル内容は検証されていない。

### MIMEスニッフィングの悪用

古いブラウザはサーバーが返す `Content-Type` を無視し、ファイルの中身から種別を推測（スニッフィング）する。テキストファイルとして返したつもりのHTMLがスクリプトとして実行されることがある。

```http
HTTP/1.1 200 OK
Content-Type: text/plain   ← サーバーはテキストのつもり

<script>alert(1)</script>  ← ブラウザがHTMLと判断して実行
```

`X-Content-Type-Options: nosniff` ヘッダーを返すことでスニッフィングを無効化できる。

### JSONとフォームデータの混同

APIが `application/json` のみを想定していても、`application/x-www-form-urlencoded` でリクエストを送ると別のパーサーで処理されるフレームワークがある。CSRF対策がJSONのみを想定していた場合に迂回される。

## 対策

- **Content-Typeを信頼しない**: サーバー側でファイルの実際の中身を検証する（マジックバイト確認・再エンコードなど）
- **`X-Content-Type-Options: nosniff` を返す**: ブラウザのMIMEスニッフィングを無効化する
- **受け入れるContent-Typeを許可リストで絞る**: 想定外の値は早期に拒否する

## 関連

- [ファイルアップロード脆弱性](/security/web-attacks/file-upload) — Content-Type偽装が使われる代表的な文脈
- [マジックバイト・ファイルシグネチャ](/security/magic-bytes) — Content-Typeに依存しないファイル種別判定
