# モジュラーモノリス

## なぜこのアーキテクチャが存在するか

レイヤードアーキテクチャは「横に切る（層で分ける）」。機能が増えると各層に全機能のコードが混在して見通しが悪くなる。
モジュラーモノリスは「縦に切る（機能で分ける）」。単一プロセスで動かしながら、将来のマイクロサービス分割を見据えた構造。

## レイヤードとの比較

```
# レイヤード（横切り）
src/
├── routes/        # 注文・ユーザー・決済のハンドラが混在
├── services/      # 注文・ユーザー・決済のロジックが混在
└── repositories/  # 注文・ユーザー・決済のDB操作が混在

# モジュラーモノリス（縦切り）
src/
├── order/         # 注文に関するすべてのコードが閉じている
├── user/          # ユーザーに関するすべてのコードが閉じている
└── payment/       # 決済に関するすべてのコードが閉じている
```

## 構造

```
src/
├── order/
│   ├── routes.ts               # HTTPハンドラ
│   ├── service.ts              # ビジネスロジック
│   ├── repository.interface.ts # リポジトリインターフェース
│   ├── repository.ts           # DB実装
│   └── index.ts                # モジュール外に公開するAPIのみをexport
├── user/
│   ├── routes.ts
│   ├── service.ts
│   ├── repository.interface.ts
│   ├── repository.ts
│   └── index.ts
└── shared/                     # モジュール間で共有する型・ユーティリティ
    └── types.ts
```

## index.ts の役割（モジュールの境界）

`index.ts` がモジュールの「公開API」を定義する。他モジュールはこれ経由でのみアクセスできる。

```ts
// order/index.ts
export { OrderService } from './service';
export type { Order, OrderStatus } from './types';
// repository.ts や内部の実装ファイルはexportしない
```

```ts
// NG: 内部ファイルへの直接import
import { OrderService } from '../order/service';

// OK: index.ts経由
import { OrderService } from '../order';
```

## モジュール間の依存ルール

```
order → user    # OK: order が user モジュールの公開APIを使う
order ↔ user   # NG: 循環依存
```

モジュール間でデータが必要なときは `shared/types.ts` に共通型を定義する。

```ts
// shared/types.ts
export type UserId = string;
export type OrderId = string;
```

## リポジトリインターフェースを挟む理由

```ts
// order/repository.interface.ts
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// order/service.ts — 実装ではなくインターフェースに依存
export class OrderService {
  constructor(private readonly repo: OrderRepository) {}
}
```

## モジュール間でデータが必要なとき

`order` モジュールが `user` の情報を必要とする場合、`user` モジュールの公開APIを呼ぶ。
DB の JOIN は使わない（将来的に DB が分離されたとき困るため）。

```ts
// order/service.ts
import { UserService } from '../user';

export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly userService: UserService,
  ) {}

  async placeOrder(userId: string, items: Item[]) {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('user not found');
    // ...
  }
}
```

## いつ使うか

- レイヤードで始めたが機能が増えてきた
- 将来マイクロサービス分割を視野に入れているが今は単一デプロイで十分
- チームが小〜中規模

## マイクロサービスへの移行パス

モジュール境界が守られていれば、各モジュールを独立サービスに切り出せる。

1. モジュール間の同期呼び出しをメッセージキュー（非同期イベント）に置き換える
2. DB をモジュールごとに分離する
3. 独立したデプロイ単位に切り出す

## スケールの限界サイン

- あるモジュールだけデプロイ頻度・チームが突出して多い → マイクロサービス化を検討
- `shared/` が肥大化してモジュール間の結合が強くなっている → 設計を見直す
