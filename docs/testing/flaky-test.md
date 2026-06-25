# フレーキーテスト

## なぜ存在するか（問題として）

フレーキーテスト（Flaky Test）とは、**コードを変更していないのに、実行するたびに pass/fail の結果が変わるテスト**のこと。

フレーキーテストが増えると：
- テストの失敗が「本物のバグ」か「たまたま失敗しただけ」か判断できなくなる
- 「またか」という感覚から、失敗を無視するようになる
- CI を再実行すれば通るので、根本原因を放置しがち

結果として**テストスイート全体の信頼性が失われる**。

## 主な原因

### 1. タイミング依存

```ts
// Bad: 固定の wait で待つ（環境によって足りないことがある）
await page.click('button');
await new Promise(r => setTimeout(r, 1000));
await expect(page.locator('.result')).toBeVisible();

// Good: 要素が現れるまで待つ（Playwright の auto-wait）
await page.click('button');
await expect(page.locator('.result')).toBeVisible(); // 自動で待機
```

### 2. テスト間の状態共有

```ts
// Bad: テストが共有状態に依存している（実行順序で結果が変わる）
let counter = 0;
test('カウントアップ', () => {
  counter++;
  expect(counter).toBe(1); // 別テストが先に実行されると失敗
});

// Good: 各テストで初期化する
test('カウントアップ', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

### 3. 外部依存（ネットワーク・時刻・乱数）

```ts
// Bad: 実際の時刻に依存
test('今日の日付でフィルタリングできる', () => {
  const results = filterByDate(data, new Date()); // 日付が変わると失敗
});

// Good: 時刻を固定する
test('今日の日付でフィルタリングできる', () => {
  jest.useFakeTimers().setSystemTime(new Date('2025-01-15'));
  const results = filterByDate(data, new Date());
  // ...
});
```

### 4. 並列実行の競合

複数のテストが同じDBテーブルやファイルを同時に操作すると競合が起きる。

```ts
// 解決策: テストごとに独立したデータを使う
beforeEach(async () => {
  testUser = await createUser({ email: `test-${crypto.randomUUID()}@example.com` });
});
afterEach(async () => {
  await deleteUser(testUser.id);
});
```

### 5. メモリリーク・リソース不足

長時間実行すると遅くなり、タイムアウトで失敗するケース。`afterEach` / `afterAll` でリソースを確実に解放する。

## 検出・対策のアプローチ

### 繰り返し実行で再現させる

```bash
# Jest: 同じテストを10回繰り返す
jest --testPathPattern=suspect.test.ts --count=10

# Playwright
npx playwright test --repeat-each=10
```

### 隔離して原因を特定する

1. 単独で実行して再現するか確認（テスト間依存の排除）
2. CI 環境だけで失敗するなら環境差異（タイムゾーン・フォント・ネットワーク）を疑う
3. ローカルでは再現しない場合、並列実行の競合を疑う

### 一時的な quarantine（隔離）

根本原因の修正に時間がかかる場合、フレーキーテストを一時的に隔離して CI をブロックしないようにする。ただし放置は禁止。

```ts
test.skip('フレーキー: issue #123 で追跡中', async () => {
  // ...
});
```

## いつ意識するか

- CI で原因不明の失敗が続くとき
- 「再実行したら通った」が増えてきたとき
- テストスイートを並列化するとき（競合が顕在化しやすい）
