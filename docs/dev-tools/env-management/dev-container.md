# Dev Container

## 何か

Docker コンテナを開発環境として使う仕組み。`.devcontainer/devcontainer.json` で環境を定義し、VS Code や GitHub Codespaces がそのコンテナ内で IDE・拡張機能・ターミナルを動かす。

## なぜ存在するか

「自分の PC では動く」問題の根本原因は、開発環境がコード化されていないことにある。ツールのバージョン・OS の差異・インストール済みの依存パッケージ——これらは暗黙知として各自の環境に潜んでいる。

mise や nix はランタイムとツールのバージョンを揃えられるが、OS レベルの差異（Linux と macOS のシステムライブラリの違いなど）は吸収できない。Dev Container は OS ごとコンテナに閉じ込めることで、環境差異をゼロにする。

特にメリットが大きい場面：

- 本番が Linux で、開発者が macOS/Windows を使っているとき
- プロジェクト固有の依存が多く、ローカル汚染を避けたいとき
- 新メンバーが `git clone` 後すぐ開発を始められるようにしたいとき

## 仕組み

```
リポジトリ/
└── .devcontainer/
    ├── devcontainer.json   # 環境定義
    └── Dockerfile          # (オプション) カスタムイメージ
```

VS Code の「Remote - Containers」拡張（または Dev Containers 拡張）がリポジトリを開くと、`.devcontainer/devcontainer.json` を読んでコンテナをビルド・起動する。ソースコードはホストからコンテナにマウントされる。

```
ホスト OS
└── Docker デーモン
    └── コンテナ（開発環境）
        ├── OS・ツール・言語ランタイム
        ├── VS Code Server（拡張機能込み）
        └── マウントされたソースコード ← ホストの ~/projects/foo
```

ターミナル・デバッガ・拡張機能はすべてコンテナ内で動く。ホスト側には Docker のみあればよい。

## devcontainer.json の基本

```json
{
  "name": "Node.js プロジェクト",
  "image": "mcr.microsoft.com/devcontainers/node:20",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "postCreateCommand": "npm install",
  "forwardPorts": [3000]
}
```

| フィールド | 役割 |
|---|---|
| `image` | ベースイメージ（Microsoft が公式イメージを提供） |
| `features` | Git・Docker・AWS CLI など追加機能を宣言的に追加 |
| `customizations.vscode.extensions` | コンテナ内にインストールする拡張機能 |
| `postCreateCommand` | コンテナ作成後に一度だけ実行するコマンド |
| `forwardPorts` | ホストに転送するポート |

## mise・nix との違い

| | mise / nix | Dev Container |
|---|---|---|
| 分離レベル | ツール・ランタイムのバージョン | OS ごと |
| OS の差異 | 吸収できない | 吸収できる |
| 起動コスト | 軽い（コンテナ不要） | 重い（Docker 必要） |
| CI との一体感 | 高い（CI も同じツールを使う） | Dockerfile を共有すれば同等 |
| オフライン | 動く | イメージをビルド済みなら動く |

mise でランタイムを管理しつつ Dev Container で OS を統一する、という組み合わせも使われる。

## Features

`features` フィールドで機能を宣言的に追加できる。Dockerfile を書かずに必要なツールを組み合わせられる。

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {},
  "ghcr.io/devcontainers/features/aws-cli:1": {},
  "ghcr.io/devcontainers/features/node:1": { "version": "20" }
}
```

## GitHub Codespaces との関係

GitHub Codespaces は Dev Container 仕様をそのまま使う。同じ `.devcontainer/devcontainer.json` をブラウザ上のクラウド環境として開ける。ローカルに Docker がなくても開発できる。

## いつ使うか

- チームで OS が混在している（Linux 本番・macOS/Windows 開発者）
- 環境構築に時間がかかり、新メンバーの立ち上げを短縮したい
- 複数プロジェクトの依存がローカルで衝突している
- GitHub Codespaces でブラウザだけで開発できる環境を用意したい
