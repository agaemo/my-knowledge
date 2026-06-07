# Web攻撃手法

Webアプリケーションに対する攻撃手法と対策。開発者がコードの書き方・設計で直接対処できるものが中心。フレームワークが自動で防いでいるものも多いが、仕組みを知らないと防御が抜け落ちる。

- [XSS（Cross-Site Scripting）](/security/web-attacks/xss) — 悪意あるスクリプトを埋め込みブラウザ上で実行させる
- [CSRF（Cross-Site Request Forgery）](/security/web-attacks/csrf) — ログイン済みユーザーに意図しないリクエストを送信させる
- [SQLインジェクション](/security/web-attacks/sql-injection) — 入力にSQLを埋め込みDBを不正操作する
- [コマンドインジェクション](/security/web-attacks/command-injection) — 入力にOSコマンドを埋め込みサーバーで任意コマンドを実行させる
- [ディレクトリトラバーサル](/security/web-attacks/directory-traversal) — パス操作で非公開ファイルにアクセスする
- [テンプレートインジェクション](/security/web-attacks/template-injection) — テンプレートエンジンを悪用して任意コードを実行する
- [SSRF（Server-Side Request Forgery）](/security/web-attacks/ssrf) — サーバーに内部リソースへのリクエストを発行させる
- [クリックジャッキング](/security/web-attacks/clickjacking) — 透明iframeで意図しない操作をさせる
- [IDOR（Insecure Direct Object Reference）](/security/web-attacks/idor) — 認可チェックなしで他ユーザーのリソースにアクセスできる
- [ファイルアップロード脆弱性](/security/web-attacks/file-upload) — 検証不備でサーバーに任意スクリプトを設置・実行される
