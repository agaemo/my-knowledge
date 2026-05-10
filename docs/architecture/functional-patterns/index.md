# 関数型プログラミングパターン

オブジェクト指向が「状態とふるまいを持つオブジェクトの組み合わせ」で設計するのに対し、関数型は「データ変換のパイプライン」として設計する。  
Haskell が理論的な根拠（圏論）を持ち込み、Scala・F#・Kotlin・TypeScript など主流言語が取り入れた。

モナドなどの概念は難解に見えるが、「Promise を使ったことがある」なら実は既に使っている。

---

## 純粋関数（Pure Function）

**何を解決するか：** 同じ入力には必ず同じ出力を返し、副作用を持たない関数を設計の基本単位にする。

```typescript
// 純粋関数 — テストが容易で、どこで呼んでも安全
const add = (a: number, b: number): number => a + b;

// 純粋でない関数 — 外部状態に依存し、結果が変わりうる
let count = 0;
const increment = () => ++count; // グローバル状態を変化させる
```

**いつ効くか：** 純粋関数はメモ化・並列実行・テストが自然に成立する。副作用（I/O・状態変更・例外）はプログラムの端に追いやる設計にする。

---

## イミュータビリティ（Immutability）

**何を解決するか：** 一度作ったデータは変更しない。変更が必要なら新しいデータを作る。

```typescript
// ミュータブル — どこで変更されたか追いにくい
const user = { name: 'Alice', age: 30 };
user.age = 31; // 元のオブジェクトが変わる

// イミュータブル — 変更は新しいオブジェクトとして表現
const updatedUser = { ...user, age: 31 };
```

**現代の言語サポート：** Kotlin の `val` / `data class copy()`、Rust のデフォルト immutable、JavaScript の `Object.freeze()`、Java の `record`。

---

## 代数的データ型（Algebraic Data Types）

**何を解決するか：** 「値があるかもしれない」「成功か失敗か」を型として表現し、`null` や例外を排除する。

### Option / Maybe — 値があるかもしれない

```kotlin
fun findUser(id: Int): User? // Kotlin: null許容型（Optionと等価）

// null チェックの代わりに、型安全なチェーン
val name = findUser(id)?.name ?: "Unknown"
```

### Result / Either — 成功か失敗か

```kotlin
sealed class Result<out T> {
    data class Success<T>(val value: T) : Result<T>()
    data class Failure(val error: Exception) : Result<Nothing>()
}

fun divide(a: Int, b: Int): Result<Int> =
    if (b == 0) Result.Failure(ArithmeticException("div by zero"))
    else Result.Success(a / b)
```

**現代の言語サポート：** Rust の `Option<T>` / `Result<T, E>`、Kotlin の null 安全性、Swift の `Optional`、TypeScript の discriminated union。

---

## Functor

**何を解決するか：** コンテナの中身に関数を適用したい。コンテナを開けずに変換できる。

`map` を持つものが Functor。

```typescript
// Array は Functor
[1, 2, 3].map(x => x * 2); // → [2, 4, 6]

// Promise も Functor（中身が非同期でも map できる）
Promise.resolve(5).then(x => x * 2); // → Promise<10>

// Option も Functor（null でなければ変換）
const maybeUser: User | null = findUser(id);
const maybeName = maybeUser?.name; // Optional chaining は map と同じ意図
```

**なぜ重要か：** 「コンテナの種類（配列・非同期・null許容）を問わず同じ `map` パターンで書ける」という統一的な考え方が生まれる。

---

## Monad

**何を解決するか：** コンテナを返す関数を、ネストせずにチェーンしたい。

`flatMap`（`bind` / `>>=`）を持つ Functor が Monad。

```typescript
// map だとネストしてしまう
const result = [1, 2, 3].map(x => [x, x * 2]);
// → [[1, 2], [2, 4], [3, 6]]  ← ネストして扱いにくい

// flatMap なら平坦になる
const flat = [1, 2, 3].flatMap(x => [x, x * 2]);
// → [1, 2, 2, 4, 3, 6]
```

**Promise はモナド：** `then` が `flatMap` に相当する。非同期処理をネストさせずにチェーンできる。

```typescript
fetch('/user')
  .then(res => res.json())     // Promise<User> を返す関数
  .then(user => fetch(`/posts/${user.id}`)) // さらに Promise を返す
  .then(res => res.json());    // → ネストせずにチェーンできる
```

**async/await はモナドの糖衣構文：** `await` は Monad のチェーンを命令的な見た目で書けるようにしたもの。

```typescript
// 上の then チェーンと等価
async function fetchUserPosts() {
    const res = await fetch('/user');
    const user = await res.json();
    const postsRes = await fetch(`/posts/${user.id}`);
    return postsRes.json();
}
```

**現代の実例：**

| 文脈 | モナド | flatMap の意味 |
|---|---|---|
| 非同期 | Promise | 非同期処理をチェーン |
| null安全 | Option / `?.` | null なら伝播、あれば次へ |
| エラー処理 | Result / Either | 失敗なら伝播、成功なら次へ |
| 配列 | Array | 変換した配列を平坦化 |

---

## カリー化と部分適用（Currying & Partial Application）

**何を解決するか：** 複数引数の関数を「引数を1つ受け取り次の関数を返す関数」に変換し、再利用しやすくする。

```typescript
// 通常
const add = (a: number, b: number) => a + b;

// カリー化後
const curriedAdd = (a: number) => (b: number) => a + b;

const add5 = curriedAdd(5); // 部分適用 — add5 は再利用可能な関数になる
add5(3); // → 8
add5(10); // → 15
```

**いつ使うか：** `filter(isAdult)` のように、汎用関数を特定用途向けに固定した関数を作りたいとき。

---

## 関数合成（Function Composition）

**何を解決するか：** 小さな関数をつなげて複雑な変換を作る。

```typescript
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const processUser = pipe(
    normalize,
    validate,
    enrichWithDefaults,
    serialize,
);

processUser(rawInput);
```

**いつ使うか：** データ変換パイプライン（ETL・バリデーション処理）。小さく純粋な関数を組み合わせる設計にすると、テストと再利用が容易になる。
