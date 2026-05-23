---
id: unix-linux
title: Unix/Linux
sidebar_label: Unix/Linux
---

# Unix/Linux

## UNIXとは

1969年にAT&Tベル研究所で生まれたOS。Ken Thompson と Dennis Ritchie らが開発した。当時のOSは特定ハードウェアに密結合していたが、UNIXはC言語で書かれ移植性を持つ初のOSとなった。

## UNIX設計思想

UNIXは「UNIX哲学」と呼ばれる設計思想を持つ。

**一つのことをうまくやれ**  
プログラムは単一の機能に集中する。`ls`はリスト表示だけ、`grep`は検索だけ。機能を詰め込まない。

**全てはファイル**  
デバイス・ソケット・プロセス間通信もファイルとして抽象化する。インターフェースを統一することで、同じ操作（read/write）があらゆるリソースに使える。

**テキストストリームで連携する**  
プログラム同士はテキストを介してパイプで繋ぐ。これにより小さなツールを組み合わせて複雑な処理ができる。

## LinuxとUNIXの関係

LinuxはUNIXそのものではなく、UNIXの設計思想を参考に1991年にLinus Torvaldsが開発したカーネル。法的にUNIXのコードは含まないが、動作・設計はUNIXに準拠している（POSIX互換）。

| | UNIX | Linux |
|---|---|---|
| 起源 | AT&Tベル研究所（1969） | Linus Torvalds（1991） |
| ライセンス | 商用（系統による） | GPL（オープンソース） |
| 例 | Solaris・AIX・HP-UX・macOS | Ubuntu・Debian・RHEL |

macOSはBSD（UNIXの派生）をベースとしており、The Open GroupのUNIX認証を受けている正式なUNIX。

## POSIX

Portable Operating System Interface の略。IEEE が策定したUNIX互換の標準仕様。POSIX準拠のOSは同じシステムコールやコマンド体系を持つため、コードの移植性が高まる。

LinuxはPOSIX準拠を目標としているが完全準拠ではない。macOSは正式にPOSIX認証を取得している。

## なぜ重要か

現代のサーバー・クラウドインフラのほぼ全てがLinux上で動く。コンテナ（Docker）もLinuxカーネルの機能（namespace・cgroup）を使う。UNIX設計思想を理解することは、シェルスクリプト・パイプ・ファイルシステムなどを扱う上での土台になる。
