# 冪等性（Idempotency）

同じリクエストを何度実行しても、結果が変わらない性質。  
ネットワークは信頼できない。タイムアウト・リトライが起きる前提で設計するための概念。

## なぜ重要か

```
クライアント → リクエスト送信 → サーバー処理完了
             ← レスポンスが返らない（ネットワーク障害）

クライアントはわからない:
  - サーバーが処理した後に失敗したのか
  - サーバーが処理する前に失敗したのか

→ 安全のためにリトライする
→ 冪等でないと二重処理が起きる
```

決済の二重請求・注文の重複作成・メールの二重送信が典型的な冪等性の欠如による問題。

## HTTP メソッドと冪等性

HTTP 仕様では各メソッドの冪等性が定義されている。

| メソッド | 冪等 | 理由 |
|---|:---:|---|
| GET | ✓ | データを取得するだけ。何度呼んでも変わらない |
| PUT | ✓ | 同じデータで上書きするだけ。何度やっても同じ結果 |
| DELETE | ✓ | 削除済みをもう一度削除してもエラーでなければ同じ結果 |
| POST | ✗ | 呼ぶたびにリソースを作成する。2回呼ぶと2つ作られる |
| PATCH | ✗ | 差分適用なので累積する（`count += 1` など） |

## 冪等性キー（Idempotency Key）

POST でも冪等にしたい場合、クライアントが一意なキーをリクエストに含め、サーバーが重複を検知する。

```
1回目: POST /payments
       Idempotency-Key: uuid-abc-123
       → 決済処理 → 結果をキーと共に保存

2回目（リトライ）: POST /payments
                   Idempotency-Key: uuid-abc-123
                   → キーが存在する → 1回目の結果を返す（再処理しない）
```

Stripe・Shopify などの決済 API が採用している標準的なパターン。

```typescript
// サーバー側の実装イメージ
async function createPayment(req: Request) {
    const key = req.headers['idempotency-key'];
    if (!key) throw new Error('Idempotency-Key required');

    const cached = await cache.get(key);
    if (cached) return cached; // 同じキーなら保存済みの結果を返す

    const result = await processPayment(req.body);
    await cache.set(key, result, { ttl: '24h' });
    return result;
}
```

## DB での設計

**UPSERT（INSERT OR UPDATE）** を使うと、同じデータを何度挿入しても重複しない。

```sql
-- PostgreSQL
INSERT INTO orders (id, user_id, amount)
VALUES ($1, $2, $3)
ON CONFLICT (id) DO NOTHING;  -- 同じIDがあれば無視
```

**楽観的ロック / バージョン番号** で重複更新を防ぐ。

```sql
UPDATE accounts SET balance = $1, version = version + 1
WHERE id = $2 AND version = $3;  -- バージョンが一致しないと更新されない
```

## イベント処理での冪等性

メッセージキュー（Kafka・SQS）は「少なくとも1回（at-least-once）」の配信を保証するため、同じメッセージが複数回届くことがある。

コンシューマー側で冪等に処理する設計が必要。

```
パターン1: メッセージIDを処理済みとして記録し、重複を無視する
パターン2: 処理そのものを冪等にする（UPSERT・上書きなど）
```

## いつ意識するか

- 決済・在庫・注文など「重複すると困る」処理を設計するとき
- リトライロジックを実装するとき
- マイクロサービス間・キューを使った非同期処理を設計するとき
