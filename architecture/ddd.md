# DDD（Domain-Driven Design）

## なぜ DDD が必要か

「ユーザー」「注文」「在庫」などのビジネス概念をコードで表現するとき、プリミティブ型（string・number）だけを使うと「このemailは検証済みか？」「この金額はマイナスになれるか？」などのルールがコード全体に散らばる。
DDD は**ビジネスのルールをオブジェクトに閉じ込める**手法。

## 主要概念

### Entity（エンティティ）

**IDで同一性を判断するオブジェクト。** 値が変わっても同じ「もの」として扱う。

```ts
class User {
  constructor(
    public readonly id: string,  // ID が同一性の基準
    public email: string,
    public name: string,
  ) {}
}

const user1 = new User('abc', 'a@example.com', 'Alice');
const user2 = new User('abc', 'b@example.com', 'Alice');
// id が同じ → 同一のユーザー（メールが変わっても）
```

### Value Object（値オブジェクト）

**値で同一性を判断する・不変オブジェクト。** コンストラクタでバリデーションを行う。

```ts
class Email {
  readonly value: string;

  constructor(value: string) {
    if (!value.includes('@')) throw new Error('invalid email');
    this.value = value.toLowerCase().trim();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

class Money {
  constructor(
    readonly amount: number,
    readonly currency: 'JPY' | 'USD',
  ) {
    if (amount < 0) throw new Error('amount must be non-negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

`new Email("invalid")` が例外を投げるため、Emailオブジェクトが存在する = 検証済み、という保証が生まれる。

### Aggregate（集約）

**整合性の境界。** ルートエンティティ経由でのみ内部を操作できる。

```ts
// Order が Aggregate Root
class Order {
  private items: OrderItem[] = [];

  constructor(public readonly id: string) {}

  // OrderItem を直接操作せず、Order 経由で追加する
  addItem(productId: string, quantity: number, price: Money): void {
    if (this.items.length >= 100) throw new Error('too many items');
    this.items.push(new OrderItem(productId, quantity, price));
  }

  get totalPrice(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.subtotal),
      new Money(0, 'JPY'),
    );
  }
}

// NG: OrderItem を Order の外から直接操作
order.items.push(new OrderItem(...));

// OK: Order のメソッド経由
order.addItem('product-1', 2, new Money(1000, 'JPY'));
```

### Repository（リポジトリ）

**集約の永続化インターフェース。** 実装の詳細（SQL・ORM）をドメインから隠す。

```ts
// domain/repositories/OrderRepository.ts
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Domain Service（ドメインサービス）

**複数の集約をまたぐロジック。** どちらの集約にも属せないビジネスルールを置く。

```ts
// 価格計算：User（会員ランク）と Order（商品）を両方参照するため
class PricingService {
  calculateDiscountedPrice(order: Order, user: User): Money {
    const base = order.totalPrice;
    if (user.memberRank === 'gold') {
      return new Money(Math.floor(base.amount * 0.9), base.currency);
    }
    return base;
  }
}
```

### Domain Event（ドメインイベント）

**集約内で起きた事実を表す。** 「注文が確定した」「支払いが失敗した」など。

```ts
class OrderPlaced {
  readonly occurredAt = new Date();
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: Money,
  ) {}
}

// 注文確定時にイベントを発行 → メール送信・在庫減算などは別のハンドラが担当
```

## ディレクトリ構造（オニオンアーキテクチャと組み合わせ）

```
src/domain/
├── order/
│   ├── Order.ts           # Aggregate Root
│   ├── OrderItem.ts       # Entity（Order経由でのみ操作）
│   ├── OrderStatus.ts     # Value Object
│   ├── OrderRepository.ts # Interface
│   └── events/
│       └── OrderPlaced.ts
├── user/
│   ├── User.ts
│   ├── Email.ts           # Value Object
│   └── UserRepository.ts
└── shared/
    └── Money.ts           # 複数集約で使う Value Object
```

## CQRS（コマンド・クエリの責任分離）

DDD と組み合わせると効果が出る。**書き込み（Command）** と **読み込み（Query）** のモデルを分離する。

### なぜ分離するか

注文一覧画面では「ユーザー名・商品名・合計金額・配送状況」を一括で取りたい。
ドメインモデルを経由すると集約の境界をまたいだ N+1 クエリが発生しやすい。
Query 側は最適化した SQL を直接書く。

```ts
// commands/PlaceOrder.ts — ドメインモデル経由でビジネスルールを守る
export class PlaceOrderHandler {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly pricingService: PricingService,
  ) {}

  async handle(command: PlaceOrderCommand): Promise<void> {
    const order = new Order(crypto.randomUUID());
    for (const item of command.items) {
      order.addItem(item.productId, item.quantity, item.price);
    }
    await this.orderRepo.save(order);
  }
}

// queries/GetOrderList.ts — DB を直接クエリ（ドメインモデルを経由しない）
export class GetOrderListHandler {
  async handle(query: GetOrderListQuery): Promise<OrderListItem[]> {
    return db.query(`
      SELECT o.id, u.name AS user_name, o.total_amount, o.status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = $1
    `, [query.userId]);
  }
}
```

### CQRS の導入タイミング

1. まず Onion + DDD で作る
2. 読み込みクエリが複雑になったタイミングで Query 側だけ分離する
3. 書き込みと読み込みの負荷差が顕著になったら完全分離を検討する

**最初から入れない。** 必要になってから導入する。

## 段階的な導入（軽量 DDD）

フルDDDは重い。以下の順で段階的に導入する。

| ステップ | やること | 効果 |
|---|---|---|
| 1 | Value Object だけ導入（`Email`, `UserId`） | 型安全化・バリデーション集約 |
| 2 | Repository インターフェースを定義する | テスト可能になる |
| 3 | Aggregate の境界を意識する | 整合性の保証 |
| 4 | Domain Event を導入する | 疎結合なイベント処理 |

## いつ DDD を使うか

- ドメインが複雑・専門用語が豊富
- 複数チームが同じシステムを開発
- 長期運用で仕様変更が多い

シンプルな CRUD アプリには過剰。まずレイヤードで始めて、ビジネスロジックが複雑化してきたら段階的に導入する。
