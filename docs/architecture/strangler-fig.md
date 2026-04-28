# ストラングラーフィグパターン

## 何か

Martin Fowler が提唱。既存システム（レガシー）を一気に書き直すのではなく、
新システムを少しずつ育てながら旧システムを段階的に「絞め殺す（strangle）」移行戦略。

熱帯雨林のイチジク（Strangler Fig）が宿主の木を包み込みながら最終的に置き換える様子が由来。

## なぜ存在するか

一括リライト（Big Bang Rewrite）は高リスク。

- 完成まで長期間、ビジネス価値をデリバリーできない
- 旧システムの暗黙知・エッジケースを再現しきれない
- 失敗したとき旧システムへの切り戻しが困難

ストラングラーフィグはこれを回避するために、**常に動く状態を保ちながら移行する**。

## 仕組み

```
                 ┌────────────────────┐
クライアント ──▶ │  Facade / Proxy    │
                 └─────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       [新システム]               [旧システム]
     (移行済み機能)              (未移行機能)
```

1. **Facade を立てる** — クライアントは Facade だけを向く（旧システムへの直接アクセスを遮断）
2. **機能単位で新システムへ移植** — 移植完了した機能のルーティングを Facade で切り替える
3. **旧システムを縮小** — 全機能が移植されたら旧システムを廃止

## ステップ例

レガシー Rails モノリスを新しい Node.js サービスへ移行するケース。

### Step 1: Facade（リバースプロキシ）を置く

```nginx
# 全リクエストをまず旧システムへ流す（初期状態）
location / {
  proxy_pass http://legacy-rails;
}
```

### Step 2: 移植済み機能だけ新システムへ切り替える

```nginx
# /api/users は新システムへ
location /api/users {
  proxy_pass http://new-node-service;
}

# それ以外は引き続き旧システム
location / {
  proxy_pass http://legacy-rails;
}
```

### Step 3: 段階的に拡大し、最終的に旧システムを廃止

```nginx
# 全機能の移植完了後
location / {
  proxy_pass http://new-node-service;
}
# legacy-rails を停止
```

## アプリケーション層での実装例

Facade をアプリコード内に持つパターン。新旧どちらに委譲するかをコードで制御する。

```ts
// facade/UserService.ts
export class UserServiceFacade {
  constructor(
    private readonly legacy: LegacyUserClient,
    private readonly newService: NewUserService,
    private readonly flags: FeatureFlags,
  ) {}

  async getUser(id: string): Promise<User> {
    // フラグで切り替え。段階的ロールアウトにも使える
    if (this.flags.isEnabled('new-user-service')) {
      return this.newService.getUser(id);
    }
    return this.legacy.getUser(id);
  }
}
```

## データ移行との組み合わせ

機能だけでなくデータも段階移行が必要な場合。

```
┌──────────┐   同期   ┌──────────┐
│ 旧DB     │ ──────▶ │ 新DB     │
│ (正）    │ ◀────── │ (正）    │
└──────────┘   双方向 └──────────┘
    ↑切り替え時点で新DBを正源泉に昇格
```

- 移行期間中は **旧DB → 新DB へ同期**（新DBはリードレプリカ扱い）
- 切り替え後は **新DB → 旧DB へ逆同期**（旧システムの残機能が旧DBを読む間だけ）
- 全機能移行完了後に旧DBを廃止

## いつ使うか

- 本番稼働中のシステムをダウンタイムなしで移行したい
- 一括リライトのリスクを避け、段階的に価値を届けたい
- モノリス→マイクロサービスへの分解を少しずつ進めたい
- 旧システムを即廃止できない制約がある（契約・依存チーム・データ移行など）

## いつ使わないか

- 旧システムが小さく、一括リライトのコストが低い
- Facade を挟む余地がない（旧システムが直接 DB を共有しているなど結合が密すぎる）
- 移行期間中の二重管理コストが許容できない

## 関連パターン

- **Branch by Abstraction** — コード内にインターフェースを挟んで新旧実装を差し替える（Facadeの粒度がより細かい）
- **Feature Flag** — 移行の切り替えをコードから操作する手段としてよく組み合わせる
- **Anti-Corruption Layer（ACL）** — 旧システムの概念モデルが新システムに汚染されないよう変換層を設ける
