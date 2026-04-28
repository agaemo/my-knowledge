# Azure（Microsoft Azure）

## 何か

Microsoft が提供するクラウドプラットフォーム。Windows Server・Active Directory・Microsoft 365 との親和性が高く、エンタープライズ・官公庁での採用が多い。

## サービスカテゴリと主要サービス

### コンピューティング

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Virtual Machines | 仮想サーバー | EC2 |
| Azure Container Apps | サーバーレスコンテナ実行環境 | App Runner |
| AKS（Azure Kubernetes Service） | マネージド Kubernetes | EKS |
| Azure Functions | サーバーレス関数 | Lambda |
| App Service | PaaS。Web アプリをインフラ管理なしでデプロイ | Elastic Beanstalk |

### ストレージ

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Blob Storage | オブジェクトストレージ | S3 |
| Managed Disks | VM にアタッチするブロックストレージ | EBS |
| Azure Files | マネージド SMB / NFS ファイル共有 | EFS |

### データベース

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Azure Database for PostgreSQL / MySQL | マネージド RDBMS | RDS |
| Azure SQL Database | マネージド SQL Server | RDS |
| Cosmos DB | グローバル分散 NoSQL。複数の API（MongoDB・Cassandra 互換など）に対応 | DynamoDB |
| Azure Cache for Redis | マネージド Redis | ElastiCache |

### ネットワーク

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Virtual Network（VNet） | 仮想ネットワーク | VPC |
| Application Gateway | HTTP/HTTPS ロードバランサー + WAF | ALB |
| Azure Load Balancer | L4 ロードバランサー | NLB |
| Azure CDN / Front Door | CDN・グローバルロードバランサー | CloudFront |
| Azure DNS | DNS サービス | Route 53 |

### 認証・セキュリティ

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Microsoft Entra ID（旧 Azure AD） | ID 管理・SSO・MFA | IAM Identity Center |
| Azure RBAC | リソースへのアクセス制御 | IAM |
| Key Vault | 機密情報・証明書・キーの管理 | Secrets Manager + KMS |
| Microsoft Defender for Cloud | セキュリティ態勢管理 | AWS Security Hub |

### 開発者ツール・運用

| サービス | 概要 | AWS 対応 |
|---|---|---|
| Azure Monitor | ログ・メトリクス・アラート | CloudWatch |
| Azure DevOps | CI/CD・ボード・リポジトリの統合サービス | CodePipeline + GitHub |
| Azure Container Registry（ACR） | Docker イメージのプライベートレジストリ | ECR |
| Service Bus | マネージドメッセージキュー | SQS / SNS |

## Azure の特徴

### Microsoft エコシステムとの統合
Windows Server・Active Directory・Microsoft 365・Teams との親和性が高い。既存の Microsoft 資産を持つ企業がクラウド移行する際に選ばれやすい。

### Microsoft Entra ID（旧 Azure AD）
エンタープライズの ID 管理・SSO の事実上の標準。既に Entra ID を使っている組織は Azure との統合がシームレス。

### Azure DevOps
リポジトリ・CI/CD・タスク管理・テスト管理を1つのプラットフォームで提供。GitHub との統合も進んでいる。

### Cosmos DB
MongoDB・Cassandra・Gremlin（グラフ）など複数の API を1つのサービスで提供するグローバル分散 NoSQL。

## よくある構成パターン

```
Internet
   ↓
Azure Front Door（CDN + WAF）
   ↓
Application Gateway（ロードバランサー）
   ↓
AKS / Container Apps（アプリ）
   ↓
Azure Database for PostgreSQL + Azure Cache for Redis
   ↓
Blob Storage（静的ファイル・バックアップ）
```

## 3大クラウドの使い分け

| | AWS | GCP | Azure |
|---|---|---|---|
| シェア | 最大（約30%） | 3位（約10%） | 2位（約25%） |
| 強み | サービス数・実績 | データ分析・AI/ML | Microsoft 統合・エンタープライズ |
| 向いている組織 | スタートアップ〜大企業全般 | データ・AI 重視 | Microsoft 製品を使っている企業 |
| Kubernetes | EKS | GKE（k8s の生みの親） | AKS |
