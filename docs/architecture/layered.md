# レイヤードアーキテクチャ

## なぜこのアーキテクチャが存在するか

コードが増えると「HTTPの処理」「ビジネスロジック」「DBアクセス」が1ファイルに混在し始める。
変更のたびにどこを触れば良いかわからなくなる問題を解決する最もシンプルな構造。

## 構造

```
src/
├── routes/       # HTTPハンドラ・リクエストのバリデーション
├── services/     # ビジネスロジック（アプリの核心）
├── repositories/
│   ├── interfaces/   # リポジトリのインターフェース定義
│   └── impl/         # DB実装（SQLite・MySQL・PostgreSQL など）
└── lib/          # 汎用ユーティリティ
```

## 依存の向き

```
routes → services → repositories/interfaces ← repositories/impl
```

- `routes` は `services` を呼ぶ
- `services` は `repositories/interfaces` にだけ依存する（実装を知らない）
- `repositories/impl` が `interfaces` を実装する

## 各層の責務

### routes/
- HTTPリクエストを受け取る
- リクエストボディ・パラメータのバリデーション
- サービス呼び出し → HTTPレスポンスへの変換

**書いてはいけないもの**: ビジネスロジック、DB操作

```ts
// routes/userRoutes.ts
router.post('/users', async (req, res) => {
  const { email, name } = req.body;

  // バリデーションはここ
  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }

  // ビジネスロジックはserviceに委ねる
  const result = await userService.createUser({ email, name });

  if (!result.ok) {
    return res.status(422).json({ error: result.error });
  }

  res.status(201).json(result.value);
});
```

### services/
- ビジネスルールを実装する唯一の場所
- 戻り値は `Result<T>` 型を使い、例外を throw しない

```ts
// services/userService.ts
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(input: { email: string; name: string }): Promise<Result<User>> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      return { ok: false, error: 'email already registered' };
    }

    const user = await this.userRepo.save({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: new Date(),
    });

    return { ok: true, value: user };
  }
}
```

### repositories/
- SQLやクエリビルダの呼び出しのみ
- ビジネス判断をしない（条件分岐でビジネスルールを実装しない）

```ts
// repositories/interfaces/UserRepository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// repositories/impl/UserRepositorySQLite.ts
export class UserRepositorySQLite implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.get('SELECT * FROM users WHERE id = ?', [id]);
  }
  // ...
}
```

## インターフェースを挟む理由

サービスが実装ではなくインターフェースに依存することで、DBエンジンの切り替えが「実装ファイルの差し替えだけ」で完結する。

```ts
// DIコンテナ or 手動注入
const userRepo = new UserRepositorySQLite(db); // ← ここだけ変える
const userService = new UserService(userRepo);
```

## いつ使うか

- CRUD中心のAPI・管理画面
- チームが小さい・スピード優先
- ビジネスロジックがシンプル

## スケールの限界サイン（次のアーキテクチャへ移行の目安）

- サービスが他のサービスを大量 import するようになった
- ビジネスルールが routes や repositories に漏れ始めた
- テストで DB モックが複雑になった

→ [モジュラーモノリス](/architecture/modular-monolith) または [オニオンアーキテクチャ](/architecture/onion) を検討
