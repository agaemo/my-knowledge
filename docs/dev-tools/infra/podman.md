# Podman

## 何か

デーモンプロセスなしでコンテナを実行するOCI準拠のコンテナエンジン。Docker互換のCLIを持ちながら、アーキテクチャが根本的に異なる。

→ [公式サイト](https://podman.io/) / [ドキュメント](https://docs.podman.io/)

## なぜ存在するか

DockerはRoot権限で動く常駐デーモン（`dockerd`）が必要で、これがセキュリティ上の問題になる。デーモンが侵害されるとホストOSへの完全なアクセスを奪われる。

PodmanはDockerのアーキテクチャ上の欠点を解消するために設計された：

- **デーモンレス**: バックグラウンドに管理プロセスがなく、コンテナはユーザーの子プロセスとして起動する
- **ルートレス**: 非Root権限でコンテナを実行できる。侵害されてもホストOSへのダメージが限定的
- **Podのネイティブサポート**: Kubernetesと同じ「Pod」の概念を持ち、複数コンテナをまとめて扱える

## Dockerとの構造的な違い

```
Docker:
  CLI → dockerd（Root常駐デーモン）→ containerd → runc → コンテナ

Podman:
  CLI → conmon（軽量監視プロセス）→ runc → コンテナ
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

## Systemdとの統合

Podmanはデーモンがないため、コンテナの自動起動にSystemdを使う。`podman generate systemd` でSystemdユニットファイルを生成できる。

```bash
# コンテナのSystemdユニットを生成
podman generate systemd --name myapp --files --new
systemctl --user enable container-myapp.service
systemctl --user start container-myapp.service
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
| Compose | Docker Compose | podman-compose / Quadlet |
| Kubernetesとの親和性 | ビルドツールとして | PodコンセプトがKと共通 |
| エコシステム | 成熟・広い | RHEL/Fedora系で強い |

DockerはCI/CDでのビルドや既存エコシステムとの互換性が必要なケース、Podmanはセキュリティ要件が厳しい環境やRHEL系OSでの運用に向いている。
