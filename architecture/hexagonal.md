# ヘキサゴナルアーキテクチャ（Ports & Adapters）

## 何か

Alistair Cockburn が提唱。アプリケーションの中心（ビジネスロジック）を外部から完全に隔離する設計。
六角形（Hexagon）の各辺がポート（接続口）で、外部とのやり取りはすべてアダプター経由になる。

別名: **Ports & Adapters アーキテクチャ**

## オニオンアーキテクチャとの違い

両者はよく混同されるが、着眼点が違う。

| | ヘキサゴナル | オニオン |
|---|---|---|
| 着眼点 | **外部との接続方法**（Port/Adapter） | **依存の方向**（内から外へ） |
| 構造の表現 | 六角形の「辺＝ポート」 | 同心円の「層」 |
| 共通点 | どちらもドメインを中心に置き、外部依存を逆転させる |

実際には組み合わせて使われることが多い。

## 概念

### Port（ポート）

アプリケーションが外部と通信するための「接続口」の定義（インターフェース）。

- **Driving Port（駆動側）**: 外部がアプリケーションを呼び出す口 → ユースケースのインターフェース
- **Driven Port（被駆動側）**: アプリケーションが外部を呼び出す口 → リポジトリ・外部APIのインターフェース

### Adapter（アダプター）

Portを実装した具体的なコード。外部の技術（HTTP・DB・メール）をPortの形に変換する。

- **Driving Adapter**: HTTP ハンドラ・CLI・テスト
- **Driven Adapter**: DB実装・外部APIクライアント・メール送信

## 構造

```
                  ┌─────────────────────────────┐
[HTTP]──Adapter──▶│                             │▶──Adapter──[PostgreSQL]
                  │   Application (Hexagon)      │
[CLI] ──Adapter──▶│                             │▶──Adapter──[外部API]
                  │  Port ←→ UseCase ←→ Port   │
[Test]──Adapter──▶│                             │▶──Adapter──[メール]
                  └─────────────────────────────┘
         Driving                              Driven
         (外→内)                             (内→外)
```

## コード例

### Driven Port（被駆動側）: アプリが外を呼ぶ口

```ts
// ports/UserRepository.ts — ポート（インターフェース）
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// ports/EmailService.ts — ポート
export interface EmailService {
  sendWelcome(to: string, name: string): Promise<void>;
}
```

### Application（六角形の内部）

```ts
// application/RegisterUser.ts — ユースケース
export class RegisterUser {
  constructor(
    private readonly userRepo: UserRepository,  // Portに依存
    private readonly emailService: EmailService, // Portに依存
  ) {}

  async execute(input: { email: string; name: string }): Promise<User> {
    const existing = await this.userRepo.findById(input.email);
    if (existing) throw new Error('already registered');

    const user = new User(crypto.randomUUID(), input.email, input.name);
    await this.userRepo.save(user);
    await this.emailService.sendWelcome(user.email, user.name);
    return user;
  }
}
```

### Driven Adapter（被駆動側）: DB・外部サービスの実装

```ts
// adapters/driven/UserRepositoryPostgres.ts
export class UserRepositoryPostgres implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? mapToUser(row) : null;
  }
  async save(user: User): Promise<void> {
    await db.query('INSERT INTO users ...', [...]);
  }
}

// adapters/driven/EmailServiceSendGrid.ts
export class EmailServiceSendGrid implements EmailService {
  async sendWelcome(to: string, name: string): Promise<void> {
    await sendgrid.send({ to, subject: `Welcome ${name}!`, ... });
  }
}
```

### Driving Adapter（駆動側）: HTTP・テスト

```ts
// adapters/driving/http/userRoutes.ts — HTTP Adapter
router.post('/users', async (req, res) => {
  const useCase = new RegisterUser(
    new UserRepositoryPostgres(db),
    new EmailServiceSendGrid(),
  );
  const user = await useCase.execute(req.body);
  res.status(201).json(user);
});

// adapters/driving/test/RegisterUser.test.ts — Test Adapter
test('ユーザー登録が成功する', async () => {
  const useCase = new RegisterUser(
    new InMemoryUserRepository(), // テスト用アダプター
    new FakeEmailService(),       // テスト用アダプター
  );
  const user = await useCase.execute({ email: 'a@b.com', name: 'Alice' });
  expect(user.name).toBe('Alice');
});
```

## ヘキサゴナルの本質的なメリット

**同じユースケースを複数の口から動かせる。**

```ts
// HTTP から呼ぶ
const useCase = new RegisterUser(postgresRepo, sendgridEmail);

// CLI から呼ぶ（アダプターが違うだけでユースケースは同じ）
const useCase = new RegisterUser(postgresRepo, consoleEmail);

// テストから呼ぶ
const useCase = new RegisterUser(inMemoryRepo, fakeEmail);
```

アダプターを差し替えるだけで、ユースケース（ビジネスロジック）には一切触れない。

## いつ使うか

- テストで DB・外部APIに依存したくない
- 同じビジネスロジックを HTTP・CLI・バッチなど複数の口から呼ぶ
- 将来 DB やメールサービスを変える可能性がある
