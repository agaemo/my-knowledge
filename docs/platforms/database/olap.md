# OLAP（分析DB）

## なぜ存在するか

RDBMSは業務データの読み書き（OLTP）に最適化されているが、分析クエリが苦手だ。

「過去2年間の売上を、月別・商品カテゴリ別・地域別に集計する」というクエリを PostgreSQL で実行すると、数百万行を全スキャンして集計するため遅くなる。これはRDBMSが**行志向**でデータを格納しているためで、集計に必要なカラムだけでなく行全体を読み込んでしまう。

OLAPデータベースは**列志向ストレージ**と**ベクトル実行**で、この問題を解決する。

## 行志向 vs 列志向

```
行志向（RDBMS）:
  [田中, 30, 営業, 2000] [佐藤, 25, 開発, 1500] [鈴木, 35, 営業, 3000] ...
  → 全カラムをまとめて格納。1件の取得・更新が速い

列志向（OLAP）:
  名前: [田中, 佐藤, 鈴木, ...]
  年齢: [30, 25, 35, ...]
  売上: [2000, 1500, 3000, ...]
  → カラムごとに格納。集計に必要なカラムだけ読み込める
```

集計クエリでは「売上カラムだけ読めばいい」ので、無関係なカラムのI/Oを排除できる。さらに同じ型の値が連続するため、圧縮効率も高い。

## 代表: DuckDB

サーバー不要の**組み込み型OLAP DB**。プロセス内で動作し、Pythonから直接呼び出せる。

### 特徴

**ファイルを直接クエリできる**

ETL（データの抽出・変換・ロード処理）なしで CSV・Parquet・JSON ファイルをそのままSQLで分析できる。

```sql
-- CSVを直接クエリ
SELECT category, SUM(amount)
FROM 'sales_2024.csv'
GROUP BY category;

-- Parquetファイルも同様
SELECT * FROM 'data/*.parquet' WHERE date >= '2024-01-01';
```

**Pandasより高速な集計**

```python
import duckdb

# PandasのDataFrameを直接クエリできる
result = duckdb.sql("""
    SELECT month, SUM(revenue) as total
    FROM df
    GROUP BY month
    ORDER BY month
""").df()
```

大量行の集計は Pandas より大幅に速く、メモリ効率も高い。

**SQLite と同様に単一ファイルで永続化**

```python
conn = duckdb.connect('analytics.duckdb')
conn.execute("CREATE TABLE events AS SELECT * FROM 'events.parquet'")
```

### DuckDB が向く用途

```
ローカルでの探索的データ分析（EDA）
ETLパイプラインの中間処理
Pandas の重い集計の代替
CI上でのデータ検証・テスト
```

## 他のOLAPシステムとの比較

| | DuckDB | BigQuery / Redshift | ClickHouse |
|---|---|---|---|
| 構成 | 組み込み（サーバーなし） | クラウドサービス | サーバー型 |
| スケール | 1台のマシン | ペタバイト規模 | 大規模クラスタ |
| コスト | 無料 | クエリ量・ストレージ課金 | 自前運用コスト |
| 向く用途 | ローカル分析・中規模 | 大規模データウェアハウス | 高頻度の大規模分析 |

## RDBMSとOLAPの使い分け

| | RDBMS（OLTP） | OLAP |
|---|---|---|
| クエリパターン | 特定レコードの読み書き | 大量行の集計・スキャン |
| データ量 | 業務データ（GB〜TB） | 履歴データ（TB〜PB） |
| 更新頻度 | 高頻度（秒単位） | 低頻度（バッチ・日次） |
| 応答時間 | ミリ秒 | 秒〜分 |
| 代表 | PostgreSQL, MySQL | DuckDB, BigQuery, Redshift |

一般的な構成は、PostgreSQL で業務データを管理し、分析用データを定期的にDuckDB や BigQuery にエクスポートして集計する。

## いつ使うか

- 数百万行以上の集計クエリをSQLで書きたい
- PandasやSparkを使わず軽量にローカル分析したい
- CSV / Parquet ファイルをサーバーなしで即クエリしたい
- データパイプラインの変換処理を高速化したい
