# Terraform

## 何か

HashiCorp が開発したインフラストラクチャ・アズ・コード（IaC）ツール。クラウドリソース（サーバー・DB・ネットワーク等）をコードで宣言し、作成・変更・削除を管理する。

→ [公式サイト](https://www.terraform.io/) / [ドキュメント](https://developer.hashicorp.com/terraform/docs)

## なぜ存在するか

GUI やスクリプトで手動構築したインフラは「誰が何をいつ変えたか」が追跡できず、再現性がない。Terraform はインフラの状態をコードとして Git 管理し、再現性・レビュー可能性・自動化を実現する。

## 主要概念

### Provider
Terraform が操作する対象（AWS・GCP・Azure・Kubernetes など）のプラグイン。

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
```

### Resource
作成・管理するインフラの1単位。

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "my-app-assets"
}

resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.micro"
}
```

### State（状態ファイル）
Terraform が管理するリソースの現在状態を記録する `terraform.tfstate`。
実インフラとのズレを検知するために使う。

チームで使う場合は S3 + DynamoDB などのリモートバックエンドに保存する（ローカル保存は危険）。

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "tfstate-lock"  # 同時編集防止
  }
}
```

### Variable / Output

```hcl
variable "env" {
  type    = string
  default = "prod"
}

output "bucket_name" {
  value = aws_s3_bucket.assets.bucket
}
```

### Module
再利用可能なリソースのまとまり。同じ構成を複数環境（dev/stg/prod）に展開するときに使う。

```hcl
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
  env    = var.env
}
```

## 基本ワークフロー

```bash
terraform init      # プロバイダーのダウンロード
terraform plan      # 変更内容のプレビュー（実際には何も変えない）
terraform apply     # 変更を実際に適用
terraform destroy   # 全リソースを削除
```

`terraform plan` を必ず確認してから `apply` するのが基本。

## Terraform vs OpenTofu

OpenTofu は Terraform のフォーク（OSS）。HashiCorp が Terraform のライセンスを BSL に変更したことで誕生。API 互換なのでほぼ同じように使える。新規プロジェクトでは OpenTofu を選ぶ選択肢も増えている。

## いつ使うか

- クラウドインフラを複数人・複数環境で管理したい
- インフラ変更をコードレビューしたい
- 同じ構成を dev/stg/prod など複数環境に再現したい

## いつ使わないか

- 個人の小規模プロジェクトで GUI で十分なとき
- AWS CDK / Pulumi のようにプログラミング言語でインフラを書きたいとき（IaC ツールの選択肢はいくつかある）
