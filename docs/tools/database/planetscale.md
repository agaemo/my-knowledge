# PlanetScale

VitessをベースにしたサーバーレスのマネージドMySQLプラットフォーム。スキーマ変更をgitのようにブランチで管理できる点が最大の特徴。

## なぜ存在するか

大規模MySQLの運用課題（シャーディング・スキーマ変更時のロック・ダウンタイム）を解決するためにYouTubeが開発したのがVitess。PlanetScaleはそのVitessをSaaSとして提供し、中小規模のチームでも大規模DBの知見を活用できるようにした。

## Vitessとは

MySQLの前段に置くプロキシ・オーケストレーション層。水平シャーディング・コネクションプーリング・クエリルーティングを透過的に処理する。MySQL互換なので既存アプリをほぼそのまま動かせる。

## 主要機能

### データブランチ
DBのスキーマをgitのブランチのように管理できる。

```
main ブランチ（本番）
  └── feature/add-user-avatar（開発）
        └── PR → レビュー → main へマージ
```

スキーマ変更をPRとしてレビューし、本番への影響を確認してからマージできる。

### ノンブロッキングスキーマ変更
通常のMySQLでは `ALTER TABLE` がテーブル全体をロックする。PlanetScaleはVitessのオンラインDDLでロックなしにスキーマを変更できる。

### Connection Pooling
サーバーレス環境（Lambda・Edge Functions）では大量のDB接続が問題になる。PlanetScaleはプロキシ層でコネクションをプールし、接続過多を防ぐ。

## 接続

MySQL互換なので既存のMySQLクライアントをそのまま使える。

```ts
import { connect } from '@planetscale/database'

const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
})

const results = await conn.execute('SELECT * FROM users WHERE id = ?', [userId])
```

## 制約

- **外部キー制約が使えない** — Vitessのシャーディングの都合上、FOREIGN KEY非対応。アプリ層で整合性を担保する必要がある
- **2024年に無料プランを廃止** — コスト圧力から無料枠を撤廃し、批判を受けた。有料プランのみ

## いつ使うか

- MySQLを使っていてスケールが見えてきた
- スキーマ変更のダウンタイムを避けたい
- サーバーレス環境でのコネクション問題を解決したい
- Vitessの恩恵を自前運用なしに受けたい
