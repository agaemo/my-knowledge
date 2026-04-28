# CockroachDB

NewSQLの代表格。PostgreSQL互換の分散SQLデータベースで、複数リージョンにまたがってデータを自動分散・複製し、強一貫性とサバイバビリティを両立する。

## なぜ存在するか

従来のRDBは単一ノードが限界に達するとシャーディングが必要になり、アプリ側の複雑さが増す。NoSQLはスケールできるが一貫性を犠牲にする。CockroachDBは「水平スケールしつつSQLとACIDを維持する」ことを目的に設計された。

名前の由来は「ゴキブリのように生き残る」——一部のノードが落ちても動き続けることを表している。

## アーキテクチャの特徴

### 自動シャーディング（Range分割）
データをRangeという単位に自動分割し、ノード間に分散する。アプリはシャードを意識せず通常のSQLを書くだけでよい。

### Raftによる複製
各Rangeは複数ノードにRaftプロトコルで複製される。過半数のノードが生きていれば書き込みが継続できる。

### 分散トランザクション
複数ノードにまたがるデータへのトランザクションをACIDで保証する。Google Spannerの論文を参考にしたTrueTimeに着想を得たHLCで時刻を管理する。

### マルチリージョン
テーブルやRowを特定リージョンに固定（REGIONAL BY ROW）したり、全リージョンに複製（GLOBAL）したりできる。GDPRなどのデータ主権要件への対応にも使える。

```sql
-- テーブルをリージョン別に分散
ALTER TABLE orders SET LOCALITY REGIONAL BY ROW;

-- グローバルに複製（全リージョンから低レイテンシ読み取り）
ALTER TABLE config SET LOCALITY GLOBAL;
```

## PostgreSQL互換

接続・ドライバ・SQLはPostgreSQL互換なので、既存のPostgreSQLアプリをほぼそのまま移行できる。

```ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // CockroachDBの接続文字列
})

const { rows } = await pool.query(
  'SELECT * FROM orders WHERE user_id = $1',
  [userId]
)
```

## Serverless（CockroachDB Serverless）

使った分だけ課金するサーバーレスプランがある。アクセスがなければコストはゼロ。開発・PoC段階での利用に向く。

## いつ使うか

- グローバルにデータを分散させたい
- ノード障害があっても無停止で動き続けたい
- PostgreSQL資産を活かしつつスケールしたい
- シャーディングをアプリ側で管理したくない

## TiDBとの比較

| 観点 | CockroachDB | TiDB |
|------|-------------|------|
| 互換性 | PostgreSQL | MySQL |
| 一貫性モデル | Serializable | Snapshot Isolation |
| HTAP対応 | 限定的 | TiFlashで対応 |
| 主な採用 | 欧米スタートアップ | アジア・大規模エンタープライズ |
