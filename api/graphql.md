# GraphQL

## 何か

Facebook が開発したAPI クエリ言語とランタイム。
クライアントが**必要なデータの形を自分で指定**できる。REST との最大の違いはここ。

## REST との比較

```
# REST: サーバーがレスポンスの形を決める
GET /users/123
→ { id, name, email, createdAt, address, ... }  # 不要なフィールドも全部来る

GET /users/123/orders      # 関連データは別リクエスト
GET /orders/456/items      # さらに別リクエスト

# GraphQL: クライアントが必要なものを指定
query {
  user(id: "123") {
    name
    orders {              # 関連データを1リクエストで取得
      id
      items { name price }
    }
  }
}
```

## 基本操作

### Query（読み取り）

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

### Mutation（書き込み）

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
```

### Subscription（リアルタイム）

```graphql
subscription OnOrderUpdated($orderId: ID!) {
  orderUpdated(orderId: $orderId) {
    status
    updatedAt
  }
}
```

## スキーマ定義

GraphQL はスキーマが契約になる。型定義から自動でドキュメントが生成される。

```graphql
type User {
  id: ID!          # ! は Non-null
  name: String!
  email: String!
  orders: [Order!]!
}

type Order {
  id: ID!
  status: OrderStatus!
  items: [OrderItem!]!
  totalAmount: Int!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
}

type Query {
  user(id: ID!): User
  orders(userId: ID!): [Order!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  placeOrder(input: PlaceOrderInput!): Order!
}
```

## N+1 問題と DataLoader

GraphQL の最も有名な落とし穴。

```graphql
# このクエリを実行すると...
query {
  orders {        # 1クエリ: 全注文を取得
    user {        # N クエリ: 各注文のユーザーを個別に取得
      name
    }
  }
}
```

```ts
// Bad: N+1
const orders = await orderRepo.findAll();         // 1クエリ
for (const order of orders) {
  order.user = await userRepo.findById(order.userId); // N クエリ
}
```

**DataLoader で解決**: リクエストをバッチにまとめて1クエリにする。

```ts
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await userRepo.findByIds(userIds); // 1クエリで全ユーザーを取得
  return userIds.map(id => users.find(u => u.id === id));
});

// Resolver
const orderResolver = {
  user: (order) => userLoader.load(order.userId), // バッチに積まれる
};
```

## REST と GraphQL の使い分け

| | REST | GraphQL |
|---|---|---|
| 向いている | シンプルなCRUD・公開API | 複雑なデータ要件・フロントエンド主導 |
| クライアント | 多様なクライアント（言語問わず） | フロントエンドが主な利用者 |
| キャッシュ | HTTPキャッシュが自然に使える | POST中心のためHTTPキャッシュが難しい |
| 学習コスト | 低い | 高い（スキーマ設計・DataLoader等） |
| オーバーフェッチ | 発生しやすい | 発生しない |

## よくある設計ミス

### スキーマをDBのテーブル構造にする

GraphQL のスキーマはユーザー体験（UI が必要とする形）で設計する。DB の都合を持ち込まない。

### Mutation を REST 的に設計する

```graphql
# Bad: RESTの動詞をそのまま持ち込む
mutation {
  updateOrderStatus(orderId: "123", status: "shipped")
}

# Good: ビジネスアクションとして表現する
mutation {
  shipOrder(orderId: "123") { status shippedAt }
}
```

### エラーハンドリングが中途半端

GraphQL は HTTP 200 でエラーを返すことがある。`errors` フィールドを必ず確認する。

```ts
const result = await graphql(query);
if (result.errors) {
  // エラーがあっても data が部分的に返ることがある
  handleErrors(result.errors);
}
```
