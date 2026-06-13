# テストダブル（Test Doubles）

テストで本物の依存（DB・外部 API・時刻など）の代わりに使う代替オブジェクトの総称。  
映画の「スタント俳優（stunt double）」からの比喩。Gerard Meszaros の著書 *xUnit Test Patterns* が出典。

「モック」と総称されることが多いが、厳密には5種類に分類される。

## 5種類の分類

### Dummy（ダミー）

渡すが使われない。引数の型合わせのためだけに存在する。

```typescript
// Logger は今回のテストでは使わないが、コンストラクタに必要
const dummyLogger = {} as Logger;
const service = new OrderService(repo, dummyLogger);
```

### Stub（スタブ）

呼ばれたときに**あらかじめ決めた値を返す**。戻り値の制御が目的。振る舞いの検証はしない。

```typescript
// 在庫を必ず「在庫あり」と返す Stub
const stubInventory: InventoryRepository = {
    findById: async () => ({ id: '1', quantity: 10 }),
};

// テスト対象：在庫があるとき注文できるか
const order = await orderService.place('item-1');
expect(order.status).toBe('confirmed');
```

### Fake（フェイク）

**動く実装**を持つが、本番には使えない簡易版。テスト用の本物。

```typescript
// 実際に動く In-Memory 実装（本番の MySQL の代替）
class InMemoryUserRepository implements UserRepository {
    private store = new Map<string, User>();
    async findById(id: string) { return this.store.get(id) ?? null; }
    async save(user: User) { this.store.set(user.id, user); }
}
```

Stub との違い：Stub は決め打ちの値を返すだけ。Fake は実際に動作するロジックを持つ。

### Spy（スパイ）

呼び出しの記録を残す Stub。**何回・どんな引数で呼ばれたか**を後から検証できる。

```typescript
let sentEmails: string[] = [];

const spyMailer = {
    send: async (to: string) => {
        sentEmails.push(to); // 呼ばれた記録を残す
    },
};

await notificationService.notifyUser('user@example.com');

expect(sentEmails).toContain('user@example.com'); // 呼ばれたか検証
```

### Mock（モック）

**期待する呼び出し**をあらかじめ設定し、テスト終了時に検証する。事前設定型の Spy。

```typescript
// Jest の mock 関数（Mock の典型）
const mockMailer = { send: jest.fn() };

await notificationService.notifyUser('user@example.com');

// モックの検証：sendが正しい引数で1回呼ばれたか
expect(mockMailer.send).toHaveBeenCalledOnce();
expect(mockMailer.send).toHaveBeenCalledWith('user@example.com');
```

## 使い分けの基準

| 種類 | 目的 | 検証対象 |
|---|---|---|
| Dummy | 引数を埋める | なし |
| Stub | 戻り値を制御する | 状態（結果が正しいか） |
| Fake | 実装を簡略化する | 状態（結果が正しいか） |
| Spy | 呼び出しを記録する | 状態 + 呼び出し |
| Mock | 呼び出しを事前設定・検証する | 呼び出し（振る舞いが正しいか） |

## 状態検証 vs 振る舞い検証

テストダブルの選択は「何を検証するか」で決まる。

**状態検証**（State Verification）  
「処理後の結果が正しいか」を検証する。Stub・Fake を使うことが多い。

```typescript
// DB に保存されたか → 結果（状態）で確認
await userService.register('alice@example.com');
const saved = await fakeRepo.findByEmail('alice@example.com');
expect(saved).not.toBeNull();
```

**振る舞い検証**（Behavior Verification）  
「正しいメソッドが正しく呼ばれたか」を検証する。Mock・Spy を使う。

```typescript
// メールが送信されたか → 呼び出しで確認
await userService.register('alice@example.com');
expect(mockMailer.send).toHaveBeenCalledWith('alice@example.com');
```

## よくある誤用

**Mock しすぎ問題**  
テスト対象クラスの依存を全部 Mock にすると、「クラス単体の動作」しか確認できず、実際の統合で壊れる。DB 操作は Fake（InMemory実装）か統合テストで実際の DB を使う方が信頼性が高い。

**実装の詳細を Mock する**  
内部のプライベートメソッドを Mock すると、リファクタリングでテストが壊れる。公開インターフェースの振る舞いを検証することに集中する。
