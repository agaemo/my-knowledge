---
id: distributions
title: ディストリビューション
sidebar_label: ディストリビューション
---

# ディストリビューション

## なぜディストリビューションが存在するか

Linuxカーネル単体はOS機能の核（プロセス管理・メモリ管理・デバイス制御）を提供するだけで、そのままでは使えない。実用的なOSとして使うには、シェル・パッケージマネージャ・標準コマンド群・初期設定・インストーラなどが必要になる。

これらをカーネルと組み合わせてパッケージ化したものが**ディストリビューション**（distro）。誰が何を組み合わせるかによって、用途・思想・サポートポリシーが異なる複数のディストリビューションが生まれた。

## 主要な系統

### Debian系

Debian Projectが開発する Debian をベースとする系統。

| ディストリビューション | 特徴 |
|---|---|
| **Debian** | 安定性重視。リリースサイクルが長い |
| **Ubuntu** | Debian派生。デスクトップ・サーバー両対応。最も広く使われる |
| **Ubuntu LTS** | 5年間の長期サポート版。本番環境で採用されることが多い |

パッケージ管理：`apt`（Advanced Package Tool）  
パッケージ形式：`.deb`

### RHEL系

Red Hat Enterprise Linux（RHEL）をベースとする商用・エンタープライズ向けの系統。

| ディストリビューション | 特徴 |
|---|---|
| **RHEL** | Red Hat社の商用サポート付きディストリビューション |
| **Fedora** | RHELの上流。新機能をいち早く取り込む実験的な位置づけ |
| **AlmaLinux / Rocky Linux** | CentOS（RHELの無償クローン）廃止後の後継 |

パッケージ管理：`dnf`（旧: `yum`）  
パッケージ形式：`.rpm`

### Arch系

シンプルさと最新パッケージを重視する系統。

| ディストリビューション | 特徴 |
|---|---|
| **Arch Linux** | ローリングリリース。手動設定が多く上級者向け |
| **Manjaro** | Archをベースにした初心者向けディストリビューション |

パッケージ管理：`pacman`

## どれを選ぶか

| 用途 | 選択肢 |
|---|---|
| 本番サーバー | Ubuntu LTS / AlmaLinux / RHEL |
| クラウドインフラ（AWS・GCP・Azure） | Ubuntu / Amazon Linux / RHEL |
| 開発環境（コンテナベース） | Alpine Linux（軽量）・Ubuntu |
| 学習・自前サーバー | Ubuntu |

Dockerイメージでよく見る **Alpine Linux** はmusl libcベースの超軽量ディストリビューション（イメージサイズ数MB）。本番向けではなくコンテナのベースイメージとして使われることが多い。

## OSの違い：macOS vs Linux

macOSはLinuxではなくBSD系UNIXをベースとする。

| | macOS | Linux |
|---|---|---|
| カーネル | XNU（Darwin） | Linuxカーネル |
| UNIX認証 | あり | なし（POSIX準拠） |
| パッケージ管理 | Homebrew（非公式） | apt / dnf / pacmanなど |
| シェルデフォルト | zsh | bash（distroによる） |

コマンドの挙動が一部異なる（例：`sed -i` の引数形式、`date` コマンドのフラグ）。CI/CD環境とローカルで差異が出る原因になりやすい。
