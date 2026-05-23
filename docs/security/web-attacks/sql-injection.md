# SQLインジェクション

ユーザー入力に悪意あるSQLを埋め込み、DBを不正操作する攻撃。

## 仕組み

ユーザー入力をそのままSQL文字列に連結して組み立てると、入力値がSQL構文として解釈される。

```
入力値: ' OR '1'='1
組み立てられるSQL: SELECT * FROM users WHERE name = '' OR '1'='1'
→ 全ユーザーのレコードが取得される

入力値: '; DROP TABLE users; --
組み立てられるSQL: SELECT * FROM users WHERE name = ''; DROP TABLE users; --
→ usersテーブルが削除される
```

## 対策

- **プリペアドステートメント**: SQLとパラメータを分離して処理する。入力値がSQL構文として解釈されない
- **ORM**: Prisma・TypeORMなどは内部でプリペアドステートメントを使用する
- **入力バリデーション**: 型・長さ・フォーマットを事前に検証する
