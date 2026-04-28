# AWS（Amazon Web Services）

## 何か

Amazon が提供するクラウドプラットフォーム。200以上のサービスを持ち、世界最大のシェアを持つ。

## サービスカテゴリと主要サービス

### コンピューティング

| サービス | 概要 |
|---|---|
| EC2 | 仮想サーバー。OS・ミドルウェアを自分で管理する |
| Lambda | サーバーレス関数。イベント駆動で実行、アイドル時は課金なし |
| ECS | Docker コンテナのオーケストレーション（Fargate でサーバーレス運用可） |
| EKS | マネージド Kubernetes |
| App Runner | コンテナをシンプルにデプロイ。ECS より設定が少ない |

### ストレージ

| サービス | 概要 |
|---|---|
| S3 | オブジェクトストレージ。静的ファイル・バックアップ・データレイク |
| EBS | EC2 にアタッチするブロックストレージ（仮想ディスク） |
| EFS | 複数 EC2 から同時マウントできる NFS |

### データベース

| サービス | 概要 |
|---|---|
| RDS | マネージド RDBMS（PostgreSQL・MySQL・Aurora など） |
| Aurora | AWS 独自の高性能 RDBMS。PostgreSQL/MySQL 互換 |
| DynamoDB | フルマネージド NoSQL。キーバリュー・ドキュメント型 |
| ElastiCache | マネージド Redis / Memcached |

### ネットワーク

| サービス | 概要 |
|---|---|
| VPC | 仮想ネットワーク。サブネット・ルーティング・セキュリティグループを定義 |
| ALB / NLB | ロードバランサー。ALB は HTTP/HTTPS、NLB は TCP/UDP |
| CloudFront | CDN。S3 や ALB の前に置いてレイテンシを下げる |
| Route 53 | DNS サービス |
| API Gateway | HTTP / WebSocket API のフロントエンド。Lambda と組み合わせることが多い |

### 認証・セキュリティ

| サービス | 概要 |
|---|---|
| IAM | ユーザー・ロール・ポリシーの管理。「誰が何をできるか」を制御 |
| Cognito | ユーザー認証（サインアップ・ログイン）のマネージドサービス |
| Secrets Manager | API キー・DB パスワードなど機密情報の管理 |
| KMS | 暗号化キーの管理 |

### 開発者ツール・運用

| サービス | 概要 |
|---|---|
| CloudWatch | ログ・メトリクス・アラートの統合監視 |
| CloudTrail | API 操作の監査ログ |
| CodePipeline / CodeBuild | CI/CD パイプライン |
| ECR | Docker イメージのプライベートレジストリ |
| SQS | マネージドメッセージキュー |
| SNS | Pub/Sub 通知サービス |

## IAM の基本

IAM はすべての AWS 操作の認可を制御する。最小権限の原則（必要最小限の権限だけ付与）が基本。

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

- **ユーザー**: 人間が使うアカウント
- **ロール**: EC2・Lambda などのサービスやアプリが引き受けるアイデンティティ
- **ポリシー**: 何を許可するかのルール（JSON）

## リージョンとアベイラビリティゾーン（AZ）

- **リージョン**: 地理的に独立したデータセンター群（ap-northeast-1 = 東京）
- **AZ**: 同一リージョン内の独立した物理ロケーション（ap-northeast-1a/b/c）
- 複数 AZ にまたがってリソースを配置することで可用性を高める（マルチ AZ 構成）

## よくある構成パターン

```
Internet
   ↓
CloudFront（CDN）
   ↓
ALB（ロードバランサー）
   ↓
ECS / EKS（アプリコンテナ）
   ↓
RDS Aurora（DB）+ ElastiCache（キャッシュ）
```

すべてを VPC 内に置き、インターネットからは ALB だけを公開するのが基本。
