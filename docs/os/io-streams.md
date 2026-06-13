---
id: io-streams
title: I/Oとファイルディスクリプタ
sidebar_label: I/Oとファイルディスクリプタ
---

# I/Oとファイルディスクリプタ

## ファイルディスクリプタとは

UNIXでは「全てはファイル」という設計思想に基づき、ファイル・デバイス・ソケットなどへのアクセスを**ファイルディスクリプタ**（fd）という整数値で統一的に表現する。

プロセスが起動すると、OSは3つのfdを自動的に割り当てる。

| fd | 名称 | デフォルトの接続先 |
|---|---|---|
| 0 | 標準入力（stdin） | キーボード |
| 1 | 標準出力（stdout） | ターミナル |
| 2 | 標準エラー出力（stderr） | ターミナル |

stdoutとstderrがどちらもターミナルに表示されるのはデフォルトの接続先が同じだからで、別のfdとして独立している。

## リダイレクト

リダイレクトはfdの接続先を変える操作。

### 出力リダイレクト

```bash
command > file    # stdout を file に上書き
command >> file   # stdout を file に追記
command 2> file   # stderr を file に上書き
command 2>> file  # stderr を file に追記
```

`>` はファイルが存在すれば上書き、存在しなければ新規作成する。`>>` は既存内容を保持して末尾に追加する。

### 入力リダイレクト

```bash
command < file    # file を stdin として読み込む
```

### stdoutとstderrをまとめる

```bash
command > file 2>&1   # stderr を stdout と同じ先（file）に向ける
command &> file       # 上と同じ（bashの省略記法）
```

`2>&1` の読み方：「fd2 を fd1 と同じ接続先に向ける（&1 は fd1 を参照）」。  
順序が重要で、`2>&1 > file` と書くと意図通りにならない（`2>&1` の時点でfd1はまだターミナルを指している）。

## /dev/null

`/dev/null` はUNIXが提供する特殊なデバイスファイル。書き込んだデータは全て捨てられ、読み込むと即座にEOFを返す。

```bash
command > /dev/null       # stdout を捨てる
command 2> /dev/null      # stderr を捨てる
command > /dev/null 2>&1  # stdout・stderr 両方捨てる
```

エラーメッセージを表示したくない場合や、コマンドの終了コードだけ知りたい場合に使う。

## パイプとの違い

```bash
command1 | command2   # command1 の stdout を command2 の stdin に繋ぐ
```

リダイレクトはfdとファイルを繋ぐ。パイプはプロセス間のfdを繋ぐ。パイプは名前なしファイル（無名パイプ）をカーネルが作成し、プロセス間通信を実現する。

```bash
# よく使うパターン
command 2>&1 | grep "error"   # stderr も含めて grep にかける
```

## tee：出力を分岐する

`tee` はstdoutをファイルと後続の両方に流す。

```bash
command | tee file          # ターミナルに表示しながらファイルにも保存
command | tee -a file       # 追記モード
command 2>&1 | tee file     # stderr も含めて分岐
```
