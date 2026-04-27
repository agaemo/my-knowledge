# オニオンアーキテクチャ

## なぜこのアーキテクチャが存在するか

レイヤードアーキテクチャでは「サービスがリポジトリに依存する」ため、ビジネスロジックのテストに DB が必要になる。
オニオンアーキテクチャは**依存の向きを逆転**させ、ドメイン層を完全に外部依存ゼロにする。

## 名前の由来

玉ねぎの断面図のように、中心から外に向かって層が重なる。

```
       ┌─────────────────────────┐
       │     presentation        │  HTTP / CLI / UI
       │   ┌─────────────────┐   │
       │   │   application   │   │  ユースケース
       │   │  ┌───────────┐  │   │
       │   │  │  domain   │  │   │  エンティティ・値オブジェクト・ルール
       │   │  └───────────┘  │   │
       │   └─────────────────┘   │
       └─────────────────────────┘
              ↑ infrastructure     DBやAPIなどの実装
```

**依存の向き: 外 → 内のみ。内は外を知らない。**

## 構造

```
src/
├── domain/          # 中心。外部への依存ゼロ
│   ├── entities/        # エンティティ（IDを持つオブジェクト）
│   ├── value-objects/   # 値オブジェクト（不変・値で同一性を判断）
│   └── repositories/    # インターフェースのみ（実装は infrastructure に）
├── application/     # ユースケース（domain にのみ依存）
│   └── use-cases/
├── infrastructure/  # 外部: DB・外部API・メール（domain インターフェースの実装）
│   ├── repositories/
│   └── services/
└── presentation/    # HTTP・CLI・UIなど（application にのみ依存）
    └── routes/
```

## 各層の責務

### domain/（最も重要・変更頻度が低い）

```ts
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    private email: Email,  // Value Object
    private name: string,
  ) {}

  changeEmail(newEmail: Email): void {
    // ビジネスルール: メール変更は検証済みのEmailオブジェクトのみ受け入れる
    this.email = newEmail;
  }
}

// domain/value-objects/Email.ts
export class Email {
  readonly value: string;

  constructor(value: string) {
    // コンストラクタでバリデーション
    if (!value.includes('@')) {
      throw new Error('invalid email format');
    }
    this.value = value;
  }
}

// domain/repositories/UserRepository.ts — インターフェースのみ
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

### application/（ユースケースの調整役）

```ts
// application/use-cases/CreateUser.ts
export class CreateUserUseCase {
  // コンストラクタインジェクションでリポジトリを受け取る
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: { email: string; name: string }): Promise<User> {
    const email = new Email(input.email); // ドメインのバリデーションを使う
    const existing = await this.userRepo.findById(email.value);

    if (existing) {
      throw new Error('user already exists');
    }

    const user = new User(crypto.randomUUID(), email, input.name);
    await this.userRepo.save(user);
    return user;
  }
}
```

### infrastructure/（外部への接続）

```ts
// infrastructure/repositories/UserRepositoryPostgres.ts
export class UserRepositoryPostgres implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!row) return null;
    return new User(row.id, new Email(row.email), row.name);
  }

  async save(user: User): Promise<void> {
    await db.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE ...',
      [user.id, user.email.value, user.name],
    );
  }
}
```

### presentation/（外界との接点）

```ts
// presentation/routes/userRoutes.ts
router.post('/users', async (req, res) => {
  const useCase = new CreateUserUseCase(new UserRepositoryPostgres(db));

  try {
    const user = await useCase.execute(req.body);
    res.status(201).json(user);
  } catch (e) {
    res.status(422).json({ error: e.message });
  }
});
```

## ドメイン層が外部依存ゼロであることのメリット

```ts
// テスト: DBが不要。モックだけでユースケースをテストできる
const fakeRepo: UserRepository = {
  findById: async () => null,
  save: async () => {},
};

const useCase = new CreateUserUseCase(fakeRepo);
const user = await useCase.execute({ email: 'test@example.com', name: 'Test' });
expect(user.name).toBe('Test');
```

## レイヤードとの違いまとめ

| | レイヤード | オニオン |
|---|---|---|
| 依存の向き | 上から下（service → repository） | 外から内（実装 → インターフェース） |
| ドメインのテスト | DB モックが必要 | 依存ゼロでテスト可能 |
| 複雑さ | シンプル | 高め |
| 向いている規模 | 小〜中 | 中〜大・長期運用 |

## いつ使うか

- ビジネスルールが複雑で長期運用が見込まれる
- テストカバレッジを高めたい
- DB・フレームワークを将来置き換える可能性がある

## DDDとの組み合わせ

オニオンアーキテクチャの `domain/` 層に DDD の概念（Entity・Value Object・Repository）を適用するのが最も一般的な組み合わせ。
[DDD](/architecture/04_ddd) を参照。
