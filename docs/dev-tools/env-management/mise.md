# mise

## 何か

プロジェクトごとにツールのバージョン・環境変数・タスクを一元管理する開発環境マネージャー。Node.js・Python・Go・Terraform など 900 以上のツールのバージョンをプロジェクト単位で切り替える。

名前は料理の「mise en place（道具と材料の準備）」に由来する。

→ [公式サイト](https://mise.jdx.dev/)

## なぜ存在するか

複数プロジェクトを掛け持つ開発者は、言語をまたいだバージョン管理の問題に常に直面する。

- API サーバーは Python 3.11、ML パイプラインは Python 3.12
- フロントエンドは Node 18、別のプロジェクトは Node 20
- インフラは Terraform 1.6、新プロジェクトは 1.9

グローバルにインストールしたツールを手動で切り替えるのは煩雑で、チーム内でのバージョン差異がバグの温床になる。Docker で解決する手もあるが、ローカル開発のたびにコンテナを立ち上げるのは重い。

mise はディレクトリに入るだけで、そのプロジェクトに必要なすべてのツールバージョンが自動で切り替わる。`mise.toml` をリポジトリにコミットしておけば、チームメンバーが `mise install` 一発で同じ環境を再現できる。

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

Python・Node・Go・Rust・PHP・Ruby など主要言語は標準で対応している。Java は `coursier`（JVM ツールチェーン管理）を介してインストールできる。

標準レジストリにないツールは asdf プラグインで追加できる。asdf のプラグインエコシステムをそのまま流用できるため、Kotlin や Scala など対応ツールの幅が広い。

```bash
# asdf プラグインを追加してからインストール
mise plugin add java https://github.com/halcyon/asdf-java.git
mise install java@21
```

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

## ベストプラクティス

### mise とエコシステムのパッケージマネージャーを分離する

mise はランタイムとツールのバージョン管理に徹し、プロジェクトの依存ライブラリ管理は各エコシステムのツールに任せる。

```
mise       → ランタイム・ツールのバージョン管理（Python, Node, uv, pnpm 等）
uv/pnpm等  → プロジェクトの依存ライブラリ管理
```

例えば Python プロジェクトでは、mise で Python と uv をインストールし、ライブラリは uv で管理する。mise に全部やらせようとすると管理が混乱する。

### バージョンはパッチまで固定する

```toml
[tools]
python = "3.12.3"  # マイナーまで固定を推奨
uv = "0.4.10"
node = "20.11.0"
```

`"3.12"` のような指定は CI と手元で差が出ることがある。

### `mise.toml` をリポジトリにコミットする

チームや CI が `mise install` 一発で同じ環境を再現できる。個人設定は `.mise.local.toml` に書いて `.gitignore` に追加する。

### Python バージョンの指定は mise.toml に一本化する

uv には `uv python pin` という独自のバージョン固定機能があるが、mise と併用すると管理箇所が分散して混乱しやすい。mise.toml 側に一本化するのがシンプル。

### CI では意図しない更新を防ぐ

```bash
mise install --no-update-tool-versions
```

## いつ使うか

- Node・Python・Go など複数バージョンを使い分けるプロジェクトが複数ある
- チームで `mise.toml` をリポジトリに入れて環境を統一したい
- asdf を使っているが速度や機能に不満がある
- `npm run` や `make` を統一したタスクランナーに集約したい
