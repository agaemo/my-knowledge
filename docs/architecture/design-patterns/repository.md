# Repository パターン

データアクセスのロジックをビジネスロジックから分離し、コレクションのように扱えるインターフェースを提供するパターン。Martin Fowler の *Patterns of Enterprise Application Architecture*（2002年）が出典。

## なぜ存在するか

ビジネスロジックが SQL やORMを直接触ると、以下の問題が起きる。

```
// ビジネスロジックの中に DB の詳細が混入する
class OrderService {
    void placeOrder(Order order) {
        // ビジネスルールの確認
        if (order.total() < 0) throw new Error();

        // DB の詳細がここに直接書かれている
        db.execute("INSERT INTO orders ...");
        db.execute("UPDATE inventory SET ...");
    }
}
```

- **テストが難しい** — DB なしでビジネスロジック単体をテストできない
- **DB 実装に依存** — MySQL → PostgreSQL の変更がビジネスロジックに波及する
- **重複したクエリ** — 同じ「注文を ID で取得する」クエリが複数箇所に散らばる

Repository はデータアクセスを抽象化し、ビジネスロジックから DB の詳細を隠す。

## 構造

```
[ビジネスロジック / ユースケース]
         ↓ インターフェースに依存
[OrderRepository インターフェース]
         ↓ 実装に依存しない
[OrderRepositoryImpl（MySQL）] [InMemoryOrderRepository（テスト用）]
```

## コード例

```typescript
// インターフェース — ビジネスロジックはここだけに依存する
interface OrderRepository {
    findById(id: string): Promise<Order | null>;
    findByUserId(userId: string): Promise<Order[]>;
    save(order: Order): Promise<void>;
    delete(id: string): Promise<void>;
}

// 本番実装
class PostgresOrderRepository implements OrderRepository {
    async findById(id: string) {
        const row = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        return row ? toDomain(row) : null;
    }
    async save(order: Order) {
        await db.query('INSERT INTO orders ...', [...]);
    }
    // ...
}

// テスト用のインメモリ実装（DB 不要）
class InMemoryOrderRepository implements OrderRepository {
    private store = new Map<string, Order>();
    async findById(id: string) { return this.store.get(id) ?? null; }
    async save(order: Order) { this.store.set(order.id, order); }
    // ...
}

// ビジネスロジック — DB の詳細を知らない
class OrderService {
    constructor(private repo: OrderRepository) {}

    async placeOrder(order: Order) {
        if (order.total() < 0) throw new Error('Invalid order');
        await this.repo.save(order);
    }
}
```

テストでは `InMemoryOrderRepository` を注入するだけで DB なしにビジネスロジックをテストできる。

## DDD との関係

DDD ではドメインモデルを永続化の詳細から守るために Repository を使う。Repository の実装（SQL・ORM）はインフラ層に置き、ドメイン層はインターフェースだけを知る。ヘキサゴナルアーキテクチャの「ポート」がこれに相当する。

## いつ使うか

- ビジネスロジックのユニットテストを書きたいとき
- DB の実装を将来変えられるようにしたいとき（MySQL → DynamoDB など）
- 複数箇所で同じデータアクセスロジックが重複しているとき

小規模なスクリプトや管理ツールでは過剰になる。ビジネスルールが複雑なドメインほど価値が出る。
