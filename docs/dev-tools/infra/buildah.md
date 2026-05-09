# Buildah

## 何か

Dockerfileなし・デーモンなし・ルートレスでOCIイメージをビルドするツール。シェルスクリプトでイメージ構築を細かく制御できる。

→ [公式サイト](https://buildah.io/) / [GitHub](https://github.com/containers/buildah)

## なぜ存在するか

DockerでイメージをビルドするにはRoot権限で動く`dockerd`が必要で、CI/CDやKubernetes上でのビルドが「Docker-in-Docker」という問題を抱える。

Buildahはこれを解消するために設計された：

- **デーモンレス**: ビルド時にバックグラウンドプロセスが不要
- **ルートレス**: 非Root権限でビルドできる
- **低レベルAPI**: Dockerfileに縛られず、シェルスクリプトから各ステップを直接制御できる

## Podmanとの関係

`podman build` は内部でBuildahのGolang APIを使用している。BuildahはPodmanの「ビルド担当」という位置づけ。

| | Buildah | Podman |
|---|---|---|
| 主な用途 | イメージのビルド | コンテナの実行・管理 |
| コンテナの寿命 | ビルド中のみ（短寿命） | 長期稼働 |
| 互いのコンテナ | 見えない（独立） | 見えない（独立） |

## 2つのビルドアプローチ

### Dockerfileを使う（従来通り）

```bash
buildah build -t myapp .
```

`docker build` と同じ感覚で使える。

### シェルスクリプトで制御する

Dockerfileの各命令（`FROM`・`RUN`・`COPY`・`CMD`）に対応するサブコマンドがあり、シェルスクリプトとして記述できる。

```bash
#!/bin/bash

# ベースイメージからコンテナを作成
ctr=$(buildah from fedora)

# パッケージをインストール
buildah run "$ctr" -- dnf -y install nginx

# ファイルをコピー
buildah copy "$ctr" ./nginx.conf /etc/nginx/nginx.conf

# 起動コマンドを設定
buildah config --cmd "/usr/sbin/nginx -g 'daemon off;'" "$ctr"

# イメージとしてコミット
buildah commit "$ctr" myapp:latest

# 作業用コンテナを削除
buildah rm "$ctr"
```

### scratch からのビルド（最小イメージ）

`scratch` は何も含まない空のベースイメージ。`buildah mount` でホスト側からファイルシステムに直接ファイルを書き込める。

```bash
ctr=$(buildah from scratch)

# コンテナのファイルシステムをホストにマウント
mnt=$(buildah mount "$ctr")

# ホスト側のパッケージマネージャーでインストール（コンテナ内でrootless）
dnf install --installroot "$mnt" --releasever 42 bash coreutils --nodocs -y

# バイナリをコピー
cp ./myapp "$mnt/usr/local/bin/"

buildah config --cmd /usr/local/bin/myapp "$ctr"
buildah commit "$ctr" myapp:scratch
buildah unmount "$ctr"
```

`docker build` ではできない「コンテナ内でコマンドを実行せずにイメージを構築する」ことが可能。

## いつ使うか

- **CI/CDでルートレスビルドしたい**: Docker-in-Dockerを避けたいKubernetes上のビルドパイプライン
- **最小イメージを作りたい**: scratchからビルドしてイメージサイズを極限まで削減
- **ビルドを細かく制御したい**: 条件分岐・ループ・外部コマンドをシェルスクリプトとして記述
- **Podmanを使っている環境**: `podman build` を使う限りBuildahが内部で動いている
