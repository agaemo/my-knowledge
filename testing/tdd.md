# TDD（テスト駆動開発）

## なぜ TDD が有効か

「実装してからテストを書く」と、テストが実装に引きずられる。「このコードはこう動く」という確認テストになりやすく、バグを見つけにくい。
TDD は**テストが仕様書になる**。実装前にテストを書くことで「何を作るべきか」を明確にしてから実装に入れる。

## サイクル

```
1. Red    — 失敗するテストを書く（実装はまだない）
2. Green  — テストが通る最小限の実装を書く
3. Refactor — 振る舞いを変えずにコードを整理する
```

**1サイクルの単位は小さく保つ。** 1関数・1エンドポイントが目安。
大きな機能は小さなサイクルに分解してから始める。

## フェーズ別のルール

### Red フェーズ

- テストを書いたら**必ず実行して失敗を確認**してから実装に進む
  - 未実装なのに green になる場合はテスト自体が壊れている（何もテストできていない）
- テスト名は「[条件]のとき[期待結果]」の形式

```ts
// Bad: 何をテストしているかわからない
test('email test', () => { ... });

// Good: 条件と期待結果が明確
test('無効なメールアドレスのとき例外を投げる', () => { ... });
test('既存ユーザーと同じメールのとき登録に失敗する', () => { ... });
```

- 1テストにアサーションは原則1つ（1テスト = 1つの「なるほど」）

### Green フェーズ

- テストを通す**最小限の実装**だけ書く
- 「きれいに書こう」はRefactorフェーズに委ねる
- すべての**既存テストが引き続き green** であることを確認する（リグレッションがないこと）

### Refactor フェーズ

- テストが green の状態を維持しながら整理する
- DRY・命名・構造の改善に集中する
- **振る舞いは変えない**。テストが全部 green なら正しくリファクタリングできている

## 具体例: ユーザー登録ユースケース

### Step 1: Red

```ts
// tests/createUser.test.ts
describe('CreateUserUseCase', () => {
  test('有効な入力のとき新しいユーザーが作成される', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo);

    const user = await useCase.execute({ email: 'test@example.com', name: 'Alice' });

    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Alice');
  });

  test('既存のメールアドレスのとき登録に失敗する', async () => {
    const repo = new InMemoryUserRepository();
    await repo.save({ id: '1', email: 'test@example.com', name: 'Bob' });
    const useCase = new CreateUserUseCase(repo);

    await expect(
      useCase.execute({ email: 'test@example.com', name: 'Alice' })
    ).rejects.toThrow('email already registered');
  });
});
```

テストを実行 → `CreateUserUseCase` が存在しないので失敗 ✓

### Step 2: Green

```ts
// application/use-cases/CreateUser.ts — 最小限の実装
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: { email: string; name: string }) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new Error('email already registered');

    const user = { id: crypto.randomUUID(), ...input };
    await this.userRepo.save(user);
    return user;
  }
}
```

テストを実行 → green ✓

### Step 3: Refactor

```ts
// バリデーションを Value Object に分離（振る舞いは変えない）
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: { email: string; name: string }) {
    const email = new Email(input.email); // バリデーション込み
    const existing = await this.userRepo.findByEmail(email.value);
    if (existing) throw new Error('email already registered');

    const user = new User(crypto.randomUUID(), email, input.name);
    await this.userRepo.save(user);
    return user;
  }
}
```

テストを実行 → 引き続き green ✓

## テスト対象の優先度

### テストファーストにすべき対象

- ビジネスロジック（計算・バリデーション・状態遷移）
- API エンドポイント（正常系・異常系・認証）
- DB 操作（CRUD・トランザクション・制約）

### 実装後でよい対象

- UI コンポーネント（スナップショットテスト等）
- 外部サービスの薄いラッパー

## テストの分類

| 種類 | 対象 | 速度 | 外部依存 |
|---|---|---|---|
| 単体テスト | 関数・クラス1つ | 高速 | なし（モック） |
| 統合テスト | 複数コンポーネント | 中速 | DBなど実物を使う |
| E2Eテスト | 画面・APIの全体フロー | 低速 | 全て実物 |

TDD の Red/Green/Refactor サイクルは主に**単体テスト**で回す。
統合・E2E はリグレッション防止として書く。

## よくある疑問

**Q: モックとスパイはどう使い分けるか？**
- モック: 外部依存（DB・外部API）を差し替えるため
- スパイ: 「このメソッドが呼ばれたか」を検証するため
- ドメイン層のテストでは `InMemoryRepository` を使うとモックより読みやすい

**Q: 既存コードに後からテストを書くのは TDD ではないか？**
- 厳密には TDD ではないが、補完テストとして価値がある
- 既存コードのテストを書くときは「このコードがどう振る舞うべきか」の仕様確認の観点で書く

**Q: テストを書く時間がない場合は？**
- ビジネスロジックだけでも TDD にする
- HTTP ハンドラや DB 操作のテストは後回しにできるが、ビジネスロジックのテストは省略しない
