# mise

## 何か

プロジェクトごとにツールのバージョン・環境変数・タスクを一元管理する開発環境マネージャー。Node.js・Python・Go・Terraform など 900 以上のツールのバージョンをプロジェクト単位で切り替える。

名前は料理の「mise en place（道具と材料の準備）」に由来する。

→ [公式サイト](https://mise.jdx.dev/)

## なぜ存在するか

複数プロジェクトを扱う開発者は「このプロジェクトは Node 18、あちらは Node 20」という状況に常に直面する。グローバルにインストールしたツールを手動で切り替えるのは煩雑で、チーム間のバージョン差異がバグの温床になる。

[asdf](https://asdf-vm.com/) という先行ツールがこの問題を解いていたが、mise はそれを Rust で再実装して高速化し、環境変数管理・タスクランナーを統合した。

## 三本柱アーキテクチャ

### 1. Dev Tools（ツールバージョン管理）

`mise.toml` にツールとバージョンを宣言する。ディレクトリに入ると自動で切り替わる。

```toml
[tools]
node = "20"
python = "3.12"
terraform = "1.7"
```

asdf のプラグインエコシステムをそのまま使えるため、既存資産が活きる。

### 2. Environments（環境変数管理）

プロジェクト固有の環境変数を `mise.toml` で管理する。`.env` ファイルの読み込みも設定できる。

```toml
[env]
NODE_ENV = "development"
DATABASE_URL = "postgres://localhost/mydb"
_.file = ".env.local"  # .env.local を自動読み込み
```

ディレクトリを移動するだけで環境変数が切り替わる。

### 3. Tasks（タスクランナー）

`mise run` で実行するタスクを定義する。`npm run` や `make` の代替として使える。

```toml
[tasks.dev]
run = "node server.js"
description = "開発サーバー起動"

[tasks.test]
run = "jest --watch"
```

## 設定ファイルの探索

`mise.toml` はディレクトリ階層を上方向に探索する。リポジトリルートに置けば全チームメンバーに共有される。ユーザー個別の設定は `~/.config/mise/config.toml` に書く。

```
プロジェクト/
  mise.toml        # リポジトリにコミットして共有
  .mise.local.toml # 個人設定（.gitignore に追加）
```

## asdf との関係

mise は asdf の後継として設計されており、`.tool-versions` ファイルをそのまま読み込める。プラグインも asdf のものを流用できる。主な違い：

| | asdf | mise |
|---|---|---|
| 実装言語 | Bash | Rust |
| 速度 | 低速 | 高速 |
| 環境変数管理 | なし | あり |
| タスクランナー | なし | あり |
| 後方互換性 | - | `.tool-versions` 対応 |

## いつ使うか

- Node・Python・Go など複数バージョンを使い分けるプロジェクトが複数ある
- チームで `mise.toml` をリポジトリに入れて環境を統一したい
- asdf を使っているが速度や機能に不満がある
- `npm run` や `make` を統一したタスクランナーに集約したい
