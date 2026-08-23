# Promise / Future パターン

非同期処理の結果を「まだ確定していない値」としてオブジェクトにカプセル化し、コールバックのネストを解消するパターン。並行プログラミングの文脈で1970〜80年代に登場した概念で、GoF の23パターンには含まれない。

## なぜ存在するか

非同期処理をコールバックで書くと、以下の問題が起きる（コールバック地獄）。

```javascript
getUser(userId, (err, user) => {
  if (err) return handleError(err);
  getPosts(user.id, (err, posts) => {
    if (err) return handleError(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);
      // ネストが深くなる、エラー処理が各層に重複する
    });
  });
});
```

- **可読性の低下** — ネストが深くなるほど処理の流れが追いにくくなる
- **エラー処理の重複** — 各コールバックで同じエラーハンドリングを書く必要がある
- **合成しづらい** — 複数の非同期処理を並列実行したり、結果を待ち合わせたりする処理が書きにくい

Promise/Future は「まだ完了していない計算の結果」を第一級オブジェクトとして表現し、メソッドチェーンで合成できるようにする。

## 構造

pending → fulfilled（成功）または rejected（失敗）という状態遷移を持ち、一度確定した状態は変わらない（immutable）。

```
[pending] --resolve()--> [fulfilled]
    |
    --reject()---------> [rejected]
```

## コード例

```javascript
function getUser(userId) {
  return fetch(`/users/${userId}`).then(res => res.json());
}

getUser(1)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .catch(err => handleError(err)); // エラー処理は1箇所に集約される
```

## Promise と Future の違い

用語は言語・文脈によって使い分けられる。

| 用語 | 主な文脈 | 特徴 |
|---|---|---|
| Future | Java・Scala など並行プログラミング全般 | 結果の「読み取り」専用の参照。値を確定させる側は別の型（Promise）に分離されることが多い |
| Promise | JavaScript | 値の確定（resolve/reject）と読み取り（then）が同じオブジェクトに統合されている |

## 他パターンとの関係

- **State** — pending/fulfilled/rejected という状態遷移を持つ点で類似
- **Observer** — `.then` で登録したコールバックが状態確定時に通知される点で類似
- **Monad** — `.then` は `flatMap` に相当し、Promise は関数型パターンにおけるモナドの具体例。詳細は[関数型パターン](/architecture/functional-patterns)

## いつ使うか

- 非同期I/O（ネットワークリクエスト・ファイル読み込み・DBクエリ）の結果を扱うとき
- 複数の非同期処理を順序立てて実行、または並列実行して待ち合わせたいとき（`Promise.all` など）
- コールバックのネストを解消したいとき

GoF のデザインパターンではないが、State・Observer と構造的に類似しており、現代の言語では非同期処理の標準的な抽象化として言語機能に組み込まれている（JavaScript の Promise、Java の `CompletableFuture`、C# の `Task` など）。
