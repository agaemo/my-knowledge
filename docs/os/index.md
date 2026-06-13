---
id: index
title: OS
sidebar_label: OS
---

# OS

オペレーティングシステムの設計思想と基盤概念を扱う。

| ページ | 内容 |
|---|---|
| [Unix/Linux](./unix-linux) | UNIX設計思想・LinuxとUNIXの関係・POSIX |
| [ディストリビューション](./distributions) | なぜディストリビューションが存在するか・主要な系統と違い |
| [I/Oとファイルディスクリプタ](./io-streams) | 標準入出力・リダイレクト・`/dev/null` |
| [エンディアン](./endianness) | リトルエンディアン・ビッグエンディアンの違いと意識すべき場面 |
| [カーネル](./kernel) | カーネル空間・ユーザー空間・システムコール・プロセス管理 |
| [ジョブスケジューリング（cron・at）](./job-scheduling) | 定期実行・予約実行の仕組みと持続化への悪用 |
| [仮想化](./virtualization) | ハイパーバイザーType1/2・VM vs コンテナ・Hyper-V・VMware ESXi |
| [CPUアーキテクチャ](./cpu-architecture) | x86-64・ARM64・Apple Silicon・Rosetta 2・Docker との関係 |
| [systemd](./systemd) | PID 1・ユニット・systemctl・journald |
| [パッケージマネージャー](./package-manager) | apt・dpkg・dnf・yum・rpm・brew の関係と使い分け |
| [パーミッションとアクセス制御](./permissions) | rwx・setuid・ACL・権限昇格の仕組み |
