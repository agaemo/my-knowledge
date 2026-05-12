# Backend

サーバーサイドの設計・通信プロトコル・データ処理に関する概念。

- [API](/backend/api/) — REST・GraphQL・gRPC・tRPC など通信プロトコルとAPIスタイルの設計
- [リバースプロキシ](/backend/reverse-proxy) — バックエンドの前段に置くトラフィック制御層。ロードバランシング・SSL終端・キャッシュ
- [冪等性](/backend/idempotency)
- [キャッシュ戦略](/backend/caching) — Cache-Aside・Write-Through・TTL 設計。なぜキャッシュが必要か・どのパターンを選ぶか — 同じリクエストを何度実行しても結果が変わらない設計。リトライ・二重処理対策の基礎
