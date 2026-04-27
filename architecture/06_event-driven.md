# イベント駆動アーキテクチャ（EDA）

## 何か

コンポーネント間の通信を「イベント（出来事）の発行と購読」で行う設計。
「注文が確定した」「支払いが完了した」などの出来事を発行し、関心のある側が受け取る。

同期的な「直接呼び出し」から非同期の「イベント経由」に変えることで、コンポーネント間の結合を弱める。

## 同期呼び出しとの比較

```ts
// 同期（直接呼び出し）— 注文サービスが決済・通知・在庫を全部知っている
class OrderService {
  async placeOrder(order: Order) {
    await this.paymentService.charge(order);      // 決済サービスを直接呼ぶ
    await this.notificationService.notify(order); // 通知サービスを直接呼ぶ
    await this.inventoryService.reserve(order);   // 在庫サービスを直接呼ぶ
  }
}

// イベント駆動 — OrderServiceは「注文確定」を発行するだけ
class OrderService {
  async placeOrder(order: Order) {
    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderPlaced(order)); // イベントを発行するだけ
  }
}

// 各サービスが独立して購読する
eventBus.subscribe(OrderPlaced, (event) => paymentService.charge(event.order));
eventBus.subscribe(OrderPlaced, (event) => notificationService.notify(event.order));
eventBus.subscribe(OrderPlaced, (event) => inventoryService.reserve(event.order));
```

## 主要パターン

### Event Notification（通知型）

イベントが起きたことだけを通知する。詳細は受信側が取りに行く。

```ts
// 最小限の情報だけ含む
class OrderPlaced {
  constructor(public readonly orderId: string) {}
}

// 受信側が詳細を取得
eventBus.subscribe(OrderPlaced, async (event) => {
  const order = await orderRepo.findById(event.orderId); // 自分で取りに行く
  await paymentService.charge(order);
});
```

### Event-Carried State Transfer（状態転送型）

イベントに必要な情報をすべて含める。受信側が追加クエリ不要。

```ts
class OrderPlaced {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: Money,
  ) {}
}
```

### Event Sourcing

状態をデータとして保存するのではなく、**イベントの履歴を保存**する。
現在の状態 = イベントを順番に適用した結果。

```ts
// 通常の状態保存
// orders テーブル: { id, status: 'shipped', totalAmount: 5000 }

// Event Sourcing
// order_events テーブル:
// { orderId, event: 'OrderPlaced',   payload: {...}, occurredAt: ... }
// { orderId, event: 'PaymentDone',   payload: {...}, occurredAt: ... }
// { orderId, event: 'OrderShipped',  payload: {...}, occurredAt: ... }

// 現在の状態を得るには全イベントを再生する
function rebuildOrder(events: OrderEvent[]): Order {
  return events.reduce((order, event) => apply(order, event), new Order());
}
```

**メリット**: 完全な変更履歴が残る。過去の任意の時点の状態を再現できる。
**デメリット**: 実装が複雑。クエリが難しい（CQRSと組み合わせて解決する）。

## Saga パターン（分散トランザクション）

複数のサービスにまたがるトランザクションを、イベントのチェーンで実現する。
マイクロサービス環境でDBを跨いだACIDが使えないときの解決策。

```
注文確定 → [OrderService] → OrderPlaced
         → [PaymentService] → PaymentCompleted or PaymentFailed
         → [InventoryService] → InventoryReserved or InventoryFailed
         → [NotificationService] → EmailSent

失敗時の補償トランザクション:
PaymentFailed → OrderCancelled → InventoryReleased
```

### Choreography（コレオグラフィー）型

各サービスがイベントを見て自律的に動く。Orchestratorなし。

```
OrderService  → publishes: OrderPlaced
PaymentService → subscribes: OrderPlaced → publishes: PaymentCompleted
InventoryService → subscribes: PaymentCompleted → publishes: InventoryReserved
```

シンプルだが、全体フローの把握が難しくなる。

### Orchestration（オーケストレーション）型

Sagaオーケストレーターが各サービスに命令を出す。

```ts
class OrderSaga {
  async execute(orderId: string) {
    await paymentService.charge(orderId);   // 直接呼ぶ
    await inventoryService.reserve(orderId);
    await notificationService.sendConfirm(orderId);
  }

  async compensate(orderId: string) {
    await inventoryService.release(orderId);
    await paymentService.refund(orderId);
  }
}
```

全体フローが1か所に集まるが、オーケストレーター自体が単一障害点になる。

## メッセージブローカー

本番環境ではイベントをメッセージキューで中継する。

| ブローカー | 特徴 | 向いている場面 |
|---|---|---|
| Redis Pub/Sub | シンプル・軽量 | 小規模・永続化不要 |
| RabbitMQ | キュー機能が豊富 | 確実な配信が必要 |
| Apache Kafka | 高スループット・ログ永続化 | 大規模・Event Sourcing |
| AWS SNS/SQS | マネージド・AWS前提 | クラウドネイティブ |

## いつ使うか

- サービス間の結合を弱めたい（追加サービスを既存コードを変えずに接続したい）
- 非同期処理が自然な業務フロー（注文→決済→配送）
- マイクロサービス間のデータ整合性をとりたい

## 落とし穴

- **デバッグが難しい**: 直接呼び出しと違い、イベントのフローを追うのが難しい → 分散トレーシングで対策
- **結果整合性**: イベントが非同期のため、一時的にデータが不整合になる状態を許容する設計が必要
- **べき等性**: 同じイベントが2回届いても同じ結果になるよう実装する必要がある
