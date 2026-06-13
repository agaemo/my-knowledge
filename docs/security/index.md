# Security

Webアプリケーションのセキュリティに関する概念・攻撃手法・対策。

- [CORS](/security/cors) — ブラウザの同一オリジンポリシーとクロスオリジンリソース共有
- [Cookie](/security/cookie) — HttpOnly・Secure・SameSiteの役割とセキュアな設定方針
- [暗号化の基礎](/security/encryption) — 共通鍵・公開鍵・ハッシュの違い。TLS・パスワード保存・JWT署名の根拠
- [HTTP セキュリティヘッダー](/security/http-headers) — CSP・HSTS・X-Frame-Options・X-Content-Type-Options・Referrer-Policy。ブラウザの挙動をヘッダーで制限する防御層
- [マジックバイト・ファイルシグネチャ](/security/magic-bytes) — ファイル種別をバイト列で識別する仕組みとセキュリティ上の限界
- [WAF（Web Application Firewall）](/security/waf) — HTTPトラフィックを検査して既知の攻撃パターンをブロックする防御層
- [ファイアウォールルール](/security/firewall-rules) — インバウンド・アウトバウンドのトラフィック制御・ステートフルフィルタリング
- [セキュリティ設計原則](/security/principles) — Zero Trust・多層防御・最小権限。攻撃手法より上位の設計指針
- [Web攻撃手法](/security/web-attacks/) — XSS・CSRF・SQLi・SSRF・クリックジャッキング・IDORなど
- [認証突破攻撃](/security/credential-attacks/) — ブルートフォース・レインボーテーブル
- [脅威・リスク](/security/threats/) — ゼロデイ・サプライチェーン攻撃など組織・運用レベルで対処する脅威
- [ペネトレーションテスト](/security/pentest/) — 侵入フェーズの全体像・偵察・脆弱性スキャン・ファジング・現地調達型攻撃
