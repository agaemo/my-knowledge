# GCP（Google Cloud Platform）

## 何か

Google が提供するクラウドプラットフォーム。データ分析・ML・AI 分野に強みを持ち、Google の内部インフラ（検索・YouTube・Gmail）と同じ技術基盤を使える。

## サービスカテゴリと主要サービス

### コンピューティング

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Compute Engine | 仮想サーバー | EC2 |
| Cloud Run | コンテナをサーバーレスで実行。リクエスト数に応じて自動スケール | App Runner |
| GKE（Google Kubernetes Engine） | マネージド Kubernetes。k8s の生みの親が Google | EKS |
| Cloud Functions | サーバーレス関数 | Lambda |
| App Engine | PaaS。インフラ管理不要でアプリをデプロイ | Elastic Beanstalk |

### ストレージ

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Cloud Storage | オブジェクトストレージ | S3 |
| Persistent Disk | VM にアタッチするブロックストレージ | EBS |
| Filestore | マネージド NFS | EFS |

### データベース

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Cloud SQL | マネージド RDBMS（PostgreSQL・MySQL） | RDS |
| Cloud Spanner | グローバル分散 RDBMS。強整合性を保ちながら水平スケール | Aurora |
| Firestore | サーバーレス NoSQL（ドキュメント型） | DynamoDB |
| Bigtable | 大規模時系列・分析用 NoSQL | DynamoDB / Keyspaces |
| Memorystore | マネージド Redis / Memcached | ElastiCache |

### ネットワーク

| サービス | 概要 | AWS 対応 |
|---|---|---|
| VPC | 仮想ネットワーク | VPC |
| Cloud Load Balancing | グローバルロードバランサー | ALB / NLB |
| Cloud CDN | CDN | CloudFront |
| Cloud DNS | DNS サービス | Route 53 |
| Cloud Armor | DDoS 防御・WAF | AWS Shield / WAF |

### データ分析・AI/ML

GCP の最大の強み。

| サービス | 概要 |
|---|---|
| BigQuery | サーバーレスなデータウェアハウス。ペタバイト規模のクエリを高速処理 |
| Dataflow | ストリーム・バッチデータ処理（Apache Beam ベース） |
| Pub/Sub | マネージドメッセージキュー |
| Vertex AI | ML モデルのトレーニング・デプロイ・管理 |
| Gemini API | Google の生成 AI モデルへのアクセス |

### 認証・セキュリティ

| サービス | 概要 | AWS 対応 |
|---|---|---|
| IAM | リソースへのアクセス制御 | IAM |
| Secret Manager | 機密情報の管理 | Secrets Manager |
| Cloud KMS | 暗号化キーの管理 | KMS |

## GCP の特徴

### グローバルネットワーク
Google の海底ケーブルを含む専用グローバルネットワーク上でトラフィックが流れる。地域をまたいでも低レイテンシ。

### BigQuery
SQL でペタバイト規模のデータを数秒〜数十秒でクエリできる。サーバー管理不要でデータウェアハウスを運用できるのが強み。

### Cloud Run
コンテナイメージをデプロイするだけで HTTPS エンドポイントが生成され、リクエストゼロ時はコストゼロ。小〜中規模のサービスに向いている。

## よくある構成パターン

```
Internet
   ↓
Cloud Load Balancing + Cloud Armor（WAF）
   ↓
Cloud Run（アプリ）
   ↓
Cloud SQL（DB）+ Memorystore（キャッシュ）
   ↓
Cloud Storage（静的ファイル・バックアップ）
```

## AWS との使い分け

| | GCP | AWS |
|---|---|---|
| 強み | BigQuery・データ分析・ML・AI | サービス数・シェア・エンタープライズ実績 |
| Kubernetes | GKE（k8s の生みの親） | EKS |
| サーバーレスコンテナ | Cloud Run（シンプル） | App Runner / Fargate |
| 価格 | コンピューティングはやや安め | サービスによる |
