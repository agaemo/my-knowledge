# テスト戦略

## テストピラミッド

Mike Cohn が提唱したテストの配分モデル。

```
        /\
       /E2E\        少量・遅い・コスト高
      /──────\
     /Integration\  中量
    /──────────────\
   /  Unit Tests   \ 大量・速い・コスト低
  /──────────────────\
```

**単体テストを厚く、E2Eを薄く**するのが基本。逆になると（テストアイスクリームコーン）、実行が遅くなり、壊れやすくなる。

## テストの種類と使い分け

### 単体テスト（Unit Test）

**対象**: 関数・クラス1つ。外部依存はモック。

**目的**: ビジネスロジックの正確性を素早く検証する。

```ts
// ビジネスロジック（ドメイン層）は単体テストが最も効果的
test('金額がマイナスのとき Money の生成が失敗する', () => {
  expect(() => new Money(-1, 'JPY')).toThrow('amount must be non-negative');
});

test('同一通貨の加算が正しく計算される', () => {
  const total = new Money(100, 'JPY').add(new Money(200, 'JPY'));
  expect(total.amount).toBe(300);
});
```

**向いている対象**:
- Value Object のバリデーション・計算
- ドメインサービスのビジネスルール
- ユーティリティ関数

### 統合テスト（Integration Test）

**対象**: 複数のコンポーネントが連携する箇所。実際のDBやファイルシステムを使う。

**目的**: コンポーネントの接続・SQLの正確性・トランザクションの検証。

```ts
// リポジトリの統合テスト（実際のDBを使う）
describe('UserRepositoryPostgres', () => {
  beforeAll(() => db.migrate());
  afterEach(() => db.truncate('users'));

  test('保存したユーザーをIDで取得できる', async () => {
    const repo = new UserRepositoryPostgres(db);
    const user = new User('id-1', new Email('a@example.com'), 'Alice');

    await repo.save(user);
    const found = await repo.findById('id-1');

    expect(found?.email.value).toBe('a@example.com');
  });
});
```

**向いている対象**:
- リポジトリ（DB操作）
- 外部APIクライアント
- ミドルウェア・認証フロー

### E2E テスト（End-to-End Test）

**対象**: 実際のHTTPリクエストから始まるフル動作。

**目的**: システム全体が繋がっているかの確認。ユーザーの重要な操作フローを保護する。

```ts
// APIのE2Eテスト（実サーバーに対してリクエスト）
test('ユーザー登録からログインまでの一連フロー', async () => {
  // 登録
  const registerRes = await request(app)
    .post('/api/users')
    .send({ email: 'test@example.com', password: 'password123', name: 'Alice' });
  expect(registerRes.status).toBe(201);

  // ログイン
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toBeDefined();
});
```

**向いている対象**:
- ユーザーの重要なフロー（登録・購入・決済）
- リグレッションを防ぎたい主要機能

## モックの使い分け

### モックを使うべき場面

- 外部API（課金・メール送信など本番に副作用があるもの）
- 非決定的な値（現在時刻・ランダムなID）

```ts
// 時刻のモック
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-01-01'));
```

### モックを避けるべき場面

- DB操作（SQLの正確性は実DBで検証する）
- 同プロジェクト内の他クラス（インターフェース経由で In-Memory 実装を使う）

**DB をモックするな**: モックが通ってもSQLが壊れていることがある。統合テストで実DBを使う。

```ts
// Bad: DB をモック
const mockRepo = { findById: jest.fn().mockResolvedValue(user) };

// Good: InMemory 実装（テスト用の本物の実装）
class InMemoryUserRepository implements UserRepository {
  private store: Map<string, User> = new Map();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(user: User) { this.store.set(user.id, user); }
}
```

## アドホックテスト

自動テストでは発見しにくいバグを人間の直感で探す。スクリプト化せず、探索的に行う。

### 探索的テスト（Exploratory Testing）

テストケースを事前に決めず、アプリを使いながら問題を探す。

```
やり方：
1. 「このユーザーが使いそうな操作」を自由に試す
2. 境界値・異常値・順序を変えて試す（メール未入力で登録、超長い名前など）
3. 発見した問題をメモ → 自動テストに追加する
```

### バグバッシュ

チームで集まり、短時間（1〜2時間）で集中的にアドホックテストを行う。
リリース前に行うことで、自動テストでは見落とした問題を発見する。

### リグレッションの発見

バグを直したら、**そのバグのテストケースを自動テストに追加する**。
「同じバグが再発する」を防ぐ。

## テスト戦略の設計

プロジェクト開始時に決める。

```
1. 何をテストするか
   → ビジネスロジック（必須）・APIエンドポイント（必須）・UIコンポーネント（任意）

2. 各種テストの割合
   → 単体: 統合: E2E = 70: 20: 10 が目安

3. カバレッジの目標
   → ビジネスロジックは 90%+ 、全体は 70%+ 程度
   → カバレッジ 100% を目指さない（テストの質より量になる）

4. CIで何を回すか
   → PR時: 単体 + 統合（E2Eは時間がかかるのでマージ後）
   → リリース前: E2Eも含めた全テスト
```

## よくある失敗

| 失敗 | 問題 | 対策 |
|---|---|---|
| テストが実装に強く結合している | リファクタリングでテストが壊れる | 外部動作（入出力）をテストする。内部実装はテストしない |
| 1テストに複数のアサーション | 失敗時にどこが問題か分からない | 1テスト1アサーションを基本にする |
| テストが順序依存 | 並列実行・単独実行で結果が変わる | テストは独立して実行できるようにする（beforeEachでリセット） |
| 遅いテストを放置 | テストが遅くなり実行を避けるようになる | 5秒以上かかるテストは原因を調べて改善する |
