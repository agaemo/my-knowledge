# REST API 設計原則

## REST とは何か

HTTP を活用してリソースを操作する設計スタイル。
「リソース指向」が核心で、**名詞（リソース）に対して動詞（HTTPメソッド）を組み合わせる**。

## URL 設計

### 基本ルール

- **名詞・複数形**を使う（動詞を使わない）
- リソースの階層を表現する

```
# Bad: 動詞がURLに含まれている
POST /createUser
GET  /getUserById?id=123
POST /deleteOrder

# Good: 名詞 + HTTPメソッドで操作を表す
POST   /users
GET    /users/123
DELETE /orders/456
```

### 階層の表現

```
GET    /users              # ユーザー一覧
POST   /users              # ユーザー作成
GET    /users/:id          # 特定ユーザーの取得
PUT    /users/:id          # ユーザーの全更新
PATCH  /users/:id          # ユーザーの部分更新
DELETE /users/:id          # ユーザーの削除

GET    /users/:id/orders   # 特定ユーザーの注文一覧
GET    /orders/:id         # 特定注文の取得（ネストは2階層まで）
```

ネストは **2階層まで**。それ以上深くなるなら設計を見直す。

### クエリパラメータの用途

```
# フィルタリング
GET /orders?status=pending&userId=123

# ソート
GET /products?sort=price&order=asc

# ページネーション
GET /users?page=2&limit=20
# または
GET /users?cursor=xxx&limit=20  # カーソルベース（大量データに向く）

# 検索
GET /products?q=typescript
```

## HTTP メソッドの使い分け

| メソッド | 用途 | べき等性 | 安全性 |
|---|---|---|---|
| GET | 取得 | ✓ | ✓ |
| POST | 作成・操作 | ✗ | ✗ |
| PUT | 全体更新（存在しなければ作成） | ✓ | ✗ |
| PATCH | 部分更新 | △ | ✗ |
| DELETE | 削除 | ✓ | ✗ |

**べき等性**: 同じリクエストを何回送っても結果が変わらない。
**安全性**: サーバーの状態を変えない。

```ts
// PUT: 全フィールドを送る（送らなかったフィールドはリセットされる）
PUT /users/123
{ "name": "Alice", "email": "alice@example.com" }

// PATCH: 変更するフィールドだけ送る
PATCH /users/123
{ "name": "Alice Updated" }
```

## ステータスコード

正しいステータスコードを返すことで、クライアントが結果をコードで処理できる。

| コード | 意味 | 使う場面 |
|---|---|---|
| 200 OK | 成功 | GET・PUT・PATCH の成功 |
| 201 Created | 作成成功 | POST で作成に成功 |
| 204 No Content | 成功（本文なし） | DELETE の成功 |
| 400 Bad Request | リクエストが不正 | バリデーションエラー |
| 401 Unauthorized | 認証が必要 | 未ログイン |
| 403 Forbidden | 権限がない | ログイン済みだが操作権限なし |
| 404 Not Found | リソースが存在しない | ID で検索して見つからない |
| 409 Conflict | 競合 | 重複登録・楽観ロック失敗 |
| 422 Unprocessable Entity | 意味的に不正 | ビジネスルール違反 |
| 429 Too Many Requests | レート制限 | API制限超過 |
| 500 Internal Server Error | サーバーエラー | 予期しないエラー |

```ts
// 400: パラメータが足りない・形式が違う
if (!body.email) {
  return res.status(400).json({ error: 'email is required' });
}

// 422: ビジネスルール違反（形式は正しいが受け入れられない）
if (await userExists(body.email)) {
  return res.status(422).json({ error: 'email already registered' });
}
```

## エラーレスポンスの統一

エラー形式を統一することで、クライアントが一貫した処理を書ける。

```ts
// エラーレスポンスの形式を統一する
{
  "error": {
    "code": "VALIDATION_ERROR",      // 機械が読むコード
    "message": "Validation failed",  // 人が読むメッセージ
    "details": [                     // 詳細（任意）
      { "field": "email", "message": "invalid email format" },
      { "field": "name", "message": "name is required" }
    ]
  }
}
```

```ts
// Express の例: 中央集権的なエラーハンドラ
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode).json({
    error: {
      code: err.code,
      message: err.message,
      details: err.details,
    },
  });
});
```

## ページネーション

### オフセットベース

シンプルだが、大量データでパフォーマンスが劣化する。データが追加されると重複が起きる。

```ts
// リクエスト
GET /users?page=2&limit=20

// レスポンス
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### カーソルベース

大量データ・リアルタイム更新に向く。前後のページを取得するだけなら最適。

```ts
// リクエスト
GET /posts?cursor=eyJpZCI6MTAwfQ&limit=20

// レスポンス
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIwfQ",  // 次ページのカーソル
    "hasNext": true
  }
}
```

## バージョニング

破壊的変更（フィールド削除・型変更）が必要なときにAPIバージョンを変える。

```
# URLパスにバージョン（最も一般的）
GET /v1/users
GET /v2/users

# ヘッダーで指定
Accept: application/vnd.myapi.v2+json
```

**後方互換性を守る変更**（バージョン不要）:
- フィールドの追加
- 任意パラメータの追加

**破壊的変更**（バージョンアップが必要）:
- フィールドの削除・リネーム
- 型の変更
- エンドポイントの削除

## よくある設計ミス

```
# URLに動詞を入れる
POST /activateUser/123     → POST /users/123/activate

# 複数形と単数形が混在
GET /user/123              → GET /users/123

# エラーを200で返す
HTTP 200
{ "success": false, "error": "not found" }  → HTTP 404を使う

# 全て POST
POST /getUsers             → GET /users
```
