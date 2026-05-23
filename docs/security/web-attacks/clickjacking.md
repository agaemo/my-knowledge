# クリックジャッキング

透明なiframeで正規サイトを重ね、ユーザーが意図しないボタン・リンクをクリックさせる攻撃。

## 仕組み

1. 攻撃者サイトが透明な iframe で正規サイト（銀行・SNSなど）を表示する
2. iframe の上に「クリックして景品をもらおう」などの罠UIを重ねる
3. ユーザーが罠UIをクリックすると、背後の正規サイトのボタン（送金・設定変更・フォロー・投稿など）が押される

JavaScriptを使わず、ユーザーの正規セッションをそのまま利用するため、CSRFトークンが設定されていても効果がない。

## 対策

- **X-Frame-Options ヘッダー**: `DENY`（全てのiframe埋め込みを禁止）または `SAMEORIGIN`（同一オリジンのみ許可）を設定する
- **Content Security Policy**: `frame-ancestors 'none'` または `frame-ancestors 'self'` で制御する。X-Frame-Optionsより柔軟で、複数ドメインの許可も記述できる
- **フレームバスティングJS**: `top !== self` を検知してリダイレクトするが、`sandbox` 属性でiframe内のJSを無効化されると回避されるため補助的な手段にとどまる
