# フィーチャーフラグ

## 何か

コードをデプロイしたまま、フラグの ON/OFF でコードの挙動を制御する仕組み。
「デプロイ」と「リリース（機能の有効化）」を分離できる。

別名: フィーチャートグル（Feature Toggle）

## なぜ存在するか

デプロイとリリースを分離することで、以下を実現できる。

- **trunk-based development** — 未完成の機能をフラグで隠したまま main にマージできる（長命ブランチを避けられる）
- **カナリアリリースの制御** — 特定ユーザー・グループだけに機能を有効化できる
- **即時キルスイッチ** — 障害時にデプロイなしで機能を無効化できる
- **A/Bテスト** — ユーザーを複数グループに分け、効果を測定できる

## フラグの種類

| 種類 | 寿命 | 用途 |
|---|---|---|
| Release Flag | 短期（機能リリースまで） | 未完成機能を隠す |
| Experiment Flag | 短〜中期（実験期間） | A/Bテスト |
| Ops Flag | 中長期 | キルスイッチ・負荷制御 |
| Permission Flag | 長期 | プレミアム機能・β招待 |

リリースフラグは使い終わったら即削除する。放置すると「フラグ負債」が溜まる。

## コード例

### シンプルな実装

```ts
// flags.ts — フラグの定義
export const FLAGS = {
  newCheckoutFlow: process.env.FLAG_NEW_CHECKOUT === 'true',
} as const;

// checkout.ts — 機能の切り替え
import { FLAGS } from './flags';

export async function handleCheckout(cart: Cart) {
  if (FLAGS.newCheckoutFlow) {
    return newCheckoutFlow(cart);
  }
  return legacyCheckoutFlow(cart);
}
```

### ユーザーセグメント別の制御

```ts
// フラグサービス（LaunchDarkly・OpenFeature などを想定）
const flagService = new FlagService();

export async function handleCheckout(cart: Cart, user: User) {
  const enabled = await flagService.isEnabled('new-checkout-flow', {
    userId: user.id,
    attributes: {
      plan: user.plan,       // プレミアムユーザーだけ有効
      region: user.region,   // 特定リージョンだけ有効
    },
  });

  if (enabled) {
    return newCheckoutFlow(cart);
  }
  return legacyCheckoutFlow(cart);
}
```

### OpenFeature（標準 SDK）

```ts
import { OpenFeature } from '@openfeature/server-sdk';

const client = OpenFeature.getClient();

const enabled = await client.getBooleanValue('new-checkout-flow', false, {
  targetingKey: user.id,
});
```

OpenFeature はフラグ管理ツール（LaunchDarkly・Unleash・Flagsmith など）を
差し替え可能にする標準仕様。ベンダーロックインを避けられる。

## 運用上の注意

### フラグ負債を防ぐ

フラグが増えると組み合わせが爆発し、テストが困難になる。

```ts
// フラグに有効期限コメントを書いておく（CI で警告させると良い）
// @flag-expires 2026-06-01
const NEW_CHECKOUT = flags.isEnabled('new-checkout-flow');
```

- リリースフラグは機能がリリースされたら即削除
- フラグの棚卸しを定期的に行う
- フラグの数が増えてきたら専用管理ツールの導入を検討

### テスト戦略

```ts
// フラグを DI できる設計にするとテストしやすい
test('新チェックアウトフローが動作する', async () => {
  const result = await handleCheckout(cart, { flagEnabled: true });
  expect(result).toMatchObject({ flow: 'new' });
});

test('旧チェックアウトフローにフォールバックする', async () => {
  const result = await handleCheckout(cart, { flagEnabled: false });
  expect(result).toMatchObject({ flow: 'legacy' });
});
```

## 管理ツール

| ツール | 特徴 |
|---|---|
| LaunchDarkly | フル機能・SaaS。大規模向け |
| Unleash | OSS。セルフホスト可能 |
| Flagsmith | OSS。セルフホスト可能 |
| GrowthBook | A/Bテスト特化 |
| 環境変数 | 最小構成。動的変更不可 |

## いつ使うか

- trunk-based development で長命ブランチを避けたい
- デプロイとリリースのタイミングを分けたい
- 特定ユーザー・グループへの段階的ロールアウトが必要
- A/Bテストでビジネスメトリクスを測定したい
- キルスイッチとして障害時に即無効化できる手段が欲しい

## 関連パターン

- **カナリアリリース** — フィーチャーフラグでユーザー割合を制御することが多い
- **ブルーグリーンデプロイメント** — デプロイの切り替えにフラグを組み合わせて段階展開できる
