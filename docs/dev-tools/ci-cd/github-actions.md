# GitHub Actions

## 何か

GitHub に統合された CI/CD プラットフォーム。リポジトリへの push・PR・スケジュールなどのイベントをトリガーにワークフローを自動実行する。

→ [公式サイト](https://github.com/features/actions) / [ドキュメント](https://docs.github.com/ja/actions)

## なぜ存在するか

テスト・ビルド・デプロイを手動で行うのはミスが多く、時間もかかる。GitHub Actions はこれをコードとして定義し、GitHub と密に統合することで設定コストを下げる（別途 CI サーバーが不要）。

## 主要概念

```
Workflow（ .github/workflows/*.yml ）
  └── Job（並列 or 依存関係で実行）
        └── Step（順番に実行）
              ├── uses: action を呼び出す
              └── run: シェルコマンドを実行
```

### Workflow
`.github/workflows/` 以下の YAML ファイルで定義。複数作れる。

### Trigger（on）
ワークフローを起動するイベント。

```yaml
on:
  push:
    branches: [main]          # main への push
  pull_request:
    branches: [main]          # main への PR
  schedule:
    - cron: '0 9 * * 1'       # 毎週月曜 9:00 UTC
  workflow_dispatch:           # 手動実行
```

### Job
並列で実行される処理単位。`needs` で依存関係を定義すると直列になる。

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: ...

  deploy:
    runs-on: ubuntu-latest
    needs: test              # test が成功してから実行
    steps: ...
```

### Action
再利用可能な処理のパッケージ。`uses` で呼び出す。

```yaml
steps:
  - uses: actions/checkout@v4          # リポジトリをチェックアウト
  - uses: actions/setup-node@v4        # Node.js のセットアップ
    with:
      node-version: '20'
```

## 実例：Node.js の CI

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Secrets の扱い

API キーなど機密情報は GitHub の Secrets に登録し、環境変数として参照する。

```yaml
# Settings > Secrets and variables > Actions で登録

steps:
  - run: npm run deploy
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## キャッシュ

依存関係のキャッシュでビルド時間を短縮できる。

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

`actions/setup-node` の `cache: 'npm'` オプションでも同様のキャッシュが自動設定される。

## Runner の種類

| Runner | 概要 |
|---|---|
| `ubuntu-latest` | GitHub 提供の Linux 環境（無料枠あり） |
| `windows-latest` | GitHub 提供の Windows 環境 |
| `macos-latest` | GitHub 提供の macOS 環境（消費が多い） |
| セルフホスト | 自前サーバーで実行。プライベートネットワークへのアクセスが必要なときに使う |

## いつ使うか

- GitHub を使っているプロジェクトで CI/CD を導入したい
- テスト・Lint・ビルド・デプロイを自動化したい
- 設定の簡単さを優先したい（Jenkins より設定が少ない）

## 他ツールとの比較

| ツール | 特徴 |
|---|---|
| GitHub Actions | GitHub 統合。設定が簡単。無料枠あり |
| CircleCI | 高速・豊富な設定。GitHub 以外にも対応 |
| Jenkins | オンプレ寄り。自由度が高いが設定コストも高い |
| ArgoCD | k8s へのデプロイ特化（GitOps） |
