# Nix

## 何か

パッケージのビルドと配布を純粋関数型のアプローチで行うパッケージマネージャー。macOS・Linux で動作し、NixOS という Linux ディストリビューションの基盤にもなっている。

→ [公式サイト](https://nixos.org/)

## なぜ存在するか

従来のパッケージマネージャー（apt・brew 等）は、インストール済みパッケージが互いの依存関係を上書きする「依存地獄」が起きやすい。また「自分のマシンでは動く」問題のようにビルド環境を再現できない課題がある。

Nix はすべてのパッケージを完全に分離・固定された形で管理することで、これらを根本から解決する。

## 中核となる設計思想

### 純粋関数型

パッケージのビルドを「純粋な関数」として扱う。同じ入力（ソース・依存関係）からは常に同じ出力（バイナリ）が生成される。

### Nix Store

全パッケージは `/nix/store` に格納される。パスにはビルド全体の入力から導出した暗号ハッシュが含まれる。

```
/nix/store/b6gvzjyb2pg0kjnlw2s3v8q1r9a4m5n1-firefox-120.0/
```

同じパッケージの異なるバージョンや、異なる依存関係でビルドしたパッケージが共存できる。DLL 地獄が原理的に起きない。

### Derivation（ビルドレシピ）

Nix 言語で書かれたビルド定義。ソース・依存関係・ビルドスクリプトをすべて宣言する。この宣言が完全であることがビルドの再現性を保証する。

```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.stdenv.mkDerivation {
  name = "my-app";
  src = ./.;
  buildInputs = [ pkgs.nodejs pkgs.yarn ];
  buildPhase = "yarn build";
}
```

### Profiles

ユーザーごとに独立したプロファイルを持つ。パッケージのインストール・更新がアトミックに行われ、失敗しても中途半端な状態にならない。ロールバックも可能。

### Flakes

Nix コードの入力（依存する nixpkgs のリビジョン等）を `flake.lock` でピン留めする仕組み。lockfile によってチーム間・CI 間で完全に同一の環境が再現できる。

## nix-shell / nix develop

プロジェクトごとの一時的な開発環境を立ち上げる機能。

```nix
# shell.nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [ pkgs.nodejs_20 pkgs.python311 pkgs.postgresql ];
}
```

`nix-shell` で入ると、これらのツールが PATH に追加される。シェルを抜ければ消える。グローバルにインストールしなくてよい。

## nixpkgs

コミュニティが管理する大規模なパッケージコレクション。GitHub リポジトリとして公開されており、どのリビジョンを使うかを固定することで再現性を保証する。

## いつ使うか

- チーム全員が全く同一のビルド環境を持つ必要がある（lockfile で nixpkgs ごと固定）
- 複数言語が混在するプロジェクトで依存関係の衝突を避けたい
- CI の再現性を高めたい
- macOS で Homebrew の代替として宣言的に環境管理したい
- NixOS でシステム全体を宣言的に管理したい

## Docker との比較

| | Nix | Docker |
|---|---|---|
| 単位 | パッケージ・環境 | コンテナ（プロセス） |
| 用途 | ビルド再現性・開発環境 | アプリ実行・デプロイ |
| OS 分離 | なし（ホスト OS を共有） | あり（コンテナ境界） |
| ロールバック | あり | イメージタグで管理 |

Nix でビルドした成果物を Docker イメージにする組み合わせもある。

## Nix ラッパーツール

Nix 単体は習得コストが高い（独自言語・概念の多さ）。実際の開発では Nix を内部で使いつつ設定を簡略化したラッパーツールが使われることが多い。

### Devbox

Jetify が開発する OSS ツール。Nix 言語を書かずに `devbox.json` だけで環境を定義できる。

→ [公式サイト](https://www.jetify.com/devbox)

```json
{
  "packages": ["nodejs@20", "python@3.12", "postgresql@16"],
  "shell": {
    "init_hook": ["echo 'Ready.'"]
  }
}
```

- チームで `devbox.json` をリポジトリに入れて共有する運用が基本
- `devbox generate dockerfile` で Dockerfile に書き出せる（CI・本番への橋渡し）
- プロセス管理（DB・サーバーの同時起動）も内蔵

### devenv

`devenv.nix` という簡略化された Nix ファイルで環境を定義する。Nix 言語を使うが、汎用 Nix より記述量が少なく、言語別ツールチェーンや PostgreSQL・Redis などのサービスをモジュールとして組み込める。

→ [公式サイト](https://devenv.sh/)

```nix
{ pkgs, ... }: {
  languages.python.enable = true;
  languages.python.version = "3.12";
  services.postgres.enable = true;
}
```

- 設定の合成が得意で、モノレポ構成に向いている
- Nix の知識がある程度あるチーム向け

### 選択の目安

| | Devbox | devenv | Nix 直接 |
|---|---|---|---|
| Nix 知識 | 不要 | 少し必要 | 必要 |
| 設定ファイル | JSON | Nix（簡略） | Nix（フル） |
| 柔軟性 | 中 | 高 | 最高 |
| 向いている場面 | チーム導入・初期コスト重視 | モジュール化・サービス管理 | CI/CD・NixOS との統合 |
