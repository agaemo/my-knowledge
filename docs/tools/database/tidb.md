# TiDB

PingCAPが開発するMySQL互換のオープンソース分散SQLデータベース。大規模OLTPとOLAPを単一DBで処理するHTAP（Hybrid Transactional/Analytical Processing）に対応する。

## なぜ存在するか

大規模サービスでは、トランザクション処理（OLTP）と分析クエリ（OLAP）を別々のDBで運用するのが一般的だったが、データの同期・整合性・運用コストが課題だった。TiDBはOLTPとOLAPを一つのシステムで扱い、それを水平スケールで実現することを目指した。

## アーキテクチャ

TiDBは複数コンポーネントに分離した設計になっている。

```
クライアント
    ↓
TiDB（SQLレイヤー）     ← MySQLプロトコル対応、ステートレス
    ↓
PD（Placement Driver）  ← メタデータ管理・スケジューリング
    ↓
TiKV（行ストア）         ← OLTP用。RaftでReplication
TiFlash（列ストア）      ← OLAP用。TiKVからリアルタイム同期
```

### TiKV
Rustで実装されたキーバリューストア。Raftで複製・一貫性を保証する。OLTPのワークロードを担当。

### TiFlash
列指向のストレージエンジン。TiKVからリアルタイムにデータを受け取り、集計・分析クエリを高速に処理する。

```sql
-- TiFlashにレプリカを作成
ALTER TABLE orders SET TIFLASH REPLICA 1;

-- ヒントで列ストアを使う
SELECT /*+ READ_FROM_STORAGE(TIFLASH[orders]) */ region, SUM(amount)
FROM orders
GROUP BY region;
```

## MySQL互換

MySQLプロトコルに対応しているため、既存のMySQLドライバや接続設定をそのまま使える。

```ts
import mysql from 'mysql2/promise'

const conn = await mysql.createConnection({
  host: process.env.TIDB_HOST,
  port: 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: 'mydb',
  ssl: { rejectUnauthorized: true },
})

const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [userId])
```

## TiDB Cloud

フルマネージドのSaaS版。Serverlessプランでは使った分だけ課金で、スケールゼロにも対応する。

## いつ使うか

- MySQLで限界が来て水平スケールが必要になった
- 大量データの分析クエリと日常のトランザクションを同一DBでこなしたい
- OLTPとOLAPのデータパイプラインを減らしたい
- 中国・アジア系の大規模サービスを参考にしたアーキテクチャを採用したい

## CockroachDBとの比較

| 観点 | TiDB | CockroachDB |
|------|------|-------------|
| 互換性 | MySQL | PostgreSQL |
| HTAP対応 | TiFlashで対応 | 限定的 |
| 一貫性モデル | Snapshot Isolation | Serializable |
| 主な採用 | アジア・大規模エンタープライズ | 欧米スタートアップ |
