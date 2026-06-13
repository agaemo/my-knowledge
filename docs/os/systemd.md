# systemd

Linuxの**initシステム**。OS起動時にカーネルが最初に起動するプロセス（PID 1）として動き、その後のすべてのプロセスを管理する。サービス管理・ログ収集・マウント・タイマーなどOS運用に必要な機能を統合している。

## なぜ存在するか（SysVinitからの置き換え）

systemd以前のLinuxはSysVinit（System V init）が主流だった。SysVinitはシェルスクリプトでサービスを順番に起動するシンプルな仕組みだったが、サービスが増えた現代のシステムでは問題が顕在化した。

| 課題 | SysVinit | systemd |
|------|----------|---------|
| 起動速度 | スクリプトを順番に実行するため遅い | 依存関係を解析して並列起動 |
| 依存管理 | スクリプトで手動管理 | ユニットファイルで宣言的に定義 |
| ログ | 各サービスがバラバラに出力 | journaldで一元収集・構造化 |
| 状態監視 | サービスがクラッシュしても気づきにくい | 自動再起動・状態追跡が標準機能 |

Ubuntu・RHEL・Debian・Arch等の主要ディストリビューションは2015年前後にsystemdを採用した。

## PID 1とは

Linuxでは起動後にカーネルが最初に1つのプロセスを生成し、そのプロセスID（PID）が**1**になる。このPID 1がすべての子プロセスの親となる。systemdはこのPID 1として動作するため、すべてのサービス・プロセスはsystemdの子孫になる。

```
カーネル
  └─ systemd（PID 1）
       ├─ sshd
       ├─ nginx
       │    └─ nginx worker
       ├─ postgresql
       └─ ...
```

PID 1が終了するとカーネルはシステムを停止する。そのためsystemdはシグナルを受け取ってもむやみに終了しない設計になっている。

## ユニット（Unit）

systemdが管理する設定の単位。種類によって拡張子が異なる。

| 種類 | 拡張子 | 役割 |
|------|--------|------|
| Service | `.service` | プロセスとして動くサービス（nginx・sshd等） |
| Timer | `.timer` | 定期実行（cronの代替） |
| Mount | `.mount` | ファイルシステムのマウント |
| Socket | `.socket` | ソケット経由の起動（必要になるまで遅延起動） |
| Target | `.target` | 複数ユニットをグループ化する起動フェーズの定義 |

### サービスユニットファイルの例

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target        # ネットワーク起動後に開始

[Service]
ExecStart=/usr/local/bin/myapp
Restart=on-failure          # クラッシュ時に自動再起動
User=myapp

[Install]
WantedBy=multi-user.target  # 通常起動時に有効化
```

## 主なコマンド（systemctl）

```bash
# サービスの操作
systemctl start nginx        # 起動
systemctl stop nginx         # 停止
systemctl restart nginx      # 再起動
systemctl reload nginx       # 設定リロード（プロセスは維持）
systemctl status nginx       # 状態確認

# 自動起動の設定
systemctl enable nginx       # OS起動時に自動起動するよう登録
systemctl disable nginx      # 自動起動を無効化

# ユニットファイルを追加・変更したあとに必要
systemctl daemon-reload
```

## ログ（journald・journalctl）

systemdに統合されたログ収集デーモン**journald**が、カーネルログ・サービスの標準出力・標準エラーをまとめて管理する。

```bash
journalctl -u nginx          # nginxのログを表示
journalctl -u nginx -f       # リアルタイムで追う（tail -f 相当）
journalctl -u nginx --since "1 hour ago"
journalctl -p err            # エラー以上のログのみ
journalctl -b                # 今回の起動以降のログ
```

従来のsyslogと異なりバイナリ形式で保存されるため高速に検索できる。

## 関連

- [カーネル](/os/kernel) — カーネルがPID 1としてsystemdを起動する
- [ジョブスケジューリング（cron・at）](/os/job-scheduling) — systemd timerはcronの現代的な代替
- [ディストリビューション](/os/distributions) — systemd採用の有無はディストリビューションの違いの一つ
