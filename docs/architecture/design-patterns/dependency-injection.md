# Dependency Injection（依存性注入）

オブジェクトが依存するコンポーネントを自分で生成せず、外部から渡してもらう設計パターン。DI とも略される。SOLID の **D**（依存性逆転の原則） を実現する具体的な手法。

## なぜ存在するか

依存オブジェクトをクラス内部で生成すると、依存先の具体実装に縛られる。

```typescript
// Bad: UserService が MySQLRepository に直接依存している
class UserService {
    private repo = new MySQLUserRepository(); // 具体クラスを自分で生成

    async getUser(id: string) {
        return this.repo.findById(id);
    }
}
// → テストで DB を使わなければならない
// → PostgreSQL に変えたいとき UserService を変更しなければならない
```

DI は依存を外から渡すことで、これを解決する。

```typescript
// Good: 外から注入する
class UserService {
    constructor(private repo: UserRepository) {} // インターフェースに依存

    async getUser(id: string) {
        return this.repo.findById(id);
    }
}

// 本番: 実際の DB 実装を注入
const service = new UserService(new MySQLUserRepository());

// テスト: インメモリ実装を注入
const service = new UserService(new InMemoryUserRepository());
```

## 3つの注入方法

**コンストラクタ注入**（推奨）

```typescript
class OrderService {
    constructor(
        private orderRepo: OrderRepository,   // 必須の依存
        private mailer: Mailer,
    ) {}
}
```

依存が明示的・必須であることが型で保証される。最も推奨される方法。

**セッター注入**

```typescript
class ReportService {
    private logger?: Logger;
    setLogger(logger: Logger) { this.logger = logger; }
}
```

オプションの依存に使う。依存が注入されていない状態が発生しうるため注意が必要。

**フィールド注入**

```java
@Autowired  // Spring のアノテーション
private UserRepository userRepo;
```

フレームワークが自動で注入する。コードは簡潔だが、依存が隠れてテストしにくくなるため推奨されない。

## DI コンテナ

依存関係が複雑になると手動での注入が大変になる。DI コンテナは「どのインターフェースにどの実装を使うか」を登録しておき、オブジェクトのグラフを自動で組み立てる。

```typescript
// tsyringe（TypeScript の DI コンテナ）の例
container.register<UserRepository>('UserRepository', MySQLUserRepository);
container.register<Mailer>('Mailer', SendGridMailer);

// コンテナが依存を自動で解決して注入する
const service = container.resolve(OrderService);
```

**有名な DI コンテナ:**
- Java: Spring（`@Autowired`）・Guice
- TypeScript: tsyringe・InversifyJS・NestJS
- Python: dependency-injector
- Go: Wire（コード生成）

## IoC（制御の逆転）との関係

DI は **IoC**（Inversion of Control） の一形態。「依存オブジェクトを自分で制御しない」という考え方。フレームワークがオブジェクトのライフサイクルを管理し、アプリコードはルールを書くだけになる。

```
従来: アプリコードが依存を生成・管理（制御がアプリにある）
IoC:  フレームワーク（DI コンテナ）が依存を管理（制御が逆転）
```

## いつ使うか

- ユニットテストで依存をモック・スタブに差し替えたいとき
- 環境ごとに実装を差し替えたいとき（本番 DB ↔ テスト用 DB）
- 横断的な関心事（ロギング・トランザクション）を後から差し込みたいとき

シンプルなスクリプトや小規模アプリでは手動で渡すだけで十分。DI コンテナが必要になるのは依存グラフが複雑になってから。
