# NewSQL

## なぜ存在するか

RDBは一貫性に強いが水平スケールが難しく、NoSQLはスケールできるが一貫性を犠牲にする。
NewSQLは**水平スケールとACIDトランザクションを両立する**ことを目指したデータベースカテゴリ。

```
RDB:    一貫性 ◎ / スケール △
NoSQL:  一貫性 △ / スケール ◎
NewSQL: 一貫性 ◎ / スケール ◎  ← 両立を目指す
```

Google Spanner（2012年）の論文が起点となり、分散環境でのトランザクションを実用的に実現できることが示された。

## 共通のアーキテクチャ特性

- **自動シャーディング**: データをノード間に自動分散し、アプリ側でシャードを意識しない
- **Raftによる複製**: ノード間でデータを複製し、一部のノード障害でも動き続ける
- **分散トランザクション**: 複数ノードにまたがるデータへのACIDトランザクション
- **既存DB互換**: MySQL または PostgreSQL の接続・クエリがそのまま動く

## 代表的なプロダクト

### CockroachDB

PostgreSQL互換の分散SQL。「ゴキブリのように生き残る」を設計思想とし、ノード障害・リージョン障害への耐性が高い。

- 一貫性モデル: Serializable（最も強い分離レベル）
- マルチリージョン: テーブル・行単位でデータの配置リージョンを指定可能（GDPR対応にも使える）

```sql
-- 行をリージョン別に自動配置
ALTER TABLE orders SET LOCALITY REGIONAL BY ROW;

-- グローバルに全リージョンへ複製（設定データなど読み取り多い場合）
ALTER TABLE config SET LOCALITY GLOBAL;
```

### TiDB

MySQL互換の分散SQL。OLTPとOLAPを単一DBで処理するHTAP対応が最大の特徴。

- アーキテクチャ: SQLレイヤー（TiDB）・行ストア（TiKV）・列ストア（TiFlash）が分離
- HTAP: TiKVからTiFlashへリアルタイム同期し、分析クエリを列ストアで高速処理

```sql
-- TiFlash（列ストア）にレプリカを作成
ALTER TABLE orders SET TIFLASH REPLICA 1;

-- 分析クエリを列ストアで実行
SELECT /*+ READ_FROM_STORAGE(TIFLASH[orders]) */ region, SUM(amount)
FROM orders GROUP BY region;
```

### PlanetScale

VitessベースのサーバーレスMySQL。YouTube が大規模MySQL運用のために開発した Vitess を SaaS として提供。

- スキーマブランチ: DBのスキーマ変更をgitのようにブランチ・PRでレビュー・マージできる
- ノンブロッキングDDL: `ALTER TABLE` をロックなしに実行できる
- 制約: Vitessのシャーディングの都合上、外部キー制約が使えない

```
main（本番）
  └── feature/add-user-avatar（開発）→ レビュー → マージ
```

## 比較

| 観点 | CockroachDB | TiDB | PlanetScale |
|---|---|---|---|
| SQL互換 | PostgreSQL | MySQL | MySQL（Vitess） |
| 一貫性モデル | Serializable | Snapshot Isolation | Snapshot Isolation |
| HTAP | 限定的 | TiFlashで対応 | なし |
| 特徴 | 高い耐障害性・マルチリージョン | OLTP+OLAP統合 | スキーマブランチ・サーバーレス |
| 外部キー | あり | あり | なし |

## いつ使うか

- 単一RDBのスケール限界に達し、シャーディングをアプリ側で管理したくない
- 水平スケールしながらACIDトランザクションが必要
- マルチリージョンへの展開が必要（CockroachDB）
- OLTPとOLAPを別システムに分けるコストを下げたい（TiDB）
- スキーマ変更フローを安全にしたい・サーバーレス環境のコネクション問題を解決したい（PlanetScale）
