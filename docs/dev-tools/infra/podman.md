# Podman

## 何か

デーモンプロセスなしでコンテナを実行するOCI準拠のコンテナエンジン。Docker互換のCLIを持ちながら、アーキテクチャが根本的に異なる。

→ [公式サイト](https://podman.io/) / [Getting Started](https://podman.io/docs) / [ドキュメント](https://docs.podman.io/)

## なぜ存在するか

DockerはRoot権限で動く常駐デーモン（`dockerd`）が必要で、これがセキュリティ上の問題になる。デーモンが侵害されるとホストOSへの完全なアクセスを奪われる。

PodmanはDockerのアーキテクチャ上の欠点を解消するために設計された：

- **デーモンレス**: バックグラウンドに管理プロセスがなく、コンテナはユーザーの子プロセスとして起動する
- **ルートレス**: 非Root権限でコンテナを実行できる。侵害されてもホストOSへのダメージが限定的
- **SELinuxラベルの自動付与**: 各コンテナに自動でSELinuxラベルが付き、リソースアクセスをカーネルレベルで制御できる
- **Podのネイティブサポート**: Kubernetesと同じ「Pod」の概念を持ち、複数コンテナをまとめて扱える

## Dockerとの構造的な違い

```
Docker:
  CLI → dockerd（Root常駐デーモン）→ containerd → runc → コンテナ

Podman:
  CLI → conmon（軽量監視プロセス）→ crun → コンテナ
  （デーモンなし・各コンテナが独立したプロセスツリー）
```

Dockerではすべてのコンテナがrootで動く`dockerd`の子プロセスだが、Podmanではコンテナがコマンドを実行したユーザーの子プロセスとして直接起動する。

## Podの概念

Podとは、同じネットワーク名前空間・ストレージを共有するコンテナのグループ。KubernetesのPodと同じ概念なので、ローカルでPodmanを使って開発したPodをそのままKubernetes YAMLに変換できる。

```bash
# PodにNginxとアプリコンテナを同居させる
podman pod create --name mypod -p 8080:80
podman run -d --pod mypod nginx
podman run -d --pod mypod myapp
```

## Docker互換性

ほぼすべてのDockerコマンドがそのまま動く。

```bash
# Docker CLIとの互換エイリアス
alias docker=podman

podman build -t myapp .
podman run -d -p 8080:3000 myapp
podman ps
podman logs -f <container>
podman exec -it <container> sh
```

Docker Composeの代替として `podman-compose` も利用可能。

## Systemdとの統合（Quadlet）

Podmanはデーモンがないため、コンテナの自動起動にSystemdを使う。Podman 4.4以降は **Quadlet** が推奨方法。`podman generate systemd` は非推奨。

QuadletはSystemdのジェネレーター機能を使い、`.container` ファイルからSystemdサービスユニットを自動生成する。宣言的に記述でき、Gitで管理しやすい。

```ini
# /etc/containers/systemd/myapp.container
[Container]
Image=docker.io/library/nginx:latest
PublishPort=8080:80
Volume=/data:/usr/share/nginx/html:Z

[Service]
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# daemon-reloadでQuadletが自動的にサービスを生成する
systemctl daemon-reload
systemctl start myapp.service
```

ユーザースコープで動かす場合（ルートレス）は `~/.config/containers/systemd/` に置き、`systemctl --user` で操作する。

## podman machine（macOS / Windows）

コンテナはLinuxカーネルの機能（namespace・cgroup）に依存するため、macOSとWindowsでは仮想マシンが必要。`podman machine` がそのライフサイクルを管理する。

```bash
# 仮想マシンを初期化して起動
podman machine init
podman machine start

# 状態確認
podman machine list
```

| プラットフォーム | デフォルトVM | 代替 |
|---|---|---|
| macOS | libkrun | applehv |
| Windows | WSL2 | Hyper-V |

Docker Desktopと同様の役割だが、OSSで無償。

## Podman Desktop

PodmanとKubernetesをGUIで操作するデスクトップアプリ（macOS・Windows・Linux対応）。複数のコンテナエンジン（Podman・Docker）を統一UIで管理できる。

主な機能：
- コンテナ・イメージ・Podの一覧と操作
- Dockerfile/Containerfileからのビルド
- KubernetesへのデプロイとYAML生成
- podman machineの管理

コマンドラインに不慣れなチームへの導入や、Kubernetesへの移行期に有効。

## containers エコシステム

Podmanは単独ツールではなく、`containers` オーガニゼーション（GitHub: [containers/](https://github.com/containers/)）が開発するOSSプロジェクト群の中核。各ツールが役割を分担している。

| ツール | 役割 |
|---|---|
| **Podman** | コンテナ・Pod・イメージのライフサイクル管理 |
| **Buildah** | OCI イメージのビルドに特化。`podman build` は内部で Buildah の API を使用 |
| **Skopeo** | レジストリ間のイメージコピー・同期・検査。デーモン不要・ルートレス |
| **crun** | 軽量・高速な OCI ランタイム（C実装）。runc の代替として Podman のデフォルト |
| **netavark** | Rust実装のコンテナネットワークスタック |
| **CRI-O** | Kubernetes 向け OCI ランタイムインターフェース |

Dockerが単一のデーモンに機能を集約するのに対し、containers エコシステムは「1ツール1責務」で構成されている。

### Skopeo の特徴的なユースケース

```bash
# コンテナを pull せずにイメージのメタデータを検査
skopeo inspect docker://docker.io/library/nginx:latest

# レジストリ間でイメージをコピー（ローカルへの保存不要）
skopeo copy docker://quay.io/myimage:latest docker://registry.example.com/myimage:latest

# エアギャップ環境向けにリポジトリをまるごと同期
skopeo sync --src docker --dest dir quay.io/myorg /offline/images
```

## いつ使うか

- **セキュリティが重要な本番環境**: ルートレスでコンテナを動かしたい
- **Kubernetesへの移行・連携**: PodのコンセプトをローカルでもKubernetesと揃えたい
- **Root権限のない環境**: 共有サーバーや制限されたCI/CD環境
- **Dockerデーモンが使えない環境**: Systemdで直接コンテナを管理したい場合
- Dockerコマンドを使い慣れていてエイリアスで乗り換えたい場合

## Dockerとの使い分け

| | Docker | Podman |
|---|---|---|
| デーモン | 必要（Root） | 不要 |
| ルートレス | 制限あり | ネイティブサポート |
| Compose | Docker Compose | podman-compose |
| Systemd統合 | 非公式 | Quadlet（公式サポート） |
| macOS/Windows | Docker Desktop | podman machine |
| GUI | Docker Desktop | Podman Desktop |
| Kubernetesとの親和性 | ビルドツールとして | PodコンセプトがKと共通 |
| エコシステム | 成熟・広い | RHEL/Fedora系で強い |

DockerはCI/CDでのビルドや既存エコシステムとの互換性が必要なケース、Podmanはセキュリティ要件が厳しい環境やRHEL系OSでの運用に向いている。

## Red Hat との関係

PodmanはRed Hatが主導して開発したOSSで、RHEL 8以降ではDockerに代わりデフォルトのコンテナツールとなっている。RHEL サブスクリプションにはPodmanが含まれており、エンタープライズサポートの対象。

これが「RHEL/Fedora系で強い」理由であり、containers オーガニゼーションのプロジェクト（Buildah・Skopeo・CRI-O 等）も同様にRed Hat主導で開発されている。
