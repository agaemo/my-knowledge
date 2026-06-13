# パッケージマネージャー

OSやランタイムにソフトウェアをインストール・更新・削除する仕組み。依存関係の解決・リポジトリからのダウンロード・バージョン管理を自動化する。

## なぜ種類が多いか

Linuxはディストリビューションごとにパッケージのフォーマットとパッケージマネージャーが異なる。歴史的にDebian系とRHEL系が独立して発展した結果、2つの系譜が生まれ、macOS・Archなどがさらに独自のものを持つ。

## 全体像

```
OS / 系統          パッケージ形式   低レベルツール    高レベルツール
─────────────────────────────────────────────────────────────
Debian / Ubuntu    .deb            dpkg             apt
RHEL / Fedora      .rpm            rpm              dnf（旧 yum）
Arch Linux         .pkg.tar.zst    pacman           pacman
macOS              —               —                Homebrew（brew）
```

## 低レベルと高レベルの違い

パッケージマネージャーは「パッケージファイルを直接操作するツール」と「リポジトリと依存関係を管理するツール」の2層に分かれる。

```
高レベル（apt / dnf）
  ↓ リポジトリからパッケージをダウンロード・依存解決
低レベル（dpkg / rpm）
  ↓ .deb / .rpm ファイルをシステムにインストール
ファイルシステム
```

通常は高レベルツールを使う。低レベルツールを直接使うのは、ダウンロード済みのファイルを手動でインストールするときや、インストール済みパッケージの状態を確認するときに限られる。

## Debian系（apt / dpkg）

Ubuntu・Debianで使われる。

```bash
apt update                   # リポジトリのパッケージ一覧を更新
apt upgrade                  # インストール済みパッケージを最新化
apt install nginx            # インストール
apt remove nginx             # アンインストール（設定ファイルは残る）
apt purge nginx              # アンインストール＋設定ファイルも削除
apt search nginx             # パッケージを検索
apt show nginx               # パッケージ情報を表示

# dpkg（低レベル）
dpkg -i package.deb          # .debファイルを直接インストール
dpkg -l                      # インストール済みパッケージの一覧
dpkg -L nginx                # パッケージが配置したファイルの一覧
```

`apt-get` は旧来のコマンド。`apt` は対話的な利用向けに出力を見やすくした上位互換で、現在は `apt` を使うのが一般的。

## RHEL系（dnf / yum / rpm）

RHEL・Fedora・AlmaLinux・Rocky Linuxで使われる。

```bash
dnf install nginx            # インストール
dnf remove nginx             # アンインストール
dnf update                   # 全パッケージを更新
dnf search nginx             # 検索
dnf info nginx               # パッケージ情報を表示

# rpm（低レベル）
rpm -ivh package.rpm         # .rpmファイルを直接インストール
rpm -qa                      # インストール済みパッケージの一覧
rpm -ql nginx                # パッケージが配置したファイルの一覧
```

**yum → dnf の変遷**: yum（Yellowdog Updater Modified）は長年RHELの標準だったが、パフォーマンスや依存解決の問題からdnf（Dandified YUM）に置き換えられた。RHEL 8以降はdnfが標準。古い記事ではyumと書かれているが、現在は同じコマンドをdnfで実行できる。

## Arch系（pacman）

```bash
pacman -Syu                  # システム全体を更新
pacman -S nginx              # インストール
pacman -R nginx              # アンインストール
pacman -Ss nginx             # 検索
pacman -Q                    # インストール済みパッケージの一覧
```

## macOS（Homebrew / brew）

macOSにはLinuxのような標準パッケージマネージャーがなく、Homebrewが事実上の標準として広く使われている（公式ではなくコミュニティプロジェクト）。

```bash
brew install nginx           # インストール
brew uninstall nginx         # アンインストール
brew upgrade                 # インストール済みパッケージを最新化
brew update                  # Homebrewとリポジトリ情報を更新
brew search nginx            # 検索
brew list                    # インストール済みの一覧
brew services start nginx    # サービスとして起動
```

**Cask**: GUIアプリ（.app形式）のインストールにも対応している。

```bash
brew install --cask docker   # Docker Desktop をインストール
```

## 横断的な比較

| 操作 | apt（Debian系） | dnf（RHEL系） | brew（macOS） |
|------|----------------|---------------|---------------|
| インストール | `apt install` | `dnf install` | `brew install` |
| 削除 | `apt remove` | `dnf remove` | `brew uninstall` |
| 更新 | `apt upgrade` | `dnf update` | `brew upgrade` |
| 検索 | `apt search` | `dnf search` | `brew search` |
| 一覧 | `dpkg -l` | `rpm -qa` | `brew list` |

## 関連

- [ディストリビューション](/os/distributions) — パッケージマネージャーの系統はディストリビューションの系統と対応する
- [環境管理（Nix・mise）](/dev-tools/env-management/) — 言語ランタイムや開発ツールにはOSのパッケージマネージャーより専用ツールを使うことが多い
